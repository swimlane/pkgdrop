import { PkgdropToolbox } from '../extensions/load-location-config';

export default {
  name: 'config',
  alias: ['c'],
  description: 'Dispays current configuration',
  hidden: false,
  dashed: false,
  run: async (toolbox: PkgdropToolbox) => {
    const { print, getPkgdropOptions } = toolbox;
    const options = await getPkgdropOptions();
    print.info(JSON.stringify(options, null, 2));
  }
};