import { ContextDocument, SignedVerifiableCredential, deriveCredential } from '@trustvc/w3c-vc';
import chalk from 'chalk';
import fs from 'fs';
import inquirer from 'inquirer';
import { CredentialQuestionType, QuestionType, RevealQuestionType } from '../types';
import { isDirectoryValid, readJsonFile } from '../utils';

export const command = 'derive';
export const describe =
  'Derive a verifiable credential using a reveal document and save the derived credential.';

// Prompt questions for reveal document, verifiable credential, and output directory paths
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const revealPrompt: any = {
  name: 'revealPath',
  type: 'input',
  message: 'Please enter the path to your reveal JSON document:',
  default: './reveal.json',
  required: true,
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const credentialPrompt: any = {
  name: 'credentialPath',
  type: 'input',
  message: 'Please enter the path to your signed verifiable credential:',
  default: './signed_vc.json',
  required: true,
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const outputPathPrompt: any = {
  name: 'outputPath',
  type: 'input',
  message: 'Please specify a directory path to save your derived verifiable credential:',
  default: '.',
  required: true,
};

export const handler = async () => {
  const answers = await promptForInputs();
  if (!answers) return;

  const { revealData, credentialData, outputPath } = answers;

  // Derive the credential
  const derived = await derivedCredential(
    credentialData as SignedVerifiableCredential,
    revealData as ContextDocument,
  );
  if (!derived) return;

  // Save the derived credential
  await saveDerivedCredential(derived, outputPath);
};

// Derived the credential with the provided parameters
export const derivedCredential = async (
  credentialData: SignedVerifiableCredential,
  revealData: ContextDocument,
): Promise<SignedVerifiableCredential> => {
  const result = await deriveCredential(credentialData, revealData);

  if (result?.derived) {
    return result.derived;
  } else {
    console.error(chalk.red(`Error: ${result.error}`));
    return null;
  }
};

// Save the derived credential to the specified output path
export const saveDerivedCredential = async (
  derivedCredential: SignedVerifiableCredential,
  outputPath: string,
) => {
  const filePath = `${outputPath}/derived_vc.json`;
  try {
    fs.writeFileSync(filePath, JSON.stringify(derivedCredential));
    console.log(chalk.green(`Derived credential saved successfully to ${filePath}`));
  } catch (err) {
    console.error(chalk.red(`Unable to save derived credential to ${filePath}`));
  }
};

// Prompt user for reveal document, credential, and output path
export const promptForInputs = async () => {
  const { credentialPath }: CredentialQuestionType = (await inquirer.prompt(
    credentialPrompt,
  )) as CredentialQuestionType;

  const credentialData = readJsonFile(credentialPath, 'credential');
  if (!credentialData) return null;

  const { revealPath }: RevealQuestionType = (await inquirer.prompt(
    revealPrompt,
  )) as RevealQuestionType;

  const revealData = readJsonFile(revealPath, 'reveal');
  if (!revealData) return null;

  const { outputPath }: QuestionType = (await inquirer.prompt(outputPathPrompt)) as QuestionType;

  if (!isDirectoryValid(outputPath)) return null;

  return { revealData, credentialData, outputPath };
};
