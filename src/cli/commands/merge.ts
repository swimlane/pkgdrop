import * as tar from 'tar';

import { AirdropToolbox } from '../extensions/load-location-config';
import { readImportmap, writeImportmap, mergeImportmaps } from '../../lib/';
import { cleanPackagePath } from '../shared';

const stream = require('stream');

class CollectStream extends stream.Transform {
  private _chunks: Uint8Array[] = [];

  _transform(chunk: Uint8Array, enc: never, cb: any) {
    this._chunks.push(chunk);
    cb();
  }

  collect() {
    return Buffer.concat(this._chunks);
  }
}

export default {
  name: 'merge',
  alias: ['m'],
  description: 'Unpacks a tarball to the putput directory, merging the existing import map.',
  hidden: false,
  dashed: false,
  run: async (toolbox: AirdropToolbox) => {
    const { parameters, print, timer, filesystem, getAirdropOptions } = toolbox;
    const time = timer.start();

    const options = await getAirdropOptions();
    const inputImportmap = await readImportmap(options);
    const file = parameters.array[0];

    if (options.clean) cleanPackagePath(options);

    filesystem.dir(options.package_path);

    print.info(`Extracting ${file}`);

    const cs = new CollectStream();
    await tar.extract({
      gzip: true,
      file,
      cwd: options.package_path,
      transform: (entry: tar.ReadEntry) => {
        if (entry.path === './importmap.json') {
          entry.absolute = '/dev/null';
          return cs;
        }
        return false;
      }
    });

    const addedImportmap = JSON.parse(cs.collect().toString('utf8'));

    print.success(`Writing importmap`);
    await writeImportmap(mergeImportmaps(inputImportmap, addedImportmap), options);

    time.done();
  }
};
