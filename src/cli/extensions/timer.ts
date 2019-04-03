import { GluegunToolbox } from 'gluegun';

export default (toolbox: GluegunToolbox) => {
  const { print } = toolbox;

  toolbox.timer = {
    start () {
      const startTime = Date.now();
      return {
        done(msg = 'Done!') {
          const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);
          const time = print.colors.muted(`[${elapsed}s]`);
          print.success(`${msg} ${time}\n`);
        }
      }
    }
  }
}