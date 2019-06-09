import { createSandbox } from './cli.util';
import * as nock from 'nock';

const TIMEOUT = 100000;

describe('resolve', () => {
  let sandbox: any;

  beforeAll(async () => {
    sandbox = await createSandbox();
    await sandbox.exec(`init -y`);
    await sandbox.exec(`add lit-html@1.1.0`);
    await sandbox.exec(`add lit-element@2.1.0 --bundle`);
    nock.disableNetConnect();
  }, TIMEOUT);

  afterAll(async () => {
    await sandbox.clean();
  }, TIMEOUT);

  test('displays resolved path', async () => {
    const out = await sandbox.exec(`resolve lit-html@1.1.0`);
    expect(out).toEqual('/-/lit-html@1.1.0/lit-html.js');
  });

  test('displays not found when not added', async () => {
    const out = await sandbox.exec(`resolve lit-element@1.1.0`);
    expect(out).toEqual('Not found!');
  });

  test('resolves to the bundle', async () => {
    const out = await sandbox.exec(`resolve lit-element@2.1.0`);
    expect(out).toEqual('/-/lit-element@2.1.0.bundle.js');
  });
});