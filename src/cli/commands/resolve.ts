import { manifest } from 'pacote';

import { PackageInfo, readImportmap, createResolver } from '../../lib/';
import { AirdropToolbox } from '../extensions/load-location-config';

export default {
  name: 'resolve',
  alias: ['r'],
  description: 'Prints the resolved url for a package',
  hidden: false,
  dashed: false,
  run: async (toolbox: AirdropToolbox) => {
    const { parameters, print, getAirdropOptions } = toolbox;

    const options = await getAirdropOptions();

    const packages = parameters.array.filter(Boolean);

    // TODO: Check file system?
    const { imports } = await readImportmap(options);
    const resolveId = createResolver(imports);    

    for (const pkg of packages) {
      const pkgInfo: PackageInfo = await manifest(pkg);
      const pkgId = `${pkgInfo.name}@${pkgInfo.version}`;
      const res = resolveId(pkgId);

      if (!res) {
        print.warning('Not found!');
        return;
      }

      print.info(res);
    }
  }
};
