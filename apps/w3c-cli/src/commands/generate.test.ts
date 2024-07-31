import {
  GenerateKeyPairOptions,
  VerificationType,
  generateKeyPair,
} from '@tradetrust-tt/w3c-issuer';
import { execSync, spawn } from 'child_process';
import { describe, expect, it, vi } from 'vitest';
import stripAnsi from 'strip-ansi';
import { promptQuestions } from 'apps/w3c-cli/src/commands/generate';
import inquirer from 'inquirer';

vi.mock("inquirer")
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
  it('should prompt questions', async () => {
    const consoleLogSpy = vi.spyOn(console, 'log');
    const consoleErrorSpy = vi.spyOn(console, 'error');

    const mockSeed = 'FVj12jBiBUqYFaEUkTuwAD73p9Hx5NzCJBge74nTguQN';
    const generateKeypairOption: GenerateKeyPairOptions = {
      type: VerificationType.Bls12381G2Key2020,
    };

    (inquirer.prompt as any).mockResolvedValue({ encryptionAlgorithm: VerificationType.Bls12381G2Key2020, seedBase58: mockSeed, keyPath: '.' });

    const answers = await promptQuestions();

    console.log(answers)
    // await runCliCommand('nx dev w3c-cli', ['generate'], [["enter"], mockSeed, '']);
    // execSync(`nx dev w3c-cli generate`);
    // execSync(`nx dev w3c-cli generate`);

    // expect(true).toBe(true)
    // expect(consoleLogSpy).toHaveBeenCalledWith('Public Key: mockPublicKey');
  });
});

