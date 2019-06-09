import { join } from 'path';

import * as execa from 'execa';
import { existsAsync, readAsync, removeAsync, dir } from 'fs-jetpack';
import * as short from 'short-uuid';
import * as stripANSI from 'strip-ansi';

import { run } from '../src/cli/cli';

const binFile = join(__dirname, '../bin/pkgdrop');

export async function execPkgdrop(command: string) {
  const commands = command.split(' ');
  let result: any;
  try {
    result = await execa(binFile, [...commands, '--no-color']);
  } catch (e) {
    result = e;
  }
  return result.stdout.trim().replace(/\[.*s\]$/g, '[XX s]');
}

const { log, warn, error } = global.console;

export async function createSandbox() {
  const cwd = join(__dirname, `__tempdir__/test-${short.generate()}/`);
  await dir(cwd);
  process.chdir(cwd);

  return {
    exists(filename: string) {
      return existsAsync(join(cwd, filename));
    },
    read(filename: string) {
      return readAsync(join(cwd, filename))
    },
    clean() {
      return removeAsync(cwd);
    },
    async exec(command: string) {
      const commands = command.split(' ');
      let result: any;
      const logSpy = [];
      global.console.log = global.console.log = global.console.warn = (...args) => logSpy.push(args);
      try {
        process.chdir(cwd);
        await run(commands);
        result = logSpy.join('\n'); // await execa(binFile, [...commands, '--no-color']);
      } catch (e) {
        // noop
      }
      result = logSpy.join('\n');
      Object.assign(global.console, {
        log,
        warn,
        error
      });
      return stripANSI(result).trim().replace(/\[.*s\]$/g, '[XX s]');
    }
  }
}
