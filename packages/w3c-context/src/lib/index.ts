import attachmentsContext from '../context/attachments-context.json';
import bbsV1 from '../context/bbs-v1.json';
import bolContext from '../context/bill-of-lading.json';
import credentialsV1 from '../context/credentials-v1.json';
import credentialsV2 from '../context/credentials-v2.json';
import didV1 from '../context/did-v1.json';
import invoiceContext from '../context/invoice.json';
import renderContext from '../context/render-method-context.json';
import trContext from '../context/transferable-records-context.json';
import { Document } from './types';

export const DID_V1_URL = 'https://www.w3.org/ns/did/v1';
export const VC_V1_URL = 'https://www.w3.org/2018/credentials/v1';
export const VC_V2_URL = 'https://www.w3.org/ns/credentials/v2';
export const TR_CONTEXT_URL = 'https://trustvc.io/context/transferable-records-context.json';
export const RENDER_CONTEXT_URL = 'https://trustvc.io/context/render-method-context.json';
export const ATTACHMENTS_CONTEXT_URL = 'https://trustvc.io/context/attachments-context.json';
export const BOL_CONTEXT_URL = 'https://trustvc.io/context/bill-of-lading.json';
export const INVOICE_CONTEXT_URL = 'https://trustvc.io/context/invoice.json';

export const BBS_V1_URL = 'https://w3id.org/security/bbs/v1';
export const STATUS_LIST_2021_CREDENTIAL_URL = 'https://w3id.org/vc/status-list/2021/v1';

export const contexts: { [key: string]: Document } = {
  [DID_V1_URL]: didV1,
  [VC_V1_URL]: credentialsV1,
  [VC_V2_URL]: credentialsV2,
  [BBS_V1_URL]: bbsV1,
};

export const trContexts: { [key: string]: Document } = {
  [TR_CONTEXT_URL]: trContext,
};

export const renderContexts: { [key: string]: Document } = {
  [RENDER_CONTEXT_URL]: renderContext,
};

export const attachmentsContexts: { [key: string]: Document } = {
  [ATTACHMENTS_CONTEXT_URL]: attachmentsContext,
};

export const bolContexts: { [key: string]: Document } = {
  [BOL_CONTEXT_URL]: bolContext,
};

export const invoiceContexts: { [key: string]: Document } = {
  [INVOICE_CONTEXT_URL]: invoiceContext,
};

export const CredentialContextVersion = {
  v1: VC_V1_URL,
  v2: VC_V2_URL,
};
