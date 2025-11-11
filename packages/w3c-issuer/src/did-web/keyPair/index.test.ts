import { omit } from 'lodash';
import { describe, expect, it } from 'vitest';
import { generateKeyPair } from './index';
import { CryptoSuite, VerificationType } from '../../lib/types';

describe('keyPair', () => {
  const seedBase58 = 'CxBwAH4ftdc9XkLhw7DkFAESxh3NEdetMyJXKrPiAKAX';
  const privateKeyBase58 = '7e1VnFeqvMjqoq61qhGE2dgnQmgNDAYEX1FGzwywf2h7';
  const publicKeyBase58 =
    '23GznFBm8BZcPM2BX7tcPfmeCAfkKKLWUWYwAj1jnu8acYhaNB892YkCDCJ1LLhXRBDpXEigx2tQYaw6EP1e1Fia83AfRUnmSA35v96ZgU3PmEd2DGqhUAXZZa4rM1gVGB9v';
  const invalidPublicKeyBase58 = 'invalidPublicKeyBase58';
  const invalidPrivateKeyBase58 = 'invalidPrivateKeyBase58';

  describe('Legacy BLS12-381 Key Generation', () => {
    it('should fail to generateKeyPair without any input', async () => {
      await expect(generateKeyPair({} as any)).rejects.toThrowError('Invalid key pair type');
    });

    it('should fail to generateKeyPair with invalid type', async () => {
      await expect(generateKeyPair({ type: 'InvalidType' as any })).rejects.toThrowError(
        'Unsupported key pair type',
      );
    });

    it('should generateKeyPair with valid type', async () => {
      const keyPair = await generateKeyPair({ type: VerificationType.Bls12381G2Key2020 });
      expect(keyPair.type).toBe(VerificationType.Bls12381G2Key2020);
      expect(keyPair.seed).toBeInstanceOf(Uint8Array);
      expect(keyPair.seed?.length).toBeGreaterThan(1);
      expect(typeof keyPair.seedBase58).toBe('string');
      expect(keyPair.seedBase58?.length).toBeGreaterThan(1);
      expect(keyPair.privateKey).toBeInstanceOf(Uint8Array);
      expect(keyPair.privateKey?.length).toBeGreaterThan(1);
      expect(typeof keyPair.privateKeyBase58).toBe('string');
      expect(keyPair.privateKeyBase58?.length).toBeGreaterThan(1);
      expect(keyPair.publicKey).toBeInstanceOf(Uint8Array);
      expect(keyPair.publicKey?.length).toBeGreaterThan(1);
      expect(typeof keyPair.publicKeyBase58).toBe('string');
      expect(keyPair.publicKeyBase58?.length).toBeGreaterThan(1);
    });

    it('should generateKeyPair with valid type and seed', async () => {
      const keyPair = await generateKeyPair({
        type: VerificationType.Bls12381G2Key2020,
        seedBase58,
      });

      expect(omit(keyPair, ['privateKey', 'publicKey', 'seed'])).toMatchInlineSnapshot(`
        {
          "privateKeyBase58": "7e1VnFeqvMjqoq61qhGE2dgnQmgNDAYEX1FGzwywf2h7",
          "publicKeyBase58": "23GznFBm8BZcPM2BX7tcPfmeCAfkKKLWUWYwAj1jnu8acYhaNB892YkCDCJ1LLhXRBDpXEigx2tQYaw6EP1e1Fia83AfRUnmSA35v96ZgU3PmEd2DGqhUAXZZa4rM1gVGB9v",
          "seedBase58": "CxBwAH4ftdc9XkLhw7DkFAESxh3NEdetMyJXKrPiAKAX",
          "type": "Bls12381G2Key2020",
        }
      `);

      expect(keyPair.type).toBe(VerificationType.Bls12381G2Key2020);
      expect(keyPair.seed).toBeInstanceOf(Uint8Array);
      expect(keyPair.seed?.length).toBeGreaterThan(1);
      expect(keyPair.seedBase58).toBe(seedBase58);
      expect(keyPair.privateKey).toBeInstanceOf(Uint8Array);
      expect(keyPair.privateKey?.length).toBeGreaterThan(1);
      expect(keyPair.privateKeyBase58).toBe(privateKeyBase58);
      expect(keyPair.publicKey).toBeInstanceOf(Uint8Array);
      expect(keyPair.publicKey?.length).toBeGreaterThan(1);
      expect(keyPair.publicKeyBase58).toBe(publicKeyBase58);
    });

    it('should generateKeyPair with valid type, seed, publicKey and privateKey', async () => {
      const keyPair = await generateKeyPair({
        type: VerificationType.Bls12381G2Key2020,
        seedBase58,
        privateKeyBase58,
        publicKeyBase58,
      });

      expect(omit(keyPair, ['privateKey', 'publicKey', 'seed'])).toMatchInlineSnapshot(`
        {
          "privateKeyBase58": "7e1VnFeqvMjqoq61qhGE2dgnQmgNDAYEX1FGzwywf2h7",
          "publicKeyBase58": "23GznFBm8BZcPM2BX7tcPfmeCAfkKKLWUWYwAj1jnu8acYhaNB892YkCDCJ1LLhXRBDpXEigx2tQYaw6EP1e1Fia83AfRUnmSA35v96ZgU3PmEd2DGqhUAXZZa4rM1gVGB9v",
          "seedBase58": "CxBwAH4ftdc9XkLhw7DkFAESxh3NEdetMyJXKrPiAKAX",
          "type": "Bls12381G2Key2020",
        }
      `);

      expect(keyPair.type).toBe(VerificationType.Bls12381G2Key2020);
      expect(keyPair.seed).toBeInstanceOf(Uint8Array);
      expect(keyPair.seed?.length).toBeGreaterThan(1);
      expect(keyPair.seedBase58).toBe(seedBase58);
      expect(keyPair.privateKey).toBeInstanceOf(Uint8Array);
      expect(keyPair.privateKey?.length).toBeGreaterThan(1);
      expect(keyPair.privateKeyBase58).toBe(privateKeyBase58);
      expect(keyPair.publicKey).toBeInstanceOf(Uint8Array);
      expect(keyPair.publicKey?.length).toBeGreaterThan(1);
      expect(keyPair.publicKeyBase58).toBe(publicKeyBase58);
    });

    it('should fail to generateKeyPair with valid type, seed and invalid privateKey', async () => {
      await expect(
        generateKeyPair({
          type: VerificationType.Bls12381G2Key2020,
          seedBase58,
          privateKeyBase58: invalidPrivateKeyBase58,
          publicKeyBase58,
        }),
      ).rejects.toThrowError('Private key does not match');
    });

    it('should fail to generateKeyPair with valid type, seed and invalid privateKey', async () => {
      await expect(
        generateKeyPair({
          type: VerificationType.Bls12381G2Key2020,
          seedBase58,
          privateKeyBase58,
          publicKeyBase58: invalidPublicKeyBase58,
        }),
      ).rejects.toThrowError('Public key does not match');
    });
  });

  describe('BBS2023 Key Generation', () => {
    it('should generateKeyPair with BBS2023 type', async () => {
      const keyPair = await generateKeyPair({ type: CryptoSuite.Bbs2023 });
      expect(keyPair.type).toBe('Multikey');
      expect(typeof keyPair.secretKeyMultibase).toBe('string');
      expect(keyPair.secretKeyMultibase?.length).toBeGreaterThan(1);
      expect(typeof keyPair.publicKeyMultibase).toBe('string');
      expect(keyPair.publicKeyMultibase?.length).toBeGreaterThan(1);
      // BBS-2023 keys should be multibase encoded (BLS12-381 format)
      expect(keyPair.secretKeyMultibase).toMatch(/^z/);
      expect(keyPair.publicKeyMultibase).toMatch(/^zUC/);
    });

    it('should generateKeyPair with BBS2023 type and seed', async () => {
      const keyPair = await generateKeyPair({
        type: CryptoSuite.Bbs2023,
        seedBase58,
      });

      expect(keyPair.type).toBe('Multikey');
      expect(keyPair.seedBase58).toBe(seedBase58);
      expect(typeof keyPair.secretKeyMultibase).toBe('string');
      expect(keyPair.secretKeyMultibase?.length).toBeGreaterThan(1);
      expect(typeof keyPair.publicKeyMultibase).toBe('string');
      expect(keyPair.publicKeyMultibase?.length).toBeGreaterThan(1);
      // BBS-2023 keys should be multibase encoded (BLS12-381 format)
      expect(keyPair.secretKeyMultibase).toMatch(/^z/);
      expect(keyPair.publicKeyMultibase).toMatch(/^zUC/);
    });

    it('should generate deterministic BBS2023 keys with same seed', async () => {
      const keyPair1 = await generateKeyPair({
        type: CryptoSuite.Bbs2023,
        seedBase58,
      });

      const keyPair2 = await generateKeyPair({
        type: CryptoSuite.Bbs2023,
        seedBase58,
      });

      expect(keyPair1.secretKeyMultibase).toBe(keyPair2.secretKeyMultibase);
      expect(keyPair1.publicKeyMultibase).toBe(keyPair2.publicKeyMultibase);
      expect(keyPair1.seedBase58).toBe(keyPair2.seedBase58);
    });
  });

  describe('ECDSASD2023 Key Generation', () => {
    it('should generate ECDSASD2023 key pair without seed', async () => {
      const keyPair = await generateKeyPair({
        type: CryptoSuite.EcdsaSd2023,
      });

      expect(keyPair.type).toBe('Multikey');
      expect(typeof keyPair.secretKeyMultibase).toBe('string');
      expect(keyPair.secretKeyMultibase?.length).toBeGreaterThan(1);
      expect(typeof keyPair.publicKeyMultibase).toBe('string');
      expect(keyPair.publicKeyMultibase?.length).toBeGreaterThan(1);
      // Keys should be multibase encoded (start with 'z')
      expect(keyPair.secretKeyMultibase).toMatch(/^z/);
      expect(keyPair.publicKeyMultibase).toMatch(/^zDn/);
    });

    it('should generate different ECDSASD2023 keys on each call', async () => {
      const keyPair1 = await generateKeyPair({
        type: CryptoSuite.EcdsaSd2023,
      });

      const keyPair2 = await generateKeyPair({
        type: CryptoSuite.EcdsaSd2023,
      });

      // ECDSA-SD-2023 keys are random - should be different each time
      expect(keyPair1.secretKeyMultibase).not.toBe(keyPair2.secretKeyMultibase);
      expect(keyPair1.publicKeyMultibase).not.toBe(keyPair2.publicKeyMultibase);
    });
  });
});
