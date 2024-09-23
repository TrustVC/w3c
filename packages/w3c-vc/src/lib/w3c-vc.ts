import { KeyPairOptions } from '@mattrglobal/bls12381-key-pair';
import { BbsBlsSignature2020, Bls12381G2KeyPair } from '@mattrglobal/jsonld-signatures-bbs';
import { contexts, DID_V1_URL } from '@tradetrust-tt/w3c-context';
import { PrivateKeyPair } from '@tradetrust-tt/w3c-issuer';
import { Resolver } from 'did-resolver';
// @ts-ignore: No types available for jsonld-signatures
import jsonldSignatures from 'jsonld-signatures';
import { getResolver as webGetResolver } from 'web-did-resolver';
import { _checkCredential, _checkKeyPair } from './helper';
import {
  DocumentLoader,
  DocumentLoaderObject,
  RawVerifiableCredential,
  SignedVerifiableCredential,
  SigningResult,
  VerificationResult,
} from './types';

/**
 * Creates and returns a custom document loader for JSON-LD contexts.
 * The loader resolves DID URLs and fetches the corresponding DID documents.
 * @returns {Promise<DocumentLoader>} A function that loads JSON-LD contexts.
 */
async function getDocumentLoader(): Promise<DocumentLoader> {
  const resultMap = new Map<string, DocumentLoaderObject>();

  // Set default cached files within our lib.
  resultMap.set(DID_V1_URL, {
    contextUrl: null,
    document: contexts[DID_V1_URL],
    documentUrl: DID_V1_URL,
  });

  const resolveDid = async (did: string) => {
    const resolver = new Resolver({
      ...webGetResolver(),
    });
    const doc = await resolver.resolve(did);

    const result: DocumentLoaderObject = {
      contextUrl: null,
      document: doc.didDocument,
      documentUrl: did,
    };

    resultMap.set(did, result);

    return result;
  };

  const customDocLoader = async (url: string) => {
    let result;

    // Serve cached results
    if (resultMap.has(url)) {
      result = resultMap.get(url);

      return result;
    }

    if (url.includes('did:')) {
      return resolveDid(url);
    }

    const results = await fetch(url, { redirect: 'follow' });

    const resolveContext: DocumentLoaderObject = {
      contextUrl: null,
      document: await results.json(),
      documentUrl: results.url,
    };

    resultMap.set(url, resolveContext);

    return resolveContext;
  };

  return jsonldSignatures.extendContextLoader(customDocLoader);
}

/**
 * Signs a credential using the specified cryptosuite. Defaults to 'BbsBlsSignature2020'.
 * @param {object} credential - The credential to be signed.
 * @param {object} keyPair - The key pair options for signing.
 * @param {string} cryptoSuite - The cryptosuite to be used for signing. Defaults to 'BbsBlsSignature2020'.
 * @returns {Promise<SigningResult>} The signed credential or an error message in case of failure.
 */
export const signCredential = async (
  credential: RawVerifiableCredential,
  keyPair: PrivateKeyPair,
  cryptoSuite = 'BbsBlsSignature2020',
): Promise<SigningResult> => {
  try {
    if (cryptoSuite === 'BbsBlsSignature2020') {
      _checkKeyPair(keyPair);
      _checkCredential(credential, undefined, 'sign');
      const documentLoader = await getDocumentLoader();

      const key = new Bls12381G2KeyPair(keyPair as KeyPairOptions);

      const signed = await jsonldSignatures.sign(credential, {
        suite: new BbsBlsSignature2020({ key }),
        purpose: new jsonldSignatures.purposes.AssertionProofPurpose(),
        documentLoader,
      });
      return { signed: signed };
    } else {
      return { error: `"${cryptoSuite}" is not supported.` };
    }
  } catch (err: unknown) {
    if (!(err instanceof Error)) {
      return { error: 'An error occurred while signing the credential.' };
    }

    const errorMessage = err?.message;

    // Handle the case where the JSON-LD object is invalid
    if (errorMessage.includes('Dereferencing a URL did not result in a valid JSON-LD object')) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const errorUrl = (err as any)?.details?.url;
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
export const verifyCredential = async (
  credential: SignedVerifiableCredential,
): Promise<VerificationResult> => {
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
    } else if (verificationResult.error && verificationResult.error.errors) {
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
  } catch (err: unknown) {
    if (!(err instanceof Error)) {
      return { verified: false, error: 'An error occurred while verifying the credential.' };
    }
    return { verified: false, error: err.message };
  }
};
