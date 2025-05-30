import { verifyCredentialStatus } from './lib/verify/credentialStatus';
import {
  deriveCredential,
  isRawDocument,
  isSignedDocument,
  signCredential,
  verifyCredential,
} from './lib/w3c-vc';
import { getDocumentLoader } from '@trustvc/w3c-context';

export * from './lib/types';
export type * from './lib/types';
export type {
  ContextDocument,
  DocumentLoader,
  Document,
  DocumentLoaderObject,
} from '@trustvc/w3c-context';
export { CredentialStatusResult } from './lib/verify/credentialStatus/types';
export {
  deriveCredential,
  getDocumentLoader,
  isRawDocument,
  isSignedDocument,
  signCredential,
  verifyCredential,
  verifyCredentialStatus,
};
