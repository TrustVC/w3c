import fs from 'fs';
import inquirer from 'inquirer';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { PrivateKeyPair, VerificationType } from '@trustvc/w3c-issuer';
import { VerifiableCredential } from '@trustvc/w3c-vc';

import {
  promptForInputs,
  saveSignedCredential,
  signCredentialWithKeyPair,
} from '../../src/commands/sign';

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

const mockKeyPair: PrivateKeyPair = {
  id: 'did:web:trustvc.github.io:did:1#keys-1',
  type: VerificationType.Bls12381G2Key2020,
  controller: 'did:web:trustvc.github.io:did:1',
  seedBase58: 'GWP69tmSWJjqC1RoJ27FehcVqkVyeYAz6h5ABwoNSNdS',
  privateKeyBase58: '4LDU56PUhA9ZEutnR1qCWQnUhtLtpLu2EHSq4h1o7vtF',
  publicKeyBase58:
    'oRfEeWFresvhRtXCkihZbxyoi2JER7gHTJ5psXhHsdCoU1MttRMi3Yp9b9fpjmKh7bMgfWKLESiK2YovRd8KGzJsGuamoAXfqDDVhckxuc9nmsJ84skCSTijKeU4pfAcxeJ',
};

const freezedMockCredential: VerifiableCredential = Object.freeze({
  '@context': [
    'https://www.w3.org/2018/credentials/v1',
    'https://w3c-ccg.github.io/citizenship-vocab/contexts/citizenship-v1.jsonld',
    'https://w3id.org/security/bbs/v1',
    'https://w3id.org/vc/status-list/2021/v1',
  ],
  credentialStatus: [
    {
      id: 'https://trustvc.github.io/did/credentials/statuslist/1#1',
      statusListCredential: 'https://trustvc.github.io/did/credentials/statuslist/1',
      statusListIndex: '1',
      statusPurpose: 'revocation',
      type: 'StatusList2021Entry',
    },
    {
      id: 'https://trustvc.github.io/did/credentials/statuslist/1#1',
      statusListCredential: 'https://trustvc.github.io/did/credentials/statuslist/1',
      statusListIndex: '1',
      statusPurpose: 'suspension',
      type: 'StatusList2021Entry',
    },
  ],
  credentialSubject: {
    name: 'TrustVC',
    birthDate: '2024-04-01T12:19:52Z',
    type: ['PermanentResident', 'Person'],
  },
  expirationDate: '2029-12-03T12:19:52Z',
  issuer: 'did:web:trustvc.github.io:did:1',
  type: ['VerifiableCredential'],
  issuanceDate: '2024-04-01T12:19:52Z',
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
