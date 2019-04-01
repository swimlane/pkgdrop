import { GluegunToolbox } from 'gluegun';
import { rollup } from 'rollup';
import * as resolve from 'rollup-plugin-node-resolve';
import * as pacote from 'pacote';
import { join } from 'path';

const outputOptions = {
  format: 'esm' as 'esm',
  sourcemap: true,
  exports: 'named' as 'named',
  chunkFileNames: 'common/[name]-[hash].js'
};

export default {
  name: 'bundle',
  alias: ['b'],
  description: 'Genreates a bumdle for a specific enrty point',
  hidden: false,
  dashed: false,
  run: async (toolbox: GluegunToolbox) => {
    const { parameters, print, config, filesystem } = toolbox;

    const packages = parameters.string.split(' ');

    const importmapPath = filesystem.path(config.bundle_path, 'importmap.json');
    let importmap = await filesystem.readAsync(importmapPath, 'json');

    if (!importmap) {
      importmap = {
        imports: {}
      };
    }

    while (packages.length > 0) {
      const pkg = packages.shift();

      print.info(`Fetching package info for ${pkg}`);
      const pkgInfo = await pacote.manifest(pkg, {
        'full-metadata': true
      });

      const packageName = `${pkgInfo.name}@${pkgInfo.version}`;
      const entryPoint = pkgInfo.module || pkgInfo.browser || pkgInfo.main || 'index.js';
  
      const packagePath = filesystem.path(config.package_path, packageName, entryPoint);

      print.info(`Bundling ${packageName}`);

      const inputOptions = {
        input: [packagePath],
        plugins: [resolve()]
      };

      const packageBundle = await rollup(inputOptions);
      const out = await packageBundle.generate(outputOptions);

      const { code } = out.output[0];
      const outputFilename = `${packageName}.mjs`;
      const outputPath = join(config.bundle_path, outputFilename);

      print.info(`Writing bundle for ${packageName}`);
      await filesystem.writeAsync(outputPath, code);

      importmap.imports[packageName] = join(config.bundle_root, outputFilename);
    }

    print.info(`Writing importmap`);
    await filesystem.writeAsync(importmapPath, importmap);
  }
};