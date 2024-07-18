import { Argv } from "yargs";
import {generateKeyPair, GenerateKeyPairType, VerificationType} from '@tradetrust-tt/w3c-issuer'

const type: GenerateKeyPairType = {
  type: VerificationType.Ed25519VerificationKey2018
}


export const command = "greet [name]"
export const describe = "Greet the user by name"
export const builder = (yargs: Argv) => {
  return yargs.positional("name", {
    alias: "n",
    describe: "Name to greet",
    type: "string",
    default: "World"
  })
}

export const handler = async (argv: any) => {
  // console.log(`Hello, ${argv.name}!`)
  const kp = await generateKeyPair(type)
  console.log(kp)
}
