/// <reference path="index.d.ts" />

import { extract } from 'pacote';

import { print, filesystem } from 'gluegun'; 

import { ImportMap, AirdropOptions } from '../../lib/';

export async function addPackages(map: ImportMap, options: AirdropOptions) {
  const extractPackages = Object.keys(map.scopes).map(async (pkg: string): Promise<void> => {
    const packagePath = filesystem.path(options.package_path, pkg);

    print.info(`Extracting tarball for ${pkg}`);
    return extract(pkg, packagePath);
  });

  await Promise.all(extractPackages);

  return map;
}
  