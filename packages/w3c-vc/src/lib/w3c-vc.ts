/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-var-requires */
import { BbsBlsSignature2020, Bls12381G2KeyPair } from '@mattrglobal/jsonld-signatures-bbs';
const jsonldSignatures = require('jsonld-signatures');

import { _checkCredential, _checkKeyPair } from './helper';
import { DocumentLoader, SigningResult, VerificationResult } from './types';

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
    const results = await fetch(url, { redirect: 'follow' });

    const resolveContext: any = {
      contextUrl: null,
      document: await results.json(),
      documentUrl: results.url,
    };

    return resolveContext;
  };
  return jsonldSignatures.extendContextLoader(customDocLoader);
}

/**
 * Signs a credential using the BBS+ signature scheme.
 * @param {object} credential - The credential to be signed.
 * @param {object} keyPair - The key pair options for signing.
 * @returns {Promise<SigningResult>} The signed credential or an error message in case of failure.
 */
export const signCredential = async (credential: any, keyPair: any): Promise<SigningResult> => {
  try {
    _checkKeyPair(keyPair);
    _checkCredential(credential, undefined, 'sign');
    const documentLoader = await getDocumentLoader();

    const key = new Bls12381G2KeyPair(keyPair);

    const signed = await jsonldSignatures.sign(credential, {
      suite: new BbsBlsSignature2020({ key }),
      purpose: new jsonldSignatures.purposes.AssertionProofPurpose(),
      documentLoader,
    });
    return { signed: signed };
  } catch (err: any) {
    const errorMessage = err.message;

    // Handle the case where the JSON-LD object is invalid
    if (errorMessage.includes('Dereferencing a URL did not result in a valid JSON-LD object')) {
      const errorUrl = err.details?.url;
      return {
        error: `Dereferencing a URL did not result in a valid JSON-LD object: "${errorUrl || 'Unknown URL'}"`,
      };
    }
    return { error: errorMessage };
  }
};

/**
 * Verifies a credential using the BBS+ signature scheme.
 * @param {object} credential - The credential to be verified.
 * @returns {Promise<VerificationResult>} The verification result indicating success
 * or failure, along with an error message if applicable.
 */
export const verifyCredential = async (credential: any): Promise<VerificationResult> => {
  try {
    _checkCredential(credential);
    const documentLoader = await getDocumentLoader();

    const verificationResult = await jsonldSignatures.verify(credential, {
      suite: new BbsBlsSignature2020(),
      purpose: new jsonldSignatures.purposes.AssertionProofPurpose(),
      documentLoader,
    });

    if (verificationResult.verified) {
      return { verified: true };
    }

    if (verificationResult.error && verificationResult.error.errors) {
      const errorMessage = verificationResult.error.errors[0].message;

      // Handle scenario where the verification method is not found
      if (
        errorMessage.includes('Unexpected token N in JSON at position 0') ||
        errorMessage.includes("Cannot read properties of undefined (reading 'length')")
      ) {
        return { verified: false, error: 'Verification method could not be found.' };
      }

      // Handle the case where the JSON-LD object is invalid
      if (errorMessage.includes('Dereferencing a URL did not result in a valid JSON-LD object')) {
        const errorUrl = verificationResult.error.errors[0].details?.url;
        return {
          verified: false,
          error: `Dereferencing a URL did not result in a valid JSON-LD object: "${errorUrl || 'Unknown URL'}"`,
        };
      }

      // Fallback: return the original error message
      return { verified: false, error: errorMessage };
    }

    // Default error message if no specific error conditions match
    return { verified: false, error: 'Verification error.' };
  } catch (err: any) {
    return { verified: false, error: err.message };
  }
};
