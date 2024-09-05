import { input, select } from '@inquirer/prompts';
import type { GeneratedKeyPair, GenerateKeyPairOptions } from '@tradetrust-tt/w3c-issuer';
import { generateKeyPair, VerificationType } from '@tradetrust-tt/w3c-issuer';
import chalk from 'chalk';
import fs from 'fs';
import { GenerateInput } from '../types';

export const command = 'generate';
export const describe = 'Generate a new key pair file';

export const handler = async () => {
  const answers = await promptQuestions();
  if (!answers) return;

  await generateAndSaveKeyPair(answers);
};

export const promptQuestions = async (): Promise<GenerateInput> => {
  // const answers = await inquirer.prompt(questions);
  const answers: GenerateInput = {} as GenerateInput;

  answers.encAlgo = await select({
    message: 'Please select an encryption algorithm:',
    choices: [
      {
        name: VerificationType.Bls12381G2Key2020,
        value: VerificationType.Bls12381G2Key2020,
        description: 'Generate KeyPair for BBS+ signature suite',
        // }, {
        //   name: VerificationType.Ed25519VerificationKey2018,
        //   value: VerificationType.Ed25519VerificationKey2018,
        //   description: 'Generate KeyPair for Ed25519 signature suite'
        // }, {
        //   name: VerificationType.EcdsaSecp256k1RecoveryMethod2020,
        //   value: VerificationType.EcdsaSecp256k1RecoveryMethod2020,
        //   description: 'Generate KeyPair for ethereum address'
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
    const keyPair: GeneratedKeyPair = {
      type: keypairData.type,
    };
    if (keypairData.type === VerificationType.Bls12381G2Key2020) {
      keyPair.seedBase58 = keypairData.seedBase58;
      keyPair.privateKeyBase58 = keypairData.privateKeyBase58;
      keyPair.publicKeyBase58 = keypairData.publicKeyBase58;
    }

    fs.writeFileSync(keyFilePath, JSON.stringify(keyPair));
    console.log(chalk.green(`File written successfully to ${keyFilePath}`));

    return keypairData;
  } catch (err) {
    console.error(chalk.red(`Unable to write file to ${keyFilePath}`));
  }
};
