import type {
  DidWebGeneratedKeyPair,
  DidWebGenerateKeyPairOptions,
  GeneratedKeyPair,
} from '@tradetrust-tt/w3c-issuer';
import { generateKeyPair } from '@tradetrust-tt/w3c-issuer';
import chalk from 'chalk';
import fs from 'fs';
import inquirer from 'inquirer';
import { encAlgos, GenerateInput } from '../types';

export const command = 'generate';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const questions: any = [
  {
    name: 'encAlgo',
    type: 'list',
    choices: encAlgos,
    message: 'Please select an encryption algorithm:',
  },
  {
    name: 'seedBase58',
    type: 'input',
    message: 'Please enter a seed in base58 format (optional):',
    default: '',
  },
  {
    name: 'keyPath',
    type: 'input',
    message: 'Please specify a directory to save your key file (optional):',
    default: '.',
    required: true,
  },
];

export const describe = 'Generate a new key pair file';
export const handler = async () => {
  const answers = await promptQuestions();
  if (!answers) return;

  const { encAlgo, seedBase58, keyPath } = answers;

  await generateAndSaveKeyPair({ encAlgo, seedBase58, keyPath });
};

export const promptQuestions = async () => {
  const answers = await inquirer.prompt(questions);

  try {
    fs.readdirSync(answers.keyPath, { encoding: 'utf-8' });
  } catch (err) {
    console.error(chalk.red(`Invalid file path provided: ${answers.keyPath}`));
    return;
  }
  return answers;
};

export const generateAndSaveKeyPair = async ({ encAlgo, seedBase58, keyPath }: GenerateInput) => {
  if (seedBase58) {
    console.log(chalk.blue('Generating keys from provided seed...'));
  }

  const keyFilePath = `${keyPath}/keypair.json`;

  const keypairOptions: DidWebGenerateKeyPairOptions = {
    type: encAlgo,
    seedBase58,
  };

  let keypairData: GeneratedKeyPair;
  try {
    keypairData = await generateKeyPair(keypairOptions);
  } catch (err) {
    if (err instanceof Error) {
      if (err.message == 'Non-base58btc character') {
        console.error(
          chalk.red('Invalid seed provided. Please provide a valid seed in base58 format.'),
        );
        return;
      }
    }
    console.error(chalk.red('Error generating keypair'));
    return;
  }

  try {
    const keyPair: DidWebGeneratedKeyPair = {
      type: keypairData.type,
      seedBase58: keypairData.seedBase58,
      privateKeyBase58: keypairData.privateKeyBase58,
      publicKeyBase58: keypairData.publicKeyBase58,
    };

    fs.writeFileSync(keyFilePath, JSON.stringify(keyPair));
    console.log(chalk.green(`File written successfully to ${keyFilePath}`));
  } catch (err) {
    console.error(chalk.red(`Unable to write file to ${keyFilePath}`));
  }
};
