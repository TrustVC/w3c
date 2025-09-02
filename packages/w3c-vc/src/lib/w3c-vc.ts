import { KeyPairOptions } from '@mattrglobal/bls12381-key-pair';
import {
  BbsBlsSignature2020,
  BbsBlsSignatureProof2020,
  Bls12381G2KeyPair,
  deriveProof,
} from '@mattrglobal/jsonld-signatures-bbs';
import * as EcdsaMultikey from '@digitalbazaar/ecdsa-multikey';
import * as ecdsaSd2023Cryptosuite from '@digitalbazaar/ecdsa-sd-2023-cryptosuite';
import { DataIntegrityProof } from '@digitalbazaar/data-integrity';
import {
  ContextDocument,
  CredentialContextVersion,
  DocumentLoader,
  getDocumentLoader,
} from '@trustvc/w3c-context';
import { PrivateKeyPair } from '@trustvc/w3c-issuer';
import jsonldSignatures from 'jsonld-signatures';
import jsonldSignaturesV7 from 'jsonld-signatures-v7';
import * as jsonld from 'jsonld';
import { _checkCredential, _checkKeyPair, getFirstContext, prefilCredentialId } from './helper';
import {
  CryptoSuiteName,
  DerivedResult,
  ProofType,
  proofTypeMapping,
  RawVerifiableCredential,
  SignedVerifiableCredential,
  SigningResult,
  VerificationResult,
} from './types';

const { createSignCryptosuite, createDiscloseCryptosuite, createVerifyCryptosuite } =
  ecdsaSd2023Cryptosuite;
const {
  purposes: { AssertionProofPurpose },
} = jsonldSignatures;
const {
  purposes: { AssertionProofPurpose: AssertionProofPurposeV7 },
} = jsonldSignaturesV7;

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
 * Checks if the input document is a valid raw credential with context version 1.1.
 * @param {RawVerifiableCredential | unknown} document - The document to check.
 * @returns {boolean} - True if the document is a valid raw credential and uses v1.1 context, otherwise false.
 */
export const isRawDocumentV1_1 = (document: RawVerifiableCredential | unknown): boolean =>
  isRawDocument(document) && getFirstContext(document) === CredentialContextVersion.v1;

/**
 * Checks if the input document is a valid raw credential with context version 2.0.
 * @param {RawVerifiableCredential | unknown} document - The document to check.
 * @returns {boolean} - True if the document is a valid raw credential and uses v2.0 context, otherwise false.
 */
export const isRawDocumentV2_0 = (document: RawVerifiableCredential | unknown): boolean =>
  isRawDocument(document) && getFirstContext(document) === CredentialContextVersion.v2;

/**
 * Checks if the input document is a signed credential.
 * @param {SignedVerifiableCredential | unknown} document - The signed credential to be checked.
 * @returns {boolean} - Returns true if the document is a signed credential, false otherwise.
 */
export const isSignedDocument = (
  document: SignedVerifiableCredential | unknown,
): document is SignedVerifiableCredential => {
  try {
    _checkCredential(document, undefined, 'verify');
  } catch (err) {
    return false;
  }
  return typeof document === 'object' && 'proof' in document;
};

/**
 * Checks if the input document is a valid signed credential with context version 1.1.
 * @param {SignedVerifiableCredential | unknown} document - The document to check.
 * @returns {boolean} - True if the document is a valid signed credential and uses v1.1 context, otherwise false.
 */
export const isSignedDocumentV1_1 = (
  document: SignedVerifiableCredential | unknown,
): document is SignedVerifiableCredential =>
  isSignedDocument(document) && getFirstContext(document) === CredentialContextVersion.v1;

/**
 * Checks if the input document is a valid signed credential with context version 2.0.
 * @param {SignedVerifiableCredential | unknown} document - The document to check.
 * @returns {boolean} - True if the document is a valid signed credential and uses v2.0 context, otherwise false.
 */
