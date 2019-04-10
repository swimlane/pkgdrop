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

describe('cli tests', () => {
  beforeAll(async () => {
    process.chdir(testDir);
    if (jetpack.exists(testPath)) {
      await jetpack.remove(testPath);
      await jetpack.remove(join(__dirname, 'airdrop.config.js'));
      return;
    }
  });

  describe('meta commands', () => {
    test('displays the version number', async () => {
      const out = await execAirdrop(`--version`);
      expect(out).toBe('1.0.0');
    });

    test('displays help', async () => {
      const out = await execAirdrop(`--help`);
      expect(out).toContain('airdrop version 1.0.0');
    });

    test('--clean', async () => {
      const out = await execAirdrop(`--clean`);
      expect(out).toContain('Cleaning output directory');
      expect(out).toContain('No packages specified');
      expect(await existsAirdrop('importmap.json')).toBe(false);
    });
  });

  describe('init', () => {
    let output;

    beforeAll(async () => {
      output = await execAirdrop(`init`);
    });

    test('displays console messages', async () => {
      expect(output).toMatchSnapshot();
    });

    test('files exist', async () => {
      expect(await jetpack.exists('airdrop.config.js')).toBe('file');
    });

    test('can\'t init again', async () => {
      const out = await execAirdrop(`init`);
      expect(out).toContain('airdrop.config.js already exists');
      expect(out).toContain('skipping');
    });
  });

  describe('add', () => {
    let output;

    beforeAll(async () => {
      await execAirdrop(`init`);
      output = await execAirdrop(`add lit-element@2.1.0 --clean`);
    });

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
      output = await execAirdrop(`add d3@5.9.2 --bundle`);
    }, 30000);

    test('displays console messages', () => {
      expect(output).toContain('Reading existing importmap');
      expect(output).toContain('Fetching package information for d3@5.9.2');
      expect(output).toContain('Bundling d3@5.9.2');
      expect(output).toContain('Writing importmap');
    });

    test('files exist', async () => {
      expect(await existsAirdrop('d3@5.9.2.bundle.js')).toBe('file');
      expect(await existsAirdrop('importmap.json')).toBe('file');
      // TODO: check importmap for deps
    });

    test('can\'t bundle again', async () => {
      const out = await execAirdrop(`bundle d3@5.9.2`);
      expect(out).toContain('Bundle already exists');
      expect(out).toContain('skipping');
    }, 30000);

    test('can force', async () => {
      const out = await execAirdrop(`bundle d3@5.9.2 --force`);
      expect(out).toMatchSnapshot();
    }, 30000);
  });

  describe('resolve', () => {
    beforeAll(async () => {
      await execAirdrop(`add lit-element@2.1.0`);
      await execAirdrop(`add d3@5.9.2 --bundle`);
    }, 10000);

    test('displays resolved path', async () => {
      const out = await execAirdrop(`resolve lit-element@2.1.0`);
      expect(out).toEqual('/-/lit-element@2.1.0/lit-element.js');
    });

    test('displays not found when not added', async () => {
      const out = await execAirdrop(`resolve lit-element@1.0.0`);
      expect(out).toEqual('Not found!');
    });

    test('resolves to the bundle', async () => {
      const out = await execAirdrop(`resolve d3@5.9.2`);
      expect(out).toEqual('/-/d3@5.9.2.bundle.js');
    });
  });
});