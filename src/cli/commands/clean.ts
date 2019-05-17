import { PkgdropToolbox } from '../extensions/load-location-config';
import { cleanPackagePath } from '../shared';

export default {
  name: 'clean',
  description: 'Cleans the output directory',
  hidden: false,
  dashed: true,
  run: async (toolbox: PkgdropToolbox) => {
    const { timer, getPkgdropOptions } = toolbox;
    const time = timer.start();

    const options = await getPkgdropOptions();
    await cleanPackagePath(options);

    time.done();
  }
};

