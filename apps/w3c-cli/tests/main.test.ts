import { isCredentialStatusStatusList } from '@trustvc/w3c-credential-status';
import * as w3cIssuer from '@trustvc/w3c-issuer';
import * as w3cVc from '@trustvc/w3c-vc';
import { getDocumentLoader, verifyCredentialStatus } from '@trustvc/w3c-vc';
import chalk from 'chalk';
import inquirer from 'inquirer';
import { beforeEach, describe, it, MockedFunction, vi } from 'vitest';
import { handler as didHandler } from '../src/commands/did';
import { handler as signHandler } from '../src/commands/sign';
import * as verifyModule from '../src/commands/verify';
import { handler as verifyHandler } from '../src/commands/verify';
import { IssueDidInput } from '../src/types';
import * as utils from '../src/utils';
import { mockCredential, mockSignedCredential } from './fixtures/mockCredential';
import { mockKeyPair, mockWellKnown } from './fixtures/mockDidWeb';

// Mock dependencies with Vitest
vi.mock('inquirer');
vi.mock('../src/utils');
vi.mock('@trustvc/w3c-vc', async () => {
  const original = await vi.importActual<typeof import('@trustvc/w3c-vc')>('@trustvc/w3c-vc');
  return {
    ...original,
    getDocumentLoader: vi.fn(),
    verifyCredential: original.verifyCredential,
    verifyCredentialStatus: vi.fn(),
  };
});
vi.mock('@trustvc/w3c-credential-status');
vi.mock('chalk', async () => {
  const originalChalk = await vi.importActual<typeof import('chalk')>('chalk');
  return {
    ...originalChalk,
  };
});
vi.mock('../src/commands/did', async () => {
  const original =
    await vi.importActual<typeof import('../src/commands/did')>('../src/commands/did');
  return {
    ...original, // Use actual implementations by default
    promptQuestions: original.promptQuestions,
    getIssuedDid: original.getIssuedDid,
    saveIssuedDid: original.saveIssuedDid,
  };
});
vi.mock('@trustvc/w3c-issuer', async () => {
  const original =
    await vi.importActual<typeof import('@trustvc/w3c-issuer')>('@trustvc/w3c-issuer');
  return {
    ...original,
    issueDID: original.issueDID,
    queryDidDocument: original.queryDidDocument,
  };
});

