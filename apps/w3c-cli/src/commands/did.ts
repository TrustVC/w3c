import { IssuedDID, issueDID, KeyPairType } from '@tradetrust-tt/w3c-issuer';
import chalk from 'chalk';
import fs from 'fs';
import inquirer from 'inquirer';

export type IssueDidInput = {
  keyPairPath: string;
  domainName: string;
  outputPath: string;
};

export const command = 'generate-did';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const keypairQuestions: any = [
  {
    name: 'keyPairPath',
    type: 'input',
    message: 'Please enter the path to your key pair JSON file:',
  },
];
export type KeyPairQuestionType = {
  keyPairPath: string;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const questions: any = [
  {
    name: 'domainName',
    type: 'input',
    message: 'Please enter your domain name (e.g., https://example.com):',
  },
  {
    name: 'outputPath',
    type: 'input',
    message: 'Please specify a directory path to save the DID token file (optional):',
    default: '.',
  },
];
export type QuestionType = {
  domainName: string;
  outputPath: string;
};

export const describe = 'Generate a new DID token file from a key pair file and a domain name';

export const handler = async () => {
  const answers = await promptQuestions();
  if (!answers) return;
  const { keypairData, outputPath } = answers;
  const did = await getIssuedDid(keypairData);
  if (!did) return;

  await saveIssuedDid(did, keypairData, outputPath);
};

export const getIssuedDid = async (keypairData: KeyPairType): Promise<IssuedDID> => {
  try {
    // Issue the DID
    const did: IssuedDID = await issueDID(keypairData);
    return did;
  } catch (err) {
    if (err instanceof Error) {
      if (err.message == 'Invalid / Missing domain') {
        console.error(chalk.red('Error generating DID token: Invalid / Missing domain'));
      } else {
        console.error(chalk.red('Error generating DID token'));
      }
    }
  }
};

export const saveIssuedDid = async (
  wellKnownDid: IssuedDID,
  keyPairs: KeyPairType,
  outputPath: string,
) => {
  const wellknownPath = `${outputPath}/wellknown.json`;
  writeFile(wellknownPath, wellKnownDid);
  const keypairsPath = `${outputPath}/keypairs.json`;
  writeFile(keypairsPath, keyPairs);
};

const writeFile = (path: string, data) => {
  try {
    fs.writeFileSync(path, JSON.stringify(data));
    console.log(chalk.green(`File written successfully to ${path}`));
  } catch (err) {
    console.error(chalk.red(`Unable to write file to ${path}`));
  }
};

export const promptQuestions = async () => {
  // Prompt for the key pair path
  const { keyPairPath }: KeyPairQuestionType = await inquirer.prompt(keypairQuestions);

  // Validate and read the key pair file
  let data: string;
  try {
    data = fs.readFileSync(keyPairPath, { encoding: 'utf8', flag: 'r' });
  } catch (err) {
    console.error(chalk.red(`Invalid file path provided: ${keyPairPath}`));
    return;
  }

  const keypairData: KeyPairType = JSON.parse(data);

  // Prompt for the domain name and output path
  const { domainName, outputPath }: QuestionType = await inquirer.prompt(questions);
  try {
    fs.readdirSync(outputPath, { encoding: 'utf-8' });
  } catch (err) {
    console.error(chalk.red(`Invalid file path provided: ${outputPath}`));
    return;
  }
  keypairData.domain = domainName;

  return { keypairData, domainName, outputPath };
};
