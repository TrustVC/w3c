import {
  SignedVerifiableCredential,
  verifyCredential,
  verifyCredentialStatus,
} from '@tradetrust-tt/w3c-vc';
import chalk from 'chalk';
import fs from 'fs';
import inquirer from 'inquirer';
import { CredentialQuestionType } from '../types';

export const command = 'verify';
export const describe = 'Verify a verifiable credential.';

// Prompt question for the verifiable credential file path
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const credentialPrompt: any = {
  name: 'credentialPath',
  type: 'input',
  message: 'Please enter the path to your verifiable credential JSON file:',
  default: './signed_vc.json',
  required: true,
};

export const handler = async () => {
  const answers = await promptForCredential();
  if (!answers) return;

  const { credentialData } = answers;

  // Verify the credential
  await verifyCredentialData(credentialData as SignedVerifiableCredential);
};

// Verify the verifiable credential using the `verifyCredential` method
export const verifyCredentialData = async (
  credentialData: SignedVerifiableCredential,
): Promise<void> => {
  const result = await verifyCredential(credentialData);

  let credentialStatusResult;
  if (credentialData?.credentialStatus) {
    credentialStatusResult = await verifyCredentialStatus(credentialData.credentialStatus);
  }

  if (result.verified) {
    console.log(chalk.green(`Verification result: ${result.verified}`));
  } else {
    console.error(chalk.red(`Verification result: ${result.verified}`));
    if (result.error) {
      console.error(chalk.red(`Error: ${result.error}`));
    }
  }

  if (credentialStatusResult) {
    if ('status' in credentialStatusResult) {
      console.log(
        chalk.green(
          `Credential status verification result: "${credentialStatusResult.purpose}:${credentialStatusResult.status}"`,
        ),
      );
    } else if (credentialStatusResult.error) {
      console.error(chalk.red(`Error: ${credentialStatusResult.error}`));
    }
  }
};

// Prompt user for the credential file path
export const promptForCredential = async () => {
  const { credentialPath }: CredentialQuestionType = await inquirer.prompt(credentialPrompt);

  const credentialData = readJsonFile(credentialPath, 'credential');
  if (!credentialData) return null;

  return { credentialData };
};

// Read and parse JSON file
const readJsonFile = <T>(filePath: string, fileType: string): T | null => {
  try {
    const data = fs.readFileSync(filePath, { encoding: 'utf8' });
    return JSON.parse(data) as T;
  } catch (err) {
    console.error(chalk.red(`Invalid ${fileType} file path: ${filePath}`));
    return null;
  }
};
