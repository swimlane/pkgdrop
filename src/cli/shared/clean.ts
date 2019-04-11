import { print, filesystem } from 'gluegun'; 

import { AirdropOptions } from '../../lib/';

export async function cleanPackagePath(options: AirdropOptions) {
  const p = filesystem.path(options.package_path);
  if (p) {
    print.info(`Cleaning output directory`);
    await filesystem.remove(p);
  }
}