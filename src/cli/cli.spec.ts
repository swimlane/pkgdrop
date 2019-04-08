import { system } from 'gluegun/system';
import { join } from 'path';
import * as jetpack from 'fs-jetpack';

const colorsRe = /[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g;
const doneRe = /\[.*s\]\n$/g;

const testDir = join(process.cwd(), '/test');
const testPath = join(testDir, '-/');
const binFile = join(process.cwd(), '/bin/airdrop');

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
      const version = await system.exec(`${binFile} --version`);
      expect(version.replace(colorsRe, '')).toBe('1.0.0');
    });

    test('displays help', async () => {
      const version = await system.exec(`${binFile} --help`);
      expect(version.replace(colorsRe, '')).toContain('airdrop version 1.0.0');
    });
  });

  describe('init', () => {
    let output;

    beforeAll(async () => {
      output = await system.exec(`${binFile} init`);
      output = output.replace(colorsRe, '').replace(doneRe, '');
    });

    test('displays console messages', async () => {
      expect(output).toMatchSnapshot();
    });

    test('files exist', async () => {
      expect(await jetpack.exists(join(testDir, 'airdrop.config.js'))).toBe('file');
    });

    test('can\'t init again', async () => {
      const out = await system.exec(`${binFile} init`);
      expect(out).toContain('airdrop.config.js already exists at');
      expect(out).toContain('skipping');
    });
  });

  describe('add', () => {
    let output;

    beforeAll(async () => {
      output = await system.exec(`${binFile} add lit-element@2.1.0`);
      output = output.replace(colorsRe, '').replace(doneRe, '');
    });

    test('displays console messages', async () => {
      expect(output).toMatchSnapshot();
    });

    test('files exist', async () => {
      expect(await jetpack.exists(join(testPath, 'lit-element@2.1.0'))).toBe('dir');
      expect(await jetpack.exists(join(testPath, 'lit-html@1.0.0'))).toBe('dir');
      expect(await jetpack.exists(join(testPath, 'importmap.json'))).toBe('file');
    });

    test('importmap', async () => {
      expect(await jetpack.readAsync(join(testPath, 'importmap.json'))).toMatchSnapshot();
    });

    test('can\t add again', async () => {
      const out = await system.exec(`${binFile} add lit-element@2.1.0`);
      expect(out).toContain('Package lit-element@2.1.0 already exists, skipping');
    });

    test('can force', async () => {
      let out = await system.exec(`${binFile} add lit-element@2.1.0 --force`);
      out = output.replace(colorsRe, '').replace(doneRe, '');
      expect(out).toMatchSnapshot();
    });
  });

  describe('resolve', () => {
    test('displays console messages', async () => {
      let output = await system.exec('../bin/airdrop resolve lit-element@2.1.0');
      output = output.replace(colorsRe, '').replace(doneRe, '');
      expect(output).toMatchSnapshot();
    });

    test('displays console messages', async () => {
      // Later this should fail if version is not installed
      let output = await system.exec(`${binFile} resolve lit-element@1.0.0`);
      output = output.replace(colorsRe, '').replace(doneRe, '');
      expect(output).toMatchSnapshot();
    });
  });

  describe('bundle', () => {
    let output;

    beforeAll(async () => {
      output = await system.exec(`${binFile} bundle lit-element@2.1.0`);
      output = output.replace(colorsRe, '').replace(doneRe, '');
    });

    test('displays console messages', async () => {
      expect(output).toMatchSnapshot();
    });

    test('files exist', async () => {
      expect(await jetpack.exists(join(testPath, 'lit-element@2.1.0.bundle.js'))).toBe('file');
    });

    test('can\'t bundle again', async () => {
      const out = await system.exec(`${binFile} bundle lit-element@2.1.0`);
      expect(out).toContain('Bundle already exists at');
      expect(out).toContain('skipping');
    });

    test('can force', async () => {
      let out = await system.exec(`${binFile} bundle lit-element@2.1.0 --force`);
      out = output.replace(colorsRe, '').replace(doneRe, '');
      expect(out).toMatchSnapshot();
    });
  });
});