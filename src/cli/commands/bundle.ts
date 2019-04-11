import { readImportmap, writeImportmap  } from '../../lib/';
import { AirdropToolbox } from '../extensions/load-location-config';
import { bundlePackages } from '../shared';

export default {
  name: 'bundle',
  alias: ['b'],
  description: 'Bundles existing package(s)',
  hidden: false,
  dashed: false,
  run: async (toolbox: AirdropToolbox) => {
    const { parameters, print, timer, getAirdropOptions } = toolbox;
    const time = timer.start();

    const options = await getAirdropOptions();

    const packages = parameters.array.filter(Boolean);

    print.info(`Reading existing importmap`);
    const importmap = await readImportmap(options);

    const { imports } = await bundlePackages(packages, importmap, options);
    Object.assign(importmap.imports, imports);

    print.success(`Writing importmap`);
    await writeImportmap(importmap, options);

    time.done();
  }
};


