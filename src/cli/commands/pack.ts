import * as tar from 'tar';

import { AirdropToolbox } from '../extensions/load-location-config';

export default {
  name: 'pack',
  alias: ['p'],
  description: 'Create a tarball from the out directory',
  hidden: false,
  dashed: false,
  run: async (toolbox: AirdropToolbox) => {
    const { parameters, print, timer, getAirdropOptions } = toolbox;
    const time = timer.start();

    const file = parameters.array.filter(Boolean)[0] || `airdrop-${new Date().toISOString()}.tgz`;
    const options = await getAirdropOptions();

    print.info(`Writing ${file}`)
    await tar.create({
      gzip: true,
      file,
      cwd: options.package_path
    }, ['.']);

    time.done();
  }
};
