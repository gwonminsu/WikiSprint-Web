const koPatchNotesContent = `# WikiSprint 최근 업데이트

## v2.14.0
- 패치 노트 페이지를 추가했어요.
- 이제 패치노트 페이지에서 업데이트 된 내용을 확인할 수 있어요.

---

## v2.13.3
- 다른 탭에서 이미 게임 중이면 새 게임이 시작되지 않도록 더 정확하게 막았어요.
- 게임 시작 실패 이유를 더 분명하게 안내하도록 개선했어요.

## v2.13.2
- 비로그인 상태에서 플레이한 뒤 로그인했을 때 기록이 어긋나는 문제를 줄였어요.
- 저장할 수 없는 기록은 잘못 복구하지 않고, 이유를 안내하도록 보강했어요.

## v2.13.1
- 신고와 관리자 처리 전에 한 번 더 확인할 수 있게 바꿨어요.
- 문서와 후원 화면의 일부 동작이 더 자연스럽고 안정적으로 보이도록 다듬었어요.`;

const enPatchNotesContent = `# Recent WikiSprint Updates

## v2.14.0
- I added a patch notes page.
- You can now check the patch notes page for updates.

---

## v2.13.3
- Starting a new game is now blocked more reliably when another tab already has a run in progress.
- The game now explains start failures more clearly.

## v2.13.2
- Reduced a mismatch issue that could happen when logging in after playing while logged out.
- Runs that cannot be recovered safely are now handled more clearly instead of being restored incorrectly.

## v2.13.1
- Added one more confirmation step before reports and admin actions are submitted.
- Polished several document and donation screen behaviors to feel more stable and natural.`;

const jaPatchNotesContent = `# WikiSprint 最近のアップデート

## v2.14.0
- パッチノートページを追加しました。
- これでパッチノートページで更新内容を確認できます。 

---

## v2.13.3
- 別タブですでにゲーム中の場合、新しいゲーム開始をより正確に防ぐようにしました。
- ゲーム開始に失敗した理由を、より分かりやすく案内するよう改善しました。

## v2.13.2
- 未ログインで遊んだあとにログインした際、記録がずれる問題を軽減しました。
- 安全に復元できない記録は、誤って復元せず理由を案内するようにしました。

## v2.13.1
- 通報や管理者操作の前に、もう一度確認できるようにしました。
- ドキュメント画面と後援画面の一部動作を、より自然で安定した見え方に整えました。`;

export const patchNotesLocale = {
  ko: {
    eyebrow: 'PATCH NOTES',
    title: '패치노트',
    documentTitle: '패치노트 | WikiSprint',
    lastUpdatedLabel: '마지막 업데이트',
    lastUpdatedDate: '2026-04-25',
    content: koPatchNotesContent,
  },
  en: {
    eyebrow: 'PATCH NOTES',
    title: 'Patch Notes',
    documentTitle: 'Patch Notes | WikiSprint',
    lastUpdatedLabel: 'Last updated',
    lastUpdatedDate: '2026-04-25',
    content: enPatchNotesContent,
  },
  ja: {
    eyebrow: 'PATCH NOTES',
    title: 'パッチノート',
    documentTitle: 'パッチノート | WikiSprint',
    lastUpdatedLabel: '最終更新',
    lastUpdatedDate: '2026-04-25',
    content: jaPatchNotesContent,
  },
} as const;
