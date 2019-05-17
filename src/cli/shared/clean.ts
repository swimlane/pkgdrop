import { print, filesystem } from 'gluegun'; 

import { PkgdropOptions } from '../../lib/';

export async function cleanPackagePath(options: PkgdropOptions) {
  const p = filesystem.path(options.package_path);
  if (p) {
    print.info(`Cleaning output directory`);
    await filesystem.remove(p);
  }
}