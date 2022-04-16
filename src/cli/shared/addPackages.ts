/// <reference path="index.d.ts" />

import { extract } from 'pacote';
import { print, filesystem } from 'gluegun';

import { getConfig } from './getConfig';
import { ImportMap, PkgdropOptions } from '../../lib/';

function normalizePackageName(s: string) {
  return s.replace(/[\/\\]$/, '').replace(/\\/g, '/');
}

export async function addPackages(map: ImportMap, options: PkgdropOptions) {
  const packages = Object.keys(map.scopes).map(normalizePackageName);
  await Promise.all(packages.map((pkg) => addPackage(pkg, options)));
  return map;
}

async function addPackage(pkg: string, options: PkgdropOptions) {
  const npmconfig = {
    ...getConfig(),
    cache: false,
  };

  let packagePath = filesystem.path(options.package_path, pkg);

  /* istanbul ignore if  */
  if (options.dry) {
    print.info(`Extracting tarball for ${pkg} [dry run]`);
    return pkg;
  }
  print.info(`Extracting tarball for ${pkg}`);
  await extract(pkg, packagePath, npmconfig);
  return pkg;
}
