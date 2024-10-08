const fs = require('fs');
const { glob } = require('glob');

module.exports = async function () {
  const files = await glob(__dirname + '/../' + '**/package.json', { ignore: 'node_modules/**' });
  files.forEach((file) => {
    console.log('file', file);

    fs.readFile(file, 'utf8', (err, data) => {
      if (err) {
        console.error('err', err);
        return;
      }

      const pkg = JSON.parse(data);
      for (const key in pkg.dependencies) {
        if (key.startsWith('@trustvc/')) {
          pkg.dependencies[key] = '*';
        }
      }

      fs.writeFile(file, JSON.stringify(pkg, null, 2), 'utf8', (err) => {
        if (err) {
          console.error(err);
          return;
        }
      });
    });
  });
};

module.exports();