export const isSignedDocumentV2_0 = (
  document: SignedVerifiableCredential | unknown,
): document is SignedVerifiableCredential =>
  isSignedDocument(document) && getFirstContext(document) === CredentialContextVersion.v2;

/**
 * Checks if a proof value represents a base (non-derived) ECDSA-SD-2023 credential
 * @param {string} proofValue - The proof value string to check
 * @returns {boolean} - true if this is a base proof, false otherwise
 */
const isEcdsaSdBaseProof = async (proofValue: string): Promise<boolean> => {
  try {
    if (!proofValue || !proofValue.startsWith('u')) {
      return false;
    }
    // @ts-ignore: No types available for base64url-universal
    const { decode } = await import('base64url-universal');
    const decoded = decode(proofValue.slice(1));
    // Check if it has the base proof header (0xd9, 0x5d, 0x00)
    // Convert to numbers to handle both Buffer (Node.js) and Uint8Array (browser) environments
    return (
      decoded.length >= 3 &&
      Number(decoded[0]) === 0xd9 &&
      Number(decoded[1]) === 0x5d &&
      Number(decoded[2]) === 0x00
    );
  } catch {
    return false;
  }
};

/**
 * Determines whether a verifiable credential is a derived credential.
 *
 * Derived credentials are selective disclosure proofs that contain only a subset
 * of the original credential's claims, rather than the full base credential.
 *
 * @param {SignedVerifiableCredential} document - The document to check.
 * @returns {Promise<boolean>} - True if the document is a derived credential, false otherwise.
 */
export const isDerived = async (document: SignedVerifiableCredential) => {
  // BBS+ signatures always indicate derived credentials (selective disclosure proofs)
  if (document.proof?.type === 'BbsBlsSignatureProof2020') {
    return true;
  } else if (document.proof?.type === 'DataIntegrityProof') {
    // For Data Integrity Proofs, check the cryptosuite to determine the specific verification approach
    const proof = jsonld.getValues(document, 'proof')[0];
    const cryptosuite = proof.cryptosuite;

    // ECDSA Selective Disclosure 2023 cryptosuite
    if (cryptosuite === 'ecdsa-sd-2023') {
      // Check if this is a base proof (original credential) or derived proof (selective disclosure)
      if (await isEcdsaSdBaseProof(proof.proofValue as string)) {
        return false; // Base proof - contains all original claims
      } else return true; // Derived proof - contains only selected claims
    }
    // Other Data Integrity cryptosuites are not derived
    return false;
  }
  // No recognized proof type for selective disclosure
  return false;
};

/**
 * Extracts mandatory pointers from an ECDSA-SD-2023 base proof value
 * @param {string} proofValue - The base proof value string
 * @returns {Promise<string[]>} - Array of mandatory pointers, empty array if extraction fails
 */
const extractMandatoryPointers = async (proofValue: string): Promise<string[]> => {
  try {
    if (!(await isEcdsaSdBaseProof(proofValue))) {
      return [];
    }

    // Decode the base64url-no-pad-encoded value
    const decodedProofValue = Buffer.from(proofValue.slice(1), 'base64url');

    // CBOR decode the components after the 3-byte header
    const cbor = await import('cbor');
    const components = cbor.decode(decodedProofValue.slice(3));

    // Components array: [baseSignature, publicKey, hmacKey, signatures, mandatoryPointers]
    if (Array.isArray(components) && components.length === 5) {
      return components[4] || [];
    }

    return [];
  } catch (error) {
    // If we can't parse the mandatory pointers, return empty array
    return [];
  }
};

/**
 * Signs a credential using the specified cryptosuite. Defaults to 'BbsBlsSignature2020'.
 * @param {object} credential - The credential to be signed.
 * @param {object} keyPair - The key pair options for signing.
 * @param {string} cryptoSuite - The cryptosuite to be used for signing. Defaults to 'BbsBlsSignature2020'.
 * @param {object} options - Optional parameters including documentLoader and mandatoryPointers for ECDSA-SD-2023.
 * @returns {Promise<SigningResult>} The signed credential or an error message in case of failure.
 */
