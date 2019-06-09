import { createSandbox } from './cli.util';
import * as nock from 'nock';

const TIMEOUT = 100000;

describe('pack', () => {
  let sandbox: any;
  let output: string;

  beforeAll(async () => {
    sandbox = await createSandbox();
    await sandbox.exec(`init -y`);
    await sandbox.exec(`add lit-element@2.0.0 --clean`);
    nock.disableNetConnect();
    output = await sandbox.exec(`pack pkgdrop-pack-test.tgz`);
  }, TIMEOUT);

  afterAll(async () => {
    await sandbox.clean();
  }, TIMEOUT);

  test('displays console messages', () => {
    expect(output).toMatchSnapshot();
  });

  test('files exist', async () => {
    expect(await sandbox.exists('pkgdrop-pack-test.tgz')).toBe('file');
  });

  test('importmap', async () => {
    expect(await sandbox.read('-/importmap.json')).toMatchSnapshot();
  });

  describe('merge', () => {
    beforeAll(async () => {
      await sandbox.exec(`add lit-element@2.1.0 --clean`);
      output = await sandbox.exec(`merge pkgdrop-pack-test.tgz`);
    }, TIMEOUT);

    test('displays console messages', () => {
      expect(output).toMatchSnapshot();
    });

    test('files', async () => {
      expect(await sandbox.exists('-/lit-element@2.1.0')).toBe('dir');
      expect(await sandbox.exists('-/lit-element@2.0.0')).toBe('dir');
    });

    test('importmap', async () => {
      expect(await sandbox.read('-/importmap.json')).toMatchSnapshot();
    });
  });

  test('dryrun', async () => {
    await sandbox.clean();
    sandbox = await createSandbox();
    nock.enableNetConnect();
    await sandbox.exec(`add lit-element@2.0.0 --clean`);
    nock.disableNetConnect();
    output = await sandbox.exec(`pack pkgdrop-pack-test.tgz --dry`);
    expect(output).toMatchSnapshot();
    expect(await sandbox.exists('pkgdrop-pack-test.tgz')).toBe(false);
  });
});