import { lstat, mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import { homedir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const hosts = ['omp', 'claude', 'codex', 'antigravity', 'opencode', 'cursor', 'gemini'];
const repository = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const json = (value) => `${JSON.stringify(value, null, 2)}\n`;

async function tree(directory, prefix = '') {
  const files = new Map();
  for (const entry of (await readdir(directory, { withFileTypes: true })).sort((a, b) => a.name < b.name ? -1 : a.name > b.name ? 1 : 0)) {
    const name = path.posix.join(prefix, entry.name);
    if (entry.isDirectory()) {
      for (const pair of await tree(path.join(directory, entry.name), name)) files.set(...pair);
    } else if (entry.isFile()) {
      files.set(name, await readFile(path.join(directory, entry.name)));
    } else {
      throw new Error(`Unsupported source entry: ${path.join(directory, entry.name)}`);
    }
  }
  return files;
}

function requireHost(host) {
  if (!hosts.includes(host)) throw new Error(`Unknown host: ${host}. Choose ${hosts.join(', ')}.`);
}

export async function adapterFiles(host, { root = repository } = {}) {
  requireHost(host);
  const { name: packageName, version, description } = JSON.parse(await readFile(path.join(root, 'package.json'), 'utf8'));
  const files = new Map();
  const internal = host === 'gemini' || host === 'opencode';
  const skillName = internal ? 'ultradesign-workflow' : 'ultradesign';
  for (const [name, bytes] of await tree(path.join(root, 'skills/ultradesign'))) {
    const content = name === 'SKILL.md' && internal
      ? bytes.toString().replace(/^name: ultradesign\r?$/m, `name: ${skillName}`)
      : bytes;
    files.set(`skills/${skillName}/${name}`, content);
  }
  const pointer = `../skills/${skillName}/SKILL.md`;
  const command = `---\ndescription: Run the Ultradesign workflow\n---\n\nRead [the canonical Ultradesign workflow](${pointer}) relative to this command file. Start or resume the user's task from its recorded stage, keeping explicit human decisions at each taste gate.\n\nUser task: $ARGUMENTS\n`;
  if (host === 'omp') {
    files.set('package.json', json({
      name: packageName, version, type: 'module',
      omp: { extensions: ['./adapters/omp/index.ts'], skills: ['./skills'] },
    }));
    for (const [name, bytes] of await tree(path.join(root, 'adapters/omp'))) {
      files.set(`adapters/omp/${name}`, bytes);
    }
  } else if (host === 'claude') {
    files.set('commands/ud.md', command);
  } else if (internal) {
    for (const name of ['ud', 'ultradesign']) {
      files.set(`commands/${name}.${host === 'gemini' ? 'toml' : 'md'}`, host === 'gemini'
        ? `description = "Run the Ultradesign workflow"\nprompt = """\nRead the installed ultradesign-workflow SKILL.md and resolve its resources relative to that skill directory. Start or resume at the recorded stage, keeping explicit human decisions at each taste gate.\n\nUser task: {{args}}\n"""\n`
        : command);
    }
  } else {
    files.set('skills/ud/SKILL.md', '---\nname: ud\ndescription: Run the human-guided Ultradesign workflow.\n---\n\nRead [the canonical Ultradesign workflow](../ultradesign/SKILL.md) relative to this skill directory. Carry the current user task through its recorded stage and wait for explicit human decisions at taste gates. Preserve the complete task, including spaces, quotes, and non-English text.\n');
  }
  if (host === 'antigravity') {
    files.set('plugin.json', json({ name: packageName, version, description, skills: './skills/' }));
  }
  if (host === 'gemini') {
    files.set('gemini-extension.json', json({ name: packageName, version }));
  }
  return new Map([...files].sort(([a], [b]) => a < b ? -1 : a > b ? 1 : 0));
}

async function existing(filename) {
  try { return await lstat(filename); }
  catch (error) { if (error.code === 'ENOENT') return null; throw error; }
}

async function guardParents(filename) {
  for (let parent = path.dirname(filename); ; parent = path.dirname(parent)) {
    const stat = await existing(parent);
    if (stat && (!stat.isDirectory() || stat.isSymbolicLink())) {
      throw new Error(`Installation path is not a real directory: ${parent}`);
    }
    if (path.dirname(parent) === parent) return;
  }
}

async function place(files, destination) {
  // Preflight the entire transaction before writing any package-owned files.
  const pending = [];
  for (const [relative, content] of files) {
    const filename = path.join(destination, relative);
    await guardParents(filename);
    const stat = await existing(filename);
    if (stat) {
      if (!stat.isFile() || stat.isSymbolicLink() || !(await readFile(filename)).equals(Buffer.from(content))) {
        throw new Error(`Refusing to overwrite differing existing file: ${filename}`);
      }
    } else {
      pending.push([filename, content]);
    }
  }
  for (const [filename, content] of pending) {
    await mkdir(path.dirname(filename), { recursive: true });
    await writeFile(filename, content, { flag: 'wx' });
  }
  return { destination, written: pending.length, reused: files.size - pending.length };
}

export async function generate(host = 'all', { root = repository, outDir = path.join(root, 'dist') } = {}) {
  const selected = host === 'all' ? hosts : [host];
  const results = [];
  for (const name of selected) results.push(await place(await adapterFiles(name, { root }), path.join(outDir, name)));
  return results;
}

export function installDirectory(host, scope, { cwd = process.cwd(), home = homedir() } = {}) {
  requireHost(host);
  if (!['project', 'user'].includes(scope)) throw new Error('Explicit --scope project|user is required.');
  const roots = scope === 'project'
    ? { omp: '.omp/extensions/ultradesign', claude: '.claude', codex: '.agents', antigravity: '.agents', opencode: '.opencode', cursor: '.cursor', gemini: '.gemini' }
    : { omp: '.omp/agent/extensions/ultradesign', claude: '.claude', codex: '.agents', antigravity: '.gemini/config', opencode: '.config/opencode', cursor: '.cursor', gemini: '.gemini' };
  return path.resolve(scope === 'project' ? cwd : home, roots[host]);
}

export async function install(host, { scope, cwd, home, root = repository } = {}) {
  const destination = installDirectory(host, scope, { cwd, home });
  const files = await adapterFiles(host, { root });
  // Native file installations are not plugin installations.
  files.delete('plugin.json');
  files.delete('gemini-extension.json');
  return place(files, destination);
}

export async function main(args = process.argv.slice(2)) {
  const [action, host, ...options] = args;
  if (action === 'generate' && options.length === 0) return generate(host ?? 'all');
  if (action === 'generate' && options.length === 2 && options[0] === '--out' && options[1] && !options[1].startsWith('--')) {
    return generate(host, { outDir: path.resolve(options[1]) });
  }
  if (action === 'install' && host && options.length === 2 && options[0] === '--scope') {
    return install(host, { scope: options[1] });
  }
  throw new Error('Usage: node scripts/adapters.mjs generate [host|all] [--out DIRECTORY]\n       node scripts/adapters.mjs install <host> --scope project|user');
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().then((result) => console.log(json(result).trimEnd())).catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  });
}
