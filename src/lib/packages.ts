import * as jetpack from 'fs-jetpack';

export interface PackageInfo {
  name: string;
  version: string;
  module?: string;
  browser?: string;
  main?: string;
  dependencies: { [key: string] : string },
  peerDependencies: { [key: string] : string }
}

export async function getLocalManifest(pkg: string, { package_path }: { package_path: string }): Promise<PackageInfo> {
  const filepath = jetpack.path(package_path, pkg, 'package.json');
  return jetpack.read(filepath, 'json')
}