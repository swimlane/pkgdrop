/// <reference path="index.d.ts" />

import { extract } from 'pacote';
import { print, filesystem } from 'gluegun'; 

import { ImportMap, AirdropOptions } from '../../lib/';

export async function addPackages(map: ImportMap, options: AirdropOptions) {
  const packages = Object.keys(map.scopes);
  await Promise.all(packages.map(pkg => addPackage(pkg, options)));
  return map;
}

async function addPackage(pkg: string, options: AirdropOptions) {
  const packagePath = filesystem.path(options.package_path, pkg);
  print.info(`Extracting tarball for ${pkg}`);
  await extract(pkg, packagePath);
  return pkg;
}
