import { IssuedDID, IssuedDIDOption, issueDID } from '@trustvc/w3c-issuer';
import chalk from 'chalk';
import inquirer from 'inquirer';
import { KeyPairQuestionType, QuestionType } from '../types';
import { isDirectoryValid, readJsonFile, writeFile } from '../utils';

export const command = 'did';
export const describe = 'Generate a new DID token file from a key pair file and a domain name';

export const handler = async () => {
  try {
    const answers = await promptQuestions();
    if (!answers) return;

    const { keypairData, outputPath } = answers;
    const did = await getIssuedDid(keypairData);
    if (!did) return;

    await saveIssuedDid(did, outputPath);
  } catch (err: unknown) {
    console.error(chalk.red(`Error: ${err instanceof Error ? err.message : err}`));
  }
};

export const getIssuedDid = async (keypairData: IssuedDIDOption): Promise<IssuedDID> => {
  try {
    // Issue the DID
    const did: IssuedDID = await issueDID(keypairData);
    return did;
  } catch (err) {
    if (err instanceof Error) {
      if (err.message == 'Missing domain' || err.message == 'Invalid domain') {
        throw new Error('Error generating DID token: ' + err.message);
      } else if (err.message === 'KeyPair already exists') {
        throw new Error('Error generating DID token: KeyPair already exists in Did Document');
      } else {
        throw new Error('Error generating DID token');
      }
    }
  }
};

export const saveIssuedDid = async (wellKnownDid: IssuedDID, outputPath: string) => {
  const wellknownPath = `${outputPath}/wellknown.json`;
  writeFile(wellknownPath, wellKnownDid.wellKnownDid);
  const keypairsPath = `${outputPath}/didKeyPairs.json`;
  writeFile(keypairsPath, wellKnownDid.didKeyPairs);
};

export const promptQuestions = async () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const keypairQuestions: any = [
    {
      name: 'keyPairPath',
      type: 'input',
      message: 'Please enter the path to your key pair JSON file:',
      default: './keypair.json',
      required: true,
    },
  ];

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const questions: any = [
    {
      name: 'domainName',
      type: 'input',
      message:
        'Please enter your domain for hosting the did-web public key (e.g., https://example.com/.well-known/did.json):',
      required: true,
    },
    {
      name: 'outputPath',
      type: 'input',
      message: 'Please specify a directory path to save the DID token file (optional):',
      default: '.',
      required: true,
    },
  ];

  // Prompt for the key pair path
  const { keyPairPath }: KeyPairQuestionType = (await inquirer.prompt(
    keypairQuestions,
  )) as KeyPairQuestionType;

  // Validate and read the key pair file
  const keypairData: IssuedDIDOption = readJsonFile(keyPairPath, 'key pair');
  if (!keypairData) throw new Error('Unable to read key pair file');

  // Prompt for the domain name and output path
  const { domainName, outputPath }: QuestionType = (await inquirer.prompt(
    questions,
  )) as QuestionType;

  if (!isDirectoryValid(outputPath)) throw new Error('Output path is not valid');
  keypairData.domain = domainName;

  return { keypairData, domainName, outputPath };
};