describe('w3c-cli', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetAllMocks();
  });

  describe('w3c-cli sign command', () => {
    beforeEach(() => {
      vi.clearAllMocks();
      vi.resetAllMocks();
    });

    it('should successfully sign a credential and save it', async ({ expect }) => {
      (inquirer.prompt as unknown as MockedFunction<any>)
        .mockResolvedValueOnce({ keyPairPath: './didKeyPairs.json' } as any)
        .mockResolvedValueOnce({ credentialPath: './vc.json' } as any)
        .mockResolvedValueOnce({ outputPath: './output' } as any);

      (utils.readJsonFile as MockedFunction<typeof utils.readJsonFile>)
        .mockReturnValueOnce(mockKeyPair)
        .mockReturnValueOnce({ ...mockCredential });
      (utils.isDirectoryValid as MockedFunction<typeof utils.isDirectoryValid>).mockReturnValue(
        true,
      );
      (utils.writeFile as MockedFunction<typeof utils.writeFile>).mockImplementation(() => {
        /* do nothing */
      });

      const signCredentialSpy = vi.spyOn(w3cVc, 'signCredential');

      const consoleLogSpy = vi.spyOn(console, 'log');
      const consoleErrorSpy = vi.spyOn(console, 'error');

      await signHandler();

      expect(inquirer.prompt).toHaveBeenCalledTimes(3);
      expect(utils.readJsonFile).toHaveBeenCalledWith('./didKeyPairs.json', 'key pair');
      expect(utils.readJsonFile).toHaveBeenCalledWith('./vc.json', 'credential');
      expect(utils.isDirectoryValid).toHaveBeenCalledWith('./output');
      expect(signCredentialSpy).toHaveBeenCalledWith(
        expect.objectContaining(mockCredential),
        mockKeyPair,
      );
      expect(utils.writeFile).toHaveBeenCalledWith(
        './output/signed_vc.json',
        expect.objectContaining({
          ...mockSignedCredential,
          id: expect.any(String),
          proof: expect.objectContaining({
            ...mockSignedCredential.proof,
            created: expect.any(String),
            proofValue: expect.any(String),
          }),
        }),
      );
      expect(consoleLogSpy).toHaveBeenCalledWith(
        chalk.green('Signed credential saved successfully to ./output/signed_vc.json'),
      );
      expect(consoleErrorSpy).not.toHaveBeenCalled();
    });

    it('should log an error when key pair file is not found/invalid', async ({ expect }) => {
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

    it('should log an error when credential file is not found/invalid', async ({ expect }) => {
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

    it('should log an error when output path is invalid', async ({ expect }) => {
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

    it('should log an error during the signing process', async ({ expect }) => {
      (inquirer.prompt as unknown as MockedFunction<any>)
        .mockResolvedValueOnce({ keyPairPath: './didKeyPairs.json' } as any)
        .mockResolvedValueOnce({ credentialPath: './vc.json' } as any)
        .mockResolvedValueOnce({ outputPath: './output' } as any);

      (utils.readJsonFile as MockedFunction<typeof utils.readJsonFile>)
        .mockReturnValueOnce(mockKeyPair)
        .mockReturnValueOnce(mockCredential);
      (utils.isDirectoryValid as MockedFunction<typeof utils.isDirectoryValid>).mockReturnValue(
        true,
      );
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

    it('should log an error during file saving', async ({ expect }) => {
      (inquirer.prompt as unknown as MockedFunction<any>)
        .mockResolvedValueOnce({ keyPairPath: './didKeyPairs.json' } as any)
        .mockResolvedValueOnce({ credentialPath: './vc.json' } as any)
        .mockResolvedValueOnce({ outputPath: './output' } as any);

      (utils.readJsonFile as MockedFunction<typeof utils.readJsonFile>)
        .mockReturnValueOnce(mockKeyPair)
        .mockReturnValueOnce(mockCredential);
      (utils.isDirectoryValid as MockedFunction<typeof utils.isDirectoryValid>).mockReturnValue(
        true,
      );
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

  describe('w3c-cli did command', () => {
    let issueDIDSpy: MockedFunction<typeof w3cIssuer.issueDID>;
    let writeFileSpy: MockedFunction<typeof utils.writeFile>;
    let consoleErrorSpy: MockedFunction<typeof console.error>;

    beforeEach(() => {
      vi.clearAllMocks();
      vi.resetAllMocks();
      vi.restoreAllMocks();

      issueDIDSpy = vi.spyOn(w3cIssuer, 'issueDID') as MockedFunction<typeof w3cIssuer.issueDID>;
      writeFileSpy = vi.spyOn(utils, 'writeFile') as MockedFunction<typeof utils.writeFile>;
      consoleErrorSpy = vi.spyOn(console, 'error') as MockedFunction<typeof console.error>;
    });

    it('should generate a new DID token file', async ({ expect }) => {
      const input: IssueDidInput = {
        keyPairPath: './keypair.json',
        domainName: 'https://example.com',
        outputPath: '.',
      };
      (inquirer.prompt as any).mockResolvedValue(input);
      (utils.readJsonFile as MockedFunction<typeof utils.readJsonFile>).mockReturnValueOnce({
        ...mockKeyPair,
      });
      (utils.isDirectoryValid as MockedFunction<typeof utils.isDirectoryValid>).mockReturnValue(
        true,
      );

      await didHandler();

      expect(issueDIDSpy).toHaveBeenCalledWith(
        expect.objectContaining({ ...mockKeyPair, domain: input.domainName }),
      );
      expect(writeFileSpy).toHaveBeenNthCalledWith(1, './wellknown.json', {
        '@context': [
          'https://www.w3.org/ns/did/v1',
          'https://w3id.org/security/suites/bls12381-2020/v1',
        ],
        assertionMethod: ['did:web:example.com#keys-1'],
        authentication: ['did:web:example.com#keys-1'],
        capabilityDelegation: ['did:web:example.com#keys-1'],
        capabilityInvocation: ['did:web:example.com#keys-1'],
        id: 'did:web:example.com',
        verificationMethod: [
          {
            controller: 'did:web:example.com',
            id: 'did:web:example.com#keys-1',
            publicKeyBase58:
              'oRfEeWFresvhRtXCkihZbxyoi2JER7gHTJ5psXhHsdCoU1MttRMi3Yp9b9fpjmKh7bMgfWKLESiK2YovRd8KGzJsGuamoAXfqDDVhckxuc9nmsJ84skCSTijKeU4pfAcxeJ',
            type: 'Bls12381G2Key2020',
          },
        ],
      });
      expect(writeFileSpy).toHaveBeenNthCalledWith(2, './didKeyPairs.json', {
        controller: 'did:web:example.com',
        id: 'did:web:example.com#keys-1',
        privateKeyBase58: '4LDU56PUhA9ZEutnR1qCWQnUhtLtpLu2EHSq4h1o7vtF',
        publicKeyBase58:
          'oRfEeWFresvhRtXCkihZbxyoi2JER7gHTJ5psXhHsdCoU1MttRMi3Yp9b9fpjmKh7bMgfWKLESiK2YovRd8KGzJsGuamoAXfqDDVhckxuc9nmsJ84skCSTijKeU4pfAcxeJ',
        seedBase58: 'GWP69tmSWJjqC1RoJ27FehcVqkVyeYAz6h5ABwoNSNdS',
        type: 'Bls12381G2Key2020',
      });
    });

    it('should early exit if did already exists', async ({ expect }) => {
      const input: IssueDidInput = {
        keyPairPath: './keypair.json',
        domainName: 'https://trustvc.github.io/did/1',
        outputPath: '.',
      };
      (inquirer.prompt as any).mockResolvedValue(input);
      (utils.readJsonFile as MockedFunction<typeof utils.readJsonFile>).mockReturnValueOnce({
        ...mockKeyPair,
      });
      (utils.isDirectoryValid as MockedFunction<typeof utils.isDirectoryValid>).mockReturnValue(
        true,
      );

      await didHandler();

      expect(issueDIDSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          ...mockKeyPair,
          domain: input.domainName,
        }),
      );
      expect(writeFileSpy).not.toHaveBeenCalled();
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        chalk.red('Error: Error generating DID token: KeyPair already exists in Did Document'),
      );
    });

    it('should early exit if getIssuedDid throws error', async ({ expect }) => {
      const input: IssueDidInput = {
        keyPairPath: './keypair.json',
        domainName: 'https://example.com',
        outputPath: '.',
      };
      (inquirer.prompt as any).mockResolvedValue(input);
      (utils.readJsonFile as MockedFunction<typeof utils.readJsonFile>).mockReturnValueOnce({
        ...mockKeyPair,
      });
      (utils.isDirectoryValid as MockedFunction<typeof utils.isDirectoryValid>).mockReturnValue(
        true,
      );

      issueDIDSpy.mockRejectedValue(new Error(''));

      await didHandler();

      expect(issueDIDSpy).toHaveBeenCalledWith({
        ...mockKeyPair,
        domain: input.domainName,
      });
      expect(writeFileSpy).not.toHaveBeenCalled();
      expect(consoleErrorSpy).toHaveBeenCalledWith(chalk.red('Error: Error generating DID token'));
    });
  });

  describe('w3c-cli verify command', () => {
    beforeEach(() => {
      vi.clearAllMocks();
      vi.resetAllMocks();
    });

    it('should successfully verify credential when called with valid input', async ({ expect }) => {
      const input = {
        credentialPath: './signed_vc.json',
      };

      (inquirer.prompt as any).mockResolvedValueOnce({ credentialPath: input.credentialPath });
      vi.spyOn(utils, 'readJsonFile').mockReturnValueOnce(mockSignedCredential);
      const consoleLogSpy = vi.spyOn(console, 'log');
      const verifyResult = { verified: true };

      (getDocumentLoader as any).mockImplementationOnce(() => {
        return getDocumentLoader({
          'did:web:trustvc.github.io:did:1': mockWellKnown,
        });
      });
      (isCredentialStatusStatusList as any).mockReturnValue(true);
      (verifyCredentialStatus as any).mockResolvedValueOnce({
        purpose: 'revocation',
        status: 'active',
      });
      const verifyCredentialSpy = vi.spyOn(w3cVc, 'verifyCredential');

      // Call the handler function
      await verifyHandler();

      expect(utils.readJsonFile).toHaveBeenCalledWith(input.credentialPath, 'credential');
      expect(verifyCredentialSpy).toHaveBeenCalledWith(mockSignedCredential);
      expect(isCredentialStatusStatusList).toHaveBeenCalled();
      expect(verifyCredentialStatus).toHaveBeenCalled();
      expect(consoleLogSpy).toHaveBeenNthCalledWith(
        1,
        chalk.green(`Verification result: ${verifyResult.verified}`),
      );
      expect(consoleLogSpy).toHaveBeenNthCalledWith(
        2,
        expect.stringContaining('Credential status verification result'),
      );
    });

    it('should handle errors gracefully', async ({ expect }) => {
      const consoleErrorSpy = vi.spyOn(console, 'error');

      // Mock inquirer to simulate the actual error that occurs
      (inquirer.prompt as any).mockRejectedValueOnce(new Error('Verification failed'));

      await verifyHandler();

      expect(consoleErrorSpy).toHaveBeenCalledWith(expect.stringMatching(/Error:.*/));
    });

    it('should exit early if no answers are returned from prompt', async ({ expect }) => {
      // Mock directly - this approach is more reliable
      vi.spyOn(verifyModule, 'promptForCredential').mockResolvedValueOnce(undefined);
      const verifySpy = vi.spyOn(verifyModule, 'verifyCredentialData');

      await verifyHandler();

      expect(verifySpy).not.toHaveBeenCalled();
    });
  });
});
