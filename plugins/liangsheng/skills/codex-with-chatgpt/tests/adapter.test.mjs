import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { PIN, stateDirectory, configFile, readConfig, validateCliArgs, verifyOwner, runCli } from '../scripts/c2c-adapter.mjs';

const temp = fs.mkdtempSync(path.join(process.env.C2C_TEST_ROOT || os.tmpdir(), 'ls-c2c-test-'));
const workspace = path.join(temp, 'task space');
const stateDir = path.join(temp, 'actual-state');
const componentRoot = path.join(temp, 'fake-component');
fs.mkdirSync(workspace); fs.mkdirSync(path.join(componentRoot, 'bin'), { recursive: true });
fs.writeFileSync(path.join(componentRoot, 'bin', 'c2c.js'), 'console.log(JSON.stringify({args:process.argv.slice(2),state:process.env.C2C_STATE_DIR,cwd:process.cwd()}));');
test.after(() => fs.rmSync(temp, { recursive: true, force: true }));

test('state directory matches upstream Windows convention and explicit override', () => {
  assert.equal(stateDirectory({ LOCALAPPDATA: 'C:\\real profile\\Local' }, 'win32'), path.join('C:\\real profile\\Local', 'codex-with-chatgpt'));
  assert.equal(stateDirectory({ C2C_STATE_DIR: stateDir }, 'win32'), stateDir);
});
test('configuration stays outside plugin and rejects unvalidated version', () => {
  const file = path.join(temp, 'config.json');
  assert.equal(configFile({ LIANGSHENG_C2C_CONFIG: file }), file);
  fs.writeFileSync(file, JSON.stringify({ schema: 1, commit: 'old', componentRoot, stateDir }));
  assert.throws(() => readConfig(file), /版本不兼容/);
  assert.throws(() => readConfig(path.resolve(import.meta.dirname, '..', 'local-config.json')), /不能保存/);
  fs.writeFileSync(file, JSON.stringify({ schema: 1, commit: PIN, componentRoot, stateDir }));
  assert.equal(readConfig(file).stateDir, stateDir);
});
test('driver forbids upstream update, Project workflow and workspace argument injection', () => {
  for (const args of [['update'], ['session', 'set', '--mode', 'project'], ['session', 'set', '--protocol-state', 'DONE'],
    ['session', 'set', '--mode', 'long-chat', '--url', 'https://chatgpt.com/c/example'],
    ['status', '--workspace=other'], ['status', '-wother'], ['prefs', 'set', '--setup-mode=manual'], ['tunnel', 'choose', '--mode', 'named']]) {
    assert.throws(() => validateCliArgs(args));
  }
  validateCliArgs(['session', 'get', '--json']);
  validateCliArgs(['tunnel', 'choose', '--mode', 'quick', '--json']);
});
test('read-only status runs with explicit canonical workspace and configured state, without lock', () => {
  const result = runCli({ componentRoot, stateDir }, workspace, null, ['status', '--json']);
  assert.equal(result.status, 0);
  const received = JSON.parse(result.stdout);
  assert.equal(received.state, stateDir);
  assert.equal(received.cwd, fs.realpathSync(workspace));
  assert.deepEqual(received.args, ['status', '--json', '--workspace', fs.realpathSync(workspace)]);
});
test('session inspection does not need owner and never rewrites upstream conversation', () => {
  const result = runCli({ componentRoot, stateDir }, workspace, null, ['session', 'get', '--json']);
  assert.equal(result.status, 0);
  assert.deepEqual(JSON.parse(result.stdout).args, ['session', 'get', '--json', '--workspace', fs.realpathSync(workspace)]);
  assert.throws(() => runCli({ componentRoot, stateDir }, workspace, null, ['session', 'set', '--url', 'https://chatgpt.com/c/example']));
});
test('maintenance uses the existing Python lock layout and refuses other owners', () => {
  const real = fs.realpathSync(workspace);
  const normalized = process.platform === 'win32' ? real.toLowerCase() : real;
  const digest = createHash('sha256').update(normalized).digest('hex');
  const lock = path.join(stateDir, 'liangsheng-advisor', digest + '.json');
  assert.throws(() => runCli({ componentRoot, stateDir }, workspace, null, ['setup', '--json']), /共享锁/);
  fs.mkdirSync(path.dirname(lock), { recursive: true });
  fs.writeFileSync(lock, JSON.stringify({ owner: 'another-window' }));
  assert.throws(() => verifyOwner(workspace, stateDir, 'this-window'), /未持有/);
  fs.writeFileSync(lock, JSON.stringify({ owner: 'this-window' }));
  const result = runCli({ componentRoot, stateDir }, workspace, 'this-window', ['setup', '--json']);
  assert.equal(result.status, 0);
  assert.deepEqual(JSON.parse(result.stdout).args, ['setup', '--json', '--workspace', real]);
});
