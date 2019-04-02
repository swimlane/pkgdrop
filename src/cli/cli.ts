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
    .command({
      name: 'add-bundle',
      alias: ['ab'],
      run: async toolbox => {
        const { parameters: { string } } = toolbox;
        await cli.run(`a ${string}`);
        await cli.run(`b ${string}`);
      }
    })
    .create();

  // and run it
  const toolbox = await cli.run(argv);

  // send it back (for testing, mostly)
  return toolbox;
}
