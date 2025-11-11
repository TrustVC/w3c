import { Resolver, DIDResolutionResult, DIDResolutionOptions } from 'did-resolver';
import { getResolver as webGetResolver } from 'web-did-resolver';
import { getDomain } from '../../lib';
import { DidWellKnownDocument, QueryDidDocument, QueryDidDocumentOption } from './types';

const SUPPORTED_CONTENT_TYPES = ['application/did+json', 'application/did+ld+json'];
const getResolver = (): Resolver => {
  return new Resolver({
    ...webGetResolver(),
  });
};

/**
 * Query well known DID document based on the domain.
 *
 * @param {string} options.domain - Domain to query well known DID @example https://subdomain.example.com/xxx
 * @param {string} options.did - DID to query well known DID @example did:web:subdomain.example.com
 * @returns {Promise<QueryDidDocument>} - Returns well known DID document and the DID
 */
export const queryDidDocument = async ({
  domain,
  did,
}: QueryDidDocumentOption): Promise<QueryDidDocument> => {
  if (!did && !domain) {
    throw new Error('Missing domain');
  }

  if (!did && domain) {
    let domainHostname = getDomain(domain);

    if (!domainHostname) {
      throw new Error('Invalid domain');
    }

    domainHostname = domainHostname.replace(/\/.well-known\/did.json$/, '');
    domainHostname = domainHostname.replace(/\/did.json$/, '');

    did = `did:web:${domainHostname?.replace(/\//g, ':')}`;
  }

  const resolver = new Resolver({
    ...webGetResolver(),
  });
  const doc = await resolver.resolve(did);

  return {
    wellKnownDid: doc?.didDocument as DidWellKnownDocument,
    did,
  };
};

/**
 * Resolves a DID to a DID Document according to the W3C DID Core specification.
 * This function implements the `resolve` operation which returns the DID document as a data model.
 *
 * @param did - The DID to resolve
 * @returns A DID Resolution Result without contentType in the metadata
 */
export const resolve = async (did: string): Promise<DIDResolutionResult> => {
  try {
    const resolver = getResolver();
    const doc: DIDResolutionResult = await resolver.resolve(did);

    if (doc.didResolutionMetadata && 'contentType' in doc.didResolutionMetadata) {
      delete doc.didResolutionMetadata.contentType;
    }

    return doc;
  } catch {
    throw new Error('Failed to resolve did');
  }
};

/**
 * Resolves a DID to a DID Document representation according to the W3C DID Core specification.
 * This function implements the `resolveRepresentation` operation which returns the DID document as a byte stream.
 *
 * @param did - The DID to resolve
 * @param resolutionOptions - Options for resolution, including accept for content negotiation
 * @returns A DID Resolution Result with the document as a string and contentType in the metadata
 */
export const resolveRepresentation = async (
  did: string,
  resolutionOptions?: DIDResolutionOptions,
) => {
  const { accept } = resolutionOptions || {};

  if (accept && !SUPPORTED_CONTENT_TYPES.includes(accept)) {
    return {
      didResolutionMetadata: {
        error: 'representationNotSupported',
        message: `Content type ${accept} is not supported.`,
      },
      didDocumentStream: '',
      didDocumentMetadata: {},
    };
  }

  try {
    const resolver = getResolver();
    const doc = await resolver.resolve(did, { accept });
    const { didDocument, didResolutionMetadata, ...rest } = doc;
    if (didDocument && accept === 'application/did+json') {
      delete didDocument['@context'];
    }

    const response = {
      ...rest,
      didDocumentStream: didDocument ? JSON.stringify(didDocument) : '',
      didResolutionMetadata,
    };

    if (!didResolutionMetadata.error) {
      response.didResolutionMetadata.contentType = accept ?? didResolutionMetadata.contentType;
    }

    return response;
  } catch {
    throw new Error('Failed to resolve did');
  }
};

/**
 * Dereferences a DID URL to a resource according to the W3C DID Core specification.
 * This function handles fragment-based dereferencing to retrieve verification methods.
 *
 * @param did - The DID URL to dereference (may include a fragment)
 * @param dereferenceOptions - Options for dereferencing, including accept for content negotiation
 * @returns A DID Dereferencing Result with the resource as a string
 */
export const dereference = async (did: string, dereferenceOptions?: DIDResolutionOptions) => {
  const { accept } = dereferenceOptions || {};

  const isInvalidRequest =
    (accept && !SUPPORTED_CONTENT_TYPES.includes(accept)) || did.includes('?') || did.includes('/');

  if (isInvalidRequest) {
    return {
      dereferencingMetadata: { error: 'notFound' },
      contentStream: '',
      contentMetadata: {},
    };
  }

  try {
    const resolver = getResolver();
    const {
      didDocument,
      didResolutionMetadata: dereferencingMetadata,
      didDocumentMetadata: contentMetadata,
    } = await resolver.resolve(did, { accept });

    if (dereferencingMetadata.error) {
      const error =
        dereferencingMetadata.error === 'invalidDid'
          ? 'invalidDidUrl'
          : dereferencingMetadata.error;

      return {
        dereferencingMetadata: { ...dereferencingMetadata, error },
        contentStream: '',
        contentMetadata,
      };
    }

    dereferencingMetadata.contentType = accept ?? dereferencingMetadata.contentType;

    if (did.includes('#')) {
      const verificationMethod = didDocument.verificationMethod?.find((vm) => vm.id === did);
      if (verificationMethod) {
        return {
          contentStream: JSON.stringify(verificationMethod),
          contentMetadata,
          dereferencingMetadata,
        };
      }
    }

    const documentToReturn = { ...didDocument };
    if (documentToReturn && accept === 'application/did+json') {
      delete documentToReturn['@context'];
    }

    return {
      contentStream: JSON.stringify(documentToReturn),
      contentMetadata,
      dereferencingMetadata,
    };
  } catch {
    throw new Error('Failed to dereference did');
  }
};
