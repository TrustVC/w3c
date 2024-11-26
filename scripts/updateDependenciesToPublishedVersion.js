import fs from 'fs';

export default function () {
  fs.readFile('package.json', 'utf8', (err, data) => {
    if (err) {
      console.error(err);
      return;
    }

    const pkg = JSON.parse(data);
    for (const key in pkg.dependencies) {
      if (key.startsWith('@trustvc/')) {
        let path = key.replace('@trustvc/', '');
        const otherPackageJson = JSON.parse(
          fs.readFileSync(`../../packages/${path}/package.json`, 'utf8'),
        );

        pkg.dependencies[key] = `^${otherPackageJson.version}`;
      }
    }

    fs.writeFile('package.json', JSON.stringify(pkg, null, 2), 'utf8', (err) => {
      if (err) {
        console.error(err);
        return;
      }
    });
  });
}
