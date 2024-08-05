import fs from 'fs';
import inquirer from 'inquirer';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { IssueDidInput, promptQuestions, saveIssuedDid } from '../../src/commands/did';

vi.mock('inquirer');
vi.mock('fs');

const input: IssueDidInput = {
  keyPairPath: './keypair.json',
  domainName: 'https://example.com',
  outputPath: '',
};

describe('did', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('promptQuestions', () => {
    it('should return correct answers for valid file path', async () => {
      const mockKeypairData = {};
      vi.spyOn(inquirer, 'prompt').mockResolvedValue(input);
      // Mocks the readFileSync function so that it successfully reads a file
      vi.spyOn(fs, 'readFileSync').mockReturnValue(JSON.stringify(mockKeypairData));

      const answers = await promptQuestions();

      expect(answers.domainName).toBe(input.domainName);
      expect(answers.outputPath).toBe(input.outputPath);

      const expectedKeypairData = {
        ...mockKeypairData,
        domain: answers.domainName,
      };
      expect(answers.keypairData).toStrictEqual(expectedKeypairData);
    });

    it('should throw error for invalid file path', async () => {
      vi.spyOn(inquirer, 'prompt').mockResolvedValue(input);
      vi.spyOn(fs, 'readFileSync').mockImplementation(() => {
        throw new Error('');
      });

      await expect(promptQuestions()).rejects.toThrowError('');
    });
  });

  describe('saveIssuedDid', () => {
    it('should write files successfully', async () => {
      const writeFileMock = vi.spyOn(fs, 'writeFile').mockImplementation((path, data, callback) => {
        callback(null);
      });

      await saveIssuedDid({}, {}, './');

      expect(writeFileMock).toHaveBeenCalledTimes(2);
    });
  });
});
