import { manifest } from 'pacote';
import { join } from 'path';

import { print, filesystem } from 'gluegun'; 

import { ImportMap, Imports, PackageInfo, AirdropOptions, genererateBundle } from '../../lib/';

export async function bundlePackages(packages: string[], importmap: ImportMap, options: AirdropOptions): Promise<ImportMap> {
  const imports: Imports = {};

  const buildBundles = packages.map(async (pkg: string) => {
    print.info(`Fetching package info for ${pkg}`);
    const pkgInfo: PackageInfo = await manifest(pkg, {
      'full-metadata': true
    });

    const pkgId = `${pkgInfo.name}@${pkgInfo.version}`;
    const entryPoint = pkgInfo.module || pkgInfo.browser || pkgInfo.main || 'index.js';
    const outputFilename = `${pkgId}.bundle.js`;
    const outputPath = join(options.package_path, outputFilename);
    const entryPath = join(options.package_root, outputFilename);

    const packagePath = filesystem.path(options.package_path, pkgId, entryPoint);

    if (!options.force && filesystem.exists(outputPath)) {
      print.warning(`Bundle already exists at ${outputPath}, skipping`);
      return;
    }

    print.info(`Bundling ${pkgId}`);
    const code = await genererateBundle(packagePath, importmap, options);

    print.success(`Writing bundle for ${pkgId}`);
    await filesystem.writeAsync(outputPath, code);

    imports[pkgId] = entryPath;
  });

  await Promise.all(buildBundles);

  return {
    imports,
    scopes: {}
  }
}