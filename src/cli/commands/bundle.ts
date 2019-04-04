import { GluegunToolbox } from 'gluegun';
import { manifest } from 'pacote';
import { join } from 'path';

import {
  AirdropOptions, PackageInfo,
  readImportmap, genererateBundle
} from '../../utils/';

export default {
  name: 'bundle',
  alias: ['b'],
  description: 'Generates a bumdle for specific entry points',
  hidden: false,
  dashed: false,
  run: async (toolbox: GluegunToolbox) => {
    const { parameters, print, config: { airdrop }, filesystem, timer } = toolbox;
    const time = timer.start();

    const config = airdrop as AirdropOptions;

    const packages = parameters.array.filter(Boolean);

    print.info(`Reading existing importmap`);
    const importmap = await readImportmap(config);

    const buildBundles = packages.map(async (pkg: string) => {
      print.info(`Fetching package info for ${pkg}`);
      const pkgInfo: PackageInfo = await manifest(pkg, {
        'full-metadata': true
      });

      const packageName = `${pkgInfo.name}@${pkgInfo.version}`;
      const entryPoint = pkgInfo.module || pkgInfo.browser || pkgInfo.main || 'index.js';
      const outputFilename = `${packageName}.bundle.js`;
      const outputPath = join(config.package_path, outputFilename);

      const packagePath = filesystem.path(config.package_path, packageName, entryPoint);

      if (!config.force && filesystem.exists(outputPath)) {
        print.warning(`Bundle already exists at ${outputPath}, skipping`);
        return;
      }

      print.info(`Bundling ${packageName}`);
      const code = await genererateBundle(packagePath, importmap, config);

      print.success(`Writing bundle for ${packageName}`);
      await filesystem.writeAsync(outputPath, code);
    });

    await Promise.all(buildBundles);

    time.done();
  }
};
