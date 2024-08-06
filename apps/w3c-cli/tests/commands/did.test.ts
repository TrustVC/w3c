import { VerificationType } from '@tradetrust-tt/w3c-issuer';
import chalk from 'chalk';
import fs from 'fs';
import inquirer from 'inquirer';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  getIssuedDid,
  promptQuestions,
  saveIssuedDid,
} from '../../src/commands/did';
import { IssueDidInput } from '../../src/types';

vi.mock('inquirer');
vi.mock('fs', async () => {
  const originalFs = await vi.importActual<typeof import('fs')>('fs');
  return {
    ...originalFs,
  };
});
vi.mock('chalk', async () => {
  const originalChalk = await vi.importActual<typeof import('chalk')>('chalk');
  return {
    ...originalChalk,
  };
});

describe('did', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetAllMocks();
  });
  describe('promptQuestions', () => {
    beforeEach(() => {
      vi.clearAllMocks();
      vi.resetAllMocks();
    });
    it('should return correct answers for valid file path', async () => {
      const input: IssueDidInput = {
        keyPairPath: './keypair.json',
        domainName: 'https://example.com',
        outputPath: '.',
      };
      const mockKeypairData = {
        ...input,
      };
      (inquirer.prompt as any).mockResolvedValue(input);
      // Mocks the readFileSync function so that it successfully reads a file
      vi.spyOn(fs, 'readFileSync').mockReturnValue(JSON.stringify(mockKeypairData));

      const answers: any = await promptQuestions();

      expect(answers.domainName).toBe(input.domainName);
      expect(answers.outputPath).toBe(input.outputPath);

      const expectedKeypairData = {
        ...mockKeypairData,
        domain: answers.domainName,
      };
      expect(answers.keypairData).toStrictEqual(expectedKeypairData);
    });

    it('should throw error for invalid file path', async () => {
      const input: IssueDidInput = {
        keyPairPath: './/bad-keypair.json',
        domainName: 'https://example.com',
        outputPath: '.',
      };
      (inquirer.prompt as any).mockResolvedValue(input);

      const consoleLogSpy = vi.spyOn(console, 'error');
      vi.spyOn(fs, 'readFileSync').mockImplementation(() => {
        throw new Error();
      });

      await promptQuestions();

      expect(consoleLogSpy).toHaveBeenNthCalledWith(
        1,
        chalk.red(`Invalid file path provided: ${input.keyPairPath}`),
      );
    });

    it('should throw error for invalid outputPath', async () => {
      const input: IssueDidInput = {
        keyPairPath: './keypair.json',
        domainName: 'https://example.com',
        outputPath: './/bad-path',
      };

      const consoleLogSpy = vi.spyOn(console, 'error');

      vi.spyOn(fs, 'readFileSync').mockImplementation(() => {
        return '{}';
      });
      vi.spyOn(fs, 'readdirSync').mockImplementation(() => {
        throw new Error();
      });

      (inquirer.prompt as any).mockResolvedValue(input);
      await promptQuestions();

      expect(consoleLogSpy).toHaveBeenNthCalledWith(
        1,
        chalk.red(`Invalid file path provided: ${input.outputPath}`),
      );
    });
  });

  describe('getIssuedDid', () => {
    beforeEach(() => {
      vi.clearAllMocks();
      vi.resetAllMocks();
    });
    it('should throw error if getIssuedDid receives invalid domain name', async () => {
      const consoleLogSpy = vi.spyOn(console, 'error');

      const mockKeypairData: any = {
        type: VerificationType.Bls12381G1Key2020,
        domainName: 'bad-domain-name',
      };
      await getIssuedDid(mockKeypairData);
      expect(consoleLogSpy).toHaveBeenNthCalledWith(
        1,
        chalk.red(`Error generating DID token: Invalid / Missing domain`),
      );
    });
  });
  describe('saveIssuedDid', () => {
    beforeEach(() => {
      vi.clearAllMocks();
      vi.resetAllMocks();
    });
    it('should write files successfully', async () => {
      const consoleLogSpy = vi.spyOn(console, 'log');
      // const writeFileMock = vi.spyOn(fs, 'writeFileSync');

      await saveIssuedDid({}, {} as any, '.');
      expect(consoleLogSpy).toHaveBeenNthCalledWith(
        1,
        chalk.green(`File written successfully to ./wellknown.json`),
      );
      expect(consoleLogSpy).toHaveBeenNthCalledWith(
        2,
        chalk.green(`File written successfully to ./keypairs.json`),
      );
    });
    it('should throw error if writeFileSync fails', async () => {
      const consoleLogSpy = vi.spyOn(console, 'error');
      const writeFileMock = vi.spyOn(fs, 'writeFileSync');
      writeFileMock.mockImplementation(() => {
        throw new Error();
      });

      await saveIssuedDid({}, {} as any, '.');
      expect(consoleLogSpy).toHaveBeenNthCalledWith(
        1,
        chalk.red(`Unable to write file to ./wellknown.json`),
      );
      expect(consoleLogSpy).toHaveBeenNthCalledWith(
        2,
        chalk.red(`Unable to write file to ./keypairs.json`),
      );
    });
  });
});
