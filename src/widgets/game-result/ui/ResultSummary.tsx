import { talkerGood, useTranslation, EmbossButton } from '@shared';

// 경과 밀리초를 \"n분 nn.nn초\" 형식의 분/초로 분리
function formatResultTime(ms: number): { minutes: number; seconds: string } {
  const totalSeconds = ms / 1000;
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = (totalSeconds % 60).toFixed(2).padStart(5, '0');
  return { minutes, seconds };
}

// ResultSummary Props
type ResultSummaryProps = {
  history: string[];
  elapsedMs: number;
  targetWord: string;
  isVisible: boolean;
  onRestart: () => void;
  onReplay: () => void;
};

// 결과 요약 영역 + 하단 버튼 (다시하기, 다시 보기, 공유하기)
export function ResultSummary({ history, elapsedMs, targetWord, isVisible, onRestart, onReplay }: ResultSummaryProps): React.ReactElement | null {
  const { t } = useTranslation();

  if (!isVisible) return null;

  const startDoc = history[0] ?? '';
  const pathCount = history.length;
  const { minutes, seconds } = formatResultTime(elapsedMs);

  // 결과 요약 텍스트 생성 — 플레이스홀더 치환
  const summaryText = t('game.resultSummary')
    .replace('@@@', startDoc)
    .replace('###', String(pathCount))
    .replace('@분', `${minutes}분`)
    .replace('@@.@@초', `${seconds}초`)
    .replace('???', targetWord);

  const handleShareKakao = (): void => {
    console.log('카카오톡 공유:', { history, targetWord, elapsedMs, pathCount });
  };

  const handleShareDiscord = (): void => {
    console.log('디스코드 공유:', { history, targetWord, elapsedMs, pathCount });
  };

  return (
    <div className="animate-result-summary-in flex flex-col items-center gap-6 mt-10 w-full max-w-sm pb-12">
      {/* talkerGood + 요약 텍스트 */}
      <div className="flex flex-col items-center gap-3">
        <img
          src={talkerGood}
          alt="결과 캐릭터"
          className="w-24 h-24 object-contain"
        />
        <p className="text-center text-sm leading-relaxed text-gray-700 dark:text-gray-200 px-2">
          {summaryText}
        </p>
      </div>

      {/* 버튼 영역 */}
      <div className="flex flex-col gap-3 w-full">
        {/* 다시하기 + 다시 보기 */}
        <div className="flex gap-3">
          <EmbossButton
            onClick={onRestart}
            variant="primary"
            className="flex-5 h-12 text-base"
          >
            {t('game.resultRestart')}
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

        {/* 공유하기 버튼들 */}
        <div className="flex gap-3">
          <EmbossButton
            onClick={handleShareKakao}
            variant="secondary"
            className="flex-1 h-10 text-sm"
          >
            {t('game.resultShareKakao')}
          </EmbossButton>
          <EmbossButton
            onClick={handleShareDiscord}
            variant="secondary"
            className="flex-1 h-10 text-sm"
          >
            {t('game.resultShareDiscord')}
          </EmbossButton>
        </div>
      </div>
    </div>
  );
}
