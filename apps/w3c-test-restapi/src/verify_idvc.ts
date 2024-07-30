/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  BbsBlsSignature2020,
  BbsBlsSignatureProof2020,
  Bls12381G2KeyPair,
  deriveProof,
} from '@mattrglobal/jsonld-signatures-bbs';
import { generateKeyPair, issueDID, VerificationType } from '@tradetrust-tt/w3c-issuer';
import { } from '@transmute/bbs-bls12381-signature-2020';
import { Resolver } from 'did-resolver';
import { extendContextLoader, purposes, sign, verify } from 'jsonld-signatures';
import * as web from 'web-did-resolver';

const rawIDVC = {
  '@context': [
    'https://www.w3.org/2018/credentials/v1',
    'https://didrp-test.esatus.com/schemas/basic-did-lei-mapping/v1',
    'https://w3id.org/security/bbs/v1',
    'https://w3id.org/vc/status-list/2021/v1',
    'https://w3id.org/security/suites/bls12381-2020/v1',
  ],
  credentialStatus: {
    id: 'https://didrp-test.esatus.com/credentials/statuslist/1#27934',
    statusListCredential: 'https://didrp-test.esatus.com/credentials/statuslist/1',
    statusListIndex: 27934,
    statusPurpose: 'revocation',
    type: 'StatusList2021Entry',
  },
  credentialSubject: {
    entityName: 'IMDA_active',
    id: 'did:ethr:0x433097a1C1b8a3e9188d8C54eCC057B1D69f1638',
    lei: '391200WCZAYD47QIKX37',
    type: ['BasicDIDLEIMapping'],
  },
  issuanceDate: '2024-04-01T12:19:52Z',
  expirationDate: '2029-12-03T12:19:52Z',
  issuer: 'did:web:localhost.com',
  type: ['VerifiableCredential'],
};

const revealDocument = {
  '@context': [
    'https://www.w3.org/2018/credentials/v1',
    'https://didrp-test.esatus.com/schemas/basic-did-lei-mapping/v1',
    'https://w3id.org/security/bbs/v1',
    'https://w3id.org/security/suites/bls12381-2020/v1',
  ],
  type: ['VerifiableCredential'],
  credentialSubject: {
    '@explicit': true,
    type: ['BasicDIDLEIMapping'],
    lei: {},
  },
};

const issuedIDVC = {
  ...rawIDVC,
  proof: {
    type: 'BbsBlsSignature2020',
    created: '2024-04-11T10:51:46Z',
    proofPurpose: 'assertionMethod',
    proofValue:
      'uDqETewb6fwNzGgihIxUSdvTyncfEeIjowsj91O4qT2HsTLk4OUmkdreSY55d+SzYUHlKfzccE4m7waZyoLEkBLFiK2g54Q2i+CdtYBgDdkUDsoULSBMcH1MwGHwdjfXpldFNFrHFx/IAvLVniyeMQ==',
    verificationMethod: 'did:web:didrp-test.esatus.com#keys-1',
  },
};

export const verifyIDVC = async () => {
  // https://github.com/mattrglobal
  // https://github.com/TradeTrust/tt-verify/blob/beta/src/verifiers/issuerIdentity/idvc/idvc-verifier.ts

  const webResolver = web.getResolver();
  const resolver = new Resolver(webResolver);

  const _resolvedResponse = await resolver.resolve(issuedIDVC.issuer);
  // const { didDocument } = resolvedResponse;

  // FIXME: This is implemented with dev Branch of tt-verify, route package to local instance of tt-verify in order to test
  // add new path to tsconfig.base.json "@tradetrust-tt/tt-verify": ["../<..>/tt-verify/src"],
  // const result = await ttVerify.verifyIDVC(issuedIDVC);
  // console.log('result', result)

  // return result[0] === false && result[1];
};

function ensureSuiteContext(_ref2) {
  const document = _ref2.document;
  const contextUrl = 'https://w3id.org/security/suites/bls12381-2020/v1';

  if (
    document['@context'] === contextUrl ||
    (Array.isArray(document['@context']) && document['@context'].includes(contextUrl))
  ) {
    // document already includes the required context
    return;
  }

  throw new TypeError(
    "The document to be signed must contain this suite's @context, " + ('"' + contextUrl + '".'),
  );
}

export const signIDVC = async () => {
  const generatedKeyPair = await generateKeyPair({
    type: VerificationType.Bls12381G2Key2020,
    seedBase58: 'ZxmZigN9Bbw6zNEnLA4wDxfVvjoQsn8F',
  });

  const keyPair = new Bls12381G2KeyPair({
    id: 'did:web:localhost.com#keys-1',
    controller: 'did:web:localhost.com',
    ...(generatedKeyPair as any),
  });

  const cacheDocument = new Map<string, any>();
  const customDocLoader = async (url: string): Promise<any> => {
    if (url.startsWith('did:web:')) {
      url = url.replace('did:web:', 'https://');
      url = 'https://' + new URL(url).hostname + '/.well-known/did.json';
    }

    let result;
    if (cacheDocument.has(url)) {
      result = cacheDocument.get(url);
    } else {
      result = await (await fetch(url)).json();
      cacheDocument.set(url, result);
    }
    return {
      document: result,
    };
  };

  const documentLoader: any = extendContextLoader(customDocLoader);

  const signedDocument = await sign(rawIDVC, {
    // suite: new BbsBlsSignature2020({ key: keyPair }),
    suite: (() => {
      const suite = new BbsBlsSignature2020({ key: keyPair });
      (suite as any).ensureSuiteContext = ensureSuiteContext;
      return suite;
    })(),
    purpose: new purposes.AssertionProofPurpose(),
    documentLoader,
  });

  console.log('Input document with proof');
  console.log(JSON.stringify(signedDocument, null, 2));

  const multiSignedDocument = await sign(signedDocument, {
    // suite: new BbsBlsSignature2020({ key: keyPair }),
    suite: (() => {
      const suite = new BbsBlsSignature2020({ key: keyPair });
      (suite as any).ensureSuiteContext = ensureSuiteContext;
      return suite;
    })(),
    purpose: new purposes.AssertionProofPurpose(),
    documentLoader,
  });

  console.log('Input document with multiple proofs');
  console.log(JSON.stringify(multiSignedDocument, null, 2));

  //Verify the proof
  const verified = await verify(multiSignedDocument, {
    // suite: new BbsBlsSignature2020(),
    suite: (() => {
      const suite = new BbsBlsSignature2020();
      (suite as any).ensureSuiteContext = ensureSuiteContext;
      return suite;
    })(),
    purpose: new purposes.AssertionProofPurpose(),
    documentLoader,
  });

  console.log('Verify the signed proof');
  console.log(JSON.stringify(verified, null, 2));

  //Derive a proof
  const derivedProof = await deriveProof(multiSignedDocument, revealDocument, {
    suite: new BbsBlsSignatureProof2020(),
    documentLoader,
  });

  console.log('Derived Proof Result');
  console.log(JSON.stringify(derivedProof, null, 2));

  //Verify the derived proof
  const derivedProofVerified = await verify(derivedProof, {
    suite: new BbsBlsSignatureProof2020(),
    purpose: new purposes.AssertionProofPurpose(),
    documentLoader,
  });

  console.log('Derived Proof Verification result');
  console.log(JSON.stringify(derivedProofVerified, null, 2));

  return {
    signProof: verified.verified,
    deriveProof: derivedProofVerified.verified,
  };
};

export { issueDID };
