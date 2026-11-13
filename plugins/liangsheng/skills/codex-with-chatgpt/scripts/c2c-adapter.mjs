#!/usr/bin/env node
// Liangsheng owns the driver; only the pinned upstream CLI is reused.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

export const PIN = '535a07dbb7aee887924c53767d985c09d405319d';
export const SOURCE = 'https://github.com/XiaoDuoYa/codex-with-chatgpt.git';
const PNM = '11.24.0';
const skillRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

export function stateDirectory(env = process.env, platform = process.platform) {
  if (env.C2C_STATE_DIR?.trim()) return path.resolve(env.C2C_STATE_DIR);
  if (platform === 'win32') return path.join(env.LOCALAPPDATA || path.join(os.homedir(), 'AppData', 'Local'), 'codex-with-chatgpt');
  if (platform === 'darwin') return path.join(os.homedir(), 'Library', 'Application Support', 'codex-with-chatgpt');
  return path.join(env.XDG_STATE_HOME || path.join(os.homedir(), '.local', 'state'), 'codex-with-chatgpt');
}

export function configFile(env = process.env) {
  if (env.LIANGSHENG_C2C_CONFIG) return path.resolve(env.LIANGSHENG_C2C_CONFIG);
  const base = process.platform === 'win32' ? env.LOCALAPPDATA || path.join(os.homedir(), 'AppData', 'Local')
    : process.platform === 'darwin' ? path.join(os.homedir(), 'Library', 'Application Support')
      : env.XDG_CONFIG_HOME || path.join(os.homedir(), '.config');
  return path.join(base, 'liangsheng', 'c2c', 'config.json');
}

function outsideSkill(candidate) {
  const relative = path.relative(path.resolve(skillRoot, '..', '..'), path.resolve(candidate));
  if (!relative || (!relative.startsWith('..' + path.sep) && relative !== '..' && !path.isAbsolute(relative))) {
    throw new Error('本机配置和组件状态不能保存到插件技能内');
  }
}

function execute(command, args, options = {}) {
  const result = spawnSync(command, args, { encoding: 'utf8', windowsHide: true, maxBuffer: 8 * 1024 * 1024, ...options });
  if (result.error) throw result.error;
  return result;
}

function checked(command, args, options = {}) {
  const result = execute(command, args, options);
  if (result.status !== 0) throw new Error(`${path.basename(command)} failed (${result.status}): ${result.stderr || result.stdout}`);
  return result.stdout.trim();
}

export function verifyComponent(componentRoot) {
  const root = fs.realpathSync(componentRoot);
  const actual = checked('git', ['-C', root, 'rev-parse', 'HEAD']);
  if (actual !== PIN) throw new Error(`底层版本未验收：${actual}；要求 ${PIN}，通过专门维护验证后才能更换固定提交`);
  if (checked('git', ['-C', root, 'status', '--porcelain', '--untracked-files=no'])) throw new Error('底层已修改，不能作为固定提交复用');
  const origin = checked('git', ['-C', root, 'remote', 'get-url', 'origin']);
  if (origin !== SOURCE && origin !== SOURCE.slice(0, -4)) throw new Error('底层来源不符');
  if (!fs.existsSync(path.join(root, 'dist', 'cli', 'index.js'))) throw new Error('底层尚未构建，运行 bootstrap 构建固定提交');
  return root;
}

export function readConfig(file = configFile()) {
  outsideSkill(file);
  if (!fs.existsSync(file)) return null;
  const config = JSON.parse(fs.readFileSync(file, 'utf8'));
  if (config.schema !== 1 || config.commit !== PIN || typeof config.componentRoot !== 'string' || typeof config.stateDir !== 'string'
      || !path.isAbsolute(config.componentRoot) || !path.isAbsolute(config.stateDir)) throw new Error('本机配置无效或版本不兼容；在维护窗口重新探测');
  outsideSkill(config.stateDir);
  return config;
}

export function discover(explicit) {
  const candidates = [explicit, process.env.LIANGSHENG_C2C_ROOT, path.join(path.dirname(configFile()), 'components', PIN),
    path.join(os.homedir(), 'codex-with-chatgpt')].filter(Boolean);
  const failures = [];
  for (const candidate of [...new Set(candidates)]) {
    if (!fs.existsSync(candidate)) continue;
    try { return verifyComponent(candidate); } catch (error) { failures.push(`${candidate}: ${error.message}`); }
  }
  throw new Error(`未发现已验证的底层组件。${failures.join('; ')} 使用 bootstrap 安装固定提交，或 init --component 指定实际位置。`);
}

