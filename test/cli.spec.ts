import { system } from 'gluegun/system';
import { join } from 'path';
import * as jetpack from 'fs-jetpack';

const testDir = join(process.cwd(), '/test');
const testPath = join(testDir, '-/');
const binFile = join(process.cwd(), '/bin/airdrop');

async function execAirdrop(command: string) {
  const output = await system.exec(`${binFile} ${command} --no-color`);
  return output.replace(/\[.*s\]\n$/g, '');  // remove run duration
}

function existsAirdrop(filename: string) {
  return jetpack.exists(join(testPath, filename));
}

const TIMEOUT = 10000;

describe('cli tests', () => {
  beforeAll(async () => {
    process.chdir(testDir);
    if (jetpack.exists(testPath)) {
      await jetpack.remove(testPath);
      await jetpack.remove(join(__dirname, 'airdrop.config.js'));
    }
  });

  describe('meta commands', () => {
    test('displays the version number', async () => {
      const out = await execAirdrop(`version --offline`);
      expect(out).toBe('1.0.0');
    });

    test('displays help', async () => {
      const out = await execAirdrop(`help --offline`);
      expect(out).toContain('airdrop version 1.0.0');
    });

    test('--clean', async () => {
      const out = await execAirdrop(`--clean --offline`);
      expect(out).toContain('Cleaning output directory');
      expect(out).toContain('No packages specified');
      expect(await existsAirdrop('importmap.json')).toBe(false);
    });
  });

  describe('init', () => {
    let output;

    beforeAll(async () => {
      output = await execAirdrop(`init -y --offline`);
    });

    test('displays console messages', () => {
      expect(output).toMatchSnapshot();
    });

    test('files exist', async () => {
      expect(await jetpack.exists('airdrop.config.js')).toBe('file');
      expect(await jetpack.exists('-')).toBe('dir');
      expect(await jetpack.exists('-/importmap.json')).toBe('file');
    });

    test('file content', async () => {
      expect(await jetpack.readAsync(join(testPath, 'importmap.json'))).toMatchSnapshot();
      expect(await jetpack.readAsync(join(testDir, 'airdrop.config.js'))).toMatchSnapshot();
    });
  });

  describe('add', () => {
    let output;

    beforeAll(async () => {
      await execAirdrop(`init -y --offline`);
      output = await execAirdrop(`add lit-element@2.1.0 --clean`);
    }, TIMEOUT);

    test('displays console messages', async () => {
      expect(output).toMatchSnapshot();
    });

    test('files exist', async () => {
      expect(await existsAirdrop('lit-element@2.1.0')).toBe('dir');
      expect(await existsAirdrop('lit-html@1.0.0')).toBe('dir');
      expect(await existsAirdrop('importmap.json')).toBe('file');
    });

    test('importmap', async () => {
      expect(await jetpack.readAsync(join(testPath, 'importmap.json'))).toMatchSnapshot();
    });

    test('can\t add again', async () => {
      const out = await execAirdrop(`add lit-element@2.1.0`);
      expect(out).toContain('Package lit-element@2.1.0 already exists, skipping');
    });

    test('can force', async () => {
      const out = await execAirdrop(`add lit-element@2.1.0 --force`);
      expect(out).toMatchSnapshot();
    });

    test('can clean', async () => {
      const out = await execAirdrop(`add lit-html@1.0.0 --clean`);
      expect(out).toMatchSnapshot();
      expect(await existsAirdrop('lit-element@2.1.0')).toBe(false);
      expect(await existsAirdrop('lit-html@1.0.0')).toBe('dir');
      expect(await existsAirdrop('importmap.json')).toBe('file');
    });
  });

  describe('add --bundle', () => {
    let output;

    beforeAll(async () => {
      output = await execAirdrop(`add lit-element@2.1.0 --clean --bundle`);
    }, TIMEOUT);

    test('displays console messages', () => {
      expect(output).toMatchSnapshot();
    });

    test('files exist', async () => {
      expect(await existsAirdrop('lit-element@2.1.0.bundle.js')).toBe('file');
      expect(await existsAirdrop('importmap.json')).toBe('file');
    });

    test('importmap', async () => {
      expect(await jetpack.readAsync(join(testPath, 'importmap.json'))).toMatchSnapshot();
    });

    test('can\'t bundle again', async () => {
      const out = await execAirdrop(`bundle lit-element@2.1.0 --offline`);
      expect(out).toContain('Bundle already exists');
      expect(out).toContain('skipping');
    }, 30000);

    test('can force', async () => {
      const out = await execAirdrop(`bundle lit-element@2.1.0 --force --offline`);
      expect(out).toMatchSnapshot();
    }, TIMEOUT);
  });

  describe('resolve', () => {
    beforeAll(async () => {
      await execAirdrop(`add lit-html@1.0.0`);
      await execAirdrop(`add lit-element@2.1.0 --bundle`);
    }, TIMEOUT);

    test('displays resolved path', async () => {
      const out = await execAirdrop(`resolve lit-html@1.0.0 --offline`);
      expect(out).toEqual('/-/lit-html@1.0.0/lit-html.js');
    });

    test('displays not found when not added', async () => {
      const out = await execAirdrop(`resolve lit-element@1.0.0 --offline`);
      expect(out).toEqual('Not found!');
    });

    test('resolves to the bundle', async () => {
      const out = await execAirdrop(`resolve lit-element@2.1.0 --offline`);
      expect(out).toEqual('/-/lit-element@2.1.0.bundle.js');
    });
  });
});