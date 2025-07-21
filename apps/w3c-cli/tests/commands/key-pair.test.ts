import * as prompts from '@inquirer/prompts';
import * as w3cIssuer from '@trustvc/w3c-issuer';
import { VerificationType } from '@trustvc/w3c-issuer';
import chalk from 'chalk';
import fs from 'fs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { generateAndSaveKeyPair, promptQuestions } from '../../src/commands/key-pair';
import { GenerateInput } from '../../src/types';

vi.mock('@inquirer/prompts');
vi.mock('fs', async () => {
  const originalFs = await vi.importActual<typeof import('fs')>('fs');
  return {
    ...originalFs,
    // This is required, otherwise mocks that use writeFile won't work
    promises: {
      writeFile: vi.fn().mockResolvedValue({}),
    },
  };
});
vi.mock('chalk', async () => {
  const originalChalk = await vi.importActual<typeof import('chalk')>('chalk');
  return {
    ...originalChalk,
  };
});

// GLOBAL CONSTANTS
const mockSeed = 'FVj12jBiBUqYFaEUkTuwAD73p9Hx5NzCJBge74nTguQN';

describe('key-pair', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe('promptQuestions', () => {
    beforeEach(() => {
      vi.resetAllMocks();
    });

    it('should promptQuestions successfully with type Bls12381G2Key2020', async () => {
      const input: GenerateInput = {
        encAlgo: VerificationType.Bls12381G2Key2020,
        seedBase58: mockSeed,
        keyPath: './valid-dir',
      };
      // Automatically keys in "user input" that inquirer will receive
      (prompts.input as any)
        .mockResolvedValueOnce(input.seedBase58)
        .mockResolvedValueOnce(input.keyPath);
      (prompts.select as any).mockResolvedValueOnce(input.encAlgo);
      vi.spyOn(fs, 'readdirSync').mockImplementation(() => {
        return [];
      });

      const answers: any = await promptQuestions();

      expect(answers.encAlgo).toBe(VerificationType.Bls12381G2Key2020);
      expect(answers.seedBase58).toBe(mockSeed);
      expect(answers.keyPath).toBe('./valid-dir');
      expect(prompts.input).toHaveBeenCalledTimes(2);
    });

    it('should fail promptQuestions when given invalid file path', async () => {
      const input: GenerateInput = {
        encAlgo: VerificationType.Bls12381G2Key2020,
        seedBase58: mockSeed,
        keyPath: './/invalid-file-path',
      };
      // Automatically keys in "user input" that inquirer will receive
      (prompts.input as any)
        .mockResolvedValueOnce(input.seedBase58)
        .mockResolvedValueOnce(input.keyPath);
      (prompts.select as any).mockResolvedValueOnce(input.encAlgo);
      const readDirMock = vi.spyOn(fs, 'readdirSync');
      readDirMock.mockImplementation(() => {
        throw new Error();
      });

      await expect(promptQuestions()).rejects.toThrowError(
        `Invalid file path provided: ${input.keyPath}`,
      );
    });
  });

  describe('generateAndSaveKeyPair with Bls12381G2Key2020', () => {
    beforeEach(() => {
      vi.resetAllMocks();
    });

    it('should successfully generate and save keypair file', async () => {
      const input: GenerateInput = {
        encAlgo: VerificationType.Bls12381G2Key2020,
        seedBase58: '',
        keyPath: '.',
      };

      const consoleLogSpy = vi.spyOn(console, 'log');
      const writeFileMock = vi.spyOn(fs, 'writeFileSync');

      await generateAndSaveKeyPair(input);

      const expectedKeyPath = `${input.keyPath}/keypair.json`;
      expect(consoleLogSpy).toHaveBeenNthCalledWith(
        1,
        chalk.green(`File written successfully to ${expectedKeyPath}`),
      );
      expect(writeFileMock).toHaveBeenCalledTimes(1);
      const writtendData = JSON.parse(writeFileMock.mock.calls[0][1].toString());
      expect(writeFileMock).toHaveBeenCalledWith(expectedKeyPath, expect.any(String));
      expect(writtendData).toHaveProperty('type', VerificationType.Bls12381G2Key2020);
      expect(writtendData).toHaveProperty('seedBase58');
      expect(writtendData).toHaveProperty('privateKeyBase58');
      expect(writtendData).toHaveProperty('publicKeyBase58');
    });

    it('should use seed to generate and save same keypair file', async () => {
      const input: GenerateInput = {
        encAlgo: VerificationType.Bls12381G2Key2020,
        seedBase58: mockSeed,
        keyPath: '.',
      };

      const consoleLogSpy = vi.spyOn(console, 'log');
      const writeFileMock = vi.spyOn(fs, 'writeFileSync');

      await generateAndSaveKeyPair(input);

      expect(consoleLogSpy).toHaveBeenNthCalledWith(
        1,
        chalk.blue('Generating keys from provided seed...'),
      );
      expect(writeFileMock).toHaveBeenCalledTimes(1);
      const writtendData = JSON.parse(writeFileMock.mock.calls[0][1].toString());
      expect(writeFileMock).toHaveBeenCalledWith(
        `${input.keyPath}/keypair.json`,
        expect.any(String),
      );
      expect(writtendData).toMatchInlineSnapshot(`
        {
          "privateKeyBase58": "6Gzro4CTmtACMnU2G3Hya3FsAMbk65tCUXUKyYamm4LA",
          "publicKeyBase58": "oYnrQCqu4eKAYmcmiXwbvcg61HBPGffdyfzB7UzhQSpN8jwLQybJTGcbhC8yxoG1hAMvyaV293LBkCbZXZ6Gt8w4r572iUR2bZXD9cWspEKzus3XxHe1JfRFd8w1z5KcrHT",
          "seedBase58": "FVj12jBiBUqYFaEUkTuwAD73p9Hx5NzCJBge74nTguQN",
          "type": "Bls12381G2Key2020",
        }
      `);
    });

    it('should throw error given invalid seed', async () => {
      const input: GenerateInput = {
        encAlgo: VerificationType.Bls12381G2Key2020,
        seedBase58: 'a invalid seed',
        keyPath: '.',
      };

      await expect(generateAndSaveKeyPair(input)).rejects.toThrowError(
        'Invalid seed provided. Please provide a valid seed in base58 format.',
      );
    });

    it('should throw generic error if generateKeyPair fails', async () => {
      const input: GenerateInput = {
        encAlgo: VerificationType.Bls12381G2Key2020,
        seedBase58: '',
        keyPath: '.',
      };
      vi.spyOn(w3cIssuer, 'generateKeyPair').mockImplementation(() => {
        throw new Error();
      });
      await expect(generateAndSaveKeyPair(input)).rejects.toThrowError('Error generating keypair');
    });

    it('should fail generateAndSaveKeyPair when unable to save file', async () => {
      const input: GenerateInput = {
        encAlgo: VerificationType.Bls12381G2Key2020,
        seedBase58: '',
        keyPath: '///invalid-key-path///', // This value doesn't really matter since we mock writeFil to always thro error below
      };
      const writeFileMock = vi.spyOn(fs, 'writeFileSync');
      writeFileMock.mockImplementation(() => {
        throw new Error();
      });

      await expect(generateAndSaveKeyPair(input)).rejects.toThrowError(
        `Unable to write file to ${input.keyPath}/keypair.json`,
      );
    });
  });
});