function saveConfig(root, stateDir, file) {
  outsideSkill(file); outsideSkill(stateDir);
  const config = { schema: 1, commit: PIN, source: SOURCE, componentRoot: root, stateDir: path.resolve(stateDir), setupMode: 'auto', tunnelMode: 'quick' };
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, JSON.stringify(config, null, 2) + '\n', { mode: 0o600 });
  return config;
}

export function resolveConfig(file = configFile()) {
  const config = readConfig(file);
  if (!config) return { schema: 1, commit: PIN, source: SOURCE, componentRoot: discover(), stateDir: stateDirectory(), setupMode: 'auto', tunnelMode: 'quick' };
  verifyComponent(config.componentRoot);
  return config;
}

export function verifyOwner(workspace, stateDir, owner) {
  if (!owner) throw new Error('连接维护、配置和会话操作必须先取得共享锁并提供 --owner');
  const canonical = fs.realpathSync(workspace);
  const normalized = process.platform === 'win32' ? canonical.toLowerCase() : canonical;
  const digest = createHash('sha256').update(normalized).digest('hex');
  const lockFile = path.join(stateDir, 'liangsheng-advisor', digest + '.json');
  if (!fs.existsSync(lockFile) || JSON.parse(fs.readFileSync(lockFile, 'utf8')).owner !== owner) throw new Error('未持有当前工作区的共享锁');
}

export function validateCliArgs(args) {
  if (!args.length) throw new Error('run -- 后必须有底层命令');
  if (args.some(arg => /^-w|^--workspace(=|$)/.test(arg))) throw new Error('工作区仅通过适配器 --workspace 提供');
  const commands = ['status', 'start', 'setup', 'stop', 'restart', 'doctor', 'pair', 'unpair', 'prefs', 'tunnel', 'session', '--version', '--help'];
  if (!commands.includes(args[0])) throw new Error('未开放该底层命令；不得运行上游更新或技能安装流程');
  if (args[0] === 'prefs' && !['get', 'set'].includes(args[1])) throw new Error('prefs 只支持 get/set');
  if (args[0] === 'tunnel' && !['status', 'choose'].includes(args[1])) throw new Error('tunnel 只支持 status/choose');
  if (args[0] === 'tunnel' && args[1] === 'choose' && (args[args.indexOf('--mode') + 1] !== 'quick' || args.some(arg => arg.startsWith('--mode=')))) throw new Error('本驱动默认且仅配置临时地址 quick');
  if (args[0] === 'session') {
    if (args[1] !== 'get') throw new Error('session 只支持只读 get；顾问 URL 和凉笙状态留在任务记录，不改上游会话');
  }
  if (args[0] === 'prefs' && (args.some(arg => arg.startsWith('--setup-mode=')) || args.includes('--setup-mode') && args[args.indexOf('--setup-mode') + 1] !== 'auto')) throw new Error('本适配驱动使用自动配置 auto');
}

export function runCli(config, workspace, owner, args) {
  validateCliArgs(args);
  const root = fs.realpathSync(workspace);
  if (!fs.statSync(root).isDirectory()) throw new Error('工作区必须是实际存在的目录');
  const readonly = args[0] === 'status' || args[0] === '--version' || args[0] === '--help' || args[0] === 'prefs' && args[1] === 'get' || args[0] === 'session' && args[1] === 'get';
  if (!readonly) verifyOwner(root, config.stateDir, owner);
  return execute(process.execPath, [path.join(config.componentRoot, 'bin', 'c2c.js'), ...args, ...(args[0].startsWith('--') ? [] : ['--workspace', root])], {
    env: { ...process.env, C2C_STATE_DIR: config.stateDir }, cwd: root,
  });
}

