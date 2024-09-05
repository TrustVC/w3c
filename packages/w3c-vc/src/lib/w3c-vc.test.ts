import { VerificationType } from '@tradetrust-tt/w3c-issuer';
import { describe, expect, it } from 'vitest';
import { signCredential, verifyCredential } from './w3c-vc';
import { SignedVerifiableCredential } from './types';

const modifiedCredential: any = {
  '@context': [
    'https://www.w3.org/2018/credentials/v1',
    'https://didrp-test.esatus.com/schemas/basic-did-lei-mapping/v1',
    'https://w3id.org/security/bbs/v1',
    'https://w3id.org/vc/status-list/2021/v1',
  ],
  credentialStatus: {
    id: 'https://didrp-test.esatus.com/credentials/statuslist/1#27934',
    statusListCredential: 'https://didrp-test.esatus.com/credentials/statuslist/1',
    statusListIndex: 27934,
    statusPurpose: 'revocation',
    type: 'StatusList2021Entry',
  },
  credentialSubject: {
    entityName: 'IMDA',
    id: 'did:ethr:0x433097a1C1b8a3e9188d8C54eCC057B1D69f1638',
    lei: '391200WCZAYD47QIKX37',
    type: ['BasicDIDLEIMapping'],
  },
  expirationDate: '2029-12-03T12:19:52Z',
  issuer: 'did:web:jocular-sunflower-144c0d.netlify.app',
  type: ['VerifiableCredential'],
};

const modifiedKeyPair: any = {
  id: 'did:web:jocular-sunflower-144c0d.netlify.app#keys-1',
  controller: 'did:web:jocular-sunflower-144c0d.netlify.app',
  type: VerificationType.Bls12381G2Key2020,
  publicKeyBase58:
    't5Rdg91V9rVVKSGbeJ6ZJP32cED2Dad1nEjQpgMwMrmbvwryzgy8ppg9dwMNWJEKQL2dotEKAe1Z9iAe5e6wQBngCEqESavreSX8d1TfPtCyRYntYQe9pQWvaGae6NvJ68J',
};

describe('Credential Signing and Verification', () => {
  it('should successfully sign and verify a credential', async () => {
    let signingKeyPair = modifiedKeyPair;
    signingKeyPair = {
      ...signingKeyPair,
      privateKeyBase58: '44ToWFUFdm9eUa5So3fc1tCTpziiZLYM4qy5vZaGds1c',
    };

    let credential = modifiedCredential;
    credential = { ...credential, issuanceDate: '2024-04-01T12:19:52Z' };

    const signedCredential = await signCredential(credential, signingKeyPair);
    expect(signedCredential.signed).toBeDefined();
    expect(signedCredential.error).toBeUndefined();

    const verificationResult = await verifyCredential(
      signedCredential.signed as SignedVerifiableCredential,
    );
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

  it('should fail to sign if a required property in the credential is missing', async () => {
    let signingKeyPair = modifiedKeyPair;
    signingKeyPair = {
      ...signingKeyPair,
      privateKeyBase58: '44ToWFUFdm9eUa5So3fc1tCTpziiZLYM4qy5vZaGds1c',
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
      issuanceDate: '2024-04-01T12:19:53Z',
      proof: {
        type: 'BbsBlsSignature2020',
        created: '2024-08-23T03:08:31Z',
        proofPurpose: 'assertionMethod',
        proofValue:
          'sHGTYvavHMHVJ3NgyEgiyDDa0IjG3wS9GChizckQHANWzcZRqBjD4uSZjxmS2fGzEgJJB6/JaL7FY9rx42Bkg/SRjvaaUiBVyOwUXeXUZMdlGEIpjzO8GDognziPqN7S9KEZagvnv3MESEx0EwvgEw==',
        verificationMethod: 'did:web:jocular-sunflower-144c0d.netlify.app#keys-1',
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
        verificationMethod: 'did:web:jocular-sunflower-144c0d.netlify.app#keys-1',
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
      issuanceDate: '2024-04-01T12:19:52Z',
      proof: {
        type: 'BbsBlsSignature2020',
        created: '2024-08-23T03:08:31Z',
        proofPurpose: 'assertionMethod',
        proofValue:
          'sHGTYvavHMHVJ3NgyEgiyDDa0IjG3wS9GChizckQHANWzcZRqBjD4uSZjxmS2fGzEgJJB6/JaL7FY9rx42Bkg/SRjvaaUiBVyOwUXeXUZMdlGEIpjzO8GDognziPqN7S9KEZagvnv3MESEx0EwvgEw==',
        verificationMethod: 'did:web:jocular-sunflower-144c0d.netlify.app#keys-2',
      },
    };

    const verificationResult = await verifyCredential(signedCredential);
    expect(verificationResult.verified).toBe(false);
    expect(verificationResult.error).equals('Verification method could not be found.');
  });
});
