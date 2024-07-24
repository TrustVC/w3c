import { Argv } from "yargs";
import {generateKeyPair, VerificationType} from '@tradetrust-tt/w3c-issuer'

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

  const type: any = {
    type: VerificationType.Ed25519VerificationKey2018
  }

  console.log(`Hello, ${argv.name}!`)
  const kp = await generateKeyPair(type)
  console.log(kp)
}
