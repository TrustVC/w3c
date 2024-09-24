const { releaseVersion, releaseChangelog } = require('nx/release');
const nx = require('./nx.json');
const yargs = require('yargs');
const chalk = require('chalk');

(async () => {
  const options = yargs
    .option('dry-run', {
      alias: 'd',
      type: 'boolean',
      default: true,
      description: 'Run without publishing',
    })
    .option('projects', {
      type: 'string',
      default: 'all',
      description: 'Projects to release (comma separated)',
    })
    .option('verbose', {
      alias: 'v',
      type: 'boolean',
      default: true,
      description: 'Run with verbose logging',
    })
    .option('forceUpgradeTo', {
      type: 'string',
      description: 'Force upgrade to a specific version',
      default: null,
    })
    .option('firstRelease', {
      type: 'boolean',
      default: false,
      description: 'Run first release',
    })
    .help()
    .parseSync();

  const projects = options.projects === 'all' ? nx.release.projects : options.projects.split(',');

  if (options.forceUpgradeTo) {
    console.warn(chalk.yellow(`Forcing upgrade to ${options.forceUpgradeTo}`));

    if (options.projects === 'all' && !options.firstRelease) {
      console.error(chalk.red('Cannot force upgrade all projects, please specify projects'));
      return;
    }
  }

  const { workspaceVersion, projectsVersionData } = await releaseVersion({
    projects,
    firstRelease: options.firstRelease,
    dryRun: options.dryRun,
    verbose: options.verbose,
    specifier: options.forceUpgradeTo,
    gitCommit: false,
    stageChanges: true,
    gitTag: true,
    generatorOptionsOverrides: {
      currentVersionResolver: 'git-tag',
      specifierSource: 'conventional-commits',
    },
  });

  const updatedProjects = Object.keys(projectsVersionData).filter(
    (key) => projectsVersionData[key].newVersion,
  );

  if (updatedProjects.length === 0) {
    console.error(chalk.red('No projects to release'));
    return;
  }

  const _changelog = await releaseChangelog({
    projects,
    version: workspaceVersion,
    versionData: projectsVersionData,
    dryRun: options.dryRun,
    verbose: options.verbose,
    gitCommit: true,
    stageChanges: true,
  });

  // await releasePublish({
  //   projects: updatedProjects,
  //   version: workspaceVersion,
  //   changelog,
  //   dryRun: options.dryRun,
  // });

  return;
})()
  .then(() => {
    console.log(chalk.green('Release completed'));
    process.exit(0);
  })
  .catch((error) => {
    console.error(chalk.red('Release failed'), error);
    process.exit(1);
  });

/**
 * To run the script for first release, execute the following command:
 */
// node release.js --firstRelease=true --forceUpgradeTo=1.0.0

/**
 * To run the script for normal release, execute the following command:
 * By default, it will run in dry-run mode
 */
// node release.js
// node release.js --dry-run=false
// node release.js -d=false

/**
 * To run the script for specific projects, execute the following command:
 */
// node release.js --projects=project1,project2
// node release.js --projects=project1
// node release.js --projects=project2

/**
 * To run the script with force upgrade, execute the following command:
 */
// node release.js --forceUpgradeTo=1.0.0 --projects=project1
// node release.js --forceUpgradeTo=1.0.0 --projects=@tradetrust-tt/w3c-context,@tradetrust-tt/w3c-credential-status,@tradetrust-tt/w3c-issuer,@tradetrust-tt/w3c-vc,@tradetrust-tt/w3c-cli
