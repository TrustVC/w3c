import dotenv from 'dotenv';
import express, { NextFunction, Request, Response } from 'express';
import _ from 'lodash';
import * as tradetrust from '../../../../test-tradetrust/libs/tradetrust-tt/tradetrust/src/index.js';
import rawV4IDVCDocument from '../../../../test-tradetrust/libs/tradetrust-tt/tradetrust/test/fixtures/v4/tt/did-idvc-raw.json';
import * as ttVerify from '../../../../test-tradetrust/libs/tradetrust-tt/tt-verify/src/index.js';
import { issueDID, signIDVC, verifyIDVC } from './verify_idvc.js';
import { generateBls12381KeyPair, generateEd25519KeyPair, generateKeyPair } from '@tradetrust-tt/w3c-issuer';
// import { generateBbsKeyPair, generateEd25519KeyPair, generateKeyPair } from '../../w3c-issuer/src/did-web/index.js';

const {
  SUPPORTED_SIGNING_ALGORITHM,
  SigningKey,
  TTv4,
  sign,
  _unsafe_use_it_at_your_own_risk_v4_alpha_tt_wrapDocuments: wrapDocumentsV4
} = tradetrust;

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use([
  express.json({ limit: '50mb' }), // json
  (req: Request, res: Response, next: NextFunction) => {
    console.log({
      url: req.url,
      method: req.method,
      // body: req.body
    })
    next();
  }
])


app.post('/issue', async (req: Request, res: Response) => {
  try {
    let document = req.body;
    console.log('document', document);

    if (_.isEmpty(document)) {
      document = rawV4IDVCDocument
    }

    const key: SigningKey = {
      private: process.env.PRIVATE_KEY || '0x7228c7b0349d52e660aba04f586b292f5a527e0568fa6549c37dab728a9d3675',
      public: process.env.PUBLIC_KEY || 'did:ethr:0xeBF5EECF62CF9E40E8224F864D162041e3d756B7'
    }

    console.log('document', document)

    const signature = (document: TTv4.WrappedDocument) => sign(SUPPORTED_SIGNING_ALGORITHM.Secp256k1VerificationKey2018, JSON.stringify(document), key, { signAsString: true });


    const wrappedDocuments = await wrapDocumentsV4([document]);
    console.log('wrappedDocuments', wrappedDocuments);
    await Promise.all(wrappedDocuments.map(async (wrappedDocument: TTv4.WrappedDocument) => {

      const signedWrappedDocuments = await signature(wrappedDocument);
      console.log('signedWrappedDocuments', signedWrappedDocuments);
      wrappedDocument.proof = {
        ...wrappedDocument.proof,
        key: key.public,
        signature: `0x${signedWrappedDocuments}`
      }

      return wrappedDocument;
    }));

    res.json(wrappedDocuments);
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: error?.message });
  }
});

app.get('/', (req: Request, res: Response) => {

});

app.post('/vc-api-verifier-test-suite/verifiers', async (req: Request, res: Response) => {
  try {
    res.json({})
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: error?.message });
  }
});

app.post('/sign', async (req: Request, res: Response) => {
  try {
    const result = await signIDVC();
    res.json({ result })
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: error?.message });
  }
});

