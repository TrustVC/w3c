import { BbsBlsSignature2020, BbsBlsSignatureProof2020 } from '@mattrglobal/jsonld-signatures-bbs';
import { DataIntegrityProof } from '@digitalbazaar/data-integrity';

// Define the type for the signing result
export interface SigningResult {
  signed?: SignedVerifiableCredential; // The signed credential, if successful
  error?: string; // The error message, if an error occurred
}

// Define the type for the derived result
export interface DerivedResult {
  derived?: SignedVerifiableCredential; // The derived credential, if successful
  error?: string; // The error message, if an error occurred
}

// Define the type for the verification result
export interface VerificationResult {
  verified: boolean; // Indicates the verification result
  error?: string; // The error message, if verification returns false
}

export type CredentialStatus = {
  id?: string;
  type: string;
} & Record<string, any>;
export type CredentialStatuses = CredentialStatus | CredentialStatus[];

export type CredentialSubject = Record<string, any>;
export type CredentialSubjects = CredentialSubject | CredentialSubject[];

export type Proof = {
  type: string;
  created: string;
  proofPurpose: string;
  verificationMethod: string;
  proofValue: string;
  nonce?: string;
} & Record<string, any>;

export type VerifiableCredential = SignedVerifiableCredential | RawVerifiableCredential;

export type SignedVerifiableCredential = {
  '@context': string | string[];
  id: string;
  type: string | string[];
  issuer: string | Record<string, any>;
  issuanceDate?: string;
  validFrom?: string;
  validUntil?: string;
  expirationDate?: string;
  credentialStatus?: CredentialStatuses;
  credentialSubject: CredentialSubjects;
  renderMethod?: Record<string, any>;
  qrCode?: Record<string, any>;
  proof?: Proof;
} & Record<string, any>;

export type RawVerifiableCredential = Omit<SignedVerifiableCredential, 'proof'>;

export type CryptoSuiteName = 'BbsBlsSignature2020' | 'bbs-2023' | 'ecdsa-sd-2023';

export type ProofType = 'BbsBlsSignature2020' | 'BbsBlsSignatureProof2020' | 'DataIntegrityProof';

export const proofTypeMapping: Record<
  ProofType,
  typeof BbsBlsSignature2020 | typeof BbsBlsSignatureProof2020 | typeof DataIntegrityProof
> = {
  BbsBlsSignature2020: BbsBlsSignature2020,
  BbsBlsSignatureProof2020: BbsBlsSignatureProof2020,
  DataIntegrityProof: DataIntegrityProof,
};
