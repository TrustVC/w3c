import { PrivateKeyPair, VerificationType } from '@tradetrust-tt/w3c-issuer';
import { describe, expect, it } from 'vitest';
import { createCredentialStatusPayload } from './index';

const PRIVATE_KEY_PAIR: PrivateKeyPair = {
  id: 'did:web:jocular-sunflower-144c0d.netlify.app#keys-1',
  controller: 'did:web:jocular-sunflower-144c0d.netlify.app',
  type: VerificationType.Bls12381G2Key2020,
  privateKeyBase58: '44ToWFUFdm9eUa5So3fc1tCTpziiZLYM4qy5vZaGds1c',
  publicKeyBase58:
    't5Rdg91V9rVVKSGbeJ6ZJP32cED2Dad1nEjQpgMwMrmbvwryzgy8ppg9dwMNWJEKQL2dotEKAe1Z9iAe5e6wQBngCEqESavreSX8d1TfPtCyRYntYQe9pQWvaGae6NvJ68J',
};

describe('w3c-credential-status', () => {
  describe('createCredentialStatusVC', () => {
    it('should create a credential status VC successfully', async () => {
      const credentialStatusPayload = await createCredentialStatusPayload(
        {
          id: 'https://example.com/credentials/3732',
          credentialSubject: {
            type: 'StatusList2021',
            id: 'https://example.com/credentials/status/3#list',
            statusPurpose: 'revocation',
            encodedList: 'encodedList',
          },
        },
        PRIVATE_KEY_PAIR,
      );

      expect(credentialStatusPayload).toMatchObject({
        '@context': [
          'https://www.w3.org/2018/credentials/v1',
          'https://w3id.org/security/bbs/v1',
          'https://w3id.org/vc/status-list/2021/v1',
        ],
        credentialSubject: {
          encodedList: 'encodedList',
          id: 'https://example.com/credentials/status/3#list',
          statusPurpose: 'revocation',
          type: 'StatusList2021',
        },
        id: 'https://example.com/credentials/3732',
        issuanceDate: expect.any(String),
        issuer: 'did:web:jocular-sunflower-144c0d.netlify.app',
        type: ['VerifiableCredential', 'StatusList2021Credential'],
        validFrom: expect.any(String),
      });
    });

    it('should return an error if type is not supported', async () => {
      expect(
        createCredentialStatusPayload(
          {
            id: 'https://example.com/credentials/3732',
          } as any,
          PRIVATE_KEY_PAIR,
          'unsupported' as any,
        ),
      ).rejects.toThrowError('Unsupported type: unsupported');
    });
  });
});
