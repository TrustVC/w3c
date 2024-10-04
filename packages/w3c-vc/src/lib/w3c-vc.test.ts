import { VerificationType } from '@trustvc/w3c-issuer';
import { describe, expect, it } from 'vitest';
import { SignedVerifiableCredential } from './types';
import { signCredential, verifyCredential } from './w3c-vc';

const modifiedCredential: any = {
  '@context': [
    'https://www.w3.org/2018/credentials/v1',
    'https://w3c-ccg.github.io/citizenship-vocab/contexts/citizenship-v1.jsonld',
    'https://w3id.org/security/bbs/v1',
    'https://w3id.org/vc/status-list/2021/v1',
    'https://trustvc.io/context/transferable-records-context.json',
  ],
  credentialStatus: {
    type: 'TransferableRecords',
    tokenNetwork: {
      chain: 'MATIC',
      chainId: '80001',
    },
    tokenRegistry: '0xE0a94770B8e969B5D9179d6dA8730B01e19279e2',
  },
  credentialSubject: {
    name: 'TrustVC',
    birthDate: '2024-04-01T12:19:52Z',
    type: ['PermanentResident', 'Person'],
  },
  expirationDate: '2029-12-03T12:19:52Z',
  issuer: 'did:web:trustvc.github.io:did:1',
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
  it('should successfully sign and verify a credential', async () => {
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
