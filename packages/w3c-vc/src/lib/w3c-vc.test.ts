import { VerificationType } from '@trustvc/w3c-issuer';
import { describe, expect, it } from 'vitest';
import { deriveCredential, signCredential, verifyCredential } from './w3c-vc';

const modifiedCredential: any = {
  '@context': [
    'https://www.w3.org/2018/credentials/v1',
    'https://w3id.org/security/bbs/v1',
    'https://w3id.org/vc/status-list/2021/v1',
    'https://trustvc.io/context/transferable-records-context.json',
    'https://trustvc.io/context/render-method-context.json',
    'https://trustvc.io/context/attachments-context.json',
    'https://trustvc.io/context/qrcode-context.json',
    'https://trustvc.io/context/bill-of-lading.json',
  ],
  qrCode: {
    type: 'TrustVCQRCode',
    uri: 'https://localhost:3000/qrcode',
  },
  credentialStatus: {
    type: 'TransferableRecords',
    tokenNetwork: {
      chain: 'MATIC',
      chainId: '80001',
    },
    tokenRegistry: '0xE0a94770B8e969B5D9179d6dA8730B01e19279e2',
  },
  credentialSubject: {
    billOfLadingName: 'TrustVC Bill of Lading',
    scac: 'SGPU',
    blNumber: 'SGCNM21566325',
    vessel: 'vessel',
    voyageNo: 'voyageNo',
    portOfLoading: 'Singapore',
    portOfDischarge: 'Paris',
    carrierName: 'A.P. Moller',
    placeOfReceipt: 'Beijing',
    placeOfDelivery: 'Singapore',
    packages: [
      { packagesDescription: 'package 1', packagesWeight: '10', packagesMeasurement: '20' },
      { packagesDescription: 'package 2', packagesWeight: '10', packagesMeasurement: '20' },
    ],
    shipperName: 'Shipper Name',
    shipperAddressStreet: '101 ORCHARD ROAD',
    shipperAddressCountry: 'SINGAPORE',
    consigneeName: 'Consignee name',
    notifyPartyName: 'Notify Party Name',
    links: 'https://localhost:3000/url',
    attachments: [
      { data: 'BASE64_ENCODED_FILE', filename: 'sample1.pdf', mimeType: 'application/pdf' },
      { data: 'BASE64_ENCODED_FILE', filename: 'sample2.pdf', mimeType: 'application/pdf' },
    ],
    type: ['BillOfLading'],
  },
  renderMethod: [
    {
      id: 'https://localhost:3000/renderer',
      type: 'EMBEDDED_RENDERER',
      templateName: 'BILL_OF_LADING',
    },
  ],
  expirationDate: '2029-12-03T12:19:52Z',
  issuer: 'did:web:trustvc.github.io:did:1',
  type: ['VerifiableCredential'],
};

const revealDocument: any = {
  '@context': [
    'https://www.w3.org/2018/credentials/v1',
    'https://w3id.org/security/bbs/v1',
    'https://w3id.org/vc/status-list/2021/v1',
    'https://trustvc.io/context/transferable-records-context.json',
    'https://trustvc.io/context/render-method-context.json',
    'https://trustvc.io/context/attachments-context.json',
    'https://trustvc.io/context/qrcode-context.json',
    'https://trustvc.io/context/bill-of-lading.json',
  ],
  credentialSubject: {
    type: ['BillOfLading'],
    '@explicit': true,
    billOfLadingName: {},
    blNumber: {},
    packages: {},
    shipperName: {},
    attachments: {},
  },
  type: ['VerifiableCredential'],
};

const modifiedKeyPair: any = {
  id: 'did:web:trustvc.github.io:did:1#keys-1',
  controller: 'did:web:trustvc.github.io:did:1',
  type: VerificationType.Bls12381G2Key2020,
  publicKeyBase58:
    'oRfEeWFresvhRtXCkihZbxyoi2JER7gHTJ5psXhHsdCoU1MttRMi3Yp9b9fpjmKh7bMgfWKLESiK2YovRd8KGzJsGuamoAXfqDDVhckxuc9nmsJ84skCSTijKeU4pfAcxeJ',
};

