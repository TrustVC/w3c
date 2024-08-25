import { describe, expect, it } from 'vitest';
import { generateEthrKeyPair } from './index';
import { VerificationType } from '../../lib/types';

describe('keyPair', () => {
  const mnemonics =
    'indicate swing place chair flight used hammer soon photo region volume shuffle';
  const blockchainAccountId = '0xe0A71284EF59483795053266CB796B65E48B5124';
  const privateKeyHex = '0xe82294532bcfcd8e0763ee5cef194f36f00396be59b94fb418f5f8d83140d9a7';

  describe('generateKeyPair', () => {
    it('should generateKeyPair', async () => {
      const keyPair = await generateEthrKeyPair();

      expect(keyPair.type).toBe('EcdsaSecp256k1RecoveryMethod2020');
      expect(keyPair).toHaveProperty('mnemonics');
      expect(keyPair).toHaveProperty('path');
      expect(keyPair).toHaveProperty('password');
      expect(keyPair).toHaveProperty('privateKeyHex');
      expect(keyPair).toHaveProperty('blockchainAccountId');
    });

    it('should generateKeyPair with valid type and mnemonics', async () => {
      const keyPair = await generateEthrKeyPair({
        type: VerificationType.EcdsaSecp256k1RecoveryMethod2020,
        mnemonics,
      });

      expect(keyPair.type).toBe('EcdsaSecp256k1RecoveryMethod2020');
      expect(keyPair.mnemonics).toBe(mnemonics);
      expect(keyPair.path.length).toBeGreaterThan(1);
      expect(keyPair.privateKeyHex).toBe(privateKeyHex);
      expect(keyPair.blockchainAccountId).toBe(blockchainAccountId);
    });

    it('should generateKeyPair with valid type, mnemonics and password', async () => {
      const privateKeyHex = '0xa8afe3193e069e3a31a1df4ce99f9a534528e4bf06cddf88f0d675ebbe455bc2';
      const blockchainAccountId = '0x360AAdEE86149B1Aa78896B544984e04BF904de0';
      const keyPair = await generateEthrKeyPair({
        type: VerificationType.EcdsaSecp256k1RecoveryMethod2020,
        mnemonics,
        password: 'password',
      });

      expect(keyPair.type).toBe('EcdsaSecp256k1RecoveryMethod2020');
      expect(keyPair.mnemonics).toBe(mnemonics);
      expect(keyPair.path.length).toBeGreaterThan(1);
      expect(keyPair.privateKeyHex).toBe(privateKeyHex);
      expect(keyPair.blockchainAccountId).toBe(blockchainAccountId);
    });

    it('should generateKeyPair with valid type, mnemonics and path', async () => {
      const privateKeyHex2 = '0xc58c1ff75001afdca8cecb61b47f36964febe4188b8f7b26252286ecae5a8879';
      const blockchainAccountId2 = '0xcDFAcbb428DD30ddf6d99875dcad04CbEFcd6E60';
      const keyPair = await generateEthrKeyPair({
        type: VerificationType.EcdsaSecp256k1RecoveryMethod2020,
        mnemonics,
        path: "m/44'/60'/0'/0/1",
      });

      expect(keyPair.type).toBe('EcdsaSecp256k1RecoveryMethod2020');
      expect(keyPair.mnemonics).toBe(mnemonics);
      expect(keyPair.path).toBe("m/44'/60'/0'/0/1");
      expect(keyPair.privateKeyHex).toBe(privateKeyHex2);
      expect(keyPair.blockchainAccountId).toBe(blockchainAccountId2);
    });
  });
});
