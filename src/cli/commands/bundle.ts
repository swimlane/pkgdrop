import { readImportmap, writeImportmap  } from '../../lib/';
import { AirdropToolbox } from '../extensions/load-location-config';
import { bundlePackages } from '../shared';

export default {
  name: 'bundle',
  alias: ['b'],
  description: 'Bundles an existing package',
  hidden: false,
  dashed: false,
  run: async (toolbox: AirdropToolbox) => {
    const { parameters, print, airdrop, timer } = toolbox;
    const time = timer.start();

    const packages = parameters.array.filter(Boolean);

    print.info(`Reading existing importmap`);
    const importmap = await readImportmap(airdrop);

    const { imports } = await bundlePackages(packages, importmap, airdrop);
    Object.assign(importmap.imports, imports);

    print.success(`Writing importmap`);
    await writeImportmap(importmap, airdrop);

    time.done();
  }
};


