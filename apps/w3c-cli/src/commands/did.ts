import inquirer from 'inquirer';
import { Argv } from 'yargs';
import fs from 'fs';
import { issueDID, KeyPairType } from '@tradetrust-tt/w3c-issuer';

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
  // const answers = await inquirer.prompt(questions);
  const { keyPairPath } = await inquirer.prompt(keypairQuestions);

  let keypairData: KeyPairType;
  try {
    const data = fs.readFileSync(keyPairPath, { encoding: 'utf8', flag: 'r' });
    keypairData = JSON.parse(data);
  } catch (err) {
    console.error(`Unable to find key pair file at ${keyPairPath}`);
    console.error('Detailed error trace:', err);
    return;
  }

  const { domainName, outputPath } = await inquirer.prompt(questions);

  keypairData.domain = domainName;
  const wellknown = await issueDID(keypairData);
  const wellknownPath = `${outputPath}/wellknown.json`;
  fs.writeFile(wellknownPath, JSON.stringify(wellknown), (err) => {
    if (err) {
      console.error('Error writing file', err);
    } else {
      console.log('File written successfully');
    }
  });
};
