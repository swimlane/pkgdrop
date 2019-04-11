import { GluegunToolbox } from 'gluegun';
import * as cosmiconfig from 'cosmiconfig';

import { AirdropOptions } from '../../lib/';

export interface AirdropToolbox extends GluegunToolbox {
  semver: null;
  system: null;
  prompt: null;
  http: null;
  template: null;
  patching: null;
  getAirdropOptions: () => Promise<AirdropOptions>;
};

export default async (toolbox: GluegunToolbox) => {
  const { parameters: { options }, config, filesystem, runtime: { brand } } = toolbox;

  options.force = options.force || false;
  options.optimize = options.optimize || false;
  options.optimize = options.bundle || false;

  toolbox.getAirdropOptions = async function  getAirdropOptions(): Promise<AirdropOptions> {
    let local: any = {};
    if (options.config) {
      const res = await cosmiconfig().load(filesystem.path(options.config));
      local = res.config;
    } else {
      local = config.loadConfig(brand, filesystem.cwd());
    }
  
    return {
      ...config.airdrop,  // defaults
      ...local,           // local
      ...options          // command line
    };
  }
}