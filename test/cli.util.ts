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
      const logSpy = jest.spyOn(console, 'log').mockImplementation(() => ({}));
      try {
        process.chdir(cwd);
        await run(commands);
      } catch (e) {
        // noop
      }
      const calls = logSpy.mock.calls;
      logSpy.mockRestore();
      return stripANSI(calls.join('\n')).trim().replace(/\[.*s\]$/g, '[XX s]');
    }
  }
}
