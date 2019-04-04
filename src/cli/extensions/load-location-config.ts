import { GluegunToolbox } from 'gluegun';

import { AirdropOptions } from '../../lib/';

export interface AirdropToolbox extends GluegunToolbox {
  semver: null;
  system: null;
  prompt: null;
  http: null;
  template: null;
  patching: null;
  airdrop: AirdropOptions;
};

export default (toolbox: GluegunToolbox) => {
  const { parameters: { options }, config, filesystem, runtime: { brand } } = toolbox;

  options.force = options.force || false;
  options.optimize = options.optimize || false;

  const local = config.loadConfig(brand, filesystem.cwd());

  const airdropConfig: AirdropOptions = {
    ...config.airdrop,
    ...local,
    ...options
  };

  toolbox.airdrop = config.airdrop = airdropConfig;
}