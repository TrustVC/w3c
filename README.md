## Starting the CLI local build 
1. `npm install` - This installs all packages for the CLI app
- Note: You might need to cd into the individual packages in the packages/ folder to install dependencies there
2. `nx build w3c-cli` - This builds all required dependencies for the CLI app, including its local dependencies in the same repo
3. `npm run cli:dev <command>` - This runs the CLI. Specify a command as parameter



## TRoubleshooting
1. If you run into ` Cannot convert undefined or null to object`, after running `nx reset`, try waiting for a few seconds
2. `[ERR_UNKNOWN_FILE_EXTENSION]: Unknown file extension ".ts" for /Users/khanghou/Documents/Code/tradetrust/w3c/apps/w3c-cli/src/main.ts` - Becuase package.json has type=module
3. We currently cannot run the CLI app via NX as it cannot handle user input like with `inquirer`. Instead, run it directly via `node dist/main.js` or `ts-node apps/w3c-cli/src/main.ts`

## Changelog
30/7/24
- Moved dist folder to project root
- Renamed front / in @/tradetrust-tt/w3c-utils path alias
- Add missing project.jsons and vite.config.ts for project
- Standardise build to use esbuild instead of vite
- Remove w3c-cli/package.json