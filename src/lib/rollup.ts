import { rollup, RollupOptions, OutputOptions, Plugin } from 'rollup';
import { terser } from 'rollup-plugin-terser';
import * as jetpack from 'fs-jetpack';
import { join } from 'path';

import { ImportMap } from './importmaps';
import { AirdropOptions } from './airdrop';
import { createResolver } from './resolver';

export async function genererateBundle(packagePath: string, importmap: ImportMap, options: AirdropOptions): Promise<string> {
    const outputOptions: OutputOptions = {
      format: 'esm' as 'esm',
      sourcemap: true,
      exports: 'named' as 'named',
      chunkFileNames: 'common/[name]-[hash].js'
    };
  
    const inputOptions: RollupOptions = {
      input: [packagePath],
      plugins: [
        airdropResolverPlugin(importmap, options),
        options.optimize && terser()
      ]
    };
  
    const packageBundle = await rollup(inputOptions);
    const out = await packageBundle.generate(outputOptions);
    return out.output[0].code;
  }
  
  // TODO: check if file exists?
  function airdropResolverPlugin(importmap: ImportMap, options: AirdropOptions): Plugin {
    return {
      name: 'airdrop-resolve',
      resolveId(importee: string, importer: string) {
        if ( /\0/.test( importee ) ) return;
        if ( !importer ) return;
  
        const basedir = jetpack.path(options.package_path);
        importer = importer.replace(basedir, '');
  
        const firstIndex = importer.indexOf('/');
        const secondIndex = importer.indexOf('/', firstIndex + 1);
        const scope = importer.slice(firstIndex + 1, secondIndex);

        if (!importmap.scopes[scope]) return;
  
        const resolveId = createResolver(importmap.scopes[scope]);
        const resolved = resolveId(importee);

        if (!resolved) return;

        return join(basedir, resolved.replace(options.package_root, ''));
      }
    }
  }