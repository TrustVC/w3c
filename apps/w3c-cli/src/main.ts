#!/usr/bin/env ts-node
import path from 'path'
import yargs from 'yargs'
import { hideBin } from 'yargs/helpers'

yargs(hideBin(process.argv))
    .commandDir(path.join(__dirname, "commands"), {extensions: ["ts", "js"]})
    .demandCommand()
    .strict()
    .help().argv

