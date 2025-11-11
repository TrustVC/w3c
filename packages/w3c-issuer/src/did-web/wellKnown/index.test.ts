import _ from 'lodash';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { issueDID } from '.';
import { CryptoSuite, VerificationType } from '../../lib/types';
import * as query from './query';
import {
  BBSPrivateKeyPair,
  Bbs2023PrivateKeyPair,
  EcdsaSd2023PrivateKeyPair,
  IssuedDID,
} from './types';

const mockedQueryDidDocumentResult = {
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
  const bls12381KeyPair = {
    seedBase58: 'CxBwAH4ftdc9XkLhw7DkFAESxh3NEdetMyJXKrPiAKAX',
    privateKeyBase58: '7e1VnFeqvMjqoq61qhGE2dgnQmgNDAYEX1FGzwywf2h7',
    publicKeyBase58:
      '23GznFBm8BZcPM2BX7tcPfmeCAfkKKLWUWYwAj1jnu8acYhaNB892YkCDCJ1LLhXRBDpXEigx2tQYaw6EP1e1Fia83AfRUnmSA35v96ZgU3PmEd2DGqhUAXZZa4rM1gVGB9v',
  };

  const bbs2023KeyPair = {
    seedBase58: 'CxBwAH4ftdc9XkLhw7DkFAESxh3NEdetMyJXKrPiAKAX',
    secretKeyMultibase: 'z42twTcNeSYcnqg1FLuSFs2bsGH3ZqbRHFmvS9XMsYhjxvHN',
    publicKeyMultibase:
      'zUC7LTa4hWtaE9YKyDsMVGiRNqPMN3s4rjBdB3MFi6PcVWReNfR72y3oGW2NhNcaKNVhMobh7aHp8oZB3qdJCs7RebM2xsodrSm8MmePbN25NTGcpjkJMwKbcWfYDX7eHCJjPGM',
  };

  describe('issueDID', () => {
    beforeEach(() => {
      vi.restoreAllMocks();
    });

    it('should fail to issueDID without any input', () => {
      expect(issueDID({} as any)).rejects.toThrowError('Missing domain');
    });

    it('should fail to issueDID with invalid domain', () => {
      expect(
        issueDID({ domain: 'invalidDomain', type: VerificationType.Bls12381G2Key2020 }),
      ).rejects.toThrowError('Invalid domain');
    });

    describe('issueDID - Bls12381', () => {
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
          seedBase58: bls12381KeyPair.seedBase58,
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
        expect(result.wellKnownDid?.verificationMethod?.[0]?.publicKeyBase58).toBe(
          bls12381KeyPair.publicKeyBase58,
        );
        expect(result.wellKnownDid?.verificationMethod?.[0]).not.toHaveProperty('seedBase58');
        expect(result.wellKnownDid?.verificationMethod?.[0]).not.toHaveProperty('privateKeyBase58');

        expect(result.didKeyPairs).toHaveProperty('type');
        expect(result.didKeyPairs).toHaveProperty('id');
        expect(result.didKeyPairs).toHaveProperty('controller');
        expect(result.didKeyPairs).toHaveProperty('seedBase58');
        expect(result.didKeyPairs).toHaveProperty('publicKeyBase58');
        expect(result.didKeyPairs).toHaveProperty('privateKeyBase58');
        expect((result.didKeyPairs as BBSPrivateKeyPair)?.publicKeyBase58).toBe(
          bls12381KeyPair.publicKeyBase58,
        );
        expect((result.didKeyPairs as BBSPrivateKeyPair)?.privateKeyBase58).toBe(
          bls12381KeyPair.privateKeyBase58,
        );
      });

      it('should issueDID with valid domain, type, seed and valid hosted did', async () => {
        const spy = vi.spyOn(query, 'queryDidDocument').mockImplementation(
          () =>
            new Promise((resolve, _rejects) =>
              resolve({
                did: mockedQueryDidDocumentResult.id,
                wellKnownDid: _.cloneDeep(mockedQueryDidDocumentResult),
              }),
            ),
        );

        const result = await issueDID({
          domain: 'https://localhost.com',
          type: VerificationType.Bls12381G2Key2020,
          seedBase58: bls12381KeyPair.seedBase58,
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
        expect(result.wellKnownDid?.verificationMethod?.[1]?.publicKeyBase58).toBe(
          bls12381KeyPair.publicKeyBase58,
        );
      });
    });

    describe('issueDID - BBS-2023', () => {
      it('should issueDID with valid domain and BBS-2023 type', async () => {
        const result: IssuedDID = await issueDID({
          domain: 'https://www.google.com',
          type: CryptoSuite.Bbs2023,
        });

        expect(result).toBeTruthy();
        expect(result.wellKnownDid).toHaveProperty('id');
        expect(result.wellKnownDid).toHaveProperty('verificationMethod');
        expect(result.wellKnownDid).toHaveProperty('@context');
        expect(result.wellKnownDid).toHaveProperty('assertionMethod');
        expect(result.wellKnownDid).toHaveProperty('authentication');
        expect(result.wellKnownDid).toHaveProperty('capabilityInvocation');
        expect(result.wellKnownDid).toHaveProperty('capabilityDelegation');

        // Check that the verification method uses Multikey type
        expect(result.wellKnownDid?.verificationMethod?.[0]?.type).toBe('Multikey');
        expect(result.wellKnownDid?.verificationMethod?.[0]).toHaveProperty('publicKeyMultibase');
        expect(result.wellKnownDid?.verificationMethod?.[0]).not.toHaveProperty('seedBase58');
        expect(result.wellKnownDid?.verificationMethod?.[0]).not.toHaveProperty(
          'secretKeyMultibase',
        );
        expect(result.wellKnownDid?.verificationMethod?.[0]).not.toHaveProperty('cryptosuite');

        // Check that the context includes Multikey v1
        expect(result.wellKnownDid?.['@context']).toContain(
          'https://w3id.org/security/multikey/v1',
        );

        // Check key pair properties
        expect(result.didKeyPairs).toHaveProperty('type', VerificationType.Multikey);
        expect(result.didKeyPairs).toHaveProperty('id');
        expect(result.didKeyPairs).toHaveProperty('controller');
        expect(result.didKeyPairs).toHaveProperty('secretKeyMultibase');
        expect(result.didKeyPairs).toHaveProperty('publicKeyMultibase');
      });

      it('should issueDID with valid domain, BBS-2023 type and seed', async () => {
        const result = await issueDID({
          domain: 'https://www.google.com',
          type: CryptoSuite.Bbs2023,
          seedBase58: bbs2023KeyPair.seedBase58,
        });

        expect(result).toBeTruthy();
        expect(result.wellKnownDid).toHaveProperty('id');
        expect(result.wellKnownDid?.verificationMethod?.[0]?.type).toBe('Multikey');
        expect(result.wellKnownDid?.verificationMethod?.[0]).toHaveProperty('publicKeyMultibase');
        expect(result.wellKnownDid?.['@context']).toContain(
          'https://w3id.org/security/multikey/v1',
        );

        expect(result.didKeyPairs).toHaveProperty('type', VerificationType.Multikey);
        expect(result.didKeyPairs).toHaveProperty('seedBase58');
        expect(result.didKeyPairs).toHaveProperty('secretKeyMultibase');
        expect(result.didKeyPairs).toHaveProperty('publicKeyMultibase');
        expect((result.didKeyPairs as Bbs2023PrivateKeyPair)?.seedBase58).toBe(
          bbs2023KeyPair.seedBase58,
        );
      });
    });

    describe('issueDID - ECDSA-SD-2023', () => {
      it('should issueDID with valid domain and ECDSA-SD-2023 type', async () => {
        const result: IssuedDID = await issueDID({
          domain: 'https://www.google.com',
          type: CryptoSuite.EcdsaSd2023,
        });

        expect(result).toBeTruthy();
        expect(result.wellKnownDid).toHaveProperty('id');
        expect(result.wellKnownDid).toHaveProperty('verificationMethod');
        expect(result.wellKnownDid).toHaveProperty('@context');
        expect(result.wellKnownDid).toHaveProperty('assertionMethod');
        expect(result.wellKnownDid).toHaveProperty('authentication');
        expect(result.wellKnownDid).toHaveProperty('capabilityInvocation');
        expect(result.wellKnownDid).toHaveProperty('capabilityDelegation');

        // Check that the verification method uses Multikey type
        expect(result.wellKnownDid?.verificationMethod?.[0]?.type).toBe('Multikey');
        expect(result.wellKnownDid?.verificationMethod?.[0]).toHaveProperty('publicKeyMultibase');
        expect(result.wellKnownDid?.['@context']).toContain(
          'https://w3id.org/security/multikey/v1',
        );

        // Check key pair properties
        expect(result.didKeyPairs).toHaveProperty('type', VerificationType.Multikey);
        expect(result.didKeyPairs).toHaveProperty('id');
        expect(result.didKeyPairs).toHaveProperty('controller');
        expect(result.didKeyPairs).toHaveProperty('secretKeyMultibase');
        expect(result.didKeyPairs).toHaveProperty('publicKeyMultibase');
        expect(result.didKeyPairs).not.toHaveProperty('seedBase58'); // ECDSA-SD-2023 doesn't use seeds
      });

      it('should generate different keys on multiple calls', async () => {
        const result1 = await issueDID({
          domain: 'https://www.google.com',
          type: CryptoSuite.EcdsaSd2023,
        });

        const result2 = await issueDID({
          domain: 'https://www.google.com',
          type: CryptoSuite.EcdsaSd2023,
        });

        expect(result1.didKeyPairs).toHaveProperty('publicKeyMultibase');
        expect(result2.didKeyPairs).toHaveProperty('publicKeyMultibase');

        // Keys should be different since ECDSA-SD-2023 generates random keys
        expect((result1.didKeyPairs as EcdsaSd2023PrivateKeyPair).publicKeyMultibase).not.toBe(
          (result2.didKeyPairs as EcdsaSd2023PrivateKeyPair).publicKeyMultibase,
        );
      });
    });

    describe('issueDID - Mixed Cryptosuites', () => {
      it('should handle existing DID with different cryptosuite types', async () => {
        const mockExistingDid = {
          id: 'did:web:localhost.com',
          verificationMethod: [
            {
              type: 'Bls12381G2Key2020',
              id: 'did:web:localhost.com#keys-0',
              controller: 'did:web:localhost.com',
              publicKeyBase58: 'existing-bls-key',
            },
            {
              type: 'Multikey',
              id: 'did:web:localhost.com#keys-1',
              controller: 'did:web:localhost.com',
              publicKeyMultibase: 'z6MkexistingBbs2023Key',
            },
          ],
          '@context': [
            'https://www.w3.org/ns/did/v1',
            'https://w3id.org/security/suites/bls12381-2020/v1',
            'https://w3id.org/security/multikey/v1',
          ],
          assertionMethod: ['did:web:localhost.com#keys-0', 'did:web:localhost.com#keys-1'],
          authentication: ['did:web:localhost.com#keys-0', 'did:web:localhost.com#keys-1'],
          capabilityInvocation: ['did:web:localhost.com#keys-0', 'did:web:localhost.com#keys-1'],
          capabilityDelegation: ['did:web:localhost.com#keys-0', 'did:web:localhost.com#keys-1'],
        };

        const spy = vi.spyOn(query, 'queryDidDocument').mockImplementation(
          () =>
            new Promise((resolve, _rejects) =>
              resolve({
                did: mockExistingDid.id,
                wellKnownDid: _.cloneDeep(mockExistingDid),
              }),
            ),
        );

        const result = await issueDID({
          domain: 'https://localhost.com',
          type: CryptoSuite.EcdsaSd2023,
        });

        expect(spy).toHaveBeenCalledTimes(1);
        expect(result).toBeTruthy();
        expect(result.wellKnownDid?.verificationMethod).toHaveLength(3); // Original 2 + new 1
        expect(result.wellKnownDid?.verificationMethod?.[2]?.type).toBe('Multikey');
        expect(result.wellKnownDid?.verificationMethod?.[2]?.id).toBe(
          'did:web:localhost.com#keys-2',
        );
      });
    });
  });
});
