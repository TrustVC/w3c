import { KeyPairOptions } from '@mattrglobal/bls12381-key-pair';
import {
  BbsBlsSignature2020,
  BbsBlsSignatureProof2020,
  Bls12381G2KeyPair,
  deriveProof,
} from '@mattrglobal/jsonld-signatures-bbs';
import {
  attachmentsContexts,
  bolContexts,
  contexts,
  invoiceContexts,
  renderContexts,
  trContexts,
} from '@trustvc/w3c-context';
import { PrivateKeyPair } from '@trustvc/w3c-issuer';
import { Resolver } from 'did-resolver';
// @ts-ignore: No types available for jsonld-signatures
import jsonldSignatures from 'jsonld-signatures';
// @ts-ignore: No types available for jsonld
import * as jsonld from 'jsonld';
import { getResolver as webGetResolver } from 'web-did-resolver';
import { _checkCredential, _checkKeyPair, prefilCredentialId } from './helper';
import {
  ContextDocument,
  DerivedResult,
  DocumentLoader,
  DocumentLoaderObject,
  ProofType,
  proofTypeMapping,
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
  [contexts, trContexts, renderContexts, attachmentsContexts, bolContexts, invoiceContexts].forEach(
    (context) => {
      Object.entries(context).forEach(([url, document]) => {
        resultMap.set(url, {
          contextUrl: null,
          document: document,
          documentUrl: url,
        });
      });
    },
  );

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
 * Checks if the input document is a raw credential.
 * @param {RawVerifiableCredential | unknown} document - The raw credential to be checked.
 * @returns {boolean} - Returns true if the document is a raw credential, false otherwise.
 */
export const isRawDocument = (document: RawVerifiableCredential | unknown): boolean => {
  try {
    _checkCredential(document, undefined, 'sign');
  } catch (err) {
    return false;
  }
  return typeof document === 'object';
};

/**
 * Checks if the input document is a signed credential.
 * @param {SignedVerifiableCredential | unknown} document - The signed credential to be checked.
 * @returns {boolean} - Returns true if the document is a signed credential, false otherwise.
 */
export const isSignedDocument = (document: SignedVerifiableCredential | unknown): boolean => {
  try {
    _checkCredential(document, undefined, 'verify');
  } catch (err) {
    return false;
  }
  return typeof document === 'object' && 'proof' in document;
};

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
  options?: {
    documentLoader?: DocumentLoader;
  },
): Promise<SigningResult> => {
  try {
    if (cryptoSuite === 'BbsBlsSignature2020') {
      _checkKeyPair(keyPair);
      _checkCredential(credential, undefined, 'sign');
      const documentLoader = options?.documentLoader ?? (await getDocumentLoader());

      const key = new Bls12381G2KeyPair(keyPair as KeyPairOptions);

      // This ensures each credential has a distinct, system-generated ID in the UUIDv7 format
      credential = prefilCredentialId(credential);

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
  options?: {
    documentLoader?: DocumentLoader;
  },
): Promise<VerificationResult> => {
  try {
    _checkCredential(credential);
    const documentLoader = options?.documentLoader ?? (await getDocumentLoader());

    let verificationResult;
    const proofType = jsonld.getValues(credential, 'proof')[0].type as ProofType;
    const SuiteClass = proofTypeMapping[proofType];

    if (SuiteClass)
      verificationResult = await jsonldSignatures.verify(credential, {
        suite: new SuiteClass(),
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

/**
 * Derives a credential with selective disclosure based on revealed attributes.
 * @param {object} credential - The verifiable credential to be selectively disclosed.
 * @param {object} revealedAttributes - The attributes from the credential that should be revealed in the derived proof.
 * @returns {Promise<DerivedResult>} A DerivedResult containing the derived proof or an error message.
 */
export const deriveCredential = async (
  credential: SignedVerifiableCredential,
  revealedAttributes: ContextDocument,
  options?: {
    documentLoader?: DocumentLoader;
  },
): Promise<DerivedResult> => {
  try {
    _checkCredential(credential);
    const documentLoader = options?.documentLoader ?? (await getDocumentLoader());

    // Generate a derived proof with selective disclosure using the BbsBlsSignatureProof2020 suite
    const derivedProof = await deriveProof(credential, revealedAttributes, {
      suite: new BbsBlsSignatureProof2020(),
      documentLoader,
    });

    return { derived: derivedProof };
  } catch (err: unknown) {
    // Handle any errors that occur during the proof derivation process
    if (!(err instanceof Error)) {
      return { error: 'An error occurred while deriving the proof.' };
    }
    return { error: err.message };
  }
};
