import { generateKeyPair, VerificationType } from '@tradetrust-tt/w3c-issuer';
import type { GenerateKeyPairOptions } from '@tradetrust-tt/w3c-issuer';
import chalk from 'chalk';
import fs from 'fs';
import inquirer from 'inquirer';

export type GenerateInput = {
  encAlgo: VerificationType;
  seedBase58: string;
  keyPath: string;
};

export const command = 'generate';

const encAlgos: VerificationType[] = [
  VerificationType.Bls12381G2Key2020,
  VerificationType.Ed25519VerificationKey2018,
];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const questions: any = [
  {
    name: 'encAlgo',
    type: 'list',
    choices: encAlgos,
    message: 'Select an encryption algorithm',
  },
  {
    name: 'seedBase58',
    type: 'input',
    message: 'Enter a seed in base58 format (optional)',
    default: '',
  },
  {
    name: 'keyPath',
    type: 'input',
    message: 'Enter a path to save the key files (default: .)',
    default: '.',
  },
];

export const describe = 'Generate a new key pair file';
// export const builder = (yargs: Argv) => { };
export const handler = async () => {
  const answers = await inquirer.prompt(questions);

  const { encAlgo, seedBase58, keyPath } = answers;

  await generateAndSaveKeyPair({ encAlgo, seedBase58, keyPath });
};

export const promptQuestions = async () => {
  const answers = await inquirer.prompt(questions);
  return answers;
};

export const generateAndSaveKeyPair = async ({ encAlgo, seedBase58, keyPath }: GenerateInput) => {
  if (seedBase58) {
    console.log(chalk.green('Generating keys from provided seed...'));
  }

  const keyFilePath = `${keyPath}/keypair.json`;

  const keypairOptions: GenerateKeyPairOptions = {
    type: encAlgo,
    seedBase58,
  };
  const keypairData = await generateKeyPair(keypairOptions);

  fs.writeFile(keyFilePath, JSON.stringify(keypairData), (err) => {
    if (err) {
      console.error(chalk.red('Error writing file', err));
      throw err;
    } else {
      console.log(chalk.green(`File written successfully to ${keyFilePath}`));
    }
  });
};
