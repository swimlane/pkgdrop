import { join } from 'path';
import { removeAsync, existsAsync, readAsync } from 'fs-jetpack';
import * as execa from 'execa';
import * as pkg from '../package.json';

const testDir = join(process.cwd(), '/test');
const testPath = join(testDir, '-/');
const binFile = join(process.cwd(), '/bin/pkgdrop');

async function execPkgdrop(command: string) {
  const commands = command.split(' ');
  let result: any;
  try {
    result = await execa(binFile, [...commands, '--no-color']);
  } catch (e) {
    result = e;
  }
  return result.stdout.trim().replace(/\[.*s\]$/g, '[XX s]');
}

async function existsPkgdrop(filename: string) {
  return existsAsync(join(testPath, filename));
}

const TIMEOUT = 10000;

describe('cli tests', () => {
  beforeAll(async () => {
    process.chdir(testDir);
    if (await existsAsync(testPath)) {
      await removeAsync(testPath);
      await removeAsync(join(__dirname, 'pkgdrop.config.js'));
    }
  });

  describe('meta commands', () => {
    test('displays the version number', async () => {
      const out = await execPkgdrop(`version --offline`);
      expect(out).toBe(pkg.version);
    });

    test('displays help', async () => {
      const out = await execPkgdrop(`help --offline`);
      expect(out).toContain(`pkgdrop version ${pkg.version}`);
    });

    test('--clean', async () => {
      const out = await execPkgdrop(`--clean --offline`);
      expect(out).toContain('Cleaning output directory');
      expect(out).toContain('No packages specified');
      expect(await existsPkgdrop('importmap.json')).toBe(false);
    });
  });

  describe('init', () => {
    let output;

    beforeAll(async () => {
      output = await execPkgdrop(`init -y --offline`);
    });

    test('displays console messages', () => {
      expect(output).toMatchSnapshot();
    });

    test('files exist', async () => {
      expect(await existsAsync('pkgdrop.config.js')).toBe('file');
      expect(await existsAsync('-')).toBe('dir');
      expect(await existsAsync('-/importmap.json')).toBe('file');
    });

    test('file content', async () => {
      expect(await readAsync(join(testPath, 'importmap.json'))).toMatchSnapshot();
      expect(await readAsync(join(testDir, 'pkgdrop.config.js'))).toMatchSnapshot();
    });
  });

  describe('add', () => {
    let output;

    beforeAll(async () => {
      await execPkgdrop(`init -y --offline`);
      output = await execPkgdrop(`add lit-element@2.1.0 --clean`);
    }, TIMEOUT);

    test('displays console messages', async () => {
      expect(output).toMatchSnapshot();
    });

    test('files exist', async () => {
      expect(await existsPkgdrop('lit-element@2.1.0')).toBe('dir');
      expect(await existsPkgdrop('lit-html@1.1.0')).toBe('dir');
      expect(await existsPkgdrop('importmap.json')).toBe('file');
    });

    test('importmap', async () => {
      expect(await readAsync(join(testPath, 'importmap.json'))).toMatchSnapshot();
    });

    test('can\t add again', async () => {
      const out = await execPkgdrop(`add lit-element@2.1.0`);
      expect(out).toContain('Package lit-element@2.1.0 already exists, skipping');
    });

    test('can force', async () => {
      const out = await execPkgdrop(`add lit-element@2.1.0 --force`);
      expect(out).toMatchSnapshot();
    });

    test('fail on missing package', async () => {
      const out = await execPkgdrop(`add @swimlane/pkgdrop@0.0.0`);
      expect(out).toMatchSnapshot();
    });

    test('can force skip on missing packages', async () => {
      const out = await execPkgdrop(`add @swimlane/pkgdrop@0.0.0 --force`);
      expect(out).toMatchSnapshot();
    });

    test('can clean', async () => {
      const out = await execPkgdrop(`add lit-html@1.1.0 --clean`);
      expect(out).toMatchSnapshot();
      expect(await existsPkgdrop('lit-element@2.1.0')).toBe(false);
      expect(await existsPkgdrop('lit-html@1.1.0')).toBe('dir');
      expect(await existsPkgdrop('importmap.json')).toBe('file');
    });

    test('importmap should add latest as major', async () => {
      await execPkgdrop(`add lit-html@1.1.0 --clean`);
      await execPkgdrop(`add lit-html@1.0.0`);
      let importmap: any = await readAsync(join(testPath, 'importmap.json'));
      importmap = JSON.parse(importmap);
      expect(importmap.imports['lit-html@1']).toBe('/-/lit-html@1.1.0/lit-html.js');
    });

    test('prints messages for peers', async () => {
      const out = await execPkgdrop(`add @angular/core --clean --dry`);
      expect(out).toMatchSnapshot();
    });
  });

  describe('add --bundle', () => {
    let output;

    beforeAll(async () => {
      output = await execPkgdrop(`add lit-element@2.1.0 --clean --bundle`);
    }, TIMEOUT);

    test('displays console messages', () => {
      expect(output).toMatchSnapshot();
    });

    test('files exist', async () => {
      expect(await existsPkgdrop('lit-element@2.1.0.bundle.js')).toBe('file');
      expect(await existsPkgdrop('importmap.json')).toBe('file');
    });

    test('importmap', async () => {
      expect(await readAsync(join(testPath, 'importmap.json'))).toMatchSnapshot();
    });

    test('can\'t bundle again', async () => {
      const out = await execPkgdrop(`bundle lit-element@2.1.0 --offline`);
      expect(out).toContain('Bundle already exists');
      expect(out).toContain('skipping');
    }, 30000);

    test('can force', async () => {
      const out = await execPkgdrop(`bundle lit-element@2.1.0 --force --offline`);
      expect(out).toMatchSnapshot();
    }, TIMEOUT);
  });

  describe('resolve', () => {
    beforeAll(async () => {
      await execPkgdrop(`add lit-html@1.1.0`);
      await execPkgdrop(`add lit-element@2.1.0 --bundle`);
    }, TIMEOUT);

    test('displays resolved path', async () => {
      const out = await execPkgdrop(`resolve lit-html@1.1.0 --offline`);
      expect(out).toEqual('/-/lit-html@1.1.0/lit-html.js');
    });

    test('displays not found when not added', async () => {
      const out = await execPkgdrop(`resolve lit-element@1.1.0 --offline`);
      expect(out).toEqual('Not found!');
    });

    test('resolves to the bundle', async () => {
      const out = await execPkgdrop(`resolve lit-element@2.1.0 --offline`);
      expect(out).toEqual('/-/lit-element@2.1.0.bundle.js');
    });
  });

  describe('pack', () => {
    let output;

    beforeAll(async () => {
      await execPkgdrop(`add lit-element@2.0.0 --clean`);
      output = await execPkgdrop(`pack pkgdrop-pack-test.tgz`);
    }, TIMEOUT);

    afterAll(async () => {
      await removeAsync(`pkgdrop-pack-test.tgz`);
    }, TIMEOUT);

    test('displays console messages', async () => {
      expect(output).toMatchSnapshot();
    });

    test('files exist', async () => {
      expect(await existsAsync('pkgdrop-pack-test.tgz')).toBe('file');
    });

    test('importmap', async () => {
      expect(await readAsync(join(testPath, 'importmap.json'))).toMatchSnapshot();
    });

    describe('merge', () => {
      beforeAll(async () => {
        await execPkgdrop(`add lit-element@2.1.0 --clean`);
        output = await execPkgdrop(`merge pkgdrop-pack-test.tgz`);
      }, TIMEOUT);

      test('displays console messages', () => {
        expect(output).toMatchSnapshot();
      });

      test('files', async () => {
        expect(await existsPkgdrop('lit-element@2.1.0')).toBe('dir');
        expect(await existsPkgdrop('lit-element@2.0.0')).toBe('dir');
      });

      test('importmap', async () => {
        expect(await readAsync(join(testPath, 'importmap.json'))).toMatchSnapshot();
      });
    });
  });
});