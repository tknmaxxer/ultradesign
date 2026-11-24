import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, mkdir, writeFile, rm, symlink } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { adapterFiles, generate, hosts, install, installDirectory, main } from '../scripts/adapters.mjs';

const surfaces = JSON.parse(await readFile(new URL('./fixtures/adapters-surfaces.json', import.meta.url), 'utf8'));
const canonical = await readFile(new URL('../skills/ultradesign/SKILL.md', import.meta.url), 'utf8');
const { version } = JSON.parse(await readFile(new URL('../package.json', import.meta.url), 'utf8'));
const normalized = (files) => [...files].map(([name, bytes]) => [name, bytes.toString()]);
async function sandbox(t) {
  const directory = await mkdtemp(path.join(tmpdir(), 'ultradesign-adapters-'));
  t.after(() => rm(directory, { recursive: true, force: true }));
  return directory;
}

for (const host of hosts) {
  test(`${host}: deterministic surfaces, canonical workflow, and native arguments`, async () => {
    const files = await adapterFiles(host);
    assert.deepEqual(normalized(files), normalized(await adapterFiles(host)));
    const internal = ['gemini', 'opencode'].includes(host);
    const name = internal ? 'ultradesign-workflow' : 'ultradesign';
    assert.equal(files.get(`skills/${name}/SKILL.md`).toString(), internal
      ? canonical.replace(/^name: ultradesign\r?$/m, 'name: ultradesign-workflow') : canonical);
    for (const relative of [
      'prompts/01-frame.md', 'prompts/02-references.md', 'prompts/03-interview.md',
      'prompts/04-system.md', 'prompts/05-catalog.md', 'prompts/06-map.md', 'prompts/07-generate.md',
      'prompts/08-visual-qa.md', 'prompts/09-motion.md', 'prompts/10-final.md', 'prompts/11-sharing.md',
      'scripts/reference-board', 'scripts/palette-board', 'scripts/design-tokens', 'scripts/design-lint',
      'scripts/a2ui-validate', 'scripts/hierarchy-check', 'scripts/screen-map',
      'assets/a2ui/v1_0/agent_to_renderer.json', 'assets/templates/guard/check.mjs',
      'assets/templates/interview-log.md', 'assets/templates/system-page/README.md',
    ]) assert.ok(files.has(`skills/${name}/${relative}`), `${host} bundle missing ${relative}`);
    const adapters = [...files.keys()].filter((file) => !file.startsWith(`skills/${name}/`) && !file.startsWith('adapters/omp/'));
    assert.deepEqual(adapters, surfaces[host]);
    for (const [filename, content] of files) {
      if (!filename.startsWith('commands/')) continue;
      const text = content.toString();
      if (host === 'gemini') {
        assert.match(text, /^description = "Run the Ultradesign workflow"\nprompt = """\n/);
        assert.match(text, /\n"""\n$/);
      } else {
        assert.match(text, /^---\ndescription: Run the Ultradesign workflow\n---\n/);
        assert.ok(text.includes(`../skills/${name}/SKILL.md`));
      }
      const token = host === 'gemini' ? '{{args}}' : '$ARGUMENTS';
      assert.ok(text.includes(token));
      assert.match(text, /explicit human decisions/);
      const task = 'review "quoted screen" 한글  spacing';
      assert.ok(text.replace(token, task).includes(task));
      assert.ok(!text.includes('!{'));
    }
    if (files.has('skills/ud/SKILL.md')) {
      const alias = files.get('skills/ud/SKILL.md');
      assert.match(alias, /^---\nname: ud\ndescription: .+\n---\n/);
      assert.match(alias, /\.\.\/ultradesign\/SKILL\.md/);
      assert.doesNotMatch(alias, /\$ARGUMENTS|\{\{args\}\}/);
    }
    if (internal) assert.ok(!files.has('skills/ultradesign/SKILL.md'));
    if (internal) {
      const extension = host === 'gemini' ? 'toml' : 'md';
      assert.equal(files.get(`commands/ud.${extension}`), files.get(`commands/ultradesign.${extension}`));
    }
    if (host === 'omp') {
      assert.ok(files.has('adapters/omp/index.ts'));
      assert.deepEqual(JSON.parse(files.get('package.json')).omp.extensions, ['./adapters/omp/index.ts']);
    }
    const manifest = { omp: 'package.json', antigravity: 'plugin.json', gemini: 'gemini-extension.json' }[host];
    if (manifest) assert.equal(JSON.parse(files.get(manifest)).version, version);
  });

  for (const scope of ['project', 'user']) {
    test(`${host}: ${scope} installation reuses identical files`, async (t) => {
      const base = await sandbox(t);
      const options = { scope, cwd: path.join(base, 'project'), home: path.join(base, 'home') };
      const first = await install(host, options);
      const second = await install(host, options);
      assert.equal(first.destination, installDirectory(host, scope, options));
      assert.ok(first.destination.startsWith(path.join(base, scope === 'project' ? 'project' : 'home') + path.sep));
      assert.ok(first.written > 0);
      assert.equal(second.written, 0);
      assert.equal(second.reused, first.written);
      for (const [name, bytes] of await adapterFiles(host)) {
        if (['plugin.json', 'gemini-extension.json'].includes(name)) continue;
        assert.deepEqual(await readFile(path.join(first.destination, name)), Buffer.from(bytes));
      }
    });
  }
}

test('Codex and Antigravity share identical project files', async (t) => {
  const cwd = await sandbox(t);
  const first = await install('codex', { scope: 'project', cwd });
  const second = await install('antigravity', { scope: 'project', cwd });
  assert.equal(second.written, 0);
  assert.equal(second.reused, first.written);
});

test('conflicts are rejected before any files are written', async (t) => {
  const cwd = await sandbox(t);
  const root = path.join(cwd, '.claude');
  await mkdir(path.join(root, 'skills/ultradesign'), { recursive: true });
  const target = path.join(root, 'skills/ultradesign/SKILL.md');
  await writeFile(target, 'existing user skill');
  await assert.rejects(install('claude', { scope: 'project', cwd }), /Refusing to overwrite/);
  assert.equal(await readFile(target, 'utf8'), 'existing user skill');
  await assert.rejects(readFile(path.join(root, 'commands/ud.md')), { code: 'ENOENT' });
});

test('symlinked destination directories are not followed', async (t) => {
  const cwd = await sandbox(t);
  const elsewhere = path.join(cwd, 'elsewhere');
  await mkdir(elsewhere);
  await symlink(elsewhere, path.join(cwd, '.claude'));
  await assert.rejects(install('claude', { scope: 'project', cwd }), /not a real directory/);
});

test('generation is repeatable and invalid CLI arguments fail closed', async (t) => {
  const outDir = await sandbox(t);
  const first = await generate('all', { outDir });
  const second = await generate('all', { outDir });
  assert.equal(first.length, hosts.length);
  assert.ok(second.every((result) => result.written === 0));
  const external = path.join(outDir, 'release');
  assert.equal((await main(['generate', 'omp', '--out', external]))[0].destination, path.join(external, 'omp'));
  await assert.rejects(main(['install', 'claude']), /Usage/);
  await assert.rejects(main(['install', 'claude', '--scope', 'global']), /Explicit --scope/);
  await assert.rejects(main(['generate', 'unknown']), /Unknown host/);
  await assert.rejects(main(['generate', 'all', '--force']), /Usage/);
});
