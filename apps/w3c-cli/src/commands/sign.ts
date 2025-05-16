import { PrivateKeyPair } from '@trustvc/w3c-issuer';
import { signCredential, VerifiableCredential } from '@trustvc/w3c-vc';
import chalk from 'chalk';
import inquirer from 'inquirer';
import { CredentialQuestionType, KeyPairQuestionType, QuestionType } from '../types';
import { isDirectoryValid, readJsonFile, writeFile } from '../utils';

export const command = 'sign';
export const describe =
  'Sign a verifiable credential using a key pair and save the signed credential.';

// Prompt questions for key pair file, credential file, and output directory paths
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const keyPairPrompt: any = {
  name: 'keyPairPath',
  type: 'input',
  message: 'Please enter the path to your key pair JSON file:',
  default: './didKeyPairs.json',
  required: true,
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const credentialPrompt: any = {
  name: 'credentialPath',
  type: 'input',
  message: 'Please enter the path to your credential JSON file:',
  default: './vc.json',
  required: true,
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const outputPathPrompt: any = {
  name: 'outputPath',
  type: 'input',
  message: 'Please specify a directory path to save your signed verifiable credential:',
  default: '.',
  required: true,
};

export const handler = async () => {
  try {
    const answers = await promptForInputs();
    if (!answers) return;

    const { keypairData, credentialData, outputPath } = answers;

    // Sign the credential
    const signedCredential = await signCredentialWithKeyPair(
      credentialData,
      keypairData as PrivateKeyPair,
    );
    if (!signedCredential) return;

    // Save the signed credential
    await saveSignedCredential(signedCredential, outputPath);
  } catch (err: unknown) {
    console.error(chalk.red(`Error: ${err instanceof Error ? err.message : err}`));
  }
};

// Sign the credential with the provided key pair
export const signCredentialWithKeyPair = async (
  credentialData: VerifiableCredential,
  keypairData: PrivateKeyPair,
): Promise<VerifiableCredential> => {
  const result = await signCredential(credentialData, keypairData);

  if (result?.signed) {
    return result.signed;
  } else {
    throw new Error(result?.error);
  }
};

// Save the signed credential to the specified output path
export const saveSignedCredential = async (
  signedCredential: VerifiableCredential,
  outputPath: string,
) => {
  const filePath = `${outputPath}/signed_vc.json`;
  try {
    writeFile(filePath, signedCredential);
    console.log(chalk.green(`Signed credential saved successfully to ${filePath}`));
  } catch (err) {
    throw new Error(`Unable to save signed credential to ${filePath}`);
  }
};

// Prompt user for key pair, credential, and output path
export const promptForInputs = async () => {
  const { keyPairPath }: KeyPairQuestionType = (await inquirer.prompt(
    keyPairPrompt,
  )) as KeyPairQuestionType;

  const keypairData = readJsonFile(keyPairPath, 'key pair');
  if (!keypairData) throw new Error('Unable to read key pair file');

  const { credentialPath }: CredentialQuestionType = (await inquirer.prompt(
    credentialPrompt,
  )) as CredentialQuestionType;

  const credentialData = readJsonFile(credentialPath, 'credential');
  if (!credentialData) throw new Error('Unable to read credential file');

  const { outputPath }: QuestionType = (await inquirer.prompt(outputPathPrompt)) as QuestionType;

  if (!isDirectoryValid(outputPath)) throw new Error('Output path is not valid');

  return { keypairData, credentialData, outputPath };
};
