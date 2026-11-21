# Rendered-artifact evaluation

Run from the repository root with Node, OMP 19 RPC, uv, and an installed Chromium:

```sh
export OMP_AUTH_BROKER_URL=http://127.0.0.1:8765
export OMP_AUTH_BROKER_TOKEN="$(omp auth-broker token)"
UD_CHROMIUM_PATH=/usr/bin/google-chrome \
node evals/run.mjs \
  --subscription \
  --builder-model openai-codex/gpt-6.2-sol --builder-thinking high --builder-output files \
  --judge-model anthropic/claude-opus-5-5 \
  --out /tmp/ultradesign-eval
```

For `--subscription`, run `omp auth-broker serve --bind=127.0.0.1:8765` in a
separate terminal with those providers' OAuth subscriptions already signed in.
Do not print or share the broker token. The runner accepts only Codex and
Anthropic in this mode and does not pass through API keys or custom models.

The output directory must not exist. Omit `--task` to run all four fixed briefs:
dashboard, landing, settings, and mobile. `--timeout 1800` is the default per
builder, judge, and renderer deadline. Both model identifiers must be explicit
`provider/model` selectors, and the judge must differ from the builder and accept
image inputs. The example models and paths are local configuration choices, not
bundled services or guaranteed available models.

Baseline receives only the plain task brief and seed files. Both conditions
use the same `--builder-thinking` effort (default: `high`) and builder/stage
model settings, with local file tools. Only treatment invokes `/ud`, chooses
and captures public references, records its design system contract before writing
screen code, renders a private recreation with the task's data, then adapts and
verifies the actual route. The runner independently
captures the final route in both conditions. Run order and A/B assignment are independently
randomized per task. Each builder and visual judge has a fresh temporary HOME,
agent directory, and project; automatic context files, extensions, rules, and
skills are disabled. The judge has no tools and receives only the brief plus six
anonymous full-page screenshots at 390, 768, and 1440 px.

Use `--task dashboard --condition treatment` in files mode for a treatment-only
calibration run. It keeps the renders, patterns and QA notes private and
does not invoke a judge. Use a fresh `--out` for each calibration and for the
final comparison. Calls are serialized; subscription usage-limit errors stop
without fallback. Only explicit overloads are retried, up to six times, using
the provider's retry interval when supplied.

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
Raw renderer checks, per-condition final HTML and renders, and treatment's
captured references, recreated study and design/QA notes live below
`OUT/private`. Completed conditions and partial treatment evidence survive
aborted runs; a partial run publishes no owner comparison. Serve only
`OUT/blind`, never its parent.

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
