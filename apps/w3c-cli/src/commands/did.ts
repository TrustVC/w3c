import { issueDID, KeyPairType } from '@tradetrust-tt/w3c-issuer';
import fs from 'fs';
import inquirer from 'inquirer';
import chalk from 'chalk';

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
    message: 'Enter the path of your key pair JSON?',
  },
];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const questions: any = [
  {
    name: 'domainName',
    type: 'input',
    message: 'What is your domain name? (https://example.com)',
  },
  {
    name: 'outputPath',
    type: 'input',
    message: 'Enter a path to save the DID token file (default: ./wellknown.json)',
    default: '.',
  },
];

export const describe = 'Generate a new DID token file from a key pair file and a domain name';

// export const builder = (yargs: Argv) => {};

export const handler = async (argv: any) => {
  try {
    const {keypairData, domainName, outputPath, } = await promptQuestions();
      
    // Issue the DID
    const did = await issueDID(keypairData);
    await saveIssuedDid(did, keypairData, outputPath);
    // Write the wellknown data to a file
  } catch (err) {
    console.error(chalk.red('Error generating DID token:'), err);
  }
};

export const saveIssuedDid = async (wellKnownDid, keyPairs, outputPath) => {
  const wellknownPath = `${outputPath}/wellknown.json`;
  writeFile(wellknownPath, wellKnownDid);
  const keypairsPath = `${outputPath}/keypairs.json`;
  writeFile(keypairsPath, keyPairs);
}


const writeFile = (path: string, data: any) => {
  fs.writeFile(path, JSON.stringify(data), (err) => {
    if (err) {
      console.error(chalk.red('Error writing file'), err);
    } else {
      console.log(chalk.green('File written successfully to'), path);
    }
  });
};


export const promptQuestions = async () => {
  try {
    // Prompt for the key pair path
    const { keyPairPath } = await inquirer.prompt(keypairQuestions);

    // Validate and read the key pair file
    const data = fs.readFileSync(keyPairPath, { encoding: 'utf8', flag: 'r' });
    const keypairData: KeyPairType = JSON.parse(data);

    // Prompt for the domain name and output path
    const { domainName, outputPath } = await inquirer.prompt(questions);
    
    keypairData.domain = domainName;

    return { keypairData, domainName, outputPath };
  } catch (err) {
    console.error(chalk.red('Error during prompts or reading key pair file:'), err);
    throw err; // Re-throw error to handle it in the main handler
  }
};