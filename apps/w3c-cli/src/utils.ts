import chalk from 'chalk';
import fs from 'fs';

export const writeFile = <T>(path: string, data: T) => {
  try {
    fs.writeFileSync(path, JSON.stringify(data));
    console.log(chalk.green(`File written successfully to ${path}`));
  } catch (err) {
    throw new Error(`Unable to write file to ${path}`);
  }
};

// Read and parse JSON file
export const readJsonFile = <T>(filePath: string, fileType: string): T | null => {
  try {
    const data = fs.readFileSync(filePath, { encoding: 'utf8' });
    return JSON.parse(data) as T;
  } catch (err) {
    throw new Error(`Invalid ${fileType} file path: ${filePath}`);
  }
};

// Validate if the directory exists
export const isDirectoryValid = (path: string): boolean => {
  try {
    fs.readdirSync(path, { encoding: 'utf-8' });
    return true;
  } catch (err) {
    console.warn(chalk.yellow(`Invalid directory path: ${path}`));
    return false;
  }
};
