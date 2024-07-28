import { omit } from 'lodash';
import { describe, expect, it } from 'vitest';
import { generateKeyPair } from './index';
import { VerificationType } from './types';
describe('keyPair', () => {
  const seedBase58 = 'CxBwAH4ftdc9XkLhw7DkFAESxh3NEdetMyJXKrPiAKAX';
  const privateKeyBase58 = '7e1VnFeqvMjqoq61qhGE2dgnQmgNDAYEX1FGzwywf2h7';
  const publicKeyBase58 = '23GznFBm8BZcPM2BX7tcPfmeCAfkKKLWUWYwAj1jnu8acYhaNB892YkCDCJ1LLhXRBDpXEigx2tQYaw6EP1e1Fia83AfRUnmSA35v96ZgU3PmEd2DGqhUAXZZa4rM1gVGB9v';
  const invalidPublicKeyBase58 = 'invalidPublicKeyBase58';
  const invalidPrivateKeyBase58 = 'invalidPrivateKeyBase58';

  describe('generateKeyPair', () => {
    it('should fail to generateKeyPair without any input', async () => {
      await expect(generateKeyPair({} as any)).rejects.toThrowError('Invalid key pair type');
    });

    it('should fail to generateKeyPair with invalid type', async () => {
      await expect(generateKeyPair({ type: 'InvalidType' as any })).rejects.toThrowError('Unsupported key pair type');
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
      const keyPair = await generateKeyPair({ type: VerificationType.Bls12381G2Key2020, seedBase58 });

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
      expect(keyPair.seedBase58).toBe(seedBase58)
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
        publicKeyBase58
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
      expect(keyPair.seedBase58).toBe(seedBase58)
      expect(keyPair.privateKey).toBeInstanceOf(Uint8Array);
      expect(keyPair.privateKey?.length).toBeGreaterThan(1);
      expect(keyPair.privateKeyBase58).toBe(privateKeyBase58);
      expect(keyPair.publicKey).toBeInstanceOf(Uint8Array);
      expect(keyPair.publicKey?.length).toBeGreaterThan(1);
      expect(keyPair.publicKeyBase58).toBe(publicKeyBase58);
    });

    it('should fail to generateKeyPair with valid type, seed and invalid privateKey', async () => {
      await expect(generateKeyPair({
        type: VerificationType.Bls12381G2Key2020,
        seedBase58,
        privateKeyBase58: invalidPrivateKeyBase58,
        publicKeyBase58
      })).rejects.toThrowError('Private key does not match');
    });

    it('should fail to generateKeyPair with valid type, seed and invalid privateKey', async () => {
      await expect(generateKeyPair({
        type: VerificationType.Bls12381G2Key2020,
        seedBase58,
        privateKeyBase58,
        publicKeyBase58: invalidPublicKeyBase58
      })).rejects.toThrowError('Public key does not match');
    });
  });
});