describe('Credential Signing and Verification', () => {
  it('should successfully sign, derive and verify a credential', async () => {
    let signingKeyPair = modifiedKeyPair;
    signingKeyPair = {
      ...signingKeyPair,
      privateKeyBase58: '4LDU56PUhA9ZEutnR1qCWQnUhtLtpLu2EHSq4h1o7vtF',
    };

    let credential = modifiedCredential;
    credential = { ...credential, issuanceDate: '2024-04-01T12:19:52Z' };

    const signedCredential = await signCredential(credential, signingKeyPair);
    expect(signedCredential.signed).toBeDefined();
    expect(signedCredential.error).toBeUndefined();

    let verificationResult = await verifyCredential(signedCredential.signed);
    expect(verificationResult.verified).toBe(true);
    expect(verificationResult.error).toBeUndefined();

    const derivedCredential = await deriveCredential(signedCredential.signed, revealDocument);
    expect(derivedCredential.derived).toBeDefined();
    expect(derivedCredential.error).toBeUndefined();

    verificationResult = await verifyCredential(derivedCredential.derived);
    expect(verificationResult.verified).toBe(true);
    expect(verificationResult.error).toBeUndefined();
  });

  it('should fail to sign if the private key is missing from the key pair', async () => {
    let credential = modifiedCredential;
    credential = { ...credential, issuanceDate: '2024-04-01T12:19:52Z' };

    const signedCredential = await signCredential(credential, modifiedKeyPair);
    expect(signedCredential.signed).toBeUndefined();
    expect(signedCredential.error).toBeDefined();
    expect(signedCredential.error).equals('"privateKeyBase58" property in keyPair is required.');
  });

  it('should fail to sign if the id field is present in the credential', async () => {
    let signingKeyPair = modifiedKeyPair;
    signingKeyPair = {
      ...signingKeyPair,
      privateKeyBase58: '4LDU56PUhA9ZEutnR1qCWQnUhtLtpLu2EHSq4h1o7vtF',
    };

    let credential = modifiedCredential;
    credential = {
      ...credential,
      issuanceDate: '2024-04-01T12:19:52Z',
      id: 'urn:uuid:0192d19c-d82c-7cc7-9431-cb495374f43b',
    };

    const signedCredential = await signCredential(credential, signingKeyPair);
    expect(signedCredential.signed).toBeUndefined();
    expect(signedCredential.error).toBeDefined();
    expect(signedCredential.error).equals(
      '"id" is a defined field and should not be set by the user.',
    );
  });

  it('should fail to sign if a required property in the credential is missing', async () => {
    let signingKeyPair = modifiedKeyPair;
    signingKeyPair = {
      ...signingKeyPair,
      privateKeyBase58: '4LDU56PUhA9ZEutnR1qCWQnUhtLtpLu2EHSq4h1o7vtF',
    };

    const signedCredential = await signCredential(modifiedCredential, signingKeyPair);
    expect(signedCredential.signed).toBeUndefined();
    expect(signedCredential.error).toBeDefined();
    expect(signedCredential.error).equals('"issuanceDate" property is required.');
  });

  it('should fail verification if the signed credential is tampered with', async () => {
    let signedCredential = modifiedCredential;
    signedCredential = {
      ...signedCredential,
      id: 'urn:bnid:_:0193b647-66b6-7ffc-ae79-ef9c590f3301',
      credentialStatus: {
        ...signedCredential.credentialStatus,
        tokenId: '398124e7f1ec797a3dea6322e5ce4ff5ee242ab6293c2acf41a95178dfb27dae',
      },
      issuanceDate: '2024-04-01T12:19:53Z',
      proof: {
        type: 'BbsBlsSignature2020',
        created: '2024-08-23T03:08:31Z',
        proofPurpose: 'assertionMethod',
        proofValue:
          'sHGTYvavHMHVJ3NgyEgiyDDa0IjG3wS9GChizckQHANWzcZRqBjD4uSZjxmS2fGzEgJJB6/JaL7FY9rx42Bkg/SRjvaaUiBVyOwUXeXUZMdlGEIpjzO8GDognziPqN7S9KEZagvnv3MESEx0EwvgEw==',
        verificationMethod: 'did:web:trustvc.github.io:did:1#keys-1',
      },
    };

    const verificationResult = await verifyCredential(signedCredential);
    expect(verificationResult.verified).toBe(false);
    expect(verificationResult.error).equals('Invalid signature.');
  });

  it('should fail verification if an unsupported signature suite is used', async () => {
    let signedCredential = modifiedCredential;
    signedCredential = {
      ...signedCredential,
      issuanceDate: '2024-04-01T12:19:52Z',
      proof: {
        type: 'Ed25519Signature2020',
        created: '2024-08-23T03:08:31Z',
        proofPurpose: 'assertionMethod',
        proofValue:
          'sHGTYvavHMHVJ3NgyEgiyDDa0IjG3wS9GChizckQHANWzcZRqBjD4uSZjxmS2fGzEgJJB6/JaL7FY9rx42Bkg/SRjvaaUiBVyOwUXeXUZMdlGEIpjzO8GDognziPqN7S9KEZagvnv3MESEx0EwvgEw==',
        verificationMethod: 'did:web:trustvc.github.io:did:1#keys-1',
      },
    };

    const verificationResult = await verifyCredential(signedCredential);
    expect(verificationResult.verified).toBe(false);
    expect(verificationResult.error).equals('"proof" type is not of BbsBlsSignature2020.');
  });

  it('should fail verification if the verification method cannot be found', async () => {
    let signedCredential = modifiedCredential;
    signedCredential = {
      ...signedCredential,
      id: 'urn:bnid:_:0193b647-66b6-7ffc-ae79-ef9c590f3301',
      credentialStatus: {
        ...signedCredential.credentialStatus,
        tokenId: '398124e7f1ec797a3dea6322e5ce4ff5ee242ab6293c2acf41a95178dfb27dae',
      },
      issuanceDate: '2024-04-01T12:19:52Z',
      proof: {
        type: 'BbsBlsSignature2020',
        created: '2024-08-23T03:08:31Z',
        proofPurpose: 'assertionMethod',
        proofValue:
          'sHGTYvavHMHVJ3NgyEgiyDDa0IjG3wS9GChizckQHANWzcZRqBjD4uSZjxmS2fGzEgJJB6/JaL7FY9rx42Bkg/SRjvaaUiBVyOwUXeXUZMdlGEIpjzO8GDognziPqN7S9KEZagvnv3MESEx0EwvgEw==',
        verificationMethod: 'did:web:trustvc.github.io:did:1#keys-2',
      },
    };

    const verificationResult = await verifyCredential(signedCredential);
    expect(verificationResult.verified).toBe(false);
    expect(verificationResult.error).equals('Verification method could not be found.');
  });
});
