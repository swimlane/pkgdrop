import { GluegunToolbox } from 'gluegun';
import * as cosmiconfig from 'cosmiconfig';

export default {
  name: 'init',
  alias: ['i'],
  description: 'Adds a airdrop.config.js to the current directory',
  hidden: false,
  dashed: false,
  run: async (toolbox: GluegunToolbox) => {
    const { print, filesystem, timer, getAirdropOptions, prompt } = toolbox;
    const time = timer.start();

    const options = await getAirdropOptions();
    const configPath = filesystem.path(options.config || 'airdrop.config.js');

    const config = {
      package_path: './-/',
      package_root: '/-/',
    };

    try {
      const res = await cosmiconfig().load(configPath);
      Object.assign(config, res.config);
    } catch (e) {
      // noop
    }

    let code;
    if (!options.y) {
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
      Object.assign(config, response);
      
      code = 'module.exports = ' + JSON.stringify(config, null, 2);

      print.newline();
      print.info(code);
      if (await toolbox.prompt.confirm('Is this OK?') === false) {
        print.warning('Aborting');
        return;
      }
    } else {
      code = 'module.exports = ' + JSON.stringify(config, null, 2);
    }

    print.info(`Writing airdrop.config.js`);
    await filesystem.writeAsync(configPath, code);

    time.done();
  }
};

