import { confirm, input, number, select } from '@inquirer/prompts';
import {
  createCredentialStatusPayload,
  CredentialStatusPurpose,
  fetchCredentialStatusVC,
  SignedCredentialStatusVC,
  StatusList,
} from '@trustvc/w3c-credential-status';
import { signCredential } from '@trustvc/w3c-vc';
import chalk from 'chalk';
import { CredentialStatusQuestionType } from '../../types';
import { isDirectoryValid, readJsonFile } from '../../utils';
import { saveSignedCredentialStatus } from './create';

export const command = 'update';
export const describe = 'Update a credential status';

export const handler = async () => {
  try {
    const answers = await promptQuestions();

    if (!answers) return;

    const signedCSVC = await createSignedCredentialStatus(answers);

    if (!signedCSVC) return;

    saveSignedCredentialStatus(signedCSVC, answers.outputPath);
  } catch (err: unknown) {
    console.error(chalk.red(`Error: ${err instanceof Error ? err.message : err}`));
  }
};

export const promptQuestions = async (): Promise<CredentialStatusQuestionType> => {
  const answers: CredentialStatusQuestionType = {
    continue: false,
  };

  // hosting url for credential status
  answers.hostingUrl = await input({
    message:
      'Please enter the URL where your credential status is currently hosted. (e.g., https://example.com/credentials/statuslist/1):',
    required: true,
  });

  let credentialStatusVC: SignedCredentialStatusVC;
  try {
    credentialStatusVC = await fetchCredentialStatusVC(answers.hostingUrl);
  } catch (err: unknown) {
    throw new Error(`Invalid URL provided: ${answers.hostingUrl}`);
  }

  answers.keyPairPath = await input({
    message: 'Please enter the path to your key pair JSON file:',
    default: './didKeyPairs.json',
    required: true,
  });

  // Validate and read the key pair file
  answers.keypairData = readJsonFile(answers.keyPairPath, 'key pair');

  answers.outputPath = await input({
    message: 'Please specify a directory path to save the credential status file (optional):',
    default: '.',
    required: true,
  });

  if (!isDirectoryValid(answers.outputPath)) throw new Error('Output path is not valid');

  answers.type = credentialStatusVC?.credentialSubject?.type;

  if (answers.type === 'StatusList2021') {
    answers.credentialStatus = await StatusList.decode({
      encodedList: credentialStatusVC.credentialSubject.encodedList,
    });

    answers.purpose = credentialStatusVC.credentialSubject.statusPurpose as CredentialStatusPurpose;

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
    if (answers.type === 'StatusList2021') {
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
      throw err;
    }
    throw new Error(`Error signing credential status: ${err.message}`);
  }
};
