import { manifest, extract } from 'pacote';
import { join } from 'path';

import { PackageInfo, readImportmap, Imports } from '../../lib/';
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
      const importmap = await readImportmap(airdrop);
   
      const pkgId = `${pkgInfo.name}@${pkgInfo.version}`;

      let res = resoleId(pkgId, importmap.imports);

      if (!res) {
        res = 'Not found!'
      }

      print.info(res);
    }
  }
};

function resoleId(id: string, scope: Imports) {
  const paths = Object.keys(scope).sort((a, b) => b.length - a.length);

  for (const s of paths) {
    if (id.startsWith(s)) {
      return id.replace(s, scope[s]);
    }
  }
}
