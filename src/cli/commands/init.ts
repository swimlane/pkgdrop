import { GluegunToolbox } from 'gluegun';
import * as cosmiconfig from 'cosmiconfig';
import { dirname, join } from 'path';

import { writeImportmap } from '../../lib/';

export default {
  name: 'init',
  alias: ['i'],
  description: 'Adds a pkgdrop.config.js to the current directory',
  hidden: false,
  dashed: false,
  run: async (toolbox: GluegunToolbox) => {
    const { print, filesystem, timer, getPkgdropOptions, prompt, runtime: { brand } } = toolbox;
    const time = timer.start();

    const options = await getPkgdropOptions();
    const configPath = filesystem.path(options.config || 'pkgdrop.config.js');

    const config = {
      package_path: './-/',
      package_root: '/-/',
    };

    try {
      // load current config, if it exists
      const res = await cosmiconfig(brand).load(configPath);
      Object.assign(config, res.config);
    } catch (e) {
      // noop
    }

    let code;
    if (!options.y) {  // prompt user for config values
      print.info(`Let's walk through creating a pkgdrop.config.json file.`);

      const askPath = {
        type: 'input',
        name: 'package_path',
        initial: config.package_path,
        message: 'Package path: '
      };

      const askRoot = {
        type: 'input',
        name: 'package_root',
        initial: config.package_root,
        message: 'Package root: '
      };

      const response = await prompt.ask([askPath, askRoot]);

      // Overwrite existing
      Object.assign(config, response);
      
      code = 'module.exports = ' + JSON.stringify(config, null, 2);

      print.newline();
      print.info(code);

      const askOk: any = {
        name: 'ok',
        type: 'confirm',
        initial: true,
        message: 'Is thsi OK?'
      };

      const { ok } = await prompt.ask(askOk);

      if (Boolean(ok) === false) {
        print.warning('Aborting');
        return;
      }
    } else {
      code = 'module.exports = ' + JSON.stringify(config, null, 2);
    }

    print.info(`Writing pkgdrop.config.js`);
    await filesystem.writeAsync(configPath, code);

    // tslint:disable-next-line:variable-name
    const package_path = join(dirname(configPath), config.package_path);
    await filesystem.dirAsync(package_path);

    // write importmap if none exists already
    const importmapPath = filesystem.path(package_path, 'importmap.json');
    if (!(await filesystem.existsAsync(importmapPath))) {
      const importmap = {
        imports: {},
        scopes: {}
      };

      print.success(`Writing importmap`);
      await writeImportmap(importmap, { package_path });
    }

    time.done();
  }
};

