import { readImportmap, writeImportmap, mergeImportmaps } from '../../lib/';
import { AirdropToolbox } from '../extensions/load-location-config';
import { getMap, addPackages, bundlePackages, cleanPackagePath } from '../shared';

export default {
  name: 'add',
  alias: ['a'],
  description: 'Adds new package(s) from npm',
  hidden: true,
  dashed: false,
  run: async (toolbox: AirdropToolbox) => {
    const { parameters, print, timer, filesystem, getAirdropOptions } = toolbox;
    const time = timer.start();

    const options = await getAirdropOptions();

    if (options.clean) cleanPackagePath(options);

    const packages = parameters.array.filter(Boolean);

    if (packages.length) {
      print.info(`Reading existing importmap`);
      const inputImportmap = await readImportmap(options);
      const map = await getMap(packages, inputImportmap, options);

      let addedImportmap = await addPackages(map, options);

      if (options.bundle) {
        addedImportmap = await bundlePackages(packages, mergeImportmaps(inputImportmap, addedImportmap), options);
      }

      if (Object.keys(addedImportmap.imports).length > 0 || Object.keys(addedImportmap.scopes).length > 0) {
        print.success(`Writing importmap`);
        await writeImportmap(mergeImportmaps(inputImportmap, addedImportmap), options);
      } else {
        print.warning(`No changes to importmap`);
      }
    } else {
      print.info(`No packages specified`);
    }

    time.done();
  }
};

