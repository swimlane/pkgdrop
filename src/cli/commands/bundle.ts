import { GluegunToolbox } from 'gluegun';
import { rollup } from 'rollup';
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

    const importmapPath = filesystem.path(config.package_path, 'importmap.json');
    let importmap = await filesystem.readAsync(importmapPath, 'json');

    if (!importmap) {
      importmap = {
        imports: {},
        scopes: {}
      };
    }

    const resolve = () => ({
      async resolveId(importee: string, importer: string) {
        if ( /\0/.test( importee ) ) return null;
        if ( !importer ) return null;

        const basedir = filesystem.path(config.package_path);
    
        importer = importer.replace(basedir, '');
    
        const firstIndex = importer.indexOf('/');
        const secondIndex = importer.indexOf('/', firstIndex + 1);
        const scope = importer.slice(firstIndex + 1, secondIndex);

        if (!importmap.scopes[scope]) {
          return;
        }
    
        const scopes = importmap.scopes[scope];
    
        for (const s in scopes) {
          if (importee.startsWith(s)) {
            const im = importee.replace(s, scopes[s]).replace(config.package_root, '');
            return filesystem.path(config.package_path, im);
          }
        }
        
        return;
      }
    });

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

      const packageBundle = await rollup(inputOptions as any);
      const out = await packageBundle.generate(outputOptions);

      const { code } = out.output[0];
      const outputFilename = `${packageName}.bundle.mjs`;
      const outputPath = join(config.package_path, outputFilename);

      print.info(`Writing bundle for ${packageName}`);
      await filesystem.writeAsync(outputPath, code);
    }
  }
};