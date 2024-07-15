import { Resolver } from 'did-resolver';
import * as web from 'web-did-resolver';
import * as ttVerify from '../../../../test-tradetrust/libs/tradetrust-tt/tt-verify/src/index.js';
import {
  BbsBlsSignature2020,
  BbsBlsSignatureProof2020,
  Bls12381G2KeyPair,
  deriveProof,
} from '@mattrglobal/jsonld-signatures-bbs';
import { generateKeyPair, issueDID, SecurityVocabTypeToContext } from '@tradetrust-tt/w3c-issuer';
import { } from "@transmute/bbs-bls12381-signature-2020";
import { extendContextLoader, purposes, sign, verify } from "jsonld-signatures";

const rawIDVC = {
  "@context": [
    // "https://www.w3.org/2018/credentials/v1",
    "https://didrp-test.esatus.com/schemas/basic-did-lei-mapping/v1",
    "https://w3id.org/security/bbs/v1",
    "https://w3id.org/vc/status-list/2021/v1",
    "https://w3id.org/security/suites/bls12381-2020/v1"
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
  "issuer": "did:web:localhost.nghaninn.com",
  "type": ["VerifiableCredential"],
};

const revealDocument = {
  "@context": [
    "https://www.w3.org/2018/credentials/v1",
    "https://didrp-test.esatus.com/schemas/basic-did-lei-mapping/v1",
    "https://w3id.org/security/bbs/v1",
    "https://w3id.org/security/suites/bls12381-2020/v1"
  ],
  "type": ["VerifiableCredential"],
  "credentialSubject": {
    "@explicit": true,
    "type": ["BasicDIDLEIMapping"],
    "lei": {}
  }
}

const issuedIDVC = {
  ...rawIDVC,
  "proof": {
    "type": "BbsBlsSignature2020",
    "created": "2024-04-11T10:51:46Z",
    "proofPurpose": "assertionMethod",
    "proofValue": "uDqETewb6fwNzGgihIxUSdvTyncfEeIjowsj91O4qT2HsTLk4OUmkdreSY55d+SzYUHlKfzccE4m7waZyoLEkBLFiK2g54Q2i+CdtYBgDdkUDsoULSBMcH1MwGHwdjfXpldFNFrHFx/IAvLVniyeMQ==",
    "verificationMethod": "did:web:didrp-test.esatus.com#keys-1"
  }
};

export const verifyIDVC2 = async () => {
  // https://github.com/mattrglobal
  // https://github.com/TradeTrust/tt-verify/blob/beta/src/verifiers/issuerIdentity/idvc/idvc-verifier.ts

  const webResolver = web.getResolver();
  // const ethrResolver = ethr.getResolver()
  const resolver = new Resolver(webResolver);
  // const resolver = new Resolver({
  //     ...ethrResolver,
  //     ...webResolver,
  // });

  const resolvedResponse = await resolver.resolve(issuedIDVC.issuer)
  // console.log('resolvedResponse', JSON.stringify(resolvedResponse, null, 2))
  const { didDocument } = resolvedResponse;
  // didDocument = {
  //     "@context": [
  //         "https://www.w3.org/ns/did/v1",
  //         "https://w3id.org/security/suites/jws-2020/v1",
  //         "https://w3id.org/security/suites/bls12381-2020/v1",
  //         "https://w3id.org/security/bbs/v1"
  //     ],
  //     "assertionMethod": [
  //         "did:web:didrp-test.esatus.com#keys-1"
  //     ],
  //     "capabilityDelegation": [
  //         "did:web:didrp-test.esatus.com#keys-1"
  //     ],
  //     "id": "did:web:didrp-test.esatus.com",
  //     "verificationMethod": [
  //         {
  //             "type": "Bls12381G2Key2020",
  //             "id": "did:web:didrp-test.esatus.com#keys-1",
  //             "controller": "did:web:didrp-test.esatus.com",
  //             "publicKeyBase58": "r7Ld81TFLZc7xTZ1EUWaG9EfYeSRgyu63eHC78WkgnX5W67qJeyDHqUDZa7Yc5SpnTvVJfPd6YEZW88jLrMs2Q1BJDPFCagaHDkY7ofZkyCUdFSMeA6BaWkBRbvNqhFf7RG"
  //         }
  //     ],
  //     "capabilityInvocation": [
  //         "did:web:didrp-test.esatus.com#keys-1"
  //     ],
  //     "authentication": [
  //         "did:web:didrp-test.esatus.com#keys-1"
  //     ]
  // }

  /**
   * Extract the verification method from the DID Document
   */

  // // Check if issuer proof purpose is valid
  // const proofPurpose = issuedIDVC.proof.proofPurpose;
  // const issuerKey = issuedIDVC.proof.verificationMethod;
  // if (didDocument?.hasOwnProperty(proofPurpose)) {
  //     const isValidIssuerKey = (didDocument as any)?.[proofPurpose].find((s: string) => s === issuerKey);
  //     if (!isValidIssuerKey) {
  //         throw new Error('Invalid issuer key');
  //     }
  // } else {
  //     throw new Error('Invalid proof purpose');
  // }

  // const verificationMethod = didDocument?.verificationMethod?.find(s => s.id === issuerKey);

  // if (verificationMethod?.publicKeyBase58 && !verificationMethod?.publicKeyMultibase) {
  //     verificationMethod.publicKeyMultibase = base58btc.encode(bs58.decode(verificationMethod.publicKeyBase58));
  //     verificationMethod.publicKeyHex = Buffer.from(bs58.decode(verificationMethod.publicKeyBase58)).toString('hex');
  // }
  // console.log('verificationMethod', verificationMethod)

  // const didWebDriver = driver();
  // didWebDriver.use({
  //     multibaseMultikeyHeader: 'zr7L',
  //     fromMultibase: Bls12381Multikey.from
  // });

  // const {
  //     didDocument: derivedDIDDoc, keyPairs, methodFor
  // } = await didWebDriver.fromKeyPair({
  //     // the desired `did:web` DID URL
  //     url: didUrlToHttpsUrl(issuedIDVC.issuer)?.fullUrl,
  //     // either one or both of these key pairs must be provided
  //     // verificationKeyPair: keyPairForVerification,
  //     verificationKeyPair: verificationMethod,
  //     // keyAgreementKeyPair: keyPairForKeyAgreement
  // });

  const result = await ttVerify.verifyIDVC(issuedIDVC);
  console.log('result', result)

  return result[0] === false && result[1];
}

function ensureSuiteContext(_ref2) {
  var document = _ref2.document;
  var contextUrl = "https://w3id.org/security/suites/bls12381-2020/v1";

  if (document["@context"] === contextUrl || Array.isArray(document["@context"]) && document["@context"].includes(contextUrl)) {
    // document already includes the required context
    return;
  }

  throw new TypeError("The document to be signed must contain this suite's @context, " + ("\"" + contextUrl + "\"."));
};

export const signIDVC = async () => {
  const generatedKeyPair = await generateKeyPair({ type: SecurityVocabTypeToContext.Bls12381G2Key2020, seedBase58: 'ZxmZigN9Bbw6zNEnLA4wDxfVvjoQsn8F' });
  console.log('generatedKeyPair', generatedKeyPair)
  const keyPair = await new Bls12381G2KeyPair({
    id: 'did:web:localhost.nghaninn.com#keys-1',
    // controller: SecurityVocabTypeToContext.Bls12381G2Key2020,
    controller: 'did:web:localhost.nghaninn.com',
    ...(generatedKeyPair as any)
  });
  console.log('keyPair', keyPair)

  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  const cacheDocument = new Map<string, any>();
  const customDocLoader = async (url: string): Promise<any> => {
    if (url.startsWith("did:web:")) {
      url = url.replace("did:web:", "https://");
      url = 'https://' + new URL(url).hostname + '/.well-known/did.json';
    }
    console.log('customDocLoader url', url)

    let result;
    if (cacheDocument.has(url)) {
      result = cacheDocument.get(url);
    } else {
      result = await (await fetch(url)).json();
      cacheDocument.set(url, result);
    }
    return {
      document: result,
    }
  };

  console.log("Input document");
  console.log(JSON.stringify(rawIDVC, null, 2));

  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  const documentLoader: any = extendContextLoader(customDocLoader);

  const signedDocument = await sign(rawIDVC, {
    // suite: new BbsBlsSignature2020({ key: keyPair }),
    suite: (() => {
      const suite = new BbsBlsSignature2020({ key: keyPair });
      (suite as any).ensureSuiteContext = ensureSuiteContext
      return suite;
    })(),
    purpose: new purposes.AssertionProofPurpose(),
    documentLoader,
  });

  console.log("Input document with proof");
  console.log(JSON.stringify(signedDocument, null, 2));

  const multiSignedDocument = await sign(signedDocument, {
    // suite: new BbsBlsSignature2020({ key: keyPair }),
    suite: (() => {
      const suite = new BbsBlsSignature2020({ key: keyPair });
      (suite as any).ensureSuiteContext = ensureSuiteContext
      return suite;
    })(),
    purpose: new purposes.AssertionProofPurpose(),
    documentLoader,
  });

  console.log("Input document with multiple proofs");
  console.log(JSON.stringify(multiSignedDocument, null, 2));

  //Verify the proof
  const verified = await verify(multiSignedDocument, {
    // suite: new BbsBlsSignature2020(),
    suite: (() => {
      const suite = new BbsBlsSignature2020();
      (suite as any).ensureSuiteContext = ensureSuiteContext
      return suite;
    })(),
    purpose: new purposes.AssertionProofPurpose(),
    documentLoader,
  });

  console.log("Verify the signed proof");
  console.log(JSON.stringify(verified, null, 2));

  //Derive a proof
  const derivedProof = await deriveProof(multiSignedDocument, revealDocument, {
    suite: new BbsBlsSignatureProof2020(),
    documentLoader,
  });

  console.log("Derived Proof Result");
  console.log(JSON.stringify(derivedProof, null, 2));

  //Verify the derived proof
  const derivedProofVerified = await verify(derivedProof, {
    suite: new BbsBlsSignatureProof2020(),
    purpose: new purposes.AssertionProofPurpose(),
    documentLoader,
  });

  console.log("Derived Proof Verification result");
  console.log(JSON.stringify(derivedProofVerified, null, 2));

  return {
    signProof: verified.verified,
    deriveProof: derivedProofVerified.verified
  };
}

// export const issueDID = async (didInput: BbsKeyPairType) => {
//     const base58 = await import('multiformats/bases/base58');
//     console.log('bbsKeyPairInput', didInput)

//     const did = `did:web:${stripDomain(didInput?.domain)}` ?? 'did:web:example.com';

//     const bbsKeyPair = await generateBbsKeyPair(didInput)
//     // const bbsKeyPair = Bls12381Multikey.generateBbsKeyPair({
//     //     id: did,
//     //     controller: did,
//     //     algorithm: Bls12381Multikey.ALGORITHMS.BBS_BLS12381_SHA256,
//     // })

//     console.log('bbsKeyPair', bbsKeyPair)

//     const keyPairs = {
//         id: `${did}#keys-1`,
//         type: 'Bls12381G2Key',
//         controller: did,

//         // privateKey: Buffer.from(bbsKeyPair.secretKey).toString('utf8'),
//         // privateKeyMultibase: base58.base58btc.encode(bbsKeyPair.secretKey),
//         privateKeyBase58: base58.base58btc.encode(bbsKeyPair.secretKey).slice(1),
//         // privateKeyHex: Buffer.from(bbsKeyPair.secretKey).toString('hex'),

//         // publicKey: Buffer.from(bbsKeyPair.publicKey).toString('utf8'),
//         // publicKeyMultibase: base58.base58btc.encode(bbsKeyPair.publicKey),
//         publicKeyBase58: base58.base58btc.encode(bbsKeyPair.publicKey).slice(1),
//         // publicKeyHex: Buffer.from(bbsKeyPair.publicKey).toString('hex')
//     }

//     const wellKnown = await generateWellKnownDid({
//         newKeyPair: keyPairs
//     })

//     return {
//         wellKnown,
//         did: keyPairs
//     };
// }

export { issueDID };
