import { PrivateKeyPair, VerificationType } from '@trustvc/w3c-issuer';
import { describe, expect, it } from 'vitest';
import { createCredentialStatusPayload } from './index';

const PRIVATE_KEY_PAIR: PrivateKeyPair = {
  id: 'did:web:trustvc.github.io:did:1#keys-1',
  type: 'Bls12381G2Key2020' as VerificationType,
  controller: 'did:web:trustvc.github.io:did:1',
  seedBase58: 'GWP69tmSWJjqC1RoJ27FehcVqkVyeYAz6h5ABwoNSNdS',
  privateKeyBase58: '4LDU56PUhA9ZEutnR1qCWQnUhtLtpLu2EHSq4h1o7vtF',
  publicKeyBase58:
    'oRfEeWFresvhRtXCkihZbxyoi2JER7gHTJ5psXhHsdCoU1MttRMi3Yp9b9fpjmKh7bMgfWKLESiK2YovRd8KGzJsGuamoAXfqDDVhckxuc9nmsJ84skCSTijKeU4pfAcxeJ',
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
        issuanceDate: expect.any(String),
        issuer: 'did:web:trustvc.github.io:did:1',
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
