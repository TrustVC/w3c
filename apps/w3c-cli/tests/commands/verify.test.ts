import { isCredentialStatusStatusList } from '@trustvc/w3c-credential-status';
import * as w3cVc from '@trustvc/w3c-vc';
import { getDocumentLoader, verifyCredential, verifyCredentialStatus } from '@trustvc/w3c-vc';
import chalk from 'chalk';
import inquirer from 'inquirer';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import * as verifyModule from '../../src/commands/verify';
import * as utils from '../../src/utils';
import { mockSignedCredential } from '../fixtures/mockCredential';
import { mockWellKnown } from '../fixtures/mockDidWeb';

// Mock dependencies
vi.mock('inquirer');
vi.mock('@trustvc/w3c-vc', async () => {
  const original = await vi.importActual<typeof import('@trustvc/w3c-vc')>('@trustvc/w3c-vc');
  return {
    ...original,
    getDocumentLoader: vi.fn(),
    verifyCredential: original.verifyCredential,
    verifyCredentialStatus: vi.fn(),
  };
});
vi.mock('@trustvc/w3c-credential-status', async () => {
  const original = await vi.importActual<typeof import('@trustvc/w3c-credential-status')>(
    '@trustvc/w3c-credential-status',
  );
  return {
    ...original,
    isCredentialStatusStatusList: vi.fn(),
  };
});
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
vi.mock('../../src/utils', () => ({
  readJsonFile: vi.fn(),
}));

describe('verify', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetAllMocks();
  });

  describe('promptForCredential', () => {
    beforeEach(() => {
      vi.clearAllMocks();
      vi.resetAllMocks();
    });

    it('should return correct answers for valid credential input', async () => {
      const input = {
        credentialPath: './signed_vc.json',
      };

      (inquirer.prompt as any).mockResolvedValueOnce({ credentialPath: input.credentialPath });
      vi.spyOn(utils, 'readJsonFile').mockReturnValueOnce(mockSignedCredential);

      const answers = await verifyModule.promptForCredential();

      expect(answers.credentialData).toStrictEqual(mockSignedCredential);
      expect(utils.readJsonFile).toHaveBeenCalledWith(input.credentialPath, 'credential');
    });

    it('should throw error for invalid credential file', async () => {
      const input = {
        credentialPath: './invalid-credential.json',
      };

      (inquirer.prompt as any).mockResolvedValueOnce({ credentialPath: input.credentialPath });
      vi.spyOn(utils, 'readJsonFile').mockReturnValueOnce(null);

      await expect(verifyModule.promptForCredential()).rejects.toThrowError(
        'Unable to read credential file',
      );
    });
  });

  describe('verifyCredentialData', () => {
    beforeEach(() => {
      vi.clearAllMocks();
      vi.resetAllMocks();
    });

    it('should log successful verification when credential is valid', async () => {
      const consoleLogSpy = vi.spyOn(console, 'log');
      const verifyResult = { verified: true };
      const verifyCredentialStatusResult = { purpose: 'revocation', status: 'active' };

      const verifyCredentialSpy = vi.spyOn(w3cVc, 'verifyCredential');
      (getDocumentLoader as any).mockImplementationOnce(() => {
        return getDocumentLoader({
          'did:web:trustvc.github.io:did:1': mockWellKnown,
        });
      });
      (isCredentialStatusStatusList as any).mockReturnValue(true);
      (verifyCredentialStatus as any).mockResolvedValueOnce(verifyCredentialStatusResult);

      await verifyModule.verifyCredentialData(mockSignedCredential);

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

    it('should log error when credential verification fails', async () => {
      const consoleErrorSpy = vi.spyOn(console, 'error');
      const verifyResult = { verified: false, error: 'Invalid signature' };

      (verifyCredential as any).mockResolvedValueOnce(verifyResult);
      (isCredentialStatusStatusList as any).mockReturnValue(false);

      await verifyModule.verifyCredentialData(mockSignedCredential);

      expect(verifyCredential).toHaveBeenCalledWith(mockSignedCredential);
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        chalk.red(`Verification result: ${verifyResult.verified}`),
      );
      expect(consoleErrorSpy).toHaveBeenCalledWith(chalk.red(`Error: ${verifyResult.error}`));
    });

    it('should throw error when credential status verification fails', async () => {
      const verifyResult = { verified: true };
      const statusError = 'Status list verification failed';

      (verifyCredential as any).mockResolvedValueOnce(verifyResult);
      (isCredentialStatusStatusList as any).mockReturnValue(true);
      (verifyCredentialStatus as any).mockResolvedValueOnce({
        error: statusError,
      });

      await expect(verifyModule.verifyCredentialData(mockSignedCredential)).rejects.toThrowError(
        statusError,
      );
    });
  });
});
