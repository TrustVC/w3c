#!/usr/bin/env ts-node
import path from 'path';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

yargs(hideBin(process.argv))
  .scriptName("w3c-cli")
  // TODO: Make code ESM-compatible
  .commandDir(path.join(__dirname, "commands"), { extensions: ["ts", "js", "cjs", "mjs"] })
  .demandCommand()
  .strict()
  .help()
  .fail((msg, err, yargs) => {
    if (err) throw err; // preserve stack
    console.error('Error:', msg);
    console.error(yargs.help());
  }).argv;
