import { DIDDocument } from 'did-resolver';

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
