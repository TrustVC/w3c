import {
  GeneralCredentialStatus,
  isCredentialStatusStatusList,
} from '@trustvc/w3c-credential-status';
import {
  CredentialStatus,
  CredentialStatusResult,
  SignedVerifiableCredential,
  verifyCredential,
  verifyCredentialStatus,
} from '@trustvc/w3c-vc';
import chalk from 'chalk';
import inquirer from 'inquirer';
import { CredentialQuestionType } from '../types';
import { readJsonFile } from '../utils';

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
  try {
    const answers = await promptForCredential();
    if (!answers) return;

    const { credentialData } = answers;

    // Verify the credential
    await verifyCredentialData(credentialData as SignedVerifiableCredential);
  } catch (err: unknown) {
    console.error(chalk.red(`Error: ${err instanceof Error ? err.message : err}`));
  }
};

// Verify the verifiable credential using the `verifyCredential` method
export const verifyCredentialData = async (
  credentialData: SignedVerifiableCredential,
): Promise<void> => {
  const result = await verifyCredential(credentialData);

  let credentialStatusResult: CredentialStatusResult[] | undefined;
  const credentialStatuses = [].concat(credentialData?.credentialStatus) || [];

  if (
    credentialStatuses &&
    credentialStatuses.every((cs: GeneralCredentialStatus) => isCredentialStatusStatusList(cs))
  ) {
    credentialStatusResult = await Promise.all(
      credentialStatuses.map((cs: CredentialStatus) => verifyCredentialStatus(cs)),
    );
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
    if (credentialStatusResult?.every((r) => 'status' in r)) {
      console.log(
        chalk.green(
          `Credential status verification result: "${credentialStatusResult.map((csr) => `${csr.purpose}:${csr.status}`)}"`,
        ),
      );
    } else if (credentialStatusResult?.some((r) => r?.error)) {
      throw new Error(
        `${credentialStatusResult
          ?.filter((r) => r.error)
          ?.map((r) => r.error)
          ?.join(', ')}`,
      );
    }
  }
};

// Prompt user for the credential file path
export const promptForCredential = async () => {
  const { credentialPath }: CredentialQuestionType = (await inquirer.prompt(
    credentialPrompt,
  )) as CredentialQuestionType;

  const credentialData = readJsonFile(credentialPath, 'credential');
  if (!credentialData) throw new Error('Unable to read credential file');

  return { credentialData };
};
