import { Resolver } from 'did-resolver';
import { getResolver as webGetResolver } from 'web-did-resolver';
import { getDomain } from '../../lib';
import { DidWellKnownDocument, QueryDidDocument, QueryDidDocumentOption } from './types';

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
