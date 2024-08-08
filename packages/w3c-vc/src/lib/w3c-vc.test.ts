import { describe, expect, it } from 'vitest';
import { signCredential, verifyCredential } from './w3c-vc';

describe('Credential Signing and Verification', () => {
  it('should successfully sign and verify a credential', async () => {
    const credential = {
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
      issuanceDate: '2024-04-01T12:19:52Z',
      expirationDate: '2029-12-03T12:19:52Z',
      issuer: 'did:web:jocular-sunflower-144c0d.netlify.app',
      type: ['VerifiableCredential'],
    };

    const signingKeyPair = {
      id: 'did:web:jocular-sunflower-144c0d.netlify.app#keys-1',
      controller: 'did:web:jocular-sunflower-144c0d.netlify.app',
      privateKeyBase58: '44ToWFUFdm9eUa5So3fc1tCTpziiZLYM4qy5vZaGds1c',
      publicKeyBase58:
        't5Rdg91V9rVVKSGbeJ6ZJP32cED2Dad1nEjQpgMwMrmbvwryzgy8ppg9dwMNWJEKQL2dotEKAe1Z9iAe5e6wQBngCEqESavreSX8d1TfPtCyRYntYQe9pQWvaGae6NvJ68J',
    };

    // Sign the credential using the defined key pair
    const signedCredential = await signCredential(credential, signingKeyPair);
    expect(signedCredential).toBeDefined();

    // Verify the signed credential
    const verificationResult = await verifyCredential(signedCredential);
    expect(verificationResult).toBeDefined();

    // Check if the credential verification was successful
    expect(verificationResult.verified).toBe(true);
  });
});
