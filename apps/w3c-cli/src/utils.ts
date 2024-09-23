import chalk from 'chalk';
import fs from 'fs';

export const writeFile = <T>(path: string, data: T) => {
  try {
    fs.writeFileSync(path, JSON.stringify(data));
    console.log(chalk.green(`File written successfully to ${path}`));
  } catch (err) {
    console.error(chalk.red(`Unable to write file to ${path}`));
  }
};
