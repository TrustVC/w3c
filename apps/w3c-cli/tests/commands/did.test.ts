import {
    GenerateKeyPairOptions,
    VerificationType,
  } from '@tradetrust-tt/w3c-issuer';
import { assert, beforeEach, describe, expect, it, vi } from 'vitest';
import inquirer from 'inquirer';
import fs from 'fs';
import { promptQuestions, saveIssuedDid } from '../../src/commands/did';
import { IssueDidInput } from 'apps/w3c-cli/src/commands/did';
import chalk from 'chalk';


vi.mock("inquirer")
vi.mock("fs", async () => {
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

const mockSeed = "9TuXkSMHnipzCMjgj56hft78LUqdGx8vbPazKDgRWfms";

describe("did", () => {
    
    describe("promptQuestions", () => {
        beforeEach(() => {
            vi.clearAllMocks();
            vi.resetAllMocks();
        })
        it("should return correct answers for valid file path", async () => {
            const input: IssueDidInput = {
                keyPairPath: './keypair.json',
                domainName: 'https://example.com',
                outputPath: '.'
            };
            const mockKeypairData = {
                ...input
            };
            (inquirer.prompt as any).mockResolvedValue(input);;
            // Mocks the readFileSync function so that it successfully reads a file
            vi.spyOn(fs, 'readFileSync').mockReturnValue(JSON.stringify(mockKeypairData));
            
            const answers = await promptQuestions();

            expect(answers.domainName).toBe(input.domainName);
            expect(answers.outputPath).toBe(input.outputPath);
    
            const expectedKeypairData = {
                ...mockKeypairData,
                domain: answers.domainName
            }
            expect(answers.keypairData).toStrictEqual(expectedKeypairData);
        })
    
        it("should throw error for invalid file path", async () => {
            const input: IssueDidInput = {
                keyPairPath: './/bad-keypair.json',
                domainName: 'https://example.com',
                outputPath: '.'
            };
            (inquirer.prompt as any).mockResolvedValue(input);

            const consoleLogSpy = vi.spyOn(console, "error")
            vi.spyOn(fs, "readFileSync").mockImplementation(() => {
                throw new Error();
            })
            
            await promptQuestions()

            expect(consoleLogSpy).toHaveBeenNthCalledWith(1, chalk.red(`Invalid file path provided: ${input.keyPairPath}`));
        })

        it("should throw error for invalid outputPath", async () => {
            const input: IssueDidInput = {
                keyPairPath: './keypair.json',
                domainName: 'https://example.com',
                outputPath: './/bad-path'
            };
            
            const consoleLogSpy = vi.spyOn(console, "error");
            
            vi.spyOn(fs, "readFileSync").mockImplementation(() => {
                return "{}"
            })
            vi.spyOn(fs, "readdirSync").mockImplementation(() => {
                throw new Error()
            });
                
            (inquirer.prompt as any).mockResolvedValue(input);
            await promptQuestions();

            expect(consoleLogSpy).toHaveBeenNthCalledWith(1, chalk.red(`Invalid file path provided: ${input.outputPath}`));
        })

    })


    describe("saveIssuedDid", () => {
        it("should write files successfully", async() => {
            const consoleLogSpy = vi.spyOn(console, 'log')
            const writeFileMock = vi.spyOn(fs, 'writeFileSync');


            await saveIssuedDid({}, {}, ".");
            expect(consoleLogSpy).toHaveBeenNthCalledWith(1, chalk.green(`File written successfully to ./wellknown.json`));
            expect(consoleLogSpy).toHaveBeenNthCalledWith(2, chalk.green(`File written successfully to ./keypairs.json`));
            expect(writeFileMock).toHaveBeenCalledTimes(2);
        })
    })

})