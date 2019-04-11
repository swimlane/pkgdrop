import { readImportmap, writeImportmap, mergeImportmaps } from '../../lib/';
import { AirdropToolbox } from '../extensions/load-location-config';
import { getMap, addPackages, bundlePackages } from '../shared';

export default {
  name: 'config',
  alias: ['c'],
  description: 'Dispays current config',
  hidden: true,
  dashed: false,
  run: async (toolbox: AirdropToolbox) => {
    const { print, getAirdropOptions } = toolbox;
    const options = await getAirdropOptions();
    print.info(JSON.stringify(options, null, 2));
  }
};