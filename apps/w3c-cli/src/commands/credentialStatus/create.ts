import { confirm, input, number, select } from '@inquirer/prompts';
import {
  createCredentialStatusPayload,
  CredentialStatusPurpose,
  StatusList,
} from '@trustvc/w3c-credential-status';
import { signCredential, SignedVerifiableCredential } from '@trustvc/w3c-vc';
import chalk from 'chalk';
import fs from 'fs';
import { CredentialStatusQuestionType } from '../../types';
import { writeFile } from '../../utils';

export const command = 'create';
export const describe = 'Create a new credential status';

export const handler = async () => {
  const answers = await promptQuestions();

  const signedCSVC = await createSignedCredentialStatus(answers);

  if (!signedCSVC) return;

  saveSignedCredentialStatus(signedCSVC, answers.outputPath);
};

export const promptQuestions = async (): Promise<CredentialStatusQuestionType> => {
  const answers: CredentialStatusQuestionType = {
    continue: false,
  };

  answers.type = await select({
    message: 'Please select an credential status:',
    choices: [
      {
        name: 'StatusList2021Entry',
        value: 'StatusList2021Entry',
        description: 'Bitstring StatusList 2021 credential status',
      },
    ],
  });

  answers.keyPairPath = await input({
    message: 'Please enter the path to your key pair JSON file:',
    default: './didKeyPairs.json',
    required: true,
  });

  // Validate and read the key pair file
  // let data: string;
  try {
    answers.keypairData = JSON.parse(
      fs.readFileSync(answers.keyPairPath, { encoding: 'utf8', flag: 'r' }),
    );
  } catch (err) {
    console.error(chalk.red(`Invalid file path provided: ${answers.keyPairPath}`));
    return;
  }

  // hosting url for credential status
  answers.hostingUrl = await input({
    message: `Please enter the URL where you'd like to host your credential status. (e.g., https://example.com/credentials/statuslist/1):`,
    required: true,
  });

  answers.outputPath = await input({
    message: 'Please specify a directory path to save the credential status file (optional):',
    default: '.',
    required: true,
  });

  try {
    fs.readdirSync(answers.outputPath, { encoding: 'utf-8' });
  } catch (err) {
    console.error(chalk.red(`Invalid file path provided: ${answers.outputPath}`));
    return;
  }

  answers.length = await number({
    message: 'Please enter the length of the status list (default 16KB - 131,072):',
    default: 131072,
    required: true,
  });

  if (answers.type === 'StatusList2021Entry') {
    answers.credentialStatus = new StatusList({ length: answers.length });

    answers.purpose = await select<CredentialStatusPurpose>({
      message: 'Please select a purpose for the status list:',
      choices: [
        {
          name: 'Revocation',
          value: 'revocation' as CredentialStatusPurpose,
        },
        {
          name: 'Suspension',
          value: 'suspension' as CredentialStatusPurpose,
        },
      ],
    });

    answers.continue = await confirm({
      message: 'Do you want to update the status list?',
      default: false,
    });

    while (answers.continue) {
      answers.index = await number({
        message: 'Please enter the index of the status list:',
        min: 0,
        max: answers.length - 1,
        required: true,
      });

      const currentIndexStatus: boolean = (answers.credentialStatus as StatusList).getStatus(
        answers.index,
      );

      answers.status = await select<boolean>({
        message: `Please select a status for index ${answers.index} in the ${answers.purpose} status list (current status: ${currentIndexStatus}):`,
        choices: [
          {
            name: 'True',
            value: true,
          },
          {
            name: 'False',
            value: false,
          },
        ],
      });

      (answers.credentialStatus as StatusList).setStatus(answers.index, answers.status);

      answers.continue = await confirm({
        message: 'Do you want to continue to add status to the list?',
        default: false,
      });
    }
  }

  return answers;
};

export const createSignedCredentialStatus = async (answers: CredentialStatusQuestionType) => {
  try {
    if (answers.type === 'StatusList2021Entry') {
      const encodedList = await (answers.credentialStatus as StatusList).encode();

      const credentialStatusPayload = await createCredentialStatusPayload(
        {
          id: answers.hostingUrl,
          credentialSubject: {
            id: `${answers.hostingUrl}#list`,
            type: 'StatusList2021',
            statusPurpose: answers.purpose,
            encodedList,
          },
        },
        answers.keypairData,
        'StatusList2021Credential',
      );

      const { signed, error } = await signCredential(credentialStatusPayload, answers.keypairData);

      if (error) {
        throw new Error(error);
      }

      return signed;
    }

    throw new Error('Invalid credential status type.');
  } catch (err: unknown) {
    if (!(err instanceof Error)) {
      console.error(chalk.red('An error occurred while signing the credential status.'));
      return;
    }
    console.error(chalk.red(`Error signing credential status: ${err.message}`));
  }
};

export const saveSignedCredentialStatus = async (
  signedCSVC: SignedVerifiableCredential,
  outputPath: string,
) => {
  const filePath = `${outputPath}/credentialStatus.json`;
  writeFile(filePath, signedCSVC);
};
