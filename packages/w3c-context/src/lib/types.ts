import { DIDDocument } from 'did-resolver';

export type ContextDocument = {
  '@context': Record<string, any>;
} & Record<string, any>;

// Define the type for the DID document
export type Document = ContextDocument | DIDDocument;
