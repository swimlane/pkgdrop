import { readImportmap, createResolver, expandLocalVersion } from '../../lib/';
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

    const { imports } = await readImportmap(options);
    const resolveId = createResolver(imports);    

    for (const pkg of packages) {
      const pkgId = await expandLocalVersion(pkg, imports);
      const res = pkgId && resolveId(pkgId);

      if (!res) {
        print.warning('Not found!');
        return;
      }

      print.info(res);
    }
  }
};
