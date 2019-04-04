import { GluegunToolbox } from 'gluegun';

export default (toolbox: GluegunToolbox) => {
  const { parameters: { options }, config, filesystem, runtime: { brand } } = toolbox;

  options.force = options.force || false;
  options.optimize = options.optimize || false;

  const local = config.loadConfig(brand, filesystem.cwd());

  Object.assign(config.airdrop, options, local);
}