import { GluegunToolbox } from 'gluegun';

export default (toolbox: GluegunToolbox) => {
  const { print, system } = toolbox;

  toolbox.timer = {
    start () {
      const timer = system.startTimer();
      return {
        /* istanbul ignore next */ 
        done(msg = 'Done!') {
          const elapsed = (timer() / 1000).toFixed(2);
          const time = print.colors.muted(`[${elapsed} s]`);
          print.success(`${msg} ${time}\n`);
          process.exitCode = 0;
        },
        /* istanbul ignore next */
        fail( msg = 'Error!') {
          const elapsed = (timer() / 1000).toFixed(2);
          const time = print.colors.muted(`[${elapsed} s]`);
          print.error(`${msg} ${time}\n`);
          process.exitCode = 1;
        }
      }
    }
  }
}