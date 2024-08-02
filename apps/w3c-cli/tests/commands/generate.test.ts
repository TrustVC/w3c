import {
    GenerateKeyPairOptions,
    VerificationType,
  } from '@tradetrust-tt/w3c-issuer';
import { assert, beforeEach, describe, expect, it, vi } from 'vitest';
import inquirer from 'inquirer';
import fs, { readFileSync } from 'fs';
import { generateAndSaveKeyPair, GenerateInput, promptQuestions } from '../../src/commands/generate';
import chalk from 'chalk';
import { generateKeyPair } from 'crypto';

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
        vi.resetAllMocks();
    });
    
    describe("promptQuestions", () => {
        beforeEach(() => {
            vi.clearAllMocks();
            vi.resetAllMocks();
        });
        it('should promptQuestions successfully', async () => {
            const input: GenerateInput = { 
                encAlgo: generateKeypairOption.type, 
                seedBase58: mockSeed, 
                keyPath: './valid-dir'
            };
            // Automatically keys in "user input" that inquirer will receive
            (inquirer.prompt as any).mockResolvedValue(input);
            vi.spyOn(fs, "readdirSync").mockImplementation(() => {
                return []
            })
    
            const answers = await promptQuestions();
    
            expect(answers.encAlgo).toBe(generateKeypairOption.type);
            expect(answers.seedBase58).toBe(mockSeed);
            expect(answers.keyPath).toBe('./valid-dir');
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
        it("should use defaults for optional inputs", async () => {
            const input1: GenerateInput = {
                encAlgo: generateKeypairOption.type,
                seedBase58: undefined,
                keyPath: undefined
            };

            (inquirer.prompt as any).mockResolvedValue({
                encAlgo: generateKeypairOption.type,
            });

            const answers = await promptQuestions();
            console.log(answers)
    
            expect(answers.encAlgo).toBe(generateKeypairOption.type);
            expect(answers.seedBase58).toBeFalsy();
            expect(answers.keyPath).toBeFalsy();
        })

    })

    describe("generateAndSaveKeyPair", () => {
        beforeEach(() => {
            vi.clearAllMocks();
            vi.resetAllMocks();
        });
        it("should successfully generate and save keypair file", async () => {
            const input: GenerateInput = { 
                encAlgo: generateKeypairOption.type, 
                seedBase58: '', 
                keyPath: '.'
            };

            const consoleLogSpy = vi.spyOn(console, 'log');
            const writeFileMock = vi.spyOn(fs, 'writeFileSync');

            await generateAndSaveKeyPair(input)

            const expectedKeyPath = `${input.keyPath}/keypair.json`;
            expect(consoleLogSpy).toHaveBeenNthCalledWith(1, chalk.green(`File written successfully to ${expectedKeyPath}`));
            expect(writeFileMock).toHaveBeenCalledTimes(1)
        })

        it("should use seed to generate and save same keypair file", async () => {
            // Mock function

            const input: GenerateInput = { 
                encAlgo: generateKeypairOption.type, 
                seedBase58: mockSeed, 
                keyPath: '.'
            };
    
            const consoleLogSpy = vi.spyOn(console, 'log')
            const writeFileMock = vi.spyOn(fs, 'writeFileSync');

            await generateAndSaveKeyPair(input)

            expect(consoleLogSpy).toHaveBeenNthCalledWith(1, chalk.blue("Generating keys from provided seed..."));
            // TODO: Check if write file mock has been called with given parameters
            expect(writeFileMock).toHaveBeenCalledTimes(1);
        })

        it("should throw error given invalid seed", async () => {
            // Mock function

            const input: GenerateInput = { 
                encAlgo: generateKeypairOption.type, 
                seedBase58: 'a invalid seed', 
                keyPath: '.'
            };
    
            const consoleLogSpy = vi.spyOn(console, 'error')

            await generateAndSaveKeyPair(input)

            expect(consoleLogSpy).toHaveBeenNthCalledWith(1, chalk.red("Invalid seed provided. Please provide a valid seed in base58 format."));
        })

        // TODO: Unable to currently mock generateKeyPair function to throw a generic error.
        // it("should throw generic error if generateKeyPair fails", async () => {
        //     // Mock function

        //     const input: GenerateInput = { 
        //         encAlgo: generateKeypairOption.type, 
        //         seedBase58: '', 
        //         keyPath: '.'
        //     };
    
        //     const consoleLogSpy = vi.spyOn(console, 'error');
        //     // vi.doMock('@tradetrust-tt/w3c-issuer', async (importOriginal) => {
        //     //     const actual: typeof import("@tradetrust-tt/w3c-issuer") = await importOriginal()
        //     //     return {
        //     //         ...actual,
        //     //         generateKeyPair: vi.fn(() => {
        //     //             throw new Error
        //     //         })
        //     //     }
        //     // });
        //     (generateKeyPair as any).mockImplementation(() => {
        //         throw new Error()
        //     })
        //     await generateAndSaveKeyPair(input)

        //     expect(consoleLogSpy).toHaveBeenNthCalledWith(1, chalk.red("Error generating keypair"));
        // })


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