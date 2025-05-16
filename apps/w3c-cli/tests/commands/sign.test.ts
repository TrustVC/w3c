import { VerifiableCredential } from '@trustvc/w3c-vc';
import fs from 'fs';
import inquirer from 'inquirer';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  promptForInputs,
  saveSignedCredential,
  signCredentialWithKeyPair,
} from '../../src/commands/sign';
import { mockCredential as freezedMockCredential } from '../fixtures/mockCredential';
import { mockKeyPair } from '../fixtures/mockDidWeb';

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

let mockCredential: VerifiableCredential;

describe('sign', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetAllMocks();
  });

  describe('promptForInputs', () => {
    beforeEach(() => {
      vi.clearAllMocks();
      vi.resetAllMocks();
    });

    it('should return correct answers for valid inputs', async () => {
      const input = {
        keyPairPath: './keypair.json',
        credentialPath: './credential.json',
        outputPath: '.',
      };

      (inquirer.prompt as any)
        .mockResolvedValueOnce({ keyPairPath: input.keyPairPath })
        .mockResolvedValueOnce({ credentialPath: input.credentialPath })
        .mockResolvedValueOnce({ outputPath: input.outputPath });

      vi.spyOn(fs, 'readFileSync')
        .mockReturnValueOnce(JSON.stringify(mockKeyPair))
        .mockReturnValueOnce(JSON.stringify(freezedMockCredential));

      const answers = await promptForInputs();

      expect(answers.keypairData).toStrictEqual(mockKeyPair);
      expect(answers.credentialData).toStrictEqual(freezedMockCredential);
      expect(answers.outputPath).toBe(input.outputPath);
    });

    it('should throw error for invalid key pair file path', async () => {
      const input = {
        keyPairPath: './invalid-keypair.json',
      };

      (inquirer.prompt as any).mockResolvedValueOnce({ keyPairPath: input.keyPairPath });

      vi.spyOn(fs, 'readFileSync').mockImplementation(() => {
        throw new Error();
      });

      await expect(promptForInputs()).rejects.toThrowError(
        `Invalid key pair file path: ${input.keyPairPath}`,
      );
    });

    it('should throw error for invalid credential file path', async () => {
      const input = {
        keyPairPath: './keypair.json',
        credentialPath: './invalid-credential.json',
      };

      (inquirer.prompt as any)
        .mockResolvedValueOnce({ keyPairPath: input.keyPairPath })
        .mockResolvedValueOnce({ credentialPath: input.credentialPath });

      vi.spyOn(fs, 'readFileSync')
        .mockReturnValueOnce(JSON.stringify(mockKeyPair))
        .mockImplementationOnce(() => {
          throw new Error();
        });

      await expect(promptForInputs()).rejects.toThrowError(
        `Invalid credential file path: ${input.credentialPath}`,
      );
    });

    it('should throw error for invalid output path', async () => {
      const input = {
        keyPairPath: './keypair.json',
        credentialPath: './credential.json',
        outputPath: './invalid-dir',
      };

      (inquirer.prompt as any)
        .mockResolvedValueOnce({ keyPairPath: input.keyPairPath })
        .mockResolvedValueOnce({ credentialPath: input.credentialPath })
        .mockResolvedValueOnce({ outputPath: input.outputPath });

      vi.spyOn(fs, 'readFileSync')
        .mockReturnValueOnce(JSON.stringify(mockKeyPair))
        .mockReturnValueOnce(JSON.stringify(freezedMockCredential));

      vi.spyOn(fs, 'readdirSync').mockImplementation(() => {
        throw new Error();
      });

      await expect(promptForInputs()).rejects.toThrowError('Output path is not valid');
    });
  });

  describe('signCredentialWithKeyPair', () => {
    beforeEach(() => {
      vi.clearAllMocks();
      vi.resetAllMocks();
      vi.restoreAllMocks();

      mockCredential = { ...freezedMockCredential };
    });

    it('should successfully sign credential', async () => {
      const result = await signCredentialWithKeyPair(mockCredential, mockKeyPair);

      expect(result).toMatchObject(
        expect.objectContaining({
          ...mockCredential,
          id: expect.stringContaining('urn:bnid:_:'),
          proof: expect.objectContaining({
            type: expect.stringContaining('BbsBlsSignature2020'),
            created: expect.stringContaining('Z'),
            proofPurpose: 'assertionMethod',
            verificationMethod: expect.stringContaining('did:web:trustvc.github.io:did:1'),
            proofValue: expect.anything(),
          }),
        }),
      );
    });

    it('should throw error when signing fails', async () => {
      // Using a key pair that is structurally different to ensure failure
      const highlyInvalidKeyPair = {
        ...mockKeyPair,
        type: 'NonExistentKeyType',
        privateKeyBase58: 'Invalid',
      } as any;

      await expect(
        signCredentialWithKeyPair(mockCredential, highlyInvalidKeyPair),
      ).rejects.toThrowError();
    });
  });

  describe('saveSignedCredential', () => {
    beforeEach(() => {
      vi.clearAllMocks();
      vi.resetAllMocks();
    });

    it('should successfully save credential to specified path', () => {
      const outputPath = '.';
      const signedCredential = { ...freezedMockCredential, id: 'test-id' }; // Add id for filename

      const writeFileSyncSpy = vi.spyOn(fs, 'writeFileSync');

      saveSignedCredential(signedCredential, outputPath);

      expect(writeFileSyncSpy).toHaveBeenCalledWith(
        `${outputPath}/signed_vc.json`,
        JSON.stringify(signedCredential),
      );
    });

    it('should throw error if saving fails', async () => {
      const outputPath = '.';
      const signedCredential = { ...mockCredential, id: 'test-id' };

      vi.spyOn(fs, 'writeFileSync').mockImplementation(() => {
        throw new Error('Save error');
      });

      await expect(saveSignedCredential(signedCredential, outputPath)).rejects.toThrowError(
        'Unable to save signed credential to ./signed_vc.json',
      );
    });
  });
});
