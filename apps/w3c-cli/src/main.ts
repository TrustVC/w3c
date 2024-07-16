#!/usr/bin/env node
import yargs, {Argv} from 'yargs'
import chalk from 'chalk';
import {hideBin} from 'yargs/helpers'


yargs(hideBin(process.argv))
    .commandDir("commands", {extensions: ["ts", "js"]})
    .demandCommand()
    .strict()
    .help().argv
    
