import { generateKeyPair } from './keyPair';
import { issueDID } from './wellKnown';

export * from './keyPair/types';
export * from './wellKnown/types';
export {
  issueDID,
  generateKeyPair
};
