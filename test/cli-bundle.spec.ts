import { createSandbox } from './cli.util';
import * as nock from 'nock';

const TIMEOUT = 100000;

describe('bundle', () => {
  let output: string;
  let sandbox: any;

  beforeAll(async () => {
    sandbox = await createSandbox();
    await sandbox.exec(`init -y`);
    await sandbox.exec(`add lit-element@2.1.0 --clean`);
    nock.disableNetConnect();
    output = await sandbox.exec(`bundle lit-element@2.1.0`);
  }, TIMEOUT);

  afterAll(async () => {
    await sandbox.clean();
  });

  test('displays console messages', () => {
    expect(output).toMatchSnapshot();
  });

  test('files exist', async () => {
    expect(await sandbox.exists('-/lit-element@2.1.0.bundle.js')).toBe('file');
    expect(await sandbox.exists('-/importmap.json')).toBe('file');
  });

  test('importmap', async () => {
    expect(await sandbox.read('-/importmap.json')).toMatchSnapshot();
  });

  test('can\'t bundle again', async () => {
    const out = await sandbox.exec(`bundle lit-element@2.1.0`);
    expect(out).toContain('Bundle already exists');
    expect(out).toContain('skipping');
  }, 30000);

  test('can force', async () => {
    const out = await sandbox.exec(`bundle lit-element@2.1.0 --force`);
    expect(out).toMatchSnapshot();
  }, TIMEOUT);
});
