import { PrivateKeyPair, VerificationType } from '@trustvc/w3c-issuer';
import * as w3cVc from '@trustvc/w3c-vc';
import chalk from 'chalk';
import inquirer from 'inquirer';
import { beforeEach, describe, expect, it, MockedFunction, vi } from 'vitest';
import { handler as signHandler } from '../src/commands/sign';
import * as utils from '../src/utils';

// Mock dependencies with Vitest
vi.mock('inquirer');
vi.mock('../src/utils');
vi.mock('@trustvc/w3c-vc');
vi.mock('chalk', async () => {
  const originalChalk = await vi.importActual<typeof import('chalk')>('chalk');
  return {
    ...originalChalk,
  };
});

const mockKeyPair: PrivateKeyPair = {
  id: 'did:web:trustvc.github.io:did:1#keys-1',
  type: VerificationType.Bls12381G2Key2020,
  controller: 'did:web:trustvc.github.io:did:1',
  seedBase58: 'GWP69tmSWJjqC1RoJ27FehcVqkVyeYAz6h5ABwoNSNdS',
  privateKeyBase58: '4LDU56PUhA9ZEutnR1qCWQnUhtLtpLu2EHSq4h1o7vtF',
  publicKeyBase58:
    'oRfEeWFresvhRtXCkihZbxyoi2JER7gHTJ5psXhHsdCoU1MttRMi3Yp9b9fpjmKh7bMgfWKLESiK2YovRd8KGzJsGuamoAXfqDDVhckxuc9nmsJ84skCSTijKeU4pfAcxeJ',
};
const mockCredential = {
  '@context': 'https://www.w3.org/2018/credentials/v1',
  id: 'urn:uuid:123',
  type: ['VerifiableCredential'],
};
const mockSignedCredential = {
  ...mockCredential,
  proof: { type: 'Ed25519Signature2018', proofPurpose: 'assertionMethod' },
};

