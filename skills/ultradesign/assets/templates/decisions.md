# Decisions and evidence

Private run record. Keep the owner's words verbatim in their language. Label what the owner said (fact), what you read from it (inference) and what you assumed (hypothesis).

## Questions

One row per open question and per ladder step. The extraction is an observable requirement (element → user effect → expected state). A requirement without a raw answer is a hypothesis.

| # | Stage | Question (as asked) | Raw answer (verbatim) | Extraction |
| --- | --- | --- | --- | --- |
| | | | | |

## Gate log

One entry per gate opening and per owner reply. Approval is recorded only with a verbatim quote from the owner's reply.

| Gate | Opened | Artifact | Reason (one line, tied to the brief) | Owner reply (verbatim) | Outcome (`approved` with quote / `revise` / `follow_up`) | Extraction or revision (element → user effect → expected state) |
| --- | --- | --- | --- | --- | --- | --- |
| | | | | | | |

## Review rounds

| Round (0 = baseline, 1–3 = fix and replay) | Method (`remorsearch` / `fallback`) | Reviewer (`independent` / `self`) | Report | Open findings |
| --- | --- | --- | --- | --- |
| | | | | |

Findings: element → user effect → expected state, with reproduction, device and input.

## Evidence ledger

Four rows kept apart. A blank row is stated as blank, never implied. Only the owner fills the last row (OMP: `/ud real-user <note>`).

| Evidence | Status | What it is | Where |
| --- | --- | --- | --- |
| Agent task success | | Core tasks completed by an agent in the browser, per state and width | |
| Automated checks | | `a2ui-validate`, guard, `hierarchy-check`, `visual-qa.py`, `text-only-lint`, `originality-check`, `scene-qa`, Storybook Test; lab numbers labelled lab | |
| Owner approval | | Gate approvals with quotes (see gate log) | |
| Real-user validation | not done | Real visitors completing the core tasks, run by the owner | |

## Open risks

- Item, why it matters, what would settle it:
