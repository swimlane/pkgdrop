import { build, GluegunToolbox } from 'gluegun';

/**
 * Create the cli and kick it off
 */
export async function run(argv?: string[] | string): Promise<GluegunToolbox> {
  // create a CLI runtime
  const cli = build('airdrop')
    .src(__dirname)
    .help()
    .version()
    .exclude([
      'semver',
      'system', 
      'prompt',
      'http',
      'template',
      'patching'
    ])
    .defaultCommand({
      run: async ({ print: { info }, meta: { version }, runtime: { brand } }: GluegunToolbox) => {
        info(`${brand} version ${version()}`)
        info(``)
        info(`  Type ${brand} --help for more info`)
      }
    })
    .create();

  return cli.run(argv);
}
