import inquirer from 'inquirer';
import { Argv } from 'yargs';
import fs from 'fs';
import { issueDID, KeyPairType } from '@tradetrust-tt/w3c-issuer';
import chalk from 'chalk';

export const command = 'generate-did';

const keypairQuestions: any = [
  {
    name: 'keyPairPath',
    type: 'input',
    message: 'Enter the path of your key pair JSON?',
  },
];

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
    const wellknown = await issueDID(keypairData);

    // Write the wellknown data to a file
    const wellknownPath = `${outputPath}/wellknown.json`;
    writeFile(wellknownPath, wellknown);
  } catch (err) {
    console.error(chalk.red('Error generating DID token:'), err);
  }
};

const writeFile = (path: string, data: any) => {
  fs.writeFile(path, JSON.stringify(data), (err) => {
    if (err) {
      console.error(chalk.red('Error writing file'), err);
    } else {
      console.log(chalk.green('File written successfully to'), path);
    }
  });
};



const promptQuestions = async () => {
  try {
    // Prompt for the key pair path
    const { keyPairPath } = await inquirer.prompt(keypairQuestions);

    // Validate and read the key pair file
    const data = fs.readFileSync(keyPairPath, { encoding: 'utf8', flag: 'r' });
    const keypairData: KeyPairType = JSON.parse(data);

    // Prompt for the domain name and output path
    const { domainName, outputPath } = await inquirer.prompt(questions);

    return { keypairData, domainName, outputPath };
  } catch (err) {
    console.error(chalk.red('Error during prompts or reading key pair file:'), err);
    throw err; // Re-throw error to handle it in the main handler
  }
};