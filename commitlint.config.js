const regex = new RegExp(/^chore\(release\): @nghaninn\//g);

module.exports = {
  extends: ['@commitlint/config-conventional', '@commitlint/config-nx-scopes'],

  // Add your own rules. See http://marionebl.github.io/commitlint
  rules: {
    'scope-enum': async (_) => {
      const { getProjects } = (await import('@commitlint/config-nx-scopes')).default.utils;
      const projects = await getProjects();
      projects.push('all');
      return [2, 'always', projects];
    },
  },
  ignores: [(message) => regex.test(message)],
};
