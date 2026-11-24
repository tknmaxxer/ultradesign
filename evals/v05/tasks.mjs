// Fixed briefs for the v0.5 hierarchy evaluation. Both conditions receive the same brief and catalog.
export const tasks = [
  {
    id: "night_oncall",
    catalog: "catalogs/cataly-ops.json",
    surfaceId: "night_oncall",
    // The brief the A2UI prototype used on 2026-11-24, unchanged.
    brief: `야간 온콜 교대 화면을 한국어로 만들어라. 한 사람이 30초 안에 오늘 보고의 핵심을 읽고 검토를 확인할 수 있어야 한다. 가상 스냅샷은 2026-11-24 21:00 KST. queue-replay는 재시도 2건으로 확인 필요, api-proxy는 정상 복구 완료다. 가장 최근 보고는 queue-replay의 20:42 KST, 다음 교대 담당자가 22:00 KST에 재시도 건수를 다시 확인한다. 제목과 보고 본문은 dataModel에 넣어 바인딩하고, 작업 자체를 변경하지 않는 ‘인수인계 확인’ 버튼을 둬라.`,
  },
  {
    id: "landing_install",
    catalog: "catalogs/cataly-landing.json",
    surfaceId: "landing_install",
    brief: `Build the "Get started" section of the Cataly landing page, in English. A developer who has just read what Cataly does should know which install path to take and start it. Facts you may use, and only these:
- The v0.1.3 prerelease is the current preview build. It supports Linux x64, herdr and Discord. Link: the v0.1.3 release.
- Current source runs on Linux and macOS; its sessions are headless by default, and herdr and hc are optional. Link: the source README.
- Earlier releases are listed in the release history.
- Installing Cataly doesn't start an agent or enable Discord. You supply your own provider access and configure the integrations you select.
- There is no stable release and no published macOS build. Don't claim either.`,
  },
];

export const generatorSystem = "You generate JSON. Follow the supplied catalog and brief. Return only one JSON object, without Markdown fences.";
