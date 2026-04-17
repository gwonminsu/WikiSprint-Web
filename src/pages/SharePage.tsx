import { useState, useCallback, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSharedRecord } from '@features';
import { w } from '@widgets';
import { PathTimeline, ResultSummary, formatElapsed } from '@widgets/game-result';
import { useTranslation, EmbossButton, useToast } from '@shared';

// 공유 전용 결과 페이지 - /share/:shareId 라우트
// 비로그인 사용자도 접근 가능하며 공유 버튼은 별도 제공하지 않는다.
export default function SharePage(): React.ReactElement {
  const { shareId = '' } = useParams<{ shareId: string }>();
  const navigate = useNavigate();
  const { t, language } = useTranslation();
  const { success: showSuccess } = useToast();

  const { data, isLoading, isError } = useSharedRecord(shareId);

  // 타임라인 리플레이 상태
  const [replayKey, setReplayKey] = useState<number>(0);
  const [showSummary, setShowSummary] = useState<boolean>(false);
  const [showShareActions, setShowShareActions] = useState<boolean>(false);
  const shareActionTimerRef = useRef<number | null>(null);

  const clearShareTimers = useCallback((): void => {
    if (shareActionTimerRef.current !== null) {
      window.clearTimeout(shareActionTimerRef.current);
      shareActionTimerRef.current = null;
    }
  }, []);

  const handleAllCardsShown = useCallback((): void => {
    clearShareTimers();
    setShowSummary(true);
    shareActionTimerRef.current = window.setTimeout(() => {
      setShowShareActions(true);
      shareActionTimerRef.current = null;
    }, 140);
  }, [clearShareTimers]);

  const handleReplay = useCallback((): void => {
    clearShareTimers();
    setShowSummary(false);
    setShowShareActions(false);
    setReplayKey((prev) => prev + 1);
  }, [clearShareTimers]);

  useEffect(() => {
    return () => {
      clearShareTimers();
    };
  }, [clearShareTimers]);

  // 홈으로 이동 (나도 도전하기)
  const handleGoHome = useCallback((): void => {
    navigate('/');
  }, [navigate]);

  // 모바일 Web Share API 지원 환경에서 네이티브 공유 시트 호출
  const handleNativeShare = useCallback(async (): Promise<void> => {
    if (!data) return;

    const shareUrl = window.location.href;
    const timeText = formatElapsed(data.elapsedMs, language);
    const pathCount = data.navPath.length;

    try {
      await navigator.share({
        title: t('share.webShareTitle', { nick: data.nick }),
        text: t('share.webShareText', {
          targetWord: data.targetWord,
          pathCount: String(pathCount),
          timeText,
          expiryNotice: t('share.validFor24Hours'),
        }),
        url: shareUrl,
      });
    } catch {
      // 사용자가 취소하거나 미지원 환경이면 조용히 무시한다.
    }
  }, [data, language, t]);

  // 공유 URL 복사
  const handleCopyLink = useCallback(async (): Promise<void> => {
    await navigator.clipboard.writeText(window.location.href);
    showSuccess(t('share.linkCopied'));
  }, [showSuccess, t]);

  // 헤더 문구 구성 - {{nick}}, {{targetWord}} 치환
  const headerMessage = data
    ? t('share.headerMessage', { nick: data.nick, targetWord: data.targetWord })
    : '';

  // headerMessage를 targetWord 기준으로 분리하여 하이라이트
  const [beforeTarget, afterTarget] = data
    ? headerMessage.split(data.targetWord)
    : ['', ''];

  // Web Share API 지원 여부
  const canNativeShare = typeof navigator.share === 'function';

  // 공유 만료 시각은 선택된 언어 기준의 로컬 시각으로 노출한다.
  const expiryDateText = data
    ? (() => {
        const expiresAtDate = new Date(data.expiresAt);
        const cleanupDisplayDate = new Date(expiresAtDate);

        if (
          cleanupDisplayDate.getMinutes() !== 0 ||
          cleanupDisplayDate.getSeconds() !== 0 ||
          cleanupDisplayDate.getMilliseconds() !== 0
        ) {
          cleanupDisplayDate.setHours(cleanupDisplayDate.getHours() + 1, 0, 0, 0);
        }

        return new Intl.DateTimeFormat(
          language === 'ko' ? 'ko-KR' : language === 'ja' ? 'ja-JP' : 'en-US',
          {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            hour12: false,
          }
        ).format(cleanupDisplayDate);
      })()
    : '';

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900">
      <w.Header />

      <div className="flex-1 overflow-y-auto">
        <div className="flex flex-col items-center px-4 py-8">
          {/* 로딩 상태 */}
          {isLoading && (
            <div className="flex flex-col items-center justify-center gap-4 mt-20">
              <div className="w-10 h-10 rounded-full border-4 border-amber-400 border-t-transparent animate-spin" />
              <p className="text-sm text-gray-400 dark:text-gray-500">
                {t('common.loading')}
              </p>
            </div>
          )}

          {/* 에러 상태 */}
          {isError && !isLoading && (
            <div className="flex flex-col items-center justify-center gap-4 mt-20 text-center px-6">
              <p className="text-2xl">😢</p>
              <p className="text-base font-bold text-gray-800 dark:text-gray-100">
                {t('share.invalidLink')}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {t('share.invalidLinkDesc')}
              </p>
              <EmbossButton
                variant="primary"
                className="mt-2 px-6 h-10 text-sm"
                onClick={handleGoHome}
              >
                {t('share.goHome')}
              </EmbossButton>
            </div>
          )}

          {/* 정상 데이터 */}
          {data && !isLoading && !isError && (
            <>
              {/* 공유 기록 만료 안내 */}
              <div className="-mt-2 mb-3 w-full max-w-xl animate-result-summary-in">
                <div className="rounded-xl border border-amber-200 bg-amber-50 px-5 py-4 text-center text-sm leading-relaxed text-amber-800 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-100">
                  <p className="font-bold">
                    {t('share.pageValidFor24Hours')}
                  </p>
                  <p className="mt-1 font-normal">
                    {t('share.expiresAtNotice', { dateTime: expiryDateText })}
                  </p>
                </div>
              </div>

              {/* 상단 헤더 메시지 */}
              <h2 className="animate-result-header text-lg font-bold text-gray-800 dark:text-gray-100 mb-8 text-center leading-relaxed">
                {beforeTarget}
                <span className="inline-flex items-center mx-1 px-2 py-0.5 rounded-md bg-red-100 text-red-500 dark:bg-red-900/30 dark:text-red-300 shadow-sm">
                  {data.targetWord}
                </span>
                {afterTarget}
              </h2>

              {/* 문서 경로 카드 타임라인 */}
              <PathTimeline
                key={replayKey}
                history={data.navPath}
                onAllCardsShown={handleAllCardsShown}
              />

              {/* 결과 요약 + 나도 도전하기 버튼 */}
              <ResultSummary
                history={data.navPath}
                elapsedMs={data.elapsedMs}
                targetWord={data.targetWord}
                isVisible={showSummary}
                onRestart={handleGoHome}
                onReplay={handleReplay}
                mode="shared"
              />

              {/* 모바일 Web Share 버튼 - navigator.share 지원 환경에서만 표시 */}
              {showShareActions && canNativeShare && (
                <div className="-mt-3 w-full max-w-sm animate-result-summary-in">
                  <EmbossButton
                    variant="secondary"
                    className="w-full h-10 text-sm"
                    onClick={handleNativeShare}
                  >
                    {t('share.nativeShare')}
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
                </div>
              )}

              {/* Web Share 미지원 환경: 링크 복사 버튼 */}
              {showShareActions && !canNativeShare && (
                <div className="-mt-3 w-full max-w-sm animate-result-summary-in">
                  <EmbossButton
                    variant="secondary"
                    className="w-full h-10 text-sm flex items-center justify-center gap-2"
                    onClick={handleCopyLink}
                  >
                    {t('share.copyShareLink')}
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
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
