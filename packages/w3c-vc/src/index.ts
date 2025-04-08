import { verifyCredentialStatus } from './lib/verify/credentialStatus';
import {
  deriveCredential,
  getDocumentLoader,
  isRawDocument,
  isSignedDocument,
  signCredential,
  verifyCredential,
} from './lib/w3c-vc';

export * from './lib/types';
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
