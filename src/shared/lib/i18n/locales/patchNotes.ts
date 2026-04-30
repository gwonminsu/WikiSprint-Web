const koPatchNotesContent = `# WikiSprint 최근 업데이트

## v2.16.2
- 추월 랭킹 알림에서 등장하는 카드 뒤로 불꽃 스파크가 함께 보이도록 다듬었어요.
- 랭킹 알림 헤더에서 플레이어 이름과 순위가 더 잘 눈에 들어오도록 강조 표현을 정리했어요.
- 랭킹 페이지에서 접힌 카드 내용이 세로 가운데에 더 자연스럽게 보이도록 정리했어요.

## v2.16.1
- 설정 화면 알림 토글 스위치의 라이트 모드 가시성을 더 또렷하게 다듬었어요.
- 토글 thumb가 꺼짐일 때는 더 왼쪽으로, 켜짐일 때는 더 오른쪽으로 움직이도록 미세 조정했어요.

## v2.16.0
- 설정 화면에서 랭크 알림과 후원 알림을 각각 켜고 끌 수 있게 되었어요.
- 후원 알림을 다시 켠 뒤에는 켠 시점 이후에 들어온 후원만 알림으로 보여줘요.

---

## v2.15.0
- 게임을 클리어해 일간 전체 랭크 순위가 바뀌면 화면에 새 알림이 표시돼요.
- 다른 플레이어의 신규 진입이나 추월도 알림으로 확인할 수 있어요.

---

## v2.14.0
- 패치노트 페이지를 추가했어요.
- 이제 업데이트 내용을 패치노트 페이지에서 바로 확인할 수 있어요.

---

## v2.13.3
- 다른 탭에서 게임이 진행 중이면 새 게임 시작을 더 정확하게 막아요.
- 게임 시작 실패 이유를 더 분명하게 안내해요.

## v2.13.2
- 로그아웃 상태에서 플레이한 뒤 로그인할 때 기록 복구가 어긋나던 문제를 줄였어요.
- 안전하게 복구할 수 없는 기록은 잘못 복원하지 않고 이유를 함께 안내해요.

## v2.13.1
- 신고와 관리자 처리 전에 한 번 더 확인하는 단계가 추가되었어요.
- 문서 화면과 후원 화면의 여러 동작을 더 자연스럽고 안정적으로 다듬었어요.`;

const enPatchNotesContent = `# Recent WikiSprint Updates

## v2.16.2
- Overtake ranking alerts now show the spark effect behind the entering card at the right moment.
- Ranking alert headlines now make player names and achieved rank easier to notice.
- Collapsed ranking cards on the ranking page now feel more vertically centered.

## v2.16.1
- Improved the visibility of the notification toggle switches in light mode on the Settings screen.
- Fine-tuned the thumb travel so it sits farther left when off and reaches a bit farther right when on.

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

## v2.16.2
- 追い抜きランキング通知では、登場するカードの後ろに火花スパークがタイミングよく見えるようになりました。
- ランキング通知ヘッダーで、プレイヤー名と達成順位がより目に入りやすくなりました。
- ランキングページの折りたたみカードは、内容が縦方向の中央により自然に見えるよう整えました。

## v2.16.1
- 設定画面の通知トグルは、ライトモードでも見やすくなるように調整しました。
- トグルのつまみは、オフのときはもう少し左へ、オンのときは少しだけ右へ動くよう微調整しました。

## v2.16.0
- 設定画面でランキング通知と支援通知をそれぞれ個別にオンオフできるようになりました。
- 支援通知を再度オンにした後は、その時点以降の支援だけが通知として表示されます。

---

## v2.15.0
- ゲームをクリアしてデイリー総合ランキングの順位が変わると、新しい通知が画面に表示されます。
- 他のプレイヤーの新規ランクインや追い抜きも通知で確認できます。

---

## v2.14.0
- パッチノートページを追加しました。
- アップデート内容をパッチノートページですぐ確認できるようになりました。

---

## v2.13.3
- 別のタブでゲームが進行中のとき、新しいゲーム開始をより正確に防ぐようにしました。
- ゲーム開始に失敗した理由を、より分かりやすく案内します。

## v2.13.2
- ログアウト状態でプレイした後にログインするとき、記録復元の食い違いが起きにくくなりました。
- 安全に復元できない記録は、誤って戻さず理由もあわせて案内します。

## v2.13.1
- 通報や管理者操作の送信前に、もう一段階の確認を追加しました。
- ドキュメント画面と支援画面のいくつかの動作を、より自然で安定したものに整えました。`;

const zhPatchNotesContent = `# WikiSprint 最新更新

## v2.16.2
- 超越类排行通知中，进入中的卡片现在会在更合适的时机显示火花效果。
- 排行通知标题里，玩家名称和达成名次会更容易被看见。
- 排行页面中折叠状态的卡片内容，看起来会更自然地位于垂直中间。

## v2.16.1
- 设置页面里的通知开关在浅色模式下更清晰了。
- 开关圆点在关闭时会更靠左、开启时会更靠右，细节上更自然。

## v2.16.0
- 现在可以在设置页面中分别开启或关闭排行通知与赞助通知。
- 重新开启赞助通知后，只会显示开启之后收到的新赞助通知。

---

## v2.15.0
- 当你通关后，若日榜总排行发生变化，现在会立刻在画面上显示通知。
- 你也能看到其他玩家新进入排行或超越他人的提示通知。

---

## v2.14.0
- 新增了更新日志页面。
- 现在可以直接在更新日志页面查看最近更新内容。`;

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
  zh: {
    eyebrow: 'PATCH NOTES',
    title: '更新日志',
    documentTitle: '更新日志 | WikiSprint',
    lastUpdatedLabel: '最后更新',
    lastUpdatedDate: '2026-04-30',
    content: zhPatchNotesContent,
  },
} as const;
