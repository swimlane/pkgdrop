import { createSandbox } from './cli.util';
import * as nock from 'nock';

nock.disableNetConnect();

describe('init', () => {
  let output: string;
  let sandbox: any;

  beforeAll(async () => {
    sandbox = await createSandbox();
    output = await sandbox.exec(`init -y`);
  });

  afterAll(async () => {
    await sandbox.clean();
  });

  test('displays console messages', () => {
    expect(output).toMatchSnapshot();
  });

  test('files exist', async () => {
    expect(await sandbox.exists('pkgdrop.config.js')).toBe('file');
    expect(await sandbox.exists('-/')).toBe('dir');
    expect(await sandbox.exists('-/importmap.json')).toBe('file');
  });

  test('file content', async () => {
    expect(await sandbox.read('-/importmap.json')).toMatchSnapshot();
    expect(await sandbox.read('pkgdrop.config.js')).toMatchSnapshot();
  });
});
