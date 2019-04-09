import { manifest } from 'pacote';
import { join } from 'path';

import {
  PackageInfo, Imports, ImportMap,
  readImportmap, genererateBundle, writeImportmap
} from '../../lib/';
import { AirdropToolbox } from '../extensions/load-location-config';

export default {
  name: 'bundle',
  alias: ['b'],
  description: 'Bundles an existing package',
  hidden: false,
  dashed: false,
  run: async (toolbox: AirdropToolbox) => {
    const { parameters, print, airdrop, filesystem, timer } = toolbox;
    const time = timer.start();

    const packages = parameters.array.filter(Boolean);

    print.info(`Reading existing importmap`);
    const importmap = await readImportmap(airdrop);

    const { imports } = await bundlePackages(packages, importmap, toolbox);
    Object.assign(importmap.imports, imports);

    print.success(`Writing importmap`);
    await writeImportmap(importmap, airdrop);

    time.done();
  }
};

export async function bundlePackages(packages: string[], importmap: ImportMap, toolbox: AirdropToolbox): Promise<ImportMap> {
  const { print, airdrop, filesystem } = toolbox;

  const imports: Imports = {};

  const buildBundles = packages.map(async (pkg: string) => {
    print.info(`Fetching package info for ${pkg}`);
    const pkgInfo: PackageInfo = await manifest(pkg, {
      'full-metadata': true
    });

    const pkgId = `${pkgInfo.name}@${pkgInfo.version}`;
    const entryPoint = pkgInfo.module || pkgInfo.browser || pkgInfo.main || 'index.js';
    const outputFilename = `${pkgId}.bundle.js`;
    const outputPath = join(airdrop.package_path, outputFilename);
    const entryPath = join(airdrop.package_root, outputFilename);

    const packagePath = filesystem.path(airdrop.package_path, pkgId, entryPoint);

    if (!airdrop.force && filesystem.exists(outputPath)) {
      print.warning(`Bundle already exists at ${outputPath}, skipping`);
      return;
    }

    print.info(`Bundling ${pkgId}`);
    const code = await genererateBundle(packagePath, importmap, airdrop);

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
