import { DIDDocument } from 'did-resolver';

// Define the type for the signing result
export interface SigningResult {
  signed?: SignedVerifiableCredential; // The signed credential, if successful
  error?: string; // The error message, if an error occurred
}

// Define the type for the verification result
export interface VerificationResult {
  verified: boolean; // Indicates the verification result
  error?: string; // The error message, if verification returns false
}

export type CredentialStatus = {
  id: string;
  type: string;
} & Record<string, any>;

export type CredentialSubject = Record<string, any>;
export type CredentialSubjects = CredentialSubject | CredentialSubject[];

export type Proof = {
  type: string;
  created: string;
  proofPurpose: string;
  verificationMethod: string;
  proofValue: string;
} & Record<string, any>;

export type VerifiableCredential = SignedVerifiableCredential | RawVerifiableCredential;

export type SignedVerifiableCredential = {
  '@context': string | string[];
  type: string[];
  id: string;
  issuer: string | Record<string, any>;
  issuanceDate: string;
  validFrom?: string;
  expirationDate?: string;
  credentialStatus?: CredentialStatus;
  credentialSubject: CredentialSubjects;
  proof?: Proof;
} & Record<string, any>;

export type RawVerifiableCredential = Omit<SignedVerifiableCredential, 'proof'>;

export type ContextDocument = {
  '@context': Record<string, any>;
} & Record<string, any>;

// Define the type for the DID document
export type Document = ContextDocument | DIDDocument;

export type DocumentLoaderObject = {
  contextUrl: string | null;
  document: Document;
  documentUrl: string;
};

// Define a type for the context loader function
export type DocumentLoader = (url: string) => Promise<DocumentLoaderObject>;
