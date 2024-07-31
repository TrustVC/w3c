import {
    GenerateKeyPairOptions,
    VerificationType,
  } from '@tradetrust-tt/w3c-issuer';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import inquirer from 'inquirer';
import fs from 'fs';
import { generateAndSaveKeyPair, GenerateInput, promptQuestions } from './generate';

vi.mock("inquirer")
vi.mock('fs');

// GLOBAL CONSTANTS
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