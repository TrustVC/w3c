import {
  BbsBlsSignature2020,
  Bls12381G2KeyPair,
  KeyPairOptions,
} from '@mattrglobal/jsonld-signatures-bbs';
import jsonldSignatures from 'jsonld-signatures';

// Define the type for the DID document
interface DidDocument {
  '@context'?: string[];
  id?: string;
  // Add other properties based on the structure of the DID document
}

// Define a type for the context loader function
type DocumentLoader = (url: string) => Promise<{
  contextUrl: string | null;
  document: DidDocument;
  documentUrl: string;
}>;

/**
 * Creates and returns a custom document loader for JSON-LD contexts.
 * The loader resolves DID URLs and fetches the corresponding DID documents.
 * @returns {Promise<DocumentLoader>} A function that loads JSON-LD contexts.
 */
async function getDocumentLoader(): Promise<DocumentLoader> {
  const customDocLoader = async (url: string) => {
    if (url.includes('did:')) {
      if (url.includes('#')) {
        url = url.slice(0, url.indexOf('#'));
      }
      const id = url.split(':');
      const path = id.map(decodeURIComponent).join('/') + '/.well-known/did.json';
      url = path.replace('did/web/', 'https://');
    }
    try {
      const results = await fetch(url, { redirect: 'follow' });

      const resolveContext = {
        contextUrl: null,
        document: await results.json(),
        documentUrl: results.url,
      };

      return resolveContext;
    } catch (err) {
      throw new Error();
    }
  };
  return jsonldSignatures.extendContextLoader(customDocLoader);
}

/**
 * Signs a credential using the BBS+ signature scheme.
 * @param {Object} credential - The credential to be signed.
 * @param {KeyPairOptions} keyPair - The key pair options for signing.
 * @returns {Promise<Object>} The signed credential.
 */
export const signCredential = async (
  credential: object,
  keyPair: KeyPairOptions,
): Promise<object> => {
  const documentLoader = await getDocumentLoader();
  const key = new Bls12381G2KeyPair(keyPair);

  return await jsonldSignatures.sign(credential, {
    suite: new BbsBlsSignature2020({ key }),
    purpose: new jsonldSignatures.purposes.AssertionProofPurpose(),
    documentLoader,
  });
};

// Define the type for the verification result
interface VerificationResult {
  verified: boolean;
}

/**
 * Verifies a credential using the BBS+ signature scheme.
 * @param {Object} credential - The credential to be verified.
 * @returns {Promise<VerificationResult>} The verification result.
 */
export const verifyCredential = async (credential: object): Promise<VerificationResult> => {
  const documentLoader = await getDocumentLoader();

  return await jsonldSignatures.verify(credential, {
    suite: new BbsBlsSignature2020(),
    purpose: new jsonldSignatures.purposes.AssertionProofPurpose(),
    documentLoader,
  });
};
