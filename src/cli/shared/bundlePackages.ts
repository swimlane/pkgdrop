import { join } from 'path';

import { print, filesystem } from 'gluegun'; 

import { ImportMap, Imports, PkgdropOptions, genererateBundle, getLocalManifest, expandLocalVersion } from '../../lib/';

export async function bundlePackages(packages: string[], importmap: ImportMap, options: PkgdropOptions): Promise<ImportMap> {
  const imports: Imports = {};

  const buildBundles = packages.map(async (pkg: string) => {
    print.info(`Fetching package info for ${pkg}`);

    const pkgId = expandLocalVersion(pkg, importmap.imports);
    const pkgInfo = await getLocalManifest(pkgId, options);

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
