import { join } from 'path';

import * as execa from 'execa';
import { existsAsync, readAsync, removeAsync, dir } from 'fs-jetpack';
import * as short from 'short-uuid';

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
    }
  }
}
