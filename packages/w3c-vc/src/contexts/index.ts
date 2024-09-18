import didV1 from './did-v1.json';
import { Document } from '../lib/types';

export const DID_V1_URL = 'https://www.w3.org/ns/did/v1';
export const VC_V1_URL = 'https://www.w3.org/2018/credentials/v1';
export const VC_V2_URL = 'https://www.w3.org/ns/credentials/v2';

export const BBS_V1_URL = 'https://w3id.org/security/bbs/v1';
export const STATUS_LIST_2021_CREDENTIAL_URL = 'https://w3id.org/vc/status-list/2021/v1';

export const contexts: { [key: string]: Document } = {
  [DID_V1_URL]: didV1,
};
