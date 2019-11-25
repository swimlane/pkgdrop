import { readImportmap, writeImportmap, getMajorVersions  } from '../../lib/';
import { PkgdropToolbox } from '../extensions/load-location-config';
import { bundlePackages } from '../shared';

export default {
  name: 'bundle',
  alias: ['b'],
  description: 'Bundles existing package(s)',
  hidden: true,
  dashed: false,
  run: async (toolbox: PkgdropToolbox) => {
    const { parameters, print, timer, getPkgdropOptions } = toolbox;
    const time = timer.start();

    const options = await getPkgdropOptions();

    const packages = parameters.array.filter(Boolean);

    print.info(`Reading existing importmap`);
    const importmap = await readImportmap(options);

    const { imports } = await bundlePackages(packages, importmap, options);

    print.success(`Writing importmap`);
    Object.assign(importmap.imports, imports);
    Object.assign(importmap.imports, getMajorVersions(importmap.imports));
    await writeImportmap(importmap, options);

    time.done();
  }
};


