import { GenerateKeyPairOptions, VerificationType } from '@tradetrust-tt/w3c-issuer';
import fs from 'fs';
import inquirer from 'inquirer';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  generateAndSaveKeyPair,
  GenerateInput,
  promptQuestions,
} from '../../src/commands/generate';

vi.mock('inquirer');
vi.mock('fs');

const mockSeed = 'FVj12jBiBUqYFaEUkTuwAD73p9Hx5NzCJBge74nTguQN';
const generateKeypairOption: GenerateKeyPairOptions = {
  type: VerificationType.Bls12381G2Key2020,
};

describe('generate', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('promptQuestions', () => {
    it('should promptQuestions successfully', async () => {
      const input: GenerateInput = {
        encAlgo: generateKeypairOption.type,
        seedBase58: mockSeed,
        keyPath: '.',
      };
      // Automatically keys in "user input" that inquirer will receive
      (inquirer.prompt as any).mockResolvedValue(input);

      const answers = await promptQuestions();

      expect(answers.encAlgo).toBe(generateKeypairOption.type);
      expect(answers.seedBase58).toBe(mockSeed);
      expect(answers.keyPath).toBe('.');
    });
  });

  describe('generateAndSaveKeyPair', () => {
    it('should successfully save keypair file', async () => {
      const input: GenerateInput = {
        encAlgo: generateKeypairOption.type,
        seedBase58: '',
        keyPath: '.',
      };

      const writeFileMock = vi.spyOn(fs, 'writeFile').mockImplementation((path, data, callback) => {
        callback(null);
      });

      await generateAndSaveKeyPair(input);

      expect(writeFileMock).toHaveBeenCalledTimes(1);
    });

    // TODO: Add failure test case
    // it('should fail to generateAndSaveKeyPair given invalid seed', async () => {
    //     const input: GenerateInput = {
    //         encAlgo: generateKeypairOption.type,
    //         seedBase58: "ddd",
    //         keyPath: '.'
    //     };
    //     // Automatically keys in "user input" that inquirer will receive
    //     (inquirer.prompt as any).mockResolvedValue(input);
    //     const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
    //     const writeFileMock = vi.spyOn(fs, 'writeFile').mockImplementation((path, data, callback) => {
    //         callback(null);
    //     });

    //     await expect(generateAndSaveKeyPair(input)).rejects.toThrowError('Invalid seed');

    //     // expect(consoleLogSpy).toHaveBeenCalledWith("Generating keys from provided seed...");

    //     // expect(writeFileMock).toHaveBeenCalledTimes(0)

    //     // assert.fail("Should throw an error")
    // })
  });
});
