import { deriveCredential, signCredential, verifyCredential } from './lib/w3c-vc';
import { verifyCredentialStatus } from './lib/verify/credentialStatus';

export * from './lib/types';
export { CredentialStatusResult } from './lib/verify/credentialStatus/types';
export { deriveCredential, signCredential, verifyCredential, verifyCredentialStatus };
