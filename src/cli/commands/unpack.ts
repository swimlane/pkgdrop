import * as tar from 'tar';

import { AirdropToolbox } from '../extensions/load-location-config';
import { cleanPackagePath } from '../shared';

export default {
  name: 'unpack',
  alias: ['u'],
  description: 'Unpacks a tarball to the output directory, overwriting the existing import map.',
  hidden: false,
  dashed: false,
  run: async (toolbox: AirdropToolbox) => {
    const { parameters, print, timer, filesystem, getAirdropOptions } = toolbox;
    const time = timer.start();

    const options = await getAirdropOptions();
    const file = parameters.array[0];

    if (options.clean) cleanPackagePath(options);

    filesystem.dir(options.package_path);

    print.info(`Extracting ${file}`)
    await tar.extract({
      gzip: true,
      file,
      cwd: options.package_path
    });

    time.done();
  }
};
