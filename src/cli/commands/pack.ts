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

    const options = await getAirdropOptions();
    const file = `airdrop-${new Date().toISOString()}.tgz`;

    print.info(`writing ${file}`)
    await tar.create({
      gzip: true,
      file,
      cwd: options.package_path
    }, ['.']);

    time.done();
  }
};
