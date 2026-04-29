const koPatchNotesContent = `# WikiSprint 최근 업데이트

## v2.16.0
- 설정 화면에서 랭킹 알림과 후원 알림을 각각 켜고 끌 수 있게 되었어요.
- 후원 알림을 다시 켠 뒤에는 켠 시점 이후에 들어온 새 후원만 알림으로 표시돼요.

---

## v2.15.0
- 게임을 클리어해 일일 전체 랭킹 순위가 오르면 화면에 알림이 표시돼요.
- 다른 플레이어의 신규 진입이나 추월도 알림으로 확인할 수 있어요.

---

## v2.14.0
- 패치노트 페이지가 추가되었어요.
- 이제 업데이트 내용을 패치노트 페이지에서 바로 확인할 수 있어요.

---

## v2.13.3
- 다른 탭에서 이미 게임을 진행 중이면 새 게임 시작이 더 정확하게 차단돼요.
- 게임 시작 실패 이유를 더 분명하게 안내해요.

## v2.13.2
- 비로그인 상태에서 플레이한 뒤 로그인했을 때 기록이 어긋나는 문제를 줄였어요.
- 안전하게 복구할 수 없는 기록은 잘못 복원하지 않고 이유를 함께 안내해요.

## v2.13.1
- 신고와 관리자 처리 전에 한 번 더 확인하는 절차가 추가되었어요.
- 문서와 후원 화면의 여러 동작을 더 자연스럽고 안정적으로 다듬었어요.`;

const enPatchNotesContent = `# Recent WikiSprint Updates

## v2.16.0
- You can now turn ranking alerts and donation alerts on or off separately in Settings.
- After re-enabling donation alerts, only donations received after that point are shown as alerts.

---

## v2.15.0
- When you clear a game and your daily overall ranking changes, a new alert now pops up on screen.
- You can also see alerts when other players enter the ranking or overtake someone.

---

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

## v2.16.0
- 設定画面でランキング通知と寄付通知をそれぞれオン・オフできるようになりました。
- 寄付通知を再びオンにしたあとは、その時点以降に届いた新しい寄付だけが通知されます。

---

## v2.15.0
- ゲームをクリアしてデイリー総合ランキングが変動すると、画面に通知が表示されます。
- 他のプレイヤーの新規ランクインや追い抜きも通知で確認できます。

---

## v2.14.0
- パッチノートページを追加しました。
- これからは更新内容をパッチノートページで確認できます。

---

## v2.13.3
- 別のタブですでにゲーム中の場合、新しいゲーム開始がより確実にブロックされます。
- ゲーム開始に失敗した理由も、より分かりやすく案内します。

## v2.13.2
- ログアウト状態で遊んだあとにログインすると記録がずれる問題を減らしました。
- 安全に復元できない記録は、誤って復元せず理由を案内します。

## v2.13.1
- 通報と管理者処理の前に、もう一度確認する手順を追加しました。
- ドキュメント画面と寄付画面のいくつかの挙動を、より自然で安定したものに整えました。`;

export const patchNotesLocale = {
  ko: {
    eyebrow: 'PATCH NOTES',
    title: '패치노트',
    documentTitle: '패치노트 | WikiSprint',
    lastUpdatedLabel: '마지막 업데이트',
    lastUpdatedDate: '2026-04-30',
    content: koPatchNotesContent,
  },
  en: {
    eyebrow: 'PATCH NOTES',
    title: 'Patch Notes',
    documentTitle: 'Patch Notes | WikiSprint',
    lastUpdatedLabel: 'Last updated',
    lastUpdatedDate: '2026-04-30',
    content: enPatchNotesContent,
  },
  ja: {
    eyebrow: 'PATCH NOTES',
    title: 'パッチノート',
    documentTitle: 'パッチノート | WikiSprint',
    lastUpdatedLabel: '最終更新',
    lastUpdatedDate: '2026-04-30',
    content: jaPatchNotesContent,
  },
} as const;
