import { GluegunToolbox } from 'gluegun';
import { rollup } from 'rollup';
import { manifest } from 'pacote';
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
  description: 'Generates a bumdle for specific entry points',
  hidden: false,
  dashed: false,
  run: async (toolbox: GluegunToolbox) => {
    const { parameters, print, config: { airdrop }, filesystem, runtime: { brand } } = toolbox;

    const config = airdrop;

    const packages = parameters.array;
    const force = parameters.options.force || false;

    const importmapPath = filesystem.path(config.package_path, 'importmap.json');

    print.info(`Reading existing importmap from ${importmapPath}`);
    const importmap = (await filesystem.readAsync(importmapPath, 'json')) || {};

    importmap.imports = importmap.imports || {};
    importmap.scopes = importmap.scopes || {};

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

    const buildBundles = packages.map(async (pkg: string) => {
      print.info(`Fetching package info for ${pkg}`);
      const pkgInfo = await manifest(pkg, {
        'full-metadata': true
      });

      const packageName = `${pkgInfo.name}@${pkgInfo.version}`;
      const entryPoint = pkgInfo.module || pkgInfo.browser || pkgInfo.main || 'index.js';
      const outputFilename = `${packageName}.bundle.js`;
      const outputPath = join(config.package_path, outputFilename);

      const packagePath = filesystem.path(config.package_path, packageName, entryPoint);

      if (!force && filesystem.exists(outputPath)) {
        print.warning(`Bundle already exists at ${outputPath}, skipping`);
        return;
      }

      print.info(`Bundling ${packageName}`);

      const inputOptions = {
        input: [packagePath],
        plugins: [resolve()]
      };

      const packageBundle = await rollup(inputOptions as any);
      const out = await packageBundle.generate(outputOptions);

      const { code } = out.output[0];

      print.success(`Writing bundle for ${packageName}`);
      await filesystem.writeAsync(outputPath, code);
    });

    await Promise.all(buildBundles);
  }
};