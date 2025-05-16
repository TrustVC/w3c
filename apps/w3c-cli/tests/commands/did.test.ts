import { IssuedDIDOption, VerificationType } from '@trustvc/w3c-issuer';
import chalk from 'chalk';
import fs from 'fs';
import inquirer from 'inquirer';
import { beforeEach, describe, expect, it, MockedFunction, vi } from 'vitest';
import { getIssuedDid, promptQuestions, saveIssuedDid } from '../../src/commands/did';
import { IssueDidInput } from '../../src/types';

vi.mock('inquirer');
vi.mock('fs', async () => {
  const originalFs = await vi.importActual<typeof import('fs')>('fs');
  return {
    ...originalFs,
  };
});
vi.mock('../../src/utils', async () => {
  const originalUtils = await vi.importActual<typeof import('../../src/utils')>('../../src/utils');
  return {
    ...originalUtils,
    isDirectoryValid: vi.fn(),
  };
});
vi.mock('@trustvc/w3c-issuer', async () => {
  const originalModule =
    await vi.importActual<typeof import('@trustvc/w3c-issuer')>('@trustvc/w3c-issuer');
  return {
    ...originalModule,
    issueDID: vi.fn(),
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

      // Mock isDirectoryValid to return true for this specific test case
      const utils = await import('../../src/utils');
      (utils.isDirectoryValid as MockedFunction<any>).mockReturnValue(true);

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

      vi.spyOn(fs, 'readFileSync').mockImplementation(() => {
        throw new Error();
      });

      await expect(promptQuestions()).rejects.toThrowError(
        `Invalid key pair file path: ${input.keyPairPath}`,
      );
    });

    it('should throw error for invalid keypair file content (not JSON)', async () => {
      const input: IssueDidInput = {
        keyPairPath: './keypair.json',
        domainName: 'https://example.com',
        outputPath: '.',
      };
      (inquirer.prompt as any).mockResolvedValue(input);

      vi.spyOn(fs, 'readFileSync').mockReturnValue('invalid json'); // Not a JSON string

      await expect(promptQuestions()).rejects.toThrowError(
        `Invalid key pair file path: ${input.keyPairPath}`,
      );
    });

    it('should throw error for invalid outputPath', async () => {
      const input: IssueDidInput = {
        keyPairPath: './keypair.json',
        domainName: 'https://example.com',
        outputPath: './/bad-path',
      };

      vi.spyOn(fs, 'readFileSync').mockImplementation(() => {
        return '{}';
      });
      vi.spyOn(fs, 'readdirSync').mockImplementation(() => {
        throw new Error();
      });

      (inquirer.prompt as any).mockResolvedValue(input);
      await expect(promptQuestions()).rejects.toThrowError(`Output path is not valid`);
    });

    it('should throw error if outputPath is a file', async () => {
      const input: IssueDidInput = {
        keyPairPath: './keypair.json',
        domainName: 'https://example.com',
        outputPath: './somefile.json', // outputPath is a file
      };

      vi.spyOn(fs, 'readFileSync').mockReturnValue('{}'); // Valid JSON

      // Mock isDirectoryValid to return false for this specific test case
      const utils = await import('../../src/utils');
      (utils.isDirectoryValid as MockedFunction<any>).mockReturnValue(false);

      (inquirer.prompt as any).mockResolvedValue(input);
      await expect(promptQuestions()).rejects.toThrowError('Output path is not valid');
    });
  });

  describe('getIssuedDid', () => {
    let issueDIDMock: MockedFunction<any>;

    beforeEach(async () => {
      vi.clearAllMocks();
      vi.resetAllMocks();

      const issuerModule = await import('@trustvc/w3c-issuer');
      issueDIDMock = issuerModule.issueDID as MockedFunction<any>;
    });

    it('should throw error if getIssuedDid receives invalid domain name', async () => {
      const mockKeypairData: IssuedDIDOption = {
        type: VerificationType.Bls12381G1Key2020,
        domain: 'bad-domain-name',
      };
      issueDIDMock.mockRejectedValue(new Error('Invalid domain'));
      await expect(getIssuedDid(mockKeypairData)).rejects.toThrowError(
        'Error generating DID token: Invalid domain',
      );
    });

    it('should return did details if domain name is valid', async () => {
      const mockKeypairData: IssuedDIDOption = {
        type: VerificationType.Bls12381G1Key2020,
        domain: 'https://example.com',
      };
      // Basic check, as the actual generation is done by an external library
      issueDIDMock.mockResolvedValue({
        wellKnownDid: { id: 'did:web:example.com' },
        didKeyPairs: { id: 'did:web:example.com#key-1' },
      });
      const result = await getIssuedDid(mockKeypairData);
      expect(result).toHaveProperty('wellKnownDid');
      expect(result).toHaveProperty('didKeyPairs');
    });

    it('should log "KeyPair already exists" error and return undefined', async () => {
      const mockKeypairData: IssuedDIDOption = {
        type: VerificationType.Bls12381G1Key2020,
        domain: 'example.com',
      };
      const errorMessage = 'KeyPair already exists';
      issueDIDMock.mockRejectedValue(new Error(errorMessage));

      await expect(getIssuedDid(mockKeypairData)).rejects.toThrowError(
        'Error generating DID token: KeyPair already exists in Did Document',
      );
    });

    it('should log generic "Error generating DID token" for other errors and return undefined', async () => {
      const mockKeypairData: IssuedDIDOption = {
        type: VerificationType.Bls12381G1Key2020,
        domain: 'example.com',
      };
      issueDIDMock.mockRejectedValue(new Error('Some other internal error'));

      await expect(getIssuedDid(mockKeypairData)).rejects.toThrowError(
        'Error generating DID token',
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

      await saveIssuedDid(
        {
          wellKnownDid: null,
          didKeyPairs: null,
        } as any,
        '.',
      );
      expect(consoleLogSpy).toHaveBeenNthCalledWith(
        1,
        chalk.green(`File written successfully to ./wellknown.json`),
      );
      expect(consoleLogSpy).toHaveBeenNthCalledWith(
        2,
        chalk.green(`File written successfully to ./didKeyPairs.json`),
      );
    });

    it('should throw error if writeFileSync fails', async () => {
      const writeFileMock = vi.spyOn(fs, 'writeFileSync');
      writeFileMock.mockImplementation(() => {
        throw new Error();
      });

      await expect(saveIssuedDid({} as any, '.')).rejects.toThrowError(
        'Unable to write file to ./wellknown.json',
      );
    });
  });
});
