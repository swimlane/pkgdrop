import * as jetpack from 'fs-jetpack';

export interface PackageInfo {
  name: string;
  version: string;
  module?: string;
  browser?: string;
  main?: string;
}

export async function getLocalManifest(pkg: string, options: any): Promise<PackageInfo> {
  const filepath = jetpack.path(options.package_path, pkg, 'package.json');
  return jetpack.read(filepath, 'json')
}