import didV1 from './did-v1.json';
import { Document } from '../lib/types';

export const DID_V1_URL = 'https://www.w3.org/ns/did/v1';

export const contexts: { [key: string]: Document } = {
  [DID_V1_URL]: didV1,
};