describe('w3c-cli sign command', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetAllMocks();
  });

  it('should successfully sign a credential and save it', async () => {
    (inquirer.prompt as unknown as MockedFunction<any>)
      .mockResolvedValueOnce({ keyPairPath: './didKeyPairs.json' } as any)
      .mockResolvedValueOnce({ credentialPath: './vc.json' } as any)
      .mockResolvedValueOnce({ outputPath: './output' } as any);

    (utils.readJsonFile as MockedFunction<typeof utils.readJsonFile>)
      .mockReturnValueOnce(mockKeyPair)
      .mockReturnValueOnce(mockCredential);
    (utils.isDirectoryValid as MockedFunction<typeof utils.isDirectoryValid>).mockReturnValue(true);
    (utils.writeFile as MockedFunction<typeof utils.writeFile>).mockImplementation(() => {
      /* do nothing */
    });

    (w3cVc.signCredential as MockedFunction<typeof w3cVc.signCredential>).mockResolvedValue({
      signed: mockSignedCredential,
    } as any);

    const consoleLogSpy = vi.spyOn(console, 'log');
    const consoleErrorSpy = vi.spyOn(console, 'error');

    await signHandler();

    expect(inquirer.prompt).toHaveBeenCalledTimes(3);
    expect(utils.readJsonFile).toHaveBeenCalledWith('./didKeyPairs.json', 'key pair');
    expect(utils.readJsonFile).toHaveBeenCalledWith('./vc.json', 'credential');
    expect(utils.isDirectoryValid).toHaveBeenCalledWith('./output');
    expect(w3cVc.signCredential).toHaveBeenCalledWith(mockCredential, mockKeyPair);
    expect(utils.writeFile).toHaveBeenCalledWith('./output/signed_vc.json', mockSignedCredential);
    expect(consoleLogSpy).toHaveBeenCalledWith(
      chalk.green('Signed credential saved successfully to ./output/signed_vc.json'),
    );
    expect(consoleErrorSpy).not.toHaveBeenCalled();
  });

  it('should log an error when key pair file is not found/invalid', async () => {
    (inquirer.prompt as unknown as MockedFunction<any>)
      .mockResolvedValueOnce({ keyPairPath: './invalidKeyPair.json' } as any)
      .mockResolvedValueOnce({ credentialPath: './vc.json' } as any)
      .mockResolvedValueOnce({ outputPath: './output' } as any);

    (utils.readJsonFile as MockedFunction<typeof utils.readJsonFile>).mockImplementation(
      (filePath) => {
        if (filePath.includes('invalidKeyPair.json')) {
          throw new Error('Key pair file not found or invalid.');
        }
        if (filePath.includes('vc.json')) {
          return mockCredential;
        }
        return {}; // Default return for any other path
      },
    );

    const consoleErrorSpy = vi.spyOn(console, 'error');
    const consoleLogSpy = vi.spyOn(console, 'log');

    await signHandler();

    expect(inquirer.prompt).toHaveBeenCalledTimes(1);
    expect(utils.readJsonFile).toHaveBeenCalledWith('./invalidKeyPair.json', 'key pair');
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      chalk.red('Error: Key pair file not found or invalid.'),
    );
    expect(consoleLogSpy).not.toHaveBeenCalled();
  });

  it('should log an error when credential file is not found/invalid', async () => {
    (inquirer.prompt as unknown as MockedFunction<any>)
      .mockResolvedValueOnce({ keyPairPath: './didKeyPairs.json' } as any)
      .mockResolvedValueOnce({ credentialPath: './invalidVc.json' } as any)
      .mockResolvedValueOnce({ outputPath: './output' } as any);

    (utils.readJsonFile as MockedFunction<typeof utils.readJsonFile>).mockImplementation(
      (filePath) => {
        if (filePath.includes('didKeyPairs.json')) {
          return mockKeyPair;
        }
        if (filePath.includes('invalidVc.json')) {
          throw new Error('Credential file not found or invalid.');
        }
        return {}; // Default return for any other path
      },
    );

    const consoleErrorSpy = vi.spyOn(console, 'error');
    const consoleLogSpy = vi.spyOn(console, 'log');

    await signHandler();

    expect(inquirer.prompt).toHaveBeenCalledTimes(2);
    expect(utils.readJsonFile).toHaveBeenCalledWith('./didKeyPairs.json', 'key pair');
    expect(utils.readJsonFile).toHaveBeenCalledWith('./invalidVc.json', 'credential');
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      chalk.red('Error: Credential file not found or invalid.'),
    );
    expect(consoleLogSpy).not.toHaveBeenCalled();
  });

  it('should log an error when output path is invalid', async () => {
    (inquirer.prompt as unknown as MockedFunction<any>)
      .mockResolvedValueOnce({ keyPairPath: './didKeyPairs.json' } as any)
      .mockResolvedValueOnce({ credentialPath: './vc.json' } as any)
      .mockResolvedValueOnce({ outputPath: './invalidOutput' } as any);

    (utils.readJsonFile as MockedFunction<typeof utils.readJsonFile>)
      .mockReturnValueOnce(mockKeyPair)
      .mockReturnValueOnce(mockCredential);
    (utils.isDirectoryValid as MockedFunction<typeof utils.isDirectoryValid>).mockReturnValue(
      false,
    );

    const consoleErrorSpy = vi.spyOn(console, 'error');
    const consoleLogSpy = vi.spyOn(console, 'log');

    await signHandler();

    expect(inquirer.prompt).toHaveBeenCalledTimes(3);
    expect(utils.readJsonFile).toHaveBeenCalledWith('./didKeyPairs.json', 'key pair');
    expect(utils.readJsonFile).toHaveBeenCalledWith('./vc.json', 'credential');
    expect(utils.isDirectoryValid).toHaveBeenCalledWith('./invalidOutput');
    expect(consoleErrorSpy).toHaveBeenCalledWith(chalk.red('Error: Output path is not valid'));
    expect(consoleLogSpy).not.toHaveBeenCalled();
  });

  it('should log an error during the signing process', async () => {
    (inquirer.prompt as unknown as MockedFunction<any>)
      .mockResolvedValueOnce({ keyPairPath: './didKeyPairs.json' } as any)
      .mockResolvedValueOnce({ credentialPath: './vc.json' } as any)
      .mockResolvedValueOnce({ outputPath: './output' } as any);

    (utils.readJsonFile as MockedFunction<typeof utils.readJsonFile>)
      .mockReturnValueOnce(mockKeyPair)
      .mockReturnValueOnce(mockCredential);
    (utils.isDirectoryValid as MockedFunction<typeof utils.isDirectoryValid>).mockReturnValue(true);
    (w3cVc.signCredential as MockedFunction<typeof w3cVc.signCredential>).mockRejectedValue(
      new Error('Signing failed.'),
    );

    const consoleErrorSpy = vi.spyOn(console, 'error');
    const consoleLogSpy = vi.spyOn(console, 'log');

    await signHandler();

    expect(w3cVc.signCredential).toHaveBeenCalledWith(mockCredential, mockKeyPair);
    expect(consoleErrorSpy).toHaveBeenCalledWith(chalk.red('Error: Signing failed.'));
    expect(consoleLogSpy).not.toHaveBeenCalled();
    expect(utils.writeFile).not.toHaveBeenCalled();
  });

  it('should log an error during file saving', async () => {
    (inquirer.prompt as unknown as MockedFunction<any>)
      .mockResolvedValueOnce({ keyPairPath: './didKeyPairs.json' } as any)
      .mockResolvedValueOnce({ credentialPath: './vc.json' } as any)
      .mockResolvedValueOnce({ outputPath: './output' } as any);

    (utils.readJsonFile as MockedFunction<typeof utils.readJsonFile>)
      .mockReturnValueOnce(mockKeyPair)
      .mockReturnValueOnce(mockCredential);
    (utils.isDirectoryValid as MockedFunction<typeof utils.isDirectoryValid>).mockReturnValue(true);
    (w3cVc.signCredential as MockedFunction<typeof w3cVc.signCredential>).mockResolvedValue({
      signed: mockSignedCredential,
    } as any);
    (utils.writeFile as MockedFunction<typeof utils.writeFile>).mockImplementation(() => {
      throw new Error('File saving failed.');
    });

    const consoleErrorSpy = vi.spyOn(console, 'error');
    const consoleLogSpy = vi.spyOn(console, 'log');

    await signHandler();

    expect(utils.writeFile).toHaveBeenCalledWith('./output/signed_vc.json', mockSignedCredential);
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      chalk.red('Error: Unable to save signed credential to ./output/signed_vc.json'),
    );
    expect(consoleLogSpy).not.toHaveBeenCalled();
  });
});
