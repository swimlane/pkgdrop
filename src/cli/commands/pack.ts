import * as tar from 'tar';

import { PkgdropToolbox } from '../extensions/load-location-config';

export default {
  name: 'pack',
  alias: ['p'],
  description: 'Create a tarball from the out directory',
  hidden: false,
  dashed: false,
  run: async (toolbox: PkgdropToolbox) => {
    const { parameters, print, timer, getPkgdropOptions } = toolbox;
    const time = timer.start();

    const file = parameters.array.filter(Boolean)[0] || `pkgdrop-${new Date().toISOString()}.tgz`;
    const options = await getPkgdropOptions();

    print.info(`Writing ${file}`)
    await tar.create({
      gzip: true,
      file,
      cwd: options.package_path
    }, ['.']);

    time.done();
  }
};
