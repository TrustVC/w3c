## Starting the CLI local build 
1. `npm run cli:install` - This installs all packages for the CLI app
2. `npm run cli:dev` - This listens to the w3c-cli src/ folder for any changes and rebuilds the files into the dist/ folder at the root level
3. `npm run cli:exec <command>` - This runs the CLI. Specify a command as parameter



## TRoubleshooting
1. If you run into ` Cannot convert undefined or null to object`, try removing the dist folder `rm -rf dist`, `nx reset` and try again
2. `[ERR_UNKNOWN_FILE_EXTENSION]: Unknown file extension ".ts" for /Users/khanghou/Documents/Code/tradetrust/w3c/apps/w3c-cli/src/main.ts` - Becuase package.json has type=module

## Changelog
30/7/24
- Moved dist folder to project root
- Renamed front / in @/tradetrust-tt/w3c-utils path alias
- Add missing project.jsons and vite.config.ts for project
- Standardise build to use esbuild instead of vite
= Remove w3c-cli/package.json