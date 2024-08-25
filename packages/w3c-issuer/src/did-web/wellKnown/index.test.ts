import { issueDID } from '.';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import * as query from './query';
import { IssuedDID } from './types';
import { VerificationType } from '../../lib/types';
import _ from 'lodash';

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
  const bls12381KeyPair = {
    seedBase58: 'CxBwAH4ftdc9XkLhw7DkFAESxh3NEdetMyJXKrPiAKAX',
    privateKeyBase58: '7e1VnFeqvMjqoq61qhGE2dgnQmgNDAYEX1FGzwywf2h7',
    publicKeyBase58:
      '23GznFBm8BZcPM2BX7tcPfmeCAfkKKLWUWYwAj1jnu8acYhaNB892YkCDCJ1LLhXRBDpXEigx2tQYaw6EP1e1Fia83AfRUnmSA35v96ZgU3PmEd2DGqhUAXZZa4rM1gVGB9v',
  };

  const walletKeyPair = {
    id: 'did:web:localhost.com#keys-3',
    type: VerificationType.EcdsaSecp256k1RecoveryMethod2020,
    controller: 'did:web:localhost.com',
    mnemonics: 'indicate swing place chair flight used hammer soon photo region volume shuffle',
    path: "m/44'/60'/0'/0/0",
    blockchainAccountId: '0xe0A71284EF59483795053266CB796B65E48B5124',
    privateKeyHex: '0xe82294532bcfcd8e0763ee5cef194f36f00396be59b94fb418f5f8d83140d9a7',
  };

  describe('issueDID', () => {
    beforeEach(() => {
      vi.restoreAllMocks();
    });

    it('should fail to issueDID without any input', () => {
      expect(issueDID({} as any)).rejects.toThrowError('Invalid / Missing domain');
    });

    it('should fail to issueDID with invalid domain', () => {
      expect(
        issueDID({ domain: 'invalidDomain', type: VerificationType.Bls12381G2Key2020 }),
      ).rejects.toThrowError('Invalid / Missing domain');
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
        expect(result.didKeyPairs?.publicKeyBase58).toBe(bls12381KeyPair.publicKeyBase58);
        expect(result.didKeyPairs?.privateKeyBase58).toBe(bls12381KeyPair.privateKeyBase58);
      });

      it('should issueDID with valid domain, type, seed and valid hosted did', async () => {
        const spy = vi.spyOn(query, 'queryWellKnownDid').mockImplementation(
          () =>
            new Promise((resolve, _rejects) =>
              resolve({
                did: mockedQueryWellKnownDidResult.id,
                wellKnownDid: _.cloneDeep(mockedQueryWellKnownDidResult),
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

    describe('issueDID - EcdsaSecp256k1RecoveryMethod2020', () => {
      it('should issueDID with valid domain and type', async () => {
        const result: IssuedDID = await issueDID({
          domain: 'https://www.google.com',
          type: VerificationType.EcdsaSecp256k1RecoveryMethod2020,
        });

        expect(result).toBeTruthy();
        expect(result.wellKnownDid).toHaveProperty('id');
        expect(result.wellKnownDid).toHaveProperty('verificationMethod');
        expect(result.wellKnownDid).toHaveProperty('@context');
        expect(result.wellKnownDid).toHaveProperty('assertionMethod');
        expect(result.wellKnownDid).toHaveProperty('authentication');
        expect(result.wellKnownDid).toHaveProperty('capabilityInvocation');
        expect(result.wellKnownDid).toHaveProperty('capabilityDelegation');
        expect(result.wellKnownDid?.verificationMethod?.[0]).not.toHaveProperty('mnomonics');
        expect(result.wellKnownDid?.verificationMethod?.[0]).not.toHaveProperty('path');
        expect(result.wellKnownDid?.verificationMethod?.[0]).not.toHaveProperty('privateKeyHex');

        expect(result.didKeyPairs).toHaveProperty('type');
        expect(result.didKeyPairs).toHaveProperty('id');
        expect(result.didKeyPairs).toHaveProperty('controller');
        expect(result.didKeyPairs).toHaveProperty('mnemonics');
        expect(result.didKeyPairs).toHaveProperty('path');
        expect(result.didKeyPairs).toHaveProperty('privateKeyHex');
        expect(result.didKeyPairs).toHaveProperty('blockchainAccountId');
      });

      it('should issueDID with valid domain, type and mnemonics', async () => {
        const result: IssuedDID = await issueDID({
          domain: 'https://google.com',
          type: VerificationType.EcdsaSecp256k1RecoveryMethod2020,
          mnemonics: walletKeyPair.mnemonics,
        });

        expect(result).toMatchInlineSnapshot(`
          {
            "didKeyPairs": {
              "blockchainAccountId": "0xe0A71284EF59483795053266CB796B65E48B5124",
              "controller": "did:web:google.com",
              "id": "did:web:google.com#keys-1",
              "mnemonics": "indicate swing place chair flight used hammer soon photo region volume shuffle",
              "path": "m/44'/60'/0'/0/0",
              "privateKeyHex": "0xe82294532bcfcd8e0763ee5cef194f36f00396be59b94fb418f5f8d83140d9a7",
              "type": "EcdsaSecp256k1RecoveryMethod2020",
            },
            "wellKnownDid": {
              "@context": [
                "https://www.w3.org/ns/did/v1",
                "https://w3id.org/security/suites/secp256k1recovery-2020/v2",
              ],
              "assertionMethod": [
                "did:web:google.com#keys-1",
              ],
              "authentication": [
                "did:web:google.com#keys-1",
              ],
              "capabilityDelegation": [
                "did:web:google.com#keys-1",
              ],
              "capabilityInvocation": [
                "did:web:google.com#keys-1",
              ],
              "id": "did:web:google.com",
              "verificationMethod": [
                {
                  "blockchainAccountId": "0xe0A71284EF59483795053266CB796B65E48B5124",
                  "controller": "did:web:google.com",
                  "id": "did:web:google.com#keys-1",
                  "type": "EcdsaSecp256k1RecoveryMethod2020",
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
        expect(result.wellKnownDid?.verificationMethod?.[0]?.blockchainAccountId).toBe(
          walletKeyPair.blockchainAccountId,
        );
        expect(result.wellKnownDid?.verificationMethod?.[0]).not.toHaveProperty('mnomonics');
        expect(result.wellKnownDid?.verificationMethod?.[0]).not.toHaveProperty('path');
        expect(result.wellKnownDid?.verificationMethod?.[0]).not.toHaveProperty('privateKeyHex');

        expect(result.didKeyPairs).toHaveProperty('type');
        expect(result.didKeyPairs).toHaveProperty('id');
        expect(result.didKeyPairs).toHaveProperty('controller');
        expect(result.didKeyPairs).toHaveProperty('mnemonics');
        expect(result.didKeyPairs).toHaveProperty('path');
        expect(result.didKeyPairs).toHaveProperty('privateKeyHex');
        expect(result.didKeyPairs).toHaveProperty('blockchainAccountId');
        expect(result.didKeyPairs?.mnemonics).toBe(walletKeyPair.mnemonics);
        expect(result.didKeyPairs?.path).toBe(walletKeyPair.path);
        expect(result.didKeyPairs?.privateKeyHex).toBe(walletKeyPair.privateKeyHex);
        expect(result.didKeyPairs?.blockchainAccountId).toBe(walletKeyPair.blockchainAccountId);
      });

      it('should issueDID with valid domain, type, seed and valid hosted did', async () => {
        const spy = vi.spyOn(query, 'queryWellKnownDid').mockImplementation(
          () =>
            new Promise((resolve, _rejects) =>
              resolve({
                did: mockedQueryWellKnownDidResult.id,
                wellKnownDid: _.cloneDeep(mockedQueryWellKnownDidResult),
              }),
            ),
        );

        const result = await issueDID({
          domain: 'https://localhost.com',
          type: VerificationType.EcdsaSecp256k1RecoveryMethod2020,
          mnemonics: walletKeyPair.mnemonics,
        });

        expect(result).toMatchInlineSnapshot(`
          {
            "didKeyPairs": {
              "blockchainAccountId": "0xe0A71284EF59483795053266CB796B65E48B5124",
              "controller": "did:web:localhost.com",
              "id": "did:web:localhost.com#keys-1",
              "mnemonics": "indicate swing place chair flight used hammer soon photo region volume shuffle",
              "path": "m/44'/60'/0'/0/0",
              "privateKeyHex": "0xe82294532bcfcd8e0763ee5cef194f36f00396be59b94fb418f5f8d83140d9a7",
              "type": "EcdsaSecp256k1RecoveryMethod2020",
            },
            "wellKnownDid": {
              "@context": [
                "https://www.w3.org/ns/did/v1",
                "https://w3id.org/security/suites/bls12381-2020/v1",
                "https://w3id.org/security/suites/secp256k1recovery-2020/v2",
              ],
              "assertionMethod": [
                "did:web:localhost.com#keys-0",
                "did:web:localhost.com#keys-1",
              ],
              "authentication": [
                "did:web:localhost.com#keys-0",
                "did:web:localhost.com#keys-1",
              ],
              "capabilityDelegation": [
                "did:web:localhost.com#keys-0",
                "did:web:localhost.com#keys-1",
              ],
              "capabilityInvocation": [
                "did:web:localhost.com#keys-0",
                "did:web:localhost.com#keys-1",
              ],
              "id": "did:web:localhost.com",
              "verificationMethod": [
                {
                  "controller": "did:web:localhost.com",
                  "id": "did:web:localhost.com#keys-0",
                  "publicKeyBase58": "yeFTpcEiuHVwhWuBfkKfuS6UVowJciCxTL7meFXjhu1vUAk1yYf8FbTk3BjiBgiyHXasTgznidM6WTSzxBYhXwfqEGbFSZToVxbhTQ1A1HYcnUuiocFgTAoyfCvbAhijdwx",
                  "type": "Bls12381G2Key2020",
                },
                {
                  "blockchainAccountId": "0xe0A71284EF59483795053266CB796B65E48B5124",
                  "controller": "did:web:localhost.com",
                  "id": "did:web:localhost.com#keys-1",
                  "type": "EcdsaSecp256k1RecoveryMethod2020",
                },
              ],
            },
          }
        `);

        expect(spy).toHaveBeenCalledTimes(1);
        expect(result).toBeTruthy();
        expect(result.wellKnownDid).toHaveProperty('id');
        expect(result.wellKnownDid).toHaveProperty('verificationMethod');
        expect(result.wellKnownDid).toHaveProperty('@context');
        expect(result.wellKnownDid).toHaveProperty('assertionMethod');
        expect(result.wellKnownDid).toHaveProperty('authentication');
        expect(result.wellKnownDid).toHaveProperty('capabilityInvocation');
        expect(result.wellKnownDid).toHaveProperty('capabilityDelegation');
        expect(result.wellKnownDid?.verificationMethod?.[1]?.blockchainAccountId).toBe(
          walletKeyPair.blockchainAccountId,
        );
      });
    });
  });
});
