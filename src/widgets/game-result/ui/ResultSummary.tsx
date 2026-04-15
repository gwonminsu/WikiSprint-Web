import { gameClear, useTranslation, EmbossButton } from '@shared';
import { QRCodeSVG } from 'qrcode.react';
import type { ReactNode } from 'react';
import { useEffect, useRef, useState } from 'react';

// 경과 밀리초를 "n분 nn.nn초" 형식의 분/초로 분리
function formatResultTime(ms: number): { minutes: number; seconds: string } {
  const totalSeconds = ms / 1000;
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = (totalSeconds % 60).toFixed(2).padStart(5, '0');
  return { minutes, seconds };
}

// 요약 문장을 하이라이트 포함 JSX로 렌더링하는 헬퍼
function renderHighlightedSummary(
  template: string,
  {
    startDoc,
    pathCount,
    minutes,
    seconds,
    targetWord,
  }: {
    startDoc: string;
    pathCount: number;
    minutes: number;
    seconds: string;
    targetWord: string;
  }
): ReactNode[] {
  const tokenMap: Record<string, ReactNode> = {
    '@@@': (
      <span className="font-bold text-base text-blue-500 dark:text-blue-400">
        {startDoc}
      </span>
    ),
    '###': (
      <span className="font-bold text-base text-gray-900 dark:text-gray-100">
        {pathCount}
      </span>
    ),
    '@분': (
      <span className="font-bold text-base text-emerald-500 dark:text-emerald-400">
        {minutes}분
      </span>
    ),
    '@@.@@초': (
      <span className="font-bold text-base text-emerald-500 dark:text-emerald-400">
        {seconds}초
      </span>
    ),
    '@ min': (
      <span className="font-bold text-base text-emerald-500 dark:text-emerald-400">
        {minutes} min
      </span>
    ),
    '@@.@@ sec': (
      <span className="font-bold text-base text-emerald-500 dark:text-emerald-400">
        {seconds} sec
      </span>
    ),
    '@分': (
      <span className="font-bold text-base text-emerald-500 dark:text-emerald-400">
        {minutes}分
      </span>
    ),
    '@@.@@秒': (
      <span className="font-bold text-base text-emerald-500 dark:text-emerald-400">
        {seconds}秒
      </span>
    ),
    '???': (
      <span className="font-bold text-base text-orange-500 dark:text-orange-400">
        {targetWord}
      </span>
    ),
  };

  const tokenRegex = /(@@\.@@ sec|@@\.@@초|@@\.@@秒|@@@|###|@ min|@분|\?\?\?|@分)/g;

  return template
    .split(tokenRegex)
    .filter(Boolean)
    .map((part, index) => (
      <span key={`${part}-${index}`}>
        {tokenMap[part] ?? part}
      </span>
    ));
}

// ResultSummary Props
type ResultSummaryProps = {
  history: string[];
  elapsedMs: number;
  targetWord: string;
  isVisible: boolean;
  onRestart: () => void;
  onReplay: () => void;
  mode?: 'own' | 'shared';       // 기본값 'own' — shared 시 공유 버튼 미표시
  onShareKakao?: () => void;     // 카카오톡 공유 콜백 (own 모드)
  shareUrl?: string;             // 공유 URL (own 모드 — URL 복사 + QR 코드에 사용)
  onCopyLink?: () => void;       // 링크 복사 콜백 (own 모드)
};

// 결과 요약 영역 + 하단 버튼
export function ResultSummary({
  history,
  elapsedMs,
  targetWord,
  isVisible,
  onRestart,
  onReplay,
  mode = 'own',
  onShareKakao,
  shareUrl,
  onCopyLink,
}: ResultSummaryProps): React.ReactElement | null {
  const { t } = useTranslation();

  const bottomRef = useRef<HTMLDivElement>(null);
  // URL+QR 패널 토글 상태
  const [showLinkPanel, setShowLinkPanel] = useState<boolean>(false);

  // 결과 요약 렌더링 후 자동 스크롤
  useEffect(() => {
    if (isVisible) {
      setTimeout(() => {
        bottomRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'end',
        });
      }, 0);
    }
  }, [isVisible]);

  // 패널 토글 시 스크롤 추적
  useEffect(() => {
    if (showLinkPanel) {
      setTimeout(() => {
        bottomRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'end',
        });
      }, 150);
    }
  }, [showLinkPanel]);

  if (!isVisible) return null;

  const startDoc = history[0] ?? '';
  const pathCount = history.length;
  const { minutes, seconds } = formatResultTime(elapsedMs);

  const summaryContent = renderHighlightedSummary(t('game.resultSummary'), {
    startDoc,
    pathCount,
    minutes,
    seconds,
    targetWord,
  });

  // 공유 링크 패널 토글 핸들러
  const handleToggleLinkPanel = (): void => {
    if (!shareUrl) {
      onCopyLink?.();
      return;
    }
    setShowLinkPanel((prev) => !prev);
  };

  // 클립보드 복사 아이콘 SVG
  const CopyIcon = (): React.ReactElement => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="w-4 h-4 shrink-0"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
      />
    </svg>
  );

  return (
    <div className="animate-result-summary-in flex flex-col items-center gap-6 mt-10 w-full max-w-sm">
      {/* gameClear + 요약 텍스트 */}
      <div className="flex flex-col items-center gap-3">
        <img
          src={gameClear}
          alt="clear img"
          className="w-84 object-contain rounded-3xl"
        />
        <p className="text-center text-sm leading-relaxed text-gray-700 dark:text-gray-200 px-2">
          {summaryContent}
        </p>
      </div>

      {/* 버튼 영역 */}
      <div className="flex flex-col gap-3 w-full">
        {/* 다시하기 + 리플레이 버튼 행 */}
        <div className="flex gap-3 pb-3">
          <EmbossButton
            onClick={onRestart}
            variant="primary"
            className="flex-5 h-12 text-base"
          >
            {mode === 'shared' ? t('share.tryChallenge') : t('game.resultRestart')}
          </EmbossButton>

          <EmbossButton
            onClick={onReplay}
            variant="secondary"
            className="flex-1 justify-center h-12 text-base"
            title={t('game.resultReplay')}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4 4v6h6M20 20v-6h-6M20 8a8 8 0 00-14.9-3M4 16a8 8 0 0014.9 3"
              />
            </svg>
          </EmbossButton>
        </div>

        {/* 공유 버튼 행 — own 모드에서만 렌더링 */}
        {mode === 'own' && (
          <>
            {/* 카카오톡 공유 + 공유 링크 복사 버튼 행 */}
            <div className="flex gap-3">
              <EmbossButton
                onClick={onShareKakao}
                variant="secondary"
                className="flex-1 h-10 text-sm"
              >
                {t('game.resultShareKakao')}

                {/* 공유 아이콘 SVG */}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="w-4 h-4 ml-2"
                >
                  <circle cx="18" cy="5" r="3" />
                  <circle cx="6" cy="12" r="3" />
                  <circle cx="18" cy="19" r="3" />
                  <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
                  <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
                </svg>
              </EmbossButton>
              <EmbossButton
                onClick={handleToggleLinkPanel}
                variant="secondary"
                className="flex-1 h-10 text-sm"
              >
                {t('share.copyShareLink')}
              </EmbossButton>
            </div>

            {/* URL + QR 코드 토글 패널 */}
            {showLinkPanel && shareUrl && (
              <div className="flex flex-col gap-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/60 px-4 py-4 animate-result-summary-in">
                {/* URL 표시 + 복사 버튼 */}
                <div className="flex items-center gap-2 rounded-lg bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 px-3 py-2">
                  <span className="flex-1 text-xs text-gray-600 dark:text-gray-300 truncate select-all">
                    {shareUrl}
                  </span>
                  <button
                    type="button"
                    onClick={onCopyLink}
                    className="text-gray-400 dark:text-gray-400 hover:text-amber-500 dark:hover:text-amber-400 transition-colors active:scale-95"
                    title={t('common.clipboardCopy')}
                  >
                    <CopyIcon />
                  </button>
                </div>

                {/* QR 코드 */}
                <div className="flex flex-col items-center gap-2">
                  <div className="p-3 bg-white rounded-xl shadow-sm">
                    <QRCodeSVG
                      value={shareUrl}
                      size={160}
                      bgColor="#ffffff"
                      fgColor="#1f2937"
                      level="M"
                    />
                  </div>
                  <p className="text-xs text-gray-400 dark:text-gray-500 text-center leading-relaxed">
                    {t('share.qrGuide')}
                  </p>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* 스크롤 기준 anchor */}
      <div ref={bottomRef} />
    </div>
  );
}
