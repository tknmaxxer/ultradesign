# Rendered-artifact evaluation

Run from the repository root with Node, OMP 19 RPC, uv, and an installed Chromium:

```sh
UD_CHROMIUM_PATH=/usr/bin/google-chrome \
node evals/run.mjs \
  --builder-model inferhub/cbcn/glm-5.3-flash \
  --judge-model inferhub/gpt-6.2-sol \
  --model-config "$HOME/.omp/agent/models.yml" \
  --out /tmp/ultradesign-eval-dashboard \
  --task dashboard
```

The output directory must not exist. Omit `--task` to run all four fixed briefs:
dashboard, landing, settings, and mobile. `--timeout 900` is the default per
builder, judge, and renderer deadline. Both model identifiers must be explicit
`provider/model` selectors, and the judge must differ from the builder and accept
image inputs. The example models and paths are local configuration choices, not
bundled services or guaranteed available models.

Each condition receives identical content, seed files, and synthetic offline
pattern studies. This keeps live reference access outside the benchmark. Both
use the same `--builder-thinking` effort (default: `high`) and identical
builder/stage model settings, with local
file tools. The runner, rather than the builder session, executes the browser.
Only treatment loads the OMP extension, gains its
checkpoint tool, and invokes `/ud`. Run order and A/B assignment are independently
randomized per task. Each builder and visual judge has a fresh temporary HOME,
agent directory, and project; automatic context files, extensions, rules, and
skills are disabled. The judge has no tools and receives only the brief plus six
anonymous full-page screenshots at 390, 768, and 1440 px.

Use `--builder-output html` for a bounded smoke of the `/ud` policy and canonical
prompts through final rendering and blind judging. Both builders then return a
single HTML document without tools. Treatment still invokes `/ud`, and the
runner includes the canonical prompts inline so the tool-free model can use
them. This mode does not measure intermediate checkpoint, task delegation, or
tool-driven implementation behavior. Use the default `files` mode to evaluate
the native file-tool workflow, and compare only like-for-like output modes.

Provider credentials come from the selected provider's `PREFIX_API_KEY` or
`PREFIX_ACCESS_TOKEN`; the provider prefix is uppercased with punctuation replaced
by underscores. `google` uses `GEMINI`, `openai-codex` uses `OPENAI`, and
`azure-openai` uses `AZURE_OPENAI`. Broker environment credentials are supported.
For custom credential names, repeat `--credential-env NAME`. A custom
`--model-config FILE` is explicitly trusted and copied only into temporary
agent state, never results. The runner does not import host auth databases or
export OAuth credentials. Temporary state is removed on success and handled
failure. Neither provider stderr nor credential values are logged.

Renderers receive no provider credentials. `UD_CHROMIUM_PATH`,
`PLAYWRIGHT_BROWSERS_PATH`, `UV_CACHE_DIR`, `UV_PYTHON`, and `UV_OFFLINE` are
forwarded only to renderers. To run offline, prepare the renderer and action
probe with the same Python interpreter and uv cache (`uv run --script
skills/ultradesign/scripts/visual-qa.py --help` and `uv run --script
evals/probe.py --help`), then pass `UV_PYTHON` and `UV_CACHE_DIR` as absolute
paths with `UV_OFFLINE=1`. Alternatively use an installed Playwright 1.65.1
browser via `PLAYWRIGHT_BROWSERS_PATH`. Evaluation rendering blocks remote resources.
This is HOME/config/project isolation, **not an operating-system sandbox**.

Open `OUT/blind/index.html`, record independent A/B/tie choices, and download
them before opening the separate `scores.html`. The owner page contains no model
scores or rationales. `scores.json` contains the anonymous score table.
`OUT/private/manifest.json` contains model identifiers, randomized mappings,
execution order, brief/image hashes, completion status, and failure phase.
Raw renderer checks are private too. Serve only `OUT/blind`, never its parent.

The six axes are hierarchy, spacing consistency, component consistency/reuse
**visual proxy**, responsiveness, polish, and motion presence. A fresh judge
scores the first five from 1 to 5 with visible evidence. Motion presence is
fixed: 5 if a live running animation is observed during the 650 ms primary-action
sample at 390 px, otherwise 1. This is not a motion-quality, appropriateness,
reduced-motion, or source-code reuse measurement. Separate fixed accessible
probes exercise invoice search, signup-dialog opening, profile cancel/restore,
or task creation. An unsuccessful probe means the behavior was not established;
it is not a complete functionality verdict.

A single run is one sample, not statistical evidence of workflow superiority.
For a model matrix, repeat the command with a different `--builder-model` and a
new `--out`, preserving judge, task, effort, timeout, and renderer settings.
Keep the private mapping hidden until the owner records their judgment.

Protocol, model, authentication, renderer, or judge/schema failures exit nonzero
and do not publish a complete owner report; inspect the private failure phase.
Malformed/missing artifacts are failures, not zero scores or fake screenshots.
Actual page errors and overflow are retained as observations rather than hidden.

Runner tests, without model calls or browser installation:

```sh
node --test tests/evals.test.mjs
```
