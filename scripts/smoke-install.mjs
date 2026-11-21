import { execFile, spawn } from 'node:child_process';
import { mkdtemp, mkdir, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';
import { generate, hosts, install } from './adapters.mjs';

const execute = promisify(execFile);
const ompProvider = fileURLToPath(new URL('../tests/fixtures/omp-provider.ts', import.meta.url));
// No prompt or turn request is sent: these probes only ask hosts for metadata.
function exchange(binary, args, { cwd, env, initial, receive, timeout = 30000 }) {
  return new Promise((resolve) => {
    const child = spawn(binary, args, { cwd, env, stdio: ['pipe', 'pipe', 'pipe'] });
    let stdout = '';
    let stderr = '';
    let buffer = '';
    let finished = false;
    let outcome;
    let killTimer;
    const finish = (result) => {
      if (finished) return;
      finished = true;
      outcome = result;
      clearTimeout(timer);
      child.kill('SIGTERM');
      killTimer = setTimeout(() => child.kill('SIGKILL'), 2000);
    };
    const send = (frame) => child.stdin.write(`${JSON.stringify(frame)}\n`);
    const timer = setTimeout(() => finish({ status: 'unavailable', reason: 'Discovery timed out' }), timeout);
    child.on('error', (error) => finish({ status: 'unavailable', reason: error.message }));
    child.stdin.on('error', () => {});
    child.stderr.on('data', (chunk) => { stderr += chunk; });
    child.stdout.on('data', (chunk) => {
      stdout += chunk;
      buffer += chunk;
      while (buffer.includes('\n')) {
        const end = buffer.indexOf('\n');
        const line = buffer.slice(0, end);
        buffer = buffer.slice(end + 1);
        let frame;
        try { frame = JSON.parse(line); } catch { continue; }
        const result = receive?.(frame, send);
        if (result) finish(result);
      }
    });
    child.on('close', (code) => {
      clearTimeout(timer);
      clearTimeout(killTimer);
      resolve({ ...(outcome ?? { status: 'unavailable', reason: `Exited before discovery (code ${code})` }), stdout, stderr });
    });
    child.on('spawn', () => { for (const frame of initial ?? []) send(frame); });
  });
}

function namesResult(names) {
  const missing = ['ud', 'ultradesign'].filter((name) => !names.includes(name));
  return missing.length
    ? { status: 'failed', reason: `Missing entries: ${missing.join(', ')}`, names }
    : { status: 'discovered', names };
}

async function probe(host, context, extra = []) {
  if (host === 'omp') {
    return exchange('omp', [
      '--mode', 'rpc', '--no-ui', '--no-session', '--no-lsp', '--no-title', '--offline',
      '-e', ompProvider, '--model', 'ultradesign-local/builder', ...extra,
    ], {
      ...context,
      env: { ...context.env, ULTRADESIGN_TEST_URL: 'http://127.0.0.1:1/v1' },
      initial: [{ id: 'discovery', type: 'get_available_commands' }],
      receive: (frame) => frame.id === 'discovery' && frame.command === 'get_available_commands'
        ? namesResult((frame.data?.commands ?? []).map((command) => command.name))
        : undefined,
    });
  }
  if (host === 'codex') {
    return exchange('codex', ['app-server', '--listen', 'stdio://'], {
      ...context,
      initial: [{ jsonrpc: '2.0', id: 1, method: 'initialize', params: { clientInfo: { name: 'ultradesign-smoke', version: '0.1.0' } } }],
      receive: (frame, send) => {
        if (frame.id === 1 && frame.result) {
          send({ jsonrpc: '2.0', method: 'initialized' });
          send({ jsonrpc: '2.0', id: 2, method: 'skills/list', params: { cwds: [context.cwd], forceReload: true } });
        }
        if (frame.id === 2) {
          if (frame.error) return { status: 'unavailable', reason: JSON.stringify(frame.error) };
          return namesResult((frame.result?.data ?? []).flatMap((entry) => entry.skills ?? []).map((skill) => skill.name));
        }
      },
    });
  }
  if (host === 'claude') {
    return exchange('claude', ['--print', '--input-format', 'stream-json', '--output-format', 'stream-json', '--verbose', '--no-session-persistence', '--strict-mcp-config', '--mcp-config', '{"mcpServers":{}}'], {
      ...context,
      initial: [{ type: 'control_request', request_id: 'discovery', request: { subtype: 'initialize' } }],
      receive: (frame) => {
        if (frame.type !== 'control_response' || frame.response?.request_id !== 'discovery') return;
        const response = frame.response;
        if (response.subtype === 'error') return { status: 'unavailable', reason: response.error };
        return namesResult((response.response?.commands ?? []).map((command) => command.name));
      },
    });
  }
  if (host === 'antigravity') {
    return exchange('agy', ['acp', '--stdio', '--disable-telemetry'], {
      ...context,
      timeout: 15000,
      initial: [{ jsonrpc: '2.0', id: 1, method: 'initialize', params: { protocolVersion: 1, clientCapabilities: {} } }],
      receive: (frame, send) => {
        if (frame.id === 1 && frame.result) {
          send({ jsonrpc: '2.0', id: 2, method: 'session/new', params: { cwd: context.cwd, mcpServers: [] } });
        }
        if ((frame.id === 1 || frame.id === 2) && frame.error) {
          return { status: 'unavailable', reason: frame.error.message ?? JSON.stringify(frame.error) };
        }
        const update = frame.params?.update;
        if (frame.method === 'session/update' && update?.sessionUpdate === 'available_commands_update') {
          return namesResult(update.availableCommands.map((command) => command.name));
        }
      },
    });
  }
  return { status: 'unavailable', reason: 'No local host discovery probe available; file placement is checked separately.' };
}

const selected = process.argv.slice(2);
if (selected.some((host) => !hosts.includes(host))) {
  throw new Error(`Usage: node scripts/smoke-install.mjs [${hosts.join('|')}] ...`);
}
const temporary = await mkdtemp(path.join(tmpdir(), 'ultradesign-smoke-'));
try {
  const reports = [];
  for (const host of selected.length ? selected : hosts) {
    for (const scope of ['project', 'user']) {
      const base = path.join(temporary, `${host}-${scope}`);
      const home = path.join(base, 'home');
      const cwd = path.join(base, 'project');
      await mkdir(home, { recursive: true });
      await mkdir(cwd, { recursive: true });
      if (host === 'codex') await mkdir(path.join(home, '.codex'));
      // An allowlist avoids inheriting credentials, gateway endpoints, custom host
      // roots, plugin settings, and provider environment variables.
      const env = {
        PATH: process.env.PATH,
        HOME: home,
        USERPROFILE: home,
        XDG_CONFIG_HOME: path.join(home, '.config'),
        XDG_CACHE_HOME: path.join(home, '.cache'),
        XDG_DATA_HOME: path.join(home, '.local/share'),
        CODEX_HOME: path.join(home, '.codex'),
        CLAUDE_CONFIG_DIR: path.join(home, '.claude'),
        PI_CODING_AGENT_DIR: path.join(home, '.omp/agent'),
        TERM: 'dumb',
        NO_COLOR: '1',
        DISABLE_AUTOUPDATER: '1',
      };
      const placement = await install(host, { scope, cwd, home });
      const discovery = await probe(host, { cwd, env });
      reports.push({ host, scope, placement, discovery });
      if (host === 'antigravity' && scope === 'project') {
        const outDir = path.join(base, 'dist');
        await generate('antigravity', { outDir });
        let validation;
        try {
          const { stdout, stderr } = await execute('agy', ['plugin', 'validate', path.join(outDir, 'antigravity'), '--json'], { cwd, env, timeout: 30000 });
          validation = { status: 'validated', stdout, stderr };
        } catch (error) {
          validation = { status: error.code === 'ENOENT' ? 'unavailable' : 'failed', reason: error.message, stdout: error.stdout, stderr: error.stderr };
        }
        reports.push({ host, scope: 'plugin validation (not native discovery)', discovery: validation });
      }
      if (host === 'omp' && scope === 'project') {
        const outDir = path.join(base, 'dist');
        await generate('omp', { outDir });
        const explicit = await probe(host, { cwd, env }, ['--no-extensions', '-e', path.join(outDir, 'omp')]);
        reports.push({ host, scope: 'explicit -e', discovery: explicit });
      }
    }
  }
  console.log(JSON.stringify({
    reports,
    gap: 'Discovery does not prove model execution or argument expansion. No provider requests, auth changes, or gateway configuration are performed.',
  }, null, 2));
  if (reports.some((report) => report.discovery.status === 'failed')) process.exitCode = 1;
} finally {
  await rm(temporary, { recursive: true, force: true });
}
