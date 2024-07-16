import { Argv } from "yargs";

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

export const handler = (argv: any) => {
  console.log(`Hello, ${argv.name}!`)
}
