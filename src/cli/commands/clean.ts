import { AirdropToolbox } from '../extensions/load-location-config';
import { cleanPackagePath } from '../shared';

export default {
  name: 'clean',
  description: 'Cleans the output directory',
  hidden: false,
  dashed: true,
  run: async (toolbox: AirdropToolbox) => {
    const { timer, getAirdropOptions } = toolbox;
    const time = timer.start();

    const options = await getAirdropOptions();
    await cleanPackagePath(options);

    time.done();
  }
};

