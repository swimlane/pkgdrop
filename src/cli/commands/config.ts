import { AirdropToolbox } from '../extensions/load-location-config';

export default {
  name: 'config',
  alias: ['c'],
  description: 'Dispays current configuration',
  hidden: false,
  dashed: false,
  run: async (toolbox: AirdropToolbox) => {
    const { print, getAirdropOptions } = toolbox;
    const options = await getAirdropOptions();
    print.info(JSON.stringify(options, null, 2));
  }
};