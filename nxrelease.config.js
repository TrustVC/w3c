module.exports = {
  repositoryUrl: 'https://github.com/TrustVC/w3c.git',
  branches: [
    {
      name: 'main',
      release: true,
    },
    {
      name: 'alpha',
      prerelease: 'alpha',
    },
    {
      name: 'beta',
      prerelease: 'beta',
    },
  ],
  github: true,
  changelog: true,
  npm: true,
  outputPath: '${PROJECT_DIR}/dist',
  buildTarget: '${PROJECT_NAME}:build',
  tagFormat: '${PROJECT_NAME}@${VERSION}',
  debug: true,
  plugins: [
    [
      '@semantic-release/npm',
      {
        npmPublish: true,
        pkgRoot: '${PROJECT_DIR}',
      },
    ],
  ],
  releaseRules: [
    {
      subject: '*BREAKING CHANGE*',
      release: 'major',
    },
    {
      type: 'feat',
      release: 'minor',
    },
    {
      type: 'fix',
      release: 'patch',
    },
    {
      type: 'perf',
      release: 'patch',
    },
  ],
};