app.post('/vc-api-verifier-test-suite/issuers', async (req: Request, res: Response) => {
  try {

    // const { credential } = req.body;
    // console.log('credential', credential);
    // credential.credentialStatus = {
    //   "type": "TradeTrustCredentialStatus",
    //   "credentialStatusType": "NONE"
    // }
    // credential['@context'].push("https://schemata.tradetrust.io/io/tradetrust/4.0/alpha-context.json")
    // credential.type.push("TradeTrustCredential")
    // credential.network = {
    //   "chain": "NA",
    //   "chainId": "NA"
    // }
    // console.log('credential', credential);

    // const wrappedDocuments = await wrapDocumentsV4([credential]);
    // console.log('wrappedDocuments', wrappedDocuments);

    res.json({
      "id": "did:ethr:0x433097a1C1b8a3e9188d8C54eCC057B1D69f1638",
      "type": "TradeTrustIssuer",
      "name": "My Own Company Pte Ltd",
      "@context": ["https://w3id.org/zcap/v1"],
      "identityProof": {
        "identityProofType": "IDVC",
        "identifier": "My Own Company Pte Ltd",
        "identityVC": {
          "type": "TradeTrustIdentityVC",
          "data": {
            "@context": [
              "https://www.w3.org/2018/credentials/v1",
              "https://didrp-test.esatus.com/schemas/basic-did-lei-mapping/v1",
              "https://w3id.org/security/bbs/v1",
              "https://w3id.org/vc/status-list/2021/v1"
            ],
            "credentialStatus": {
              "id": "https://didrp-test.esatus.com/credentials/statuslist/1#27934",
              "statusListCredential": "https://didrp-test.esatus.com/credentials/statuslist/1",
              "statusListIndex": 27934,
              "statusPurpose": "revocation",
              "type": "StatusList2021Entry"
            },
            "credentialSubject": {
              "entityName": "IMDA_active",
              "id": "did:ethr:0x433097a1C1b8a3e9188d8C54eCC057B1D69f1638",
              "lei": "391200WCZAYD47QIKX37",
              "type": ["BasicDIDLEIMapping"]
            },
            "issuanceDate": "2024-04-01T12:19:52Z",
            "expirationDate": "2029-12-03T12:19:52Z",
            "issuer": "did:web:didrp-test.esatus.com",
            "type": ["VerifiableCredential"],
            "proof": {
              "type": "BbsBlsSignature2020",
              "created": "2024-04-11T10:51:46Z",
              "proofPurpose": "assertionMethod",
              "proofValue": "uDqETewb6fwNzGgihIxUSdvTyncfEeIjowsj91O4qT2HsTLk4OUmkdreSY55d+SzYUHlKfzccE4m7waZyoLEkBLFiK2g54Q2i+CdtYBgDdkUDsoULSBMcH1MwGHwdjfXpldFNFrHFx/IAvLVniyeMQ==",
              "verificationMethod": "did:web:didrp-test.esatus.com#keys-1"
            }
          }
        }
      }
    })

  } catch (error) {
    console.error(error);
    res.status(400).json({ error: error?.message });
  }
});

app.post('/vc-api-test-suite/verify', async (req: Request, res: Response) => {
  try {
    const { verifiableCredential } = req.body;
    // console.log('document', verifiableCredential);

    const VERIFICATION_TYPE = ['DOCUMENT_INTEGRITY', 'DOCUMENT_STATUS', 'ISSUER_IDENTITY']

    const verifyResult = await ttVerify.verify(verifiableCredential);
    // console.log('verifyResult', verifyResult);

    const verifyFilteredOutput = VERIFICATION_TYPE.map((type) => {
      return verifyResult.find((r) => r.status === 'VALID' && r.type === type)
    });

    if (verifyFilteredOutput.every(Boolean)) {
      res.json({ checks: ['proof'] });
    } else {
      res.status(400).json({ error: 'Invalid proof' });
    }
  } catch (error) {
    // console.error(error);
    res.status(400).json({ error: error?.message });
  }
});

app.get('/verify_idvc', async (req: Request, res: Response) => {
  try {
    const result = await verifyIDVC()
    console.log('/verify_idvc', result)
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err });
  }
});

app.get('/issue_didweb', async (req: Request, res: Response) => {
  try {
    const { seedBase58, privateKeyBase58, publicKeyBase58, domain, type } = req.body
    const result = await issueDID({ domain, type, seedBase58, privateKeyBase58, publicKeyBase58 })
    res.json(result)
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: error?.message });
  }
});

app.get('/new_private_key', async (req: Request, res: Response) => {
  try {
    const { seedBase58, privateKeyBase58, publicKeyBase58, domain, type } = req.body
    let result = await generateKeyPair({ type, seedBase58, privateKeyBase58, publicKeyBase58 })

    res.json({ result });
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: error?.message });
  }
});

app.get('/.well-known/did.json', async (req: Request, res: Response) => {
  res.type('application/did+ld+json').json({
    "id": "did:web:localhost.nghaninn.com",
    "verificationMethod": [
      {
        "type": "Bls12381G2Key2020",
        "id": "did:web:localhost.nghaninn.com#keys-1",
        "controller": "did:web:localhost.nghaninn.com",
        "publicKeyBase58": "yeFTpcEiuHVwhWuBfkKfuS6UVowJciCxTL7meFXjhu1vUAk1yYf8FbTk3BjiBgiyHXasTgznidM6WTSzxBYhXwfqEGbFSZToVxbhTQ1A1HYcnUuiocFgTAoyfCvbAhijdwx"
      }
    ],
    "@context": [
      "https://www.w3.org/ns/did/v1",
      "https://w3id.org/security/suites/bls12381-2020/v1"
    ],
    "assertionMethod": [
      "did:web:localhost.nghaninn.com#keys-1"
    ],
    "capabilityInvocation": [
      "did:web:localhost.nghaninn.com#keys-1"
    ]
  })
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});