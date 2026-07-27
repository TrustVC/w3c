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
export type CredentialSchema = {
  id: string;
  type: string;
} & Record<string, any>;
export type CredentialSchemas = CredentialSchema | CredentialSchema[];
export type CredentialSubject = Record<string, any>;
export type CredentialSubjects = CredentialSubject | CredentialSubject[];

export type TermsOfUse = {
  type: string;
} & Record<string, any>;
export type TermsOfUses = TermsOfUse | TermsOfUse[];

type RelatedResource = {
  id: string;
  mediaType?: string;
} & (
  | { digestSRI: string; digestMultibase?: string }
  | { digestSRI?: string; digestMultibase: string }
) &
  Record<string, any>;
export type RelatedResources = RelatedResource | RelatedResource[];

export type RefreshService = {
  type: string;
} & Record<string, any>;
export type RefreshServices = RefreshService | RefreshService[];

export type Evidence = {
  type: string;
} & Record<string, any>;
export type Evidences = Evidence | Evidence[];

export type Proof = {
  type: string;
  created?: string;
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
  credentialSchema?: CredentialSchemas;
  termsOfUse?: TermsOfUses;
  evidence?: Evidences;
  relatedResource?: RelatedResources;
  refreshService?: RefreshServices;
  renderMethod?: Record<string, any>;
  qrCode?: Record<string, any>;
  proof?: Proof;
} & Record<string, any>;

export type RawVerifiableCredential = Omit<SignedVerifiableCredential, 'proof'>;

// A Verifiable Presentation is an envelope that wraps one or more Verifiable
// Credentials. The embedded credentials each keep their own proof (and may use
// different cryptosuites / VC data-model versions); the presentation may
// additionally carry a single holder-binding proof over the whole envelope.
export type RawVerifiablePresentation = {
  '@context': string | (string | Record<string, any>)[];
  type: string | string[];
  id?: string;
  holder?: string | Record<string, any>;
  verifiableCredential?: SignedVerifiableCredential | SignedVerifiableCredential[];
} & Record<string, any>;

export type SignedVerifiablePresentation = RawVerifiablePresentation & {
  proof: Proof;
};

// Cryptosuite used for a presentation's holder-binding proof. Selective-disclosure
// suites cannot cover the `verifiableCredential` @graph, so only the plain
// `ecdsa-rdfc-2019` suite is supported (reusing the ECDSA Multikey used for
// `ecdsa-sd-2023` credentials).
export type PresentationProofSuite = 'ecdsa-rdfc-2019';

export type VerifiablePresentation = SignedVerifiablePresentation | RawVerifiablePresentation;

// Result of signing a presentation
export interface PresentationSigningResult {
  signed?: SignedVerifiablePresentation; // The signed presentation, if successful
  error?: string; // The error message, if an error occurred
}

// Per-credential verification outcome within a presentation
export interface CredentialVerificationResult extends VerificationResult {
  credentialIndex: number; // Index of the credential within verifiableCredential
}

// Result of verifying a presentation. `verified` is true only when the holder
// proof (if any) AND every embedded credential verify successfully.
export interface PresentationVerificationResult {
  verified: boolean;
  error?: string;
  // Verification outcome of the presentation's own holder-binding proof.
  // Undefined when the presentation carries no proof (unsigned envelope).
  presentationResult?: VerificationResult;
  // Verification outcome of each embedded verifiable credential.
  credentialResults?: CredentialVerificationResult[];
}

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
