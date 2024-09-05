import { describe, expect, it } from 'vitest';
import { generateEthrKeyPair } from './index';
import { VerificationType } from '../../lib/types';

describe('keyPair', () => {
  const mnemonics =
    'indicate swing place chair flight used hammer soon photo region volume shuffle';

  describe('generateKeyPair', () => {
    it('should generateKeyPair', async () => {
      const keyPair = await generateEthrKeyPair();

      expect(keyPair.type).toBe('EcdsaSecp256k1RecoveryMethod2020');
      expect(keyPair).toHaveProperty('mnemonics');
      expect(keyPair).toHaveProperty('path');
      expect(keyPair).toHaveProperty('password');
      expect(keyPair).toHaveProperty('privateKeyHex');
      expect(keyPair).toHaveProperty('publicKeyHex');
      expect(keyPair).toHaveProperty('ethereumAddress');
    });

    it('should generateKeyPair with valid type and mnemonics', async () => {
      const keyPair = await generateEthrKeyPair({
        type: VerificationType.EcdsaSecp256k1RecoveryMethod2020,
        mnemonics,
      });

      expect(keyPair).toMatchInlineSnapshot(`
        {
          "ethereumAddress": "0xe0A71284EF59483795053266CB796B65E48B5124",
          "mnemonics": "indicate swing place chair flight used hammer soon photo region volume shuffle",
          "password": "",
          "path": "m/44'/60'/0'/0/0",
          "privateKeyHex": "0xe82294532bcfcd8e0763ee5cef194f36f00396be59b94fb418f5f8d83140d9a7",
          "privateKeyMultibase": "zGdAAkPsZjTzseQ8aWsihSmqspwy54as6rHGSJFzp5F7c",
          "publicKeyHex": "0x02de2454a05cdb55780b85c04128233e31ac9179235607e4d6fa0c6b38140fb51a",
          "publicKeyMultibase": "zrQnP71wXdGkTbvMcthZEFWTLUSCo35dwYoMNSNHaSe6D",
          "type": "EcdsaSecp256k1RecoveryMethod2020",
        }
      `);
    });

    it('should generateKeyPair with valid type, mnemonics and password', async () => {
      const keyPair = await generateEthrKeyPair({
        type: VerificationType.EcdsaSecp256k1RecoveryMethod2020,
        mnemonics,
        password: 'password',
      });

      expect(keyPair).toMatchInlineSnapshot(`
        {
          "ethereumAddress": "0x360AAdEE86149B1Aa78896B544984e04BF904de0",
          "mnemonics": "indicate swing place chair flight used hammer soon photo region volume shuffle",
          "password": "password",
          "path": "m/44'/60'/0'/0/0",
          "privateKeyHex": "0xa8afe3193e069e3a31a1df4ce99f9a534528e4bf06cddf88f0d675ebbe455bc2",
          "privateKeyMultibase": "zCMV3pj9VKgnrBYsCGepQK12hQo4z17LAHtYy1iBbG8fs",
          "publicKeyHex": "0x03da8b72d5f166f17a1e36e33535a02bf2c6e68f6a4ea56979fd7aad8ae34c1f2a",
          "publicKeyMultibase": "z29Q4KWBq4ZnTixFCpQndJ23bZcA7qLzyKYfTm3CoU3PxV",
          "type": "EcdsaSecp256k1RecoveryMethod2020",
        }
      `);
    });

    it('should generateKeyPair with valid type, mnemonics and path', async () => {
      const keyPair = await generateEthrKeyPair({
        type: VerificationType.EcdsaSecp256k1RecoveryMethod2020,
        mnemonics,
        path: "m/44'/60'/0'/0/1",
      });

      expect(keyPair).toMatchInlineSnapshot(`
        {
          "ethereumAddress": "0xcDFAcbb428DD30ddf6d99875dcad04CbEFcd6E60",
          "mnemonics": "indicate swing place chair flight used hammer soon photo region volume shuffle",
          "password": "",
          "path": "m/44'/60'/0'/0/1",
          "privateKeyHex": "0xc58c1ff75001afdca8cecb61b47f36964febe4188b8f7b26252286ecae5a8879",
          "privateKeyMultibase": "zEJ9F8Ugv6myma2TUEukqm2xzAiPeNxyBpfKQ6ttxRtqW",
          "publicKeyHex": "0x0396762cb3d373ddab0685bbd5e45ccaf7481d8deb5b75ab38704fba089abed629",
          "publicKeyMultibase": "z24pHnHXwQNQVhbtjHQWggNdxJAXy3hCjNg3UURQ1iZJR6",
          "type": "EcdsaSecp256k1RecoveryMethod2020",
        }
      `);
    });
  });
});
