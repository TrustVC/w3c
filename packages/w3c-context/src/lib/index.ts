import { queryDidDocument } from '@trustvc/w3c-issuer';
import { DocumentLoader, DocumentLoaderObject } from './types';
// @ts-ignore: No types available for jsonld-signatures
import jsonldSignatures from 'jsonld-signatures';
import attachmentsContext from '../context/attachments-context.json';
import bbsV1 from '../context/bbs-v1.json';
import bolContext from '../context/bill-of-lading.json';
import bolcContext from '../context/bill-of-lading-carrier.json';
import cooContext from '../context/coo.json';
import credentialsV1 from '../context/credentials-v1.json';
import credentialsV2 from '../context/credentials-v2.json';
import didV1 from '../context/did-v1.json';
import invoiceContext from '../context/invoice.json';
import jwsV1 from '../context/jws-2020-v1.json';
import promissoryNoteContext from '../context/promissory-note.json';
import qrCodeContext from '../context/qrcode-context.json';
import renderContext from '../context/render-method-context.json';
import trContext from '../context/transferable-records-context.json';
import warehouseReceiptContext from '../context/warehouse-receipt.json';
import { Document } from './types';

export const DID_V1_URL = 'https://www.w3.org/ns/did/v1';
export const VC_V1_URL = 'https://www.w3.org/2018/credentials/v1';
export const VC_V2_URL = 'https://www.w3.org/ns/credentials/v2';
export const BBS_V1_URL = 'https://w3id.org/security/bbs/v1';
export const BLS12381_2020_V1_URL = 'https://w3id.org/security/suites/bls12381-2020/v1';
export const JWS_V1_URL = 'https://w3id.org/security/suites/jws-2020/v1';
export const STATUS_LIST_2021_CREDENTIAL_URL = 'https://w3id.org/vc/status-list/2021/v1';

export const TR_CONTEXT_URL = 'https://trustvc.io/context/transferable-records-context.json';
export const RENDER_CONTEXT_URL = 'https://trustvc.io/context/render-method-context.json';
export const ATTACHMENTS_CONTEXT_URL = 'https://trustvc.io/context/attachments-context.json';
export const QRCODE_CONTEXT_URL = 'https://trustvc.io/context/qrcode-context.json';

export const BOL_CONTEXT_URL = 'https://trustvc.io/context/bill-of-lading.json';
export const BOLC_CONTEXT_URL = 'https://trustvc.io/context/bill-of-lading-carrier.json';
export const COO_CONTEXT_URL = 'https://trustvc.io/context/coo.json';
export const INVOICE_CONTEXT_URL = 'https://trustvc.io/context/invoice.json';
export const PROMISSORY_NOTE_CONTEXT_URL = 'https://trustvc.io/context/promissory-note.json';
export const WAREHOUSE_RECEIPT_CONTEXT_URL = 'https://trustvc.io/context/warehouse-receipt.json';

export const contexts: { [key: string]: Document } = {
  [DID_V1_URL]: didV1,
  [VC_V1_URL]: credentialsV1,
  [VC_V2_URL]: credentialsV2,
  [BBS_V1_URL]: bbsV1,
  [BLS12381_2020_V1_URL]: bbsV1,
  [JWS_V1_URL]: jwsV1,
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

export const qrCodeContexts: { [key: string]: Document } = {
  [QRCODE_CONTEXT_URL]: qrCodeContext,
};

export const templateContexts: { [key: string]: Document } = {
  [BOL_CONTEXT_URL]: bolContext,
  [BOLC_CONTEXT_URL]: bolcContext,
  [COO_CONTEXT_URL]: cooContext,
  [INVOICE_CONTEXT_URL]: invoiceContext,
  [PROMISSORY_NOTE_CONTEXT_URL]: promissoryNoteContext,
  [WAREHOUSE_RECEIPT_CONTEXT_URL]: warehouseReceiptContext,
};

export const CredentialContextVersion = {
  v1: VC_V1_URL,
  v2: VC_V2_URL,
};

/**
 * Creates and returns a custom document loader for JSON-LD contexts.
 * The loader resolves DID URLs and fetches the corresponding DID documents.
 *
 * @param {Record<string, Document>} additionalContexts - Optional additional contexts to be loaded.
 * @returns {Promise<DocumentLoader>} A function that loads JSON-LD contexts.
 */

export async function getDocumentLoader(
  additionalContexts?: Record<string, Document>,
): Promise<DocumentLoader> {
  const resultMap = new Map<string, DocumentLoaderObject>();

  // Set default cached files within our lib.
  [
    contexts,
    trContexts,
    renderContexts,
    attachmentsContexts,
    qrCodeContexts,
    templateContexts,
    additionalContexts,
  ].forEach((context) => {
    if (!context) return;
    Object.entries(context).forEach(([url, document]) => {
      resultMap.set(url, {
        contextUrl: null,
        document: document,
        documentUrl: url,
      });
    });
  });

  const resolveDid = async (did: string) => {
    const { wellKnownDid } = await queryDidDocument({ did });
    const result: DocumentLoaderObject = {
      contextUrl: null,
      document: wellKnownDid,
      documentUrl: did,
    };

    resultMap.set(did, result);

    return result;
  };

  const customDocLoader = async (url: string) => {
    let result;

    // Serve cached results
    if (resultMap.has(url)) {
      result = resultMap.get(url);

      return result;
    }

    if (url.includes('did:')) {
      return resolveDid(url);
    }

    const results = await fetch(url, { redirect: 'follow' });

    const resolveContext: DocumentLoaderObject = {
      contextUrl: null,
      document: await results.json(),
      documentUrl: results.url,
    };

    resultMap.set(url, resolveContext);

    return resolveContext;
  };

  return jsonldSignatures.extendContextLoader(customDocLoader);
}
