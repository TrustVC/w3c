import path from 'path';
import yargs from 'yargs';

export const command = 'credential-status';
export const describe = 'Generate a new credential status';

module.exports = {
  command,
  describe,
  builder: (yargs: yargs.Argv) => {
    yargs
      .commandDir(path.join(__dirname, 'credentialStatus'), { extensions: ['ts', 'js'] })
      .demandCommand()
      .strict()
      .help();
  },
};
