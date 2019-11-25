import { createSandbox } from './cli.util';

const TIMEOUT = 100000;

describe('add', () => {
  let output: string;
  let sandbox: any;

  beforeAll(async () => {
    sandbox = await createSandbox();
    await sandbox.exec(`init -y`);
    output = await sandbox.exec(`add lit-element@2.1.0 --clean`);
  }, TIMEOUT);

  afterAll(async () => {
    await sandbox.clean();
  });

  afterEach(()=> {
    process.exitCode = null;
  });

  test('displays console messages', async () => {
    expect(output).toMatchSnapshot();
    expect(process.exitCode).toBeFalsy();
  });

  test('files exist', async () => {
    expect(await sandbox.exists('-/lit-element@2.1.0')).toBe('dir');
    expect(await sandbox.exists('-/lit-html@1.1.2')).toBe('dir');  // Note: changes to latest v1
    expect(await sandbox.exists('-/importmap.json')).toBe('file');
  });

  test('importmap', async () => {
    expect(await sandbox.read('-/importmap.json')).toMatchSnapshot();
  });

  test(`can't add again`, async () => {
    const out = await sandbox.exec(`add lit-element@2.1.0`);
    expect(out).toContain('Package lit-element@2.1.0 already exists, skipping');
    expect(process.exitCode).toBeFalsy();
  });

  test('can force', async () => {
    const out = await sandbox.exec(`add lit-element@2.1.0 --force`);
    expect(out).toMatchSnapshot();
    expect(process.exitCode).toBeFalsy();
  });

  test('fail on missing package', async () => {
    const out = await sandbox.exec(`add @swimlane/pkgdrop@0.0.0`);
    expect(out).toMatchSnapshot();
    expect(process.exitCode).toBeTruthy(); // exit code 1
  });

  test('can force skip on missing packages', async () => {
    const out = await sandbox.exec(`add @swimlane/pkgdrop@0.0.0 --force`);
    expect(out).toMatchSnapshot();
    expect(process.exitCode).toBeFalsy();
  });

  test('can clean', async () => {
    const out = await sandbox.exec(`add lit-html@1.1.0 --clean`);
    expect(out).toMatchSnapshot();
    expect(await sandbox.exists('-/lit-element@2.1.0')).toBe(false);
    expect(await sandbox.exists('-/lit-html@1.1.0')).toBe('dir');
    expect(await sandbox.exists('-/importmap.json')).toBe('file');
    expect(process.exitCode).toBeFalsy();
  });

  test('importmap should add latest as major', async () => {
    await sandbox.exec(`add lit-html@1.1.0 --clean`);
    await sandbox.exec(`add lit-html@1.0.0`);
    let importmap: any = await sandbox.read('-/importmap.json');
    importmap = JSON.parse(importmap);
    expect(importmap.imports['lit-html@1']).toBe('/-/lit-html@1.1.0/lit-html.js');
    expect(process.exitCode).toBeFalsy();
  }, TIMEOUT);

  test('prints messages for peers', async () => {
    const out = await sandbox.exec(`add @angular/core@7.0.0 --clean --dry`);
    expect(out).toMatchSnapshot();
    expect(process.exitCode).toBeFalsy();
  });

  test('prints messages when no packages sepecified', async () => {
    const out = await sandbox.exec(`add`);
    expect(out).toContain('No packages specified');
    expect(process.exitCode).toBeFalsy();
  });
});
