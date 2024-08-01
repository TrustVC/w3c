import {
    GenerateKeyPairOptions,
    VerificationType,
  } from '@tradetrust-tt/w3c-issuer';
import { assert, beforeEach, describe, expect, it, vi } from 'vitest';
import inquirer from 'inquirer';
import fs, { readFileSync } from 'fs';
import { generateAndSaveKeyPair, GenerateInput, promptQuestions } from '../../src/commands/generate';
import chalk from 'chalk';

vi.mock("inquirer")
vi.mock("fs", async () => {
    const originalFs = await vi.importActual<typeof import('fs')>('fs');
    return {
      ...originalFs,
      // This is required, otherwise mocks that use writeFile won't work
        promises: {
            writeFile: vi.fn().mockResolvedValue({}),
        },
    };
  });
vi.mock('chalk', async () => {
    const originalChalk = await vi.importActual<typeof import('chalk')>('chalk');
    return {
      ...originalChalk,
    };
  });

// GLOBAL CONSTANTS
const mockSeed = 'FVj12jBiBUqYFaEUkTuwAD73p9Hx5NzCJBge74nTguQN';
const generateKeypairOption: GenerateKeyPairOptions = {
    type: VerificationType.Bls12381G2Key2020,
};

describe('generate', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe("promptQuestions", () => {
        it('should promptQuestions successfully', async () => {
            const input: GenerateInput = { 
                encAlgo: generateKeypairOption.type, 
                seedBase58: mockSeed, 
                keyPath: './valid-dir'
            };
            // Automatically keys in "user input" that inquirer will receive
            (inquirer.prompt as any).mockResolvedValue(input);
    
            const answers = await promptQuestions();
    
            expect(answers.encAlgo).toBe(generateKeypairOption.type);
            expect(answers.seedBase58).toBe(mockSeed);
            expect(answers.keyPath).toBe('./dir');
        });

        it('should fail promptQuestions when given invalid file path', async () => {
            const input: GenerateInput = { 
                encAlgo: generateKeypairOption.type, 
                seedBase58: mockSeed, 
                keyPath: './/invalid-file-path'
            };
            // Automatically keys in "user input" that inquirer will receive
            (inquirer.prompt as any).mockResolvedValue(input);
            const readDirMock = vi.spyOn(fs, 'readdirSync')
            const consoleErrorSpy = vi.spyOn(console, 'error')
            readDirMock.mockImplementation(() => {
                throw new Error()
            })
            await promptQuestions();
            
            expect(consoleErrorSpy).toHaveBeenCalledWith(chalk.red(`Invalid file path provided: ${input.keyPath}`))
        })

        // NOTE: Currently doesn't work because we automatically resolve the value without being able to trigger inquirer's default values
        // it("should use defaults for optional inputs", async () => {
        //     const input1: GenerateInput = {
        //         encAlgo: generateKeypairOption.type,
        //         seedBase58: undefined,
        //         keyPath: undefined
        //     };

        //     (inquirer.prompt as any).mockResolvedValue({
        //         encAlgo: generateKeypairOption.type,
        //     });

        //     const answers = await promptQuestions();
        //     console.log(answers)
    
        //     expect(answers.encAlgo).toBe(generateKeypairOption.type);
        //     expect(answers.seedBase58).toBe('');
        //     expect(answers.keyPath).toBe('.');
        // })

    })

    describe("generateAndSaveKeyPair", () => {
        it("should successfully save keypair file", async () => {
            const input: GenerateInput = { 
                encAlgo: generateKeypairOption.type, 
                seedBase58: '', 
                keyPath: '.'
            };

            const writeFileMock = vi.spyOn(fs, 'writeFileSync');
    
            await generateAndSaveKeyPair(input)

            expect(writeFileMock).toHaveBeenCalledTimes(1)
        })

        it("should generate same keypair given same seed", async () => {
            // Mock function

            const input: GenerateInput = { 
                encAlgo: generateKeypairOption.type, 
                seedBase58: 'a valid seed', 
                keyPath: '.'
            };
    
            // const writeFileMock = vi.spyOn(fs, 'writeFileSync').mockImplementation(() => {});
            const consoleLogSpy = vi.spyOn(console, 'log')
            await generateAndSaveKeyPair(input)

            expect(consoleLogSpy).toHaveBeenNthCalledWith(1, chalk.blue("Generating keys from provided seed..."));
        })


        it('should fail generateAndSaveKeyPair when unable to save file', async () => {
            const input: GenerateInput = { 
                encAlgo: generateKeypairOption.type, 
                seedBase58: "", 
                keyPath: '///invalid-key-path///' // This value doesn't really matter since we mock writeFil to always thro error below
            };
            // Automatically keys in "user input" that inquirer will receive
            (inquirer.prompt as any).mockResolvedValue(input);
            const consoleLogSpy = vi.spyOn(console, 'error')
            const writeFileMock = vi.spyOn(fs, 'writeFileSync')
            writeFileMock.mockImplementation(() => {
                throw new Error()
            })
            
            await generateAndSaveKeyPair(input);

            expect(consoleLogSpy).toHaveBeenNthCalledWith(1, chalk.red(`Unable to write file to ${input.keyPath}/keypair.json`));
        })
    })

});