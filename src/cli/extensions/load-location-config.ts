import { GluegunToolbox } from 'gluegun';
import * as cosmiconfig from 'cosmiconfig'
import { dirname, join } from 'path';

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

interface CosmiConfig {
  filepath: string;
  config: AirdropOptions
}

export default async (toolbox: GluegunToolbox) => {
  const { parameters: { options }, config, filesystem, runtime: { brand } } = toolbox;

  options.force = options.force || false;
  options.optimize = options.optimize || false;
  options.optimize = options.bundle || false;

  toolbox.getAirdropOptions = async function  getAirdropOptions(): Promise<AirdropOptions> {
    const loader = cosmiconfig(brand);

    const local: CosmiConfig = options.config ?
      await loader.load(filesystem.path(options.config)) :
      await loader.search(brand, filesystem.cwd());

    // tslint:disable-next-line:variable-name
    const config_path = local ? local.filepath : undefined;

    if (local) {
      local.config.package_path = join(dirname(config_path), local.config.package_path);
    }

    return {
      ...config.airdrop,  // defaults
      ...(local ? local.config : undefined),    // local
      ...options,         // command line
      config_path
    };
  }
}