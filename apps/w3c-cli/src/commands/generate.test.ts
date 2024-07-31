import {
  GenerateKeyPairOptions,
  VerificationType,
  generateKeyPair,
} from '@tradetrust-tt/w3c-issuer';
import { execSync, spawn } from 'child_process';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import stripAnsi from 'strip-ansi';
import { generateAndSaveKeyPair, GenerateInput, promptQuestions } from './generate';
import inquirer from 'inquirer';
import fs from 'fs';



vi.mock("inquirer")
vi.mock('fs');

vi.mock('@tradetrust-tt/w3c-issuer', () => ({
  generateKeyPair: vi.fn().mockResolvedValue({
    publicKey: 'mockPublicKey',
    privateKey: 'mockPrivateKey',
  }),
  VerificationType: {
    Bls12381G2Key2020: 'Bls12381G2Key2020',
    // Add other verification types if necessary
  }
}));

const mockSeed = 'FVj12jBiBUqYFaEUkTuwAD73p9Hx5NzCJBge74nTguQN';
const generateKeypairOption: GenerateKeyPairOptions = {
  type: VerificationType.Bls12381G2Key2020,
};

describe('generate', () => {

  beforeEach(() => {
    vi.clearAllMocks();
  });
  
  it('should prompt questions and obtain answers', async () => {
    

    const input: GenerateInput = { 
      encAlgo: generateKeypairOption.type, 
      seedBase58: mockSeed, 
      keyPath: '.'
    };
    // Automatically keys in "user input" that inquirer will receive
    (inquirer.prompt as any).mockResolvedValue(input);

    const answers = await promptQuestions();

    expect(answers.encAlgo).toBe(generateKeypairOption.type);
    expect(answers.seedBase58).toBe(mockSeed);
    expect(answers.keyPath).toBe('.');
  });

  it("should save keypair file", async () => {
    const input: GenerateInput = { 
      encAlgo: generateKeypairOption.type, 
      seedBase58: mockSeed, 
      keyPath: '.'
    };
    const writeFileMock = vi.spyOn(fs, 'writeFile').mockImplementation((path, data, callback) => {
      callback(null);
    });
    await generateAndSaveKeyPair(input)

    expect(writeFileMock).toHaveBeenCalled()
  })
});

