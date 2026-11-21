# Ultradesign

레퍼런스를 모으는 데서 멈추지 않고, 필요한 디자인 패턴을 골라 토큰과 컴포넌트로 옮기고 실제 화면에서 검증하는 [Agent Skill](https://agentskills.io/specification)입니다.

## 설치

스킬을 사용할 프로젝트 디렉터리에서 아래 중 하나를 실행하세요.

**Codex**

```bash
mkdir -p .agents/skills
git clone https://github.com/tknmaxxer/ultradesign.git .agents/skills/ultradesign
```

**Claude Code**

```bash
mkdir -p .claude/skills
git clone https://github.com/tknmaxxer/ultradesign.git .claude/skills/ultradesign
```

다른 Agent Skills 호환 도구에서는 `SKILL.md`와 `references/`를 함께 `ultradesign/` 디렉터리에 두고, 도구가 읽는 스킬 경로에 등록하세요.

## 사용

프롬프트에서 `Ultradesign`을 지정하세요.

> Ultradesign으로 팀 온보딩 대시보드를 다듬어줘. 기존 톤은 유지하고 카드 중첩을 줄여. 키보드와 모바일로 주요 플로우를 확인해.

> Ultradesign으로 개발 도구 랜딩을 만들어줘. 첫 화면에 실제 제품 동작을 보여주고, 모바일부터 데스크톱까지 깨지는 구간이 없는지 확인해.

계획이나 리뷰만 원하면 그렇게 명시하세요. 전체 워크플로는 [SKILL.md](SKILL.md)에 있습니다.
