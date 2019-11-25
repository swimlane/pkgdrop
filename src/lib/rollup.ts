import { rollup, RollupOptions, OutputOptions, Plugin } from 'rollup';
import { terser } from 'rollup-plugin-terser';
import * as commonjs from 'rollup-plugin-commonjs';
import * as jetpack from 'fs-jetpack';
import { join } from 'path';

import { ImportMap } from './importmaps';
import { PkgdropOptions } from './pkgdrop';
import { createResolver } from './resolver';

export async function genererateBundle(packagePath: string, importmap: ImportMap, options: PkgdropOptions): Promise<string> {
    const outputOptions: OutputOptions = {
      format: 'esm' as 'esm',
      sourcemap: true,
      exports: 'named' as 'named',
      chunkFileNames: 'common/[name]-[hash].js'
    };
  
    const inputOptions: RollupOptions = {
      input: [packagePath],
      plugins: [
        pkgdropResolverPlugin(importmap, options),
        (commonjs as any)(),
        options.optimize && terser()
      ]
    };
  
    const packageBundle = await rollup(inputOptions);
    const out = await packageBundle.generate(outputOptions);
    return out.output[0].code;
  }
  
  function pkgdropResolverPlugin(importmap: ImportMap, options: PkgdropOptions): Plugin {
    return {
      name: 'pkgdrop-rollup',
      resolveId(importee: string, importer: string) {
        /* istanbul ignore next */
        if ( /\0/.test( importee ) ) return;
        if ( !importer ) return;
  
        const basedir = jetpack.path(options.package_path);
        importer = importer.replace(basedir, '');
  
        const firstIndex = importer.indexOf('/');
        const secondIndex = importer.indexOf('/', firstIndex + 1);
        const scope = importer.slice(firstIndex + 1, secondIndex + 1);

        /* istanbul ignore next */
        if (!importmap.scopes[scope]) return;
  
        const resolveId = createResolver(importmap.scopes[scope]);
        const resolved = resolveId(importee);

        if (!resolved) return;

        return join(basedir, resolved.replace(options.package_root, ''));
      }
    }
  }