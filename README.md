# Ultradesign v0.2

[한국어](#한국어) · [English](#english)

## 한국어

Ultradesign은 레퍼런스 탐색을 실제 화면으로 이어 주는 디자인 워크플로입니다. 여러 사례에서 잘 작동하는 부분을 재현해 본 다음, 제품에 맞게 하나씩 바꿉니다. 토큰과 컴포넌트 계약을 먼저 정하고, 구현·모션·실화면 검증을 별개 단계로 진행합니다.

### 설치

이 저장소의 로컬 체크아웃과 Node.js가 필요합니다. **설치할 프로젝트**에서 아래 명령을 실행하세요. 전역 설치는 `--scope user`를 사용합니다. 실행 중인 하네스는 설치 후 다시 시작하세요.

```sh
node /path/to/ultradesign/scripts/adapters.mjs install omp --scope project
```

위 명령의 `omp`를 대상 하네스 이름으로 바꾸면 됩니다.

| 하네스 이름 | 호출 | 프로젝트 / 사용자 설치 경로 |
| --- | --- | --- |
| `omp` | `/ud`, `/ultradesign` | `.omp/extensions/ultradesign/` / `~/.omp/agent/extensions/ultradesign/` |
| `claude` (Claude Code) | `/ud`, `/ultradesign` | `.claude/` / `~/.claude/` |
| `codex` | `$ud`, `$ultradesign` | `.agents/skills/` / `~/.agents/skills/` |
| `antigravity` (`agy`) | `/ud`, `/ultradesign` | `.agents/skills/` / `~/.gemini/config/skills/` |
| `opencode` | `/ud`, `/ultradesign` | `.opencode/` / `~/.config/opencode/` |
| `cursor` | `/ud`, `/ultradesign` | `.cursor/skills/` / `~/.cursor/skills/` |
| `gemini` (Gemini CLI) | `/ud`, `/ultradesign` | `.gemini/` / `~/.gemini/` |

OMP에서 설치 없이 한 세션만 쓰려면 `omp -e /path/to/ultradesign`으로 실행하세요. 배포용 파일이 필요하면 체크아웃에서 `node scripts/adapters.mjs generate all`로 `dist/`에 생성합니다. 설치기는 동일한 파일을 재사용하고, 내용이 다른 기존 파일을 발견하면 경로를 알리고 중단합니다.

### 사용

하네스의 입력창에 호출 이름과 과제를 한 메시지로 입력합니다. Codex에서는 `/ud` 대신 `$ud`를 사용합니다.

```text
/ud 계획만: 주문 목록에 모바일 필터를 추가하는 UI를 설계해줘.
/ud 리뷰: 현재 결제 화면에서 모바일 사용자가 막히는 곳을 찾아줘.
/ud 구현: 팀 대시보드의 다음 행동을 명확히 하고 세 화면 너비에서 검증해줘.
```

계획은 디자인 계약과 확인 기준, 리뷰는 우선순위가 있는 관찰 결과, 구현은 동작하는 UI와 검증 근거를 남깁니다. OMP는 명령으로 켜면 세션 동안 디자인 정책을 적용하고 작업 단계와 근거를 세션에 기록합니다. 다른 하네스는 같은 [워크플로 스킬](skills/ultradesign/SKILL.md)을 불러오는 얇은 진입점을 제공합니다.

[레퍼런스 단계](skills/ultradesign/prompts/01-references.md)에서 전체 화면과 주요 영역을 캡처하고 관찰합니다. 디자인 시스템 계약을 먼저 작성한 뒤 프로젝트 데이터로 재현하고 제품에 맞게 바꿉니다. 캡처와 재현본은 비공개로 보관합니다. [시각 QA 가이드](skills/ultradesign/references/visual-qa.md)에는 같은 너비로 비교할 실제 화면의 캡처 방법이 있습니다.

### OMP 설정

`/ud status`로 현재 단계, `/ud resume`으로 이어서 작업, `/ud off`로 비활성화를 요청합니다. 공용 시스템을 준비할 때는 `/ud --shared <과제>`를 사용합니다. OMP가 단계 완료와 근거를 저장하므로 같은 세션을 다시 열면 그 단계부터 이어갑니다.

기본 구현 모델은 `openai-codex/gpt-6.2-sol` (`high`), QA는 `anthropic/claude-opus-4-6` (`high`)입니다. 사용할 수 있는 모델로 바꾸려면 OMP를 시작할 때 아래 환경변수를 설정합니다.

- `ULTRADESIGN_MODEL=provider/model`, `ULTRADESIGN_THINKING_LEVEL=high`: 모든 단계의 공통 기본값.
- `ULTRADESIGN_MODELS='{"qa":{"model":"provider/judge","thinkingLevel":"high"}}'`: 단계별 우선 설정. 키는 `references`, `system`, `implementation`, `motion`, `qa`, `sharing`입니다.

OMP의 `task`가 사용 가능한 환경에서는 레퍼런스 조사와 시각 QA를 각각 독립 작업으로 병렬화합니다. 자식의 모델과 권한은 OMP 설정을 따릅니다.

### 블라인드 평가

OMP, `uv`, Chromium과 접근 가능한 구현 모델 및 별도 이미지 심사 모델이 필요합니다. 체크아웃에서 다음을 실행하면 고정 과제 하나를 `/ud` 적용 전후로 비교합니다. `--task`를 빼면 4개 과제를 모두 실행합니다. 모델별로 출력 디렉터리를 다르게 지정하세요.

```sh
node evals/run.mjs --task dashboard --builder-model "$BUILDER_MODEL" \
  --judge-model "$JUDGE_MODEL" --out eval-results/dashboard-smoke
```

두 모델은 `provider/model`로 지정합니다. 사용자 정의 공급자를 쓰려면 `--model-config /path/to/models.yml`을 추가하세요. 채점과 조건을 보기 전에 `blind/index.html`에서 A/B를 비교합니다. 평가가 측정하는 것과 측정하지 않는 것은 [평가 안내](evals/README.md)를 참고하세요.

## English

Ultradesign is a design workflow for turning reference studies into a verified interface. Reconstruct the strongest patterns to understand why they work, then adapt them piece by piece. Define tokens and component contracts first. Build, choreograph motion, and inspect the rendered result in separate passes.

### Install

Use a local checkout and Node.js. From the **project you want to use**, run:

```sh
node /path/to/ultradesign/scripts/adapters.mjs install omp --scope project
```

Replace `omp` with `claude`, `codex`, `antigravity`, `opencode`, `cursor`, or `gemini` as needed. See the [host paths above](#설치); `--scope user` installs for the current user. Restart the host after installation. Identical files are reused; differing existing files are left untouched.

For one OMP session without installing, run `omp -e /path/to/ultradesign`. To generate bundles under `dist/`, run `node scripts/adapters.mjs generate all` from the checkout.

### Use

Enter the alias and task in the same chat message: `/ud` or `/ultradesign`; in Codex use `$ud` or `$ultradesign`.

```text
/ud Plan only: design mobile filters for the order list.
/ud Review the current checkout for blockers on mobile.
/ud Implement a clearer next action on the team dashboard and verify three widths.
```

Plan returns a design contract and acceptance checks. Review reports prioritized observations. Implement delivers working UI and rendered evidence. In OMP the command activates session-long design guidance and remembers stage checkpoints. Other hosts load the same [workflow skill](skills/ultradesign/SKILL.md) through thin entry points.

### OMP settings

Use `/ud status` to see the checkpoint, `/ud resume` to continue, `/ud off` to deactivate, or `/ud --shared <task>` to include system sharing. Reopening the same session restores its checkpoint.

Implementation defaults to `openai-codex/gpt-6.2-sol` (`high`) and QA to `anthropic/claude-opus-4-6` (`high`). Set `ULTRADESIGN_MODEL=provider/model` and `ULTRADESIGN_THINKING_LEVEL=high` to change defaults for the current OMP process. `ULTRADESIGN_MODELS='{"qa":{"model":"provider/judge","thinkingLevel":"high"}}'` takes precedence per stage: `references`, `system`, `implementation`, `motion`, `qa`, `sharing`. Use models available to this OMP environment.

When OMP's `task` is available, independent reference and QA work can run in parallel. OMP controls child models and permissions. See [reference capture](skills/ultradesign/prompts/01-references.md) for the private reference and recreation, and the [visual QA guide](skills/ultradesign/references/visual-qa.md) for the actual route.

### Blind evaluation

With OMP, `uv`, Chromium, and two available models (a builder and a distinct image-capable judge), use the [command above](#블라인드-평가) for a one-task A/B smoke. Omit `--task` for the four tasks, and choose a new output directory for each builder model. Open `blind/index.html` before looking at the scores or condition map. See the [evaluation guide](evals/README.md) for scoring and limitations.
