import {
    GenerateKeyPairOptions,
    VerificationType,
  } from '@tradetrust-tt/w3c-issuer';
import { assert, beforeEach, describe, expect, it, vi } from 'vitest';
import inquirer from 'inquirer';
import fs from 'fs';
import { promptQuestions, saveIssuedDid } from '../../src/commands/did';
import { IssueDidInput } from 'apps/w3c-cli/src/commands/did';

vi.mock("inquirer")
vi.mock('fs');

const mockSeed = "9TuXkSMHnipzCMjgj56hft78LUqdGx8vbPazKDgRWfms";

describe("did", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    })

    describe("promptQuestions", () => {
        it("should return correct answers for valid file path", async () => {
            const input: IssueDidInput = {
                keyPairPath: './keypair.json',
                domainName: 'https://example.com',
                outputPath: ''
            };
            const mockKeypairData = {};
            (inquirer.prompt as any).mockResolvedValue(input);;
            // Mocks the readFileSync function so that it successfully reads a file
            (fs.readFileSync as any).mockReturnValue(JSON.stringify(mockKeypairData));
            
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
                keyPairPath: './keypair.json',
                domainName: 'https://example.com',
                outputPath: ''
            };
            (inquirer.prompt as any).mockResolvedValue(input);;
            
            await expect(promptQuestions()).rejects.toThrowError()
        })

    })


    describe("saveIssuedDid", () => {
        it("should write files successfully", async() => {
            const writeFileMock = vi.spyOn(fs, 'writeFile').mockImplementation((path, data, callback) => {
                callback(null);
            });

            await saveIssuedDid({}, {}, "./");

            expect(writeFileMock).toHaveBeenCalledTimes(2);
        })
    })

})