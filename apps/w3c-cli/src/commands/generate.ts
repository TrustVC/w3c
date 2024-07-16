import inquirer from 'inquirer';
import { Argv, Choices } from 'yargs';
import fs from 'fs'

enum EncAlgo {
    BLS12381 = "BLS12381"
}

export const command = "generate";

const encAlgos: any = [EncAlgo.BLS12381]

export const describe = "Generate a new did file"
export const builder = (yargs: Argv) => {
    return {}
}
export const handler = async (argv: any) => {
    const answers = await inquirer.prompt([
        {
            name: "encAlgo",
            type: "list",
            choices: encAlgos,
            message: "Select an encryption algorithm"
        },
        {
            name: "seed",
            type: "input",
            message: "Enter a seed (optional)",
            default: ""
        },
        {
            name: "keyPath",
            type: "input",
            message: "Enter a path to save the key files (default: .)",
            default: "."
        }
    ])

    const {encAlgo, seed, keyPath} = answers;

    console.log("Generating key pairs", encAlgo, seed);
    const keyFilePath = `${keyPath}/key.json`;
    const keyData = ""
    fs.writeFile(keyFilePath, keyData, (err) => {
        if (err) {
            console.error("Error writing file", err);
        } else {
            console.log("File written successfully");
        }
    })

}