function packageManager(installBase) {
  // Invoke JavaScript entries directly: avoids cmd.exe argument re-parsing on Windows.
  const local = path.join(installBase, 'tools', 'node_modules', 'pnpm', 'bin', 'pnpm.cjs');
  if (fs.existsSync(local) && checked(process.execPath, [local, '--version']) === PNM) return local;
  const npm = [path.join(path.dirname(process.execPath), 'node_modules', 'npm', 'bin', 'npm-cli.js'),
    path.join(path.dirname(process.execPath), '..', 'lib', 'node_modules', 'npm', 'bin', 'npm-cli.js')].find(p => fs.existsSync(p));
  if (!npm) throw new Error('固定提交构建需要 npm；请使用含 npm 的 Node.js >=20 后再次 bootstrap');
  checked(process.execPath, [npm, 'install', '--prefix', path.join(installBase, 'tools'), '--no-save', '--no-package-lock', '--ignore-scripts', `pnpm@${PNM}`], { timeout: 300000 });
  if (!fs.existsSync(local)) throw new Error('固定 pnpm 入口不存在');
  return local;
}

export function bootstrap(file = configFile(), stateDir = stateDirectory()) {
  outsideSkill(file); outsideSkill(stateDir);
  const base = path.dirname(file);
  const root = path.join(base, 'components', PIN);
  if (!fs.existsSync(root)) {
    fs.mkdirSync(path.dirname(root), { recursive: true });
    checked('git', ['clone', '--no-checkout', SOURCE, root], { timeout: 300000 });
    checked('git', ['-C', root, 'checkout', '--detach', PIN]);
  }
  if (checked('git', ['-C', root, 'rev-parse', 'HEAD']) !== PIN || checked('git', ['-C', root, 'status', '--porcelain', '--untracked-files=no'])) throw new Error('已有固定组件目录内容不符，未覆盖');
  const pm = packageManager(base);
  const pmEnv = { ...process.env, pnpm_config_manage_package_manager_versions: 'false' };
  checked(process.execPath, [pm, 'install', '--frozen-lockfile'], { cwd: root, env: pmEnv, timeout: 300000 });
  checked(process.execPath, [path.join(root, 'node_modules', 'typescript', 'bin', 'tsc'), '-p', 'tsconfig.json'], { cwd: root, timeout: 120000 });
  return saveConfig(verifyComponent(root), stateDir, file);
}

function argumentsFor(argv) {
  const split = argv.indexOf('--');
  const options = split === -1 ? argv : argv.slice(0, split);
  const cliArgs = split === -1 ? [] : argv.slice(split + 1);
  const action = options.shift();
  const parsed = {};
  for (let i = 0; i < options.length; i += 2) {
    if (options[i] === '--json') { i--; continue; }
    if (!['--config', '--component', '--state-dir', '--workspace', '--owner'].includes(options[i]) || !options[i + 1]) throw new Error('无效适配器参数');
    parsed[options[i].slice(2)] = options[i + 1];
  }
  return { action, parsed, cliArgs };
}

export function main(argv = process.argv.slice(2)) {
  const { action, parsed, cliArgs } = argumentsFor([...argv]);
  const file = path.resolve(parsed.config || configFile());
  let config;
  if (action === 'init') config = saveConfig(discover(parsed.component), parsed['state-dir'] || stateDirectory(), file);
  else if (action === 'bootstrap') config = bootstrap(file, parsed['state-dir'] || readConfig(file)?.stateDir || stateDirectory());
  else if (['resolve', 'check', 'run'].includes(action)) config = resolveConfig(file);
  else throw new Error('用法: c2c-adapter.mjs init|resolve|check|bootstrap|run [--config path] [--workspace path] [--owner id] -- <底层命令>');
  if (action === 'run') {
    if (!parsed.workspace || !path.isAbsolute(parsed.workspace)) throw new Error('必须显式提供 --workspace 绝对路径');
    const result = runCli(config, parsed.workspace, parsed.owner, cliArgs);
    process.stdout.write(result.stdout || ''); process.stderr.write(result.stderr || '');
    return result.status ?? 1;
  }
  process.stdout.write(JSON.stringify({ ok: true, configFile: file, ...config, checkout: config.componentRoot, node: process.execPath, lockRoot: path.join(config.stateDir, 'liangsheng-advisor') }) + '\n');
  return 0;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try { process.exitCode = main(); } catch (error) { process.stderr.write(JSON.stringify({ ok: false, error: error.message }) + '\n'); process.exitCode = 1; }
}
