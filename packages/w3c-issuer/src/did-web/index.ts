import { generateKeyPair } from './keyPair';
import { issueDID } from './wellKnown';
import { queryDidDocument } from './wellKnown/query';

export * from './keyPair/types';
export * from './wellKnown/types';
export { generateKeyPair, issueDID, queryDidDocument };
