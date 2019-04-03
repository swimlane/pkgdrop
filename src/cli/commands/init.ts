import { GluegunToolbox } from 'gluegun';

export default {
  name: 'init',
  alias: ['i'],
  description: 'Adds a airdrop.config.js to the cwd',
  hidden: false,
  dashed: false,
  run: async (toolbox: GluegunToolbox) => {
    const { parameters, print, filesystem, timer } = toolbox;
    const time = timer.start();

    const force = parameters.options.force || false;

    const configPath = filesystem.path('airdrop.config.js');

    if (!force && filesystem.exists(configPath)) {
      print.warning(`airdrop.config.js already exists at ${filesystem.cwd()}, skipping`);
    } else {
      const code = 'module.exports = {\npackage_path: \'./-/\',\npackage_root: \'/-/\'\n}';
      print.info(`Writing airdrop.config.js`);
      await filesystem.writeAsync(configPath, code);      
    }

    time.done();
  }
};

