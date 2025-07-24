import { input, select } from '@inquirer/prompts';
import type { GeneratedKeyPair, GenerateKeyPairOptions } from '@trustvc/w3c-issuer';
import { generateKeyPair, VerificationType } from '@trustvc/w3c-issuer';
import chalk from 'chalk';
import { GenerateInput } from '../types';
import { isDirectoryValid, writeFile } from '../utils';

export const command = 'key-pair';
export const describe = 'Generate a new key pair file';

export const handler = async () => {
  try {
    const answers = await promptQuestions();
    if (!answers) return;

    await generateAndSaveKeyPair(answers);
  } catch (err: unknown) {
    console.error(chalk.red(`Error: ${err instanceof Error ? err.message : err}`));
  }
};

export const promptQuestions = async (): Promise<GenerateInput> => {
  const answers: GenerateInput = {} as GenerateInput;

  answers.encAlgo = await select({
    message: 'Please select an encryption algorithm:',
    choices: [
      {
        name: VerificationType.Bls12381G2Key2020,
        value: VerificationType.Bls12381G2Key2020,
        description: 'Generate KeyPair for BBS+ signature suite',
      },
    ],
  });

  answers.seedBase58 = await input({
    message: 'Please enter a seed in base58 format (optional):',
    default: '',
  });

  answers.keyPath = await input({
    message: 'Please specify a directory to save your key file (optional):',
    default: '.',
    required: true,
  });

  if (!isDirectoryValid(answers.keyPath)) {
    throw new Error(`Invalid file path provided: ${answers.keyPath}`);
  }

  return answers;
};

export const generateAndSaveKeyPair = async ({ encAlgo, seedBase58, keyPath }: GenerateInput) => {
  if (seedBase58) {
    console.log(chalk.blue('Generating keys from provided seed...'));
  }

  const keyFilePath = `${keyPath}/keypair.json`;

  const keypairOptions: GenerateKeyPairOptions = {
    type: encAlgo,
    seedBase58,
  };

  let keypairData: GeneratedKeyPair;
  try {
    keypairData = await generateKeyPair(keypairOptions);
  } catch (err) {
    if (err instanceof Error) {
      if (err.message == 'Non-base58btc character') {
        throw new Error('Invalid seed provided. Please provide a valid seed in base58 format.');
      }
    }
    throw new Error('Error generating keypair');
  }

  const keyPair: GeneratedKeyPair = {
    type: keypairData.type,
  };
  if (keypairData.type === VerificationType.Bls12381G2Key2020) {
    keyPair.seedBase58 = keypairData.seedBase58;
    keyPair.privateKeyBase58 = keypairData.privateKeyBase58;
    keyPair.publicKeyBase58 = keypairData.publicKeyBase58;
  }

  writeFile(keyFilePath, keyPair);
  console.log(chalk.green(`File written successfully to ${keyFilePath}`));

  return keypairData;
};
