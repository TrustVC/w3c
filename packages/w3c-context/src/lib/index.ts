import didV1 from '../context/did-v1.json';
import trContext from '../context/transferable-records-context.json';
import credentialsV1 from '../context/credentials-v1.json';
import credentialsV2 from '../context/credentials-v2.json';
import { Document } from './types';

export const DID_V1_URL = 'https://www.w3.org/ns/did/v1';
export const VC_V1_URL = 'https://www.w3.org/2018/credentials/v1';
export const VC_V2_URL = 'https://www.w3.org/ns/credentials/v2';
export const TR_CONTEXT_URL = 'https://trustvc.io/context/transferable-records-context.json';

export const BBS_V1_URL = 'https://w3id.org/security/bbs/v1';
export const STATUS_LIST_2021_CREDENTIAL_URL = 'https://w3id.org/vc/status-list/2021/v1';

export const contexts: { [key: string]: Document } = {
  [DID_V1_URL]: didV1,
  [VC_V1_URL]: credentialsV1,
  [VC_V2_URL]: credentialsV2,
};

export const trContexts: { [key: string]: Document } = {
  [TR_CONTEXT_URL]: trContext,
};

export const CredentialContextVersion = {
  v1: VC_V1_URL,
  v2: VC_V2_URL,
};
