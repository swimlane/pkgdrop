import { GluegunToolbox } from 'gluegun';
import * as pacote from 'pacote';
import * as npm from 'npm';
import { promisify } from 'util';

const npmConfig = {
  silent: true,
  loaded: false,
  progress: true,
  only: 'prod',
  'audit': false,
  'ignore-scripts': true,
  'package-lock': false
};

export default {
  name: 'install',
  alias: ['i'],
  description: 'Installs an existing package',
  hidden: false,
  dashed: false,
  run: async (toolbox: GluegunToolbox) => {
    const { parameters, print, config, filesystem } = toolbox;

    const packages = parameters.string.split(' ');

    while (packages.length > 0) {
      const pkg = packages.shift();
      print.info(`Fetching package info for ${pkg}`);
      const { name, version } = await pacote.manifest(pkg);

      const packagePath = filesystem.path(config.package_path, `${name}@${version}`);

      print.info(`Installing dependencies for ${pkg}`);
      
      const npmLoad = promisify(npm.load);
      await npmLoad(npmConfig);
      
      const npmInstall = promisify(npm.commands.install);
      await npmInstall(packagePath, []);
    }

    return;
  }
};
