import {
  GenerateKeyPairOptions,
  VerificationType,
  generateKeyPair,
} from '@tradetrust-tt/w3c-issuer';
import { execSync, spawn } from 'child_process';
import { describe, expect, it, vi } from 'vitest';
import stripAnsi from 'strip-ansi';

vi.mock('fs', () => ({
  writeFile: vi.fn((path, data, callback) => callback(null)),
}));

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

describe('generate', () => {
  it('should generate a key pair and save it to a file', async () => {
    const consoleLogSpy = vi.spyOn(console, 'log');
    const consoleErrorSpy = vi.spyOn(console, 'error');

    const mockSeed = 'FVj12jBiBUqYFaEUkTuwAD73p9Hx5NzCJBge74nTguQN';
    const generateKeypairOption: GenerateKeyPairOptions = {
      type: VerificationType.Bls12381G2Key2020,
    };

    await runCliCommand('nx dev w3c-cli', ['generate'], [generateKeypairOption.type, mockSeed, '']);
    // execSync(`nx dev w3c-cli generate`);
    // execSync(`nx dev w3c-cli generate`);

    // expect(true).toBe(true)
    // expect(consoleLogSpy).toHaveBeenCalledWith('Public Key: mockPublicKey');
  });
});

function runCliCommand(command: string, args: string[], inputs: string[]): Promise<string> {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { shell: true });
    let output = '';
    let errorOutput = '';
    let inputIndex = 0;

    child.stdout.on('data', (data) => {
      const strData = data.toString();
      output += strData;
      console.log("POoP", strData); // Optional: log output for debugging
      
      if (inputIndex < inputs.length) {
        child.stdin.write(inputs[inputIndex] + '\n');
        inputIndex++;
      }
    });

    child.stderr.on('data', (data) => {
      errorOutput += data.toString();
    });

    child.on('close', (code) => {
      if (code !== 0) {
        reject(new Error(`Command failed with code ${code}: ${errorOutput}`));
      } else {
        console.log("op", output);
        resolve(stripAnsi(output));
      }
    });
  });
}