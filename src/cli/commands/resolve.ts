import { manifest, extract } from 'pacote';
import { join } from 'path';

import { PackageInfo } from '../../lib/';
import { AirdropToolbox } from '../extensions/load-location-config';

export default {
  name: 'resolve',
  alias: ['r'],
  description: 'Prints the resolved url for a package',
  hidden: false,
  dashed: false,
  run: async (toolbox: AirdropToolbox) => {
    const { parameters, print, airdrop } = toolbox;

    const packages = parameters.array.filter(Boolean);

    for (const pkg of packages) {
      const pkgInfo: PackageInfo = await manifest(pkg, {
        'full-metadata': true
      });

      // TODO: Check import map and file system
   
      const pkgId = `${pkgInfo.name}@${pkgInfo.version}`;
      const entryPoint = pkgInfo.module || pkgInfo.main || 'index.js';
      const outputPath = join(airdrop.package_root, pkgId, entryPoint);

      print.info(outputPath);
    }
  }
};
