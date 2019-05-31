import { print, filesystem } from 'gluegun'; 

import { PkgdropOptions } from '../../lib/';

export async function cleanPackagePath(options: PkgdropOptions) {
  const p = filesystem.path(options.package_path);
  if (p) {
    if (options.dry) {
      print.info(`Cleaning output directory [dry run]`);
    } else {
      print.info(`Cleaning output directory`);
      await filesystem.remove(p);      
    }
  }
}