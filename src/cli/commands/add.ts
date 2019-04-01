import { GluegunToolbox } from 'gluegun';
import * as pacote from 'pacote';

export default {
  name: 'add',
  alias: ['a'],
  description: 'Adds a new package',
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

      print.info(`Extracting tarball for ${pkg} to ${packagePath}`);
      await pacote.extract(pkg, packagePath);
    }
  }
};
