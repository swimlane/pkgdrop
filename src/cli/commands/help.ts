export default {
  name: 'help',
  alias: 'h',
  description: 'This help text',
  dashed: true,
  hidden: true,
  run: toolbox => {
    const { runtime: { brand }, print: { info, newline, printCommands } } = toolbox
    info(`${brand} version ${toolbox.meta.version()}`);
    newline();
    info(`  ${brand} [<@scope>/]<pkg>[@<version|range|tag>]`);
    newline();
    info('    aliases: add, a');
    info('    options: [--clean] [--force] [--bundle [--optimize]]');
    newline();
    info(`Other commands: ${brand} <command>`);
    printCommands(toolbox);
  }
}