export const signCredential = async (
  credential: RawVerifiableCredential,
  keyPair: PrivateKeyPair,
  cryptoSuite: CryptoSuiteName = 'BbsBlsSignature2020',
  options?: {
    documentLoader?: DocumentLoader;
    mandatoryPointers?: string[];
  },
): Promise<SigningResult> => {
  try {
    const documentLoader = options?.documentLoader ?? (await getDocumentLoader());

    if (cryptoSuite === 'BbsBlsSignature2020') {
      _checkKeyPair(keyPair);
      _checkCredential(credential, undefined, 'sign');

      const key = new Bls12381G2KeyPair(keyPair as KeyPairOptions);

      // This ensures each credential has a distinct, system-generated ID in the UUIDv7 format
      credential = prefilCredentialId(credential, cryptoSuite);

      const signed = await jsonldSignaturesV7.sign(credential, {
        suite: new BbsBlsSignature2020({ key }),
        purpose: new AssertionProofPurposeV7(),
        documentLoader,
      });

      return { signed: signed };
    } else if (cryptoSuite === 'ecdsa-sd-2023') {
      _checkKeyPair(keyPair);
      _checkCredential(credential, undefined, 'sign');

      // Import the key pair object into a usable signer instance
      const ecdsaKeyPair = await EcdsaMultikey.from({ ...keyPair });

      // Determine required mandatory pointers based on credential format
      const firstContext = credential['@context'][0];
      const isV2 = firstContext === CredentialContextVersion.v2;

      // Core mandatory pointers for fields required for credential validity
      const coreMandatoryPointers = ['/issuer'];

      // Add date field pointer based on credential version
      if (isV2) {
        // For v2.0, validFrom is optional but if present should be mandatory for consistency
        if (credential.validFrom) {
          coreMandatoryPointers.push('/validFrom');
        }
      } else {
        // For v1.1, issuanceDate is required
        coreMandatoryPointers.push('/issuanceDate');
      }

      // Combine core mandatory pointers with user-provided ones, ensuring core fields are always included
      const userMandatoryPointers = options?.mandatoryPointers || [];
      const mandatoryPointers = [
        ...coreMandatoryPointers,
        ...userMandatoryPointers.filter((pointer) => !coreMandatoryPointers.includes(pointer)),
      ];

      // Create the DataIntegrityProof suite using the ECDSA-SD cryptosuite
      const suite = new DataIntegrityProof({
        signer: ecdsaKeyPair.signer(),
        cryptosuite: createSignCryptosuite({
          mandatoryPointers: mandatoryPointers,
        }),
      });

      // This ensures each credential has a distinct, system-generated ID in the UUIDv7 format
      credential = prefilCredentialId(credential, cryptoSuite);

      const signed = await jsonldSignatures.sign(credential, {
        suite,
        purpose: new AssertionProofPurpose(),
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
 * Verifies a credential using the BBS+ signature scheme or ECDSA-SD-2023.
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

    if (SuiteClass) {
      if (proofType === 'DataIntegrityProof') {
        // Check the cryptosuite to determine the specific verification approach
        const proof = jsonld.getValues(credential, 'proof')[0];
        const cryptosuite = proof.cryptosuite;

        if (cryptosuite === 'ecdsa-sd-2023') {
          // Check if this is a base credential (non-derived) by examining the proofValue structure
          if (await isEcdsaSdBaseProof(proof.proofValue as string)) {
            // This is a base proof - ECDSA-SD-2023 base credentials require derivation before verification
            return {
              verified: false,
              error: `${cryptosuite} base credentials must be derived before verification. Use deriveCredential() first.`,
            };
          }

          verificationResult = await jsonldSignatures.verify(credential, {
            suite: new DataIntegrityProof({
              cryptosuite: createVerifyCryptosuite(),
            }),
            purpose: new AssertionProofPurpose(),
            documentLoader,
          });
        }
      } else {
        // For BBS+ proofs, create the suite normally
        verificationResult = await jsonldSignaturesV7.verify(credential, {
          suite: new SuiteClass(),
          purpose: new AssertionProofPurposeV7(),
          documentLoader,
        });
      }
    }

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
 * @param {object|string[]} revealedAttributes - For BBS+: The attributes from the credential that should be revealed. For ECDSA-SD-2023: Array of selective pointers.
 * @param {object} options - Optional parameters including documentLoader.
 * @returns {Promise<DerivedResult>} A DerivedResult containing the derived proof or an error message.
 */
export const deriveCredential = async (
  credential: SignedVerifiableCredential,
  revealedAttributes: ContextDocument | string[],
  options?: {
    documentLoader?: DocumentLoader;
  },
): Promise<DerivedResult> => {
  try {
    _checkCredential(credential);
    const documentLoader = options?.documentLoader ?? (await getDocumentLoader());

    const proofType = jsonld.getValues(credential, 'proof')[0].type as ProofType;

    if (proofType === 'BbsBlsSignature2020') {
      // For BBS+, use the existing deriveProof function with revealedAttributes
      const derivedProof = await deriveProof(credential, revealedAttributes as ContextDocument, {
        suite: new BbsBlsSignatureProof2020(),
        documentLoader,
      });
      return { derived: derivedProof };
    } else if (proofType === 'DataIntegrityProof') {
      // Check the cryptosuite to determine the specific proof type
      const proof = jsonld.getValues(credential, 'proof')[0];
      const cryptosuite = proof.cryptosuite;

      if (cryptosuite === 'ecdsa-sd-2023') {
        // Check if this is already a derived credential by examining the proofValue structure
        if (!(await isEcdsaSdBaseProof(proof.proofValue as string))) {
          return {
            error: `${cryptosuite} derived credentials cannot be further derived. Multiple rounds of derivation are not supported by this cryptosuite.`,
          };
        }

        // For ECDSA-SD-2023, use selective pointers (can be empty array for mandatory-only disclosure)
        if (!Array.isArray(revealedAttributes)) {
          return {
            error: `${cryptosuite} requires revealedAttributes to be an array of JSON pointers (string[]).`,
          };
        }

        const selectivePointers = revealedAttributes;

        // Extract mandatory pointers from the base proof
        const mandatoryPointers = await extractMandatoryPointers(proof.proofValue as string);

        // Check if credentialSubject is already in mandatory pointers or selective pointers
        const hasCredentialSubjectInMandatory = mandatoryPointers.some((pointer) =>
          pointer.startsWith('/credentialSubject'),
        );
        const hasCredentialSubjectInSelective = selectivePointers.some((pointer) =>
          pointer.startsWith('/credentialSubject'),
        );

        let finalSelectivePointers = selectivePointers;
        if (!hasCredentialSubjectInMandatory && !hasCredentialSubjectInSelective) {
          // Only add /credentialSubject if it's not already in mandatory pointers
          // and no credentialSubject properties are selected
          // This ensures the derived credential remains valid per W3C VC specification
          finalSelectivePointers = [...selectivePointers, '/credentialSubject'];
        }

        // Create the DataIntegrityProof suite for disclosure
        const suite = new DataIntegrityProof({
          cryptosuite: createDiscloseCryptosuite({
            selectivePointers: finalSelectivePointers,
          }),
        });

        // Derive the selectively disclosed credential
        const derivedProof = await jsonldSignatures.derive(credential, {
          suite,
          purpose: new AssertionProofPurpose(),
          documentLoader,
        });

        return { derived: derivedProof };
      } else {
        return {
          error: `DataIntegrityProof with cryptosuite "${cryptosuite}" is not supported for derivation.`,
        };
      }
    } else {
      return { error: `Proof type "${proofType}" is not supported for derivation.` };
    }
  } catch (err: unknown) {
    // Handle any errors that occur during the proof derivation process
    if (!(err instanceof Error)) {
      return { error: 'An error occurred while deriving the proof.' };
    }
    return { error: err.message };
  }
};
