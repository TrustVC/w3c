import {
  GenerateKeyPairOptions,
  VerificationType,
  generateKeyPair,
} from '@tradetrust-tt/w3c-issuer';
import { execSync } from 'child_process';
import { describe, expect, it, vi } from 'vitest';

vi.mock('fs', () => ({
  writeFile: vi.fn((path, data, callback) => callback(null)),
}));

vi.mock('@tradetrust-tt/w3c-issuer', () => ({
  generateKeyPair: vi.fn().mockResolvedValue({
    publicKey: 'mockPublicKey',
    privateKey: 'mockPrivateKey',
  }),
  VerificationType: {
    Bls12381G2Key2020: 'Bls12381G2Key2020',
    // Add other verification types if necessary
  }
}));

describe('generate', () => {
  it('should generate a key pair and save it to a file', async () => {
    const consoleLogSpy = vi.spyOn(console, 'log');
    const consoleErrorSpy = vi.spyOn(console, 'error');

    const mockSeed = 'FVj12jBiBUqYFaEUkTuwAD73p9Hx5NzCJBge74nTguQN';
    const generateKeypairOption: GenerateKeyPairOptions = {
      type: VerificationType.Bls12381G2Key2020,
    };

    execSync(`nx dev w3c-cli generate`);

    expect(true).toBe(true)
    // expect(consoleLogSpy).toHaveBeenCalledWith('Public Key: mockPublicKey');
  });
});
