import { readImportmap, writeImportmap, mergeImportmaps, getMajorVersions, ImportMap } from '../../lib/';
import { PkgdropToolbox } from '../extensions/load-location-config';
import { getMap, addPackages, bundlePackages, cleanPackagePath } from '../shared';

export default {
  name: 'add',
  alias: ['a'],
  description: 'Adds new package(s) from npm',
  hidden: true,
  dashed: false,
  run: async (toolbox: PkgdropToolbox) => {
    const { parameters, print, timer, getPkgdropOptions } = toolbox;
    const time = timer.start();

    const options = await getPkgdropOptions();

    if (options.clean) cleanPackagePath(options);

    const packages = parameters.array.filter(Boolean);

    if (packages.length) {
      print.info(`Reading existing importmap`);
      const inputImportmap = await readImportmap(options);

      let map: ImportMap;
      try {
        map = await getMap(packages, inputImportmap, options);
      } catch (e) {
        time.fail(e);
        return;
      }
      
      let addedImportmap = await addPackages(map, options);

      if (options.bundle) {
        addedImportmap = await bundlePackages(packages, mergeImportmaps(inputImportmap, addedImportmap), options);
      }

      if (Object.keys(addedImportmap.imports).length > 0 || Object.keys(addedImportmap.scopes).length > 0) {
        print.success(`Writing importmap`);
        const merged = mergeImportmaps(inputImportmap, addedImportmap);
        Object.assign(merged.imports, getMajorVersions(merged.imports));
        await writeImportmap(merged, options);
      } else {
        print.warning(`No changes to importmap`);
      }
    } else {
      print.info(`No packages specified`);
    }

    time.done();
  }
};

