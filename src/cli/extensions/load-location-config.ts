import { GluegunToolbox } from 'gluegun';

export default (toolbox: GluegunToolbox) => {
  const { config, filesystem, runtime: { brand } } = toolbox;

  const local = config.loadConfig(brand, filesystem.cwd());

  Object.assign(config.airdrop, local);
}