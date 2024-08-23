// Define the type for the signing result
export interface SigningResult {
  signed?: object; // The signed credential, if successful
  error?: string; // The error message, if an error occurred
}

// Define the type for the verification result
export interface VerificationResult {
  verified: boolean; // Indicates the verification result
  error?: string; // The error message, if verification returns false
}

// Define the type for the DID document
interface DidDocument {
  '@context'?: string[];
  id?: string;
  // Add other properties based on the structure of the DID document
}

// Define a type for the context loader function
export type DocumentLoader = (url: string) => Promise<{
  contextUrl: string | null;
  document: DidDocument;
  documentUrl: string;
}>;
