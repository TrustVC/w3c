import { issueDID } from '.';
import { VerificationType } from '../keyPair/types';
import { describe, expect, it, vi } from 'vitest';
import * as query from './query';
import { IssuedDID } from './types';

const mockedQueryWellKnownDidResult = {
  id: 'did:web:localhost.com',
  verificationMethod: [
    {
      type: 'Bls12381G2Key2020',
      id: 'did:web:localhost.com#keys-0',
      controller: 'did:web:localhost.com',
      publicKeyBase58:
        'yeFTpcEiuHVwhWuBfkKfuS6UVowJciCxTL7meFXjhu1vUAk1yYf8FbTk3BjiBgiyHXasTgznidM6WTSzxBYhXwfqEGbFSZToVxbhTQ1A1HYcnUuiocFgTAoyfCvbAhijdwx',
    },
  ],
  '@context': ['https://www.w3.org/ns/did/v1', 'https://w3id.org/security/suites/bls12381-2020/v1'],
  assertionMethod: ['did:web:localhost.com#keys-0'],
  authentication: ['did:web:localhost.com#keys-0'],
  capabilityInvocation: ['did:web:localhost.com#keys-0'],
  capabilityDelegation: ['did:web:localhost.com#keys-0'],
};

describe('wellKnown', () => {
  const seedBase58 = 'CxBwAH4ftdc9XkLhw7DkFAESxh3NEdetMyJXKrPiAKAX';
  const privateKeyBase58 = '7e1VnFeqvMjqoq61qhGE2dgnQmgNDAYEX1FGzwywf2h7';
  const publicKeyBase58 =
    '23GznFBm8BZcPM2BX7tcPfmeCAfkKKLWUWYwAj1jnu8acYhaNB892YkCDCJ1LLhXRBDpXEigx2tQYaw6EP1e1Fia83AfRUnmSA35v96ZgU3PmEd2DGqhUAXZZa4rM1gVGB9v';

  describe('issueDID', () => {
    it('should fail to issueDID without any input', () => {
      expect(issueDID({} as any)).rejects.toThrowError('Invalid / Missing domain');
    });

    it('should fail to issueDID with invalid domain', () => {
      expect(
        issueDID({ domain: 'invalidDomain', type: VerificationType.Bls12381G2Key2020 }),
      ).rejects.toThrowError('Invalid / Missing domain');
    });

    it('should issueDID with valid domain and type', async () => {
      const result: IssuedDID = await issueDID({
        domain: 'https://www.google.com',
        type: VerificationType.Bls12381G2Key2020,
      });

      expect(result).toBeTruthy();
      expect(result.wellKnownDid).toHaveProperty('id');
      expect(result.wellKnownDid).toHaveProperty('verificationMethod');
      expect(result.wellKnownDid).toHaveProperty('@context');
      expect(result.wellKnownDid).toHaveProperty('assertionMethod');
      expect(result.wellKnownDid).toHaveProperty('authentication');
      expect(result.wellKnownDid).toHaveProperty('capabilityInvocation');
      expect(result.wellKnownDid).toHaveProperty('capabilityDelegation');
      expect(result.wellKnownDid?.verificationMethod?.[0]).not.toHaveProperty('seedBase58');
      expect(result.wellKnownDid?.verificationMethod?.[0]).not.toHaveProperty('privateKeyBase58');

      expect(result.didKeyPairs).toHaveProperty('type');
      expect(result.didKeyPairs).toHaveProperty('id');
      expect(result.didKeyPairs).toHaveProperty('controller');
      expect(result.didKeyPairs).toHaveProperty('seedBase58');
      expect(result.didKeyPairs).toHaveProperty('publicKeyBase58');
      expect(result.didKeyPairs).toHaveProperty('privateKeyBase58');
    });

    it('should issueDID with valid domain, type and seed', async () => {
      const result = await issueDID({
        domain: 'https://www.google.com',
        type: VerificationType.Bls12381G2Key2020,
        seedBase58,
      });

      expect(result).toMatchInlineSnapshot(`
        {
          "didKeyPairs": {
            "controller": "did:web:www.google.com",
            "id": "did:web:www.google.com#keys-1",
            "privateKeyBase58": "7e1VnFeqvMjqoq61qhGE2dgnQmgNDAYEX1FGzwywf2h7",
            "publicKeyBase58": "23GznFBm8BZcPM2BX7tcPfmeCAfkKKLWUWYwAj1jnu8acYhaNB892YkCDCJ1LLhXRBDpXEigx2tQYaw6EP1e1Fia83AfRUnmSA35v96ZgU3PmEd2DGqhUAXZZa4rM1gVGB9v",
            "seedBase58": "CxBwAH4ftdc9XkLhw7DkFAESxh3NEdetMyJXKrPiAKAX",
            "type": "Bls12381G2Key2020",
          },
          "wellKnownDid": {
            "@context": [
              "https://www.w3.org/ns/did/v1",
              "https://w3id.org/security/suites/bls12381-2020/v1",
            ],
            "assertionMethod": [
              "did:web:www.google.com#keys-1",
            ],
            "authentication": [
              "did:web:www.google.com#keys-1",
            ],
            "capabilityDelegation": [
              "did:web:www.google.com#keys-1",
            ],
            "capabilityInvocation": [
              "did:web:www.google.com#keys-1",
            ],
            "id": "did:web:www.google.com",
            "verificationMethod": [
              {
                "controller": "did:web:www.google.com",
                "id": "did:web:www.google.com#keys-1",
                "publicKeyBase58": "23GznFBm8BZcPM2BX7tcPfmeCAfkKKLWUWYwAj1jnu8acYhaNB892YkCDCJ1LLhXRBDpXEigx2tQYaw6EP1e1Fia83AfRUnmSA35v96ZgU3PmEd2DGqhUAXZZa4rM1gVGB9v",
                "type": "Bls12381G2Key2020",
              },
            ],
          },
        }
      `);

      expect(result).toBeTruthy();
      expect(result.wellKnownDid).toHaveProperty('id');
      expect(result.wellKnownDid).toHaveProperty('verificationMethod');
      expect(result.wellKnownDid).toHaveProperty('@context');
      expect(result.wellKnownDid).toHaveProperty('assertionMethod');
      expect(result.wellKnownDid).toHaveProperty('authentication');
      expect(result.wellKnownDid).toHaveProperty('capabilityInvocation');
      expect(result.wellKnownDid).toHaveProperty('capabilityDelegation');
      expect(result.wellKnownDid?.verificationMethod?.[0]?.publicKeyBase58).toBe(publicKeyBase58);
      expect(result.wellKnownDid?.verificationMethod?.[0]).not.toHaveProperty('seedBase58');
      expect(result.wellKnownDid?.verificationMethod?.[0]).not.toHaveProperty('privateKeyBase58');

      expect(result.didKeyPairs).toHaveProperty('type');
      expect(result.didKeyPairs).toHaveProperty('id');
      expect(result.didKeyPairs).toHaveProperty('controller');
      expect(result.didKeyPairs).toHaveProperty('seedBase58');
      expect(result.didKeyPairs).toHaveProperty('publicKeyBase58');
      expect(result.didKeyPairs).toHaveProperty('privateKeyBase58');
      expect(result.didKeyPairs?.publicKeyBase58).toBe(publicKeyBase58);
      expect(result.didKeyPairs?.privateKeyBase58).toBe(privateKeyBase58);
    });

    it('should issueDID with valid domain, type, seed and valid hosted did', async () => {
      const spy = vi
        .spyOn(query, 'queryWellKnownDid')
        .mockImplementation(
          () => new Promise((resolve, _rejects) => resolve(mockedQueryWellKnownDidResult)),
        );

      const result = await issueDID({
        domain: 'https://www.google.com',
        type: VerificationType.Bls12381G2Key2020,
        seedBase58,
      });

      expect(spy).toHaveBeenCalledTimes(1);
      expect(result).toBeTruthy();
      expect(result.wellKnownDid).toHaveProperty('id');
      expect(result.wellKnownDid).toHaveProperty('verificationMethod');
      expect(result.wellKnownDid).toHaveProperty('@context');
      expect(result.wellKnownDid).toHaveProperty('assertionMethod');
      expect(result.wellKnownDid).toHaveProperty('authentication');
      expect(result.wellKnownDid).toHaveProperty('capabilityInvocation');
      expect(result.wellKnownDid).toHaveProperty('capabilityDelegation');
      expect(result.wellKnownDid?.verificationMethod?.[1]?.publicKeyBase58).toBe(publicKeyBase58);
    });
  });
});
