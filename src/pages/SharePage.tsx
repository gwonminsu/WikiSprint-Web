import { useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSharedRecord } from '@features';
import { w } from '@widgets';
import { PathTimeline, ResultSummary, formatElapsed } from '@widgets/game-result';
import { useTranslation, EmbossButton, useToast } from '@shared';

// 공유 전용 결과 페이지 — /share/:shareId 라우트
// 비로그인 사용자도 접근 가능, 공유 버튼 없음
export default function SharePage(): React.ReactElement {
  const { shareId = '' } = useParams<{ shareId: string }>();
  const navigate = useNavigate();
  const { t, language } = useTranslation();
  const { success: showSuccess } = useToast();

  const { data, isLoading, isError } = useSharedRecord(shareId);

  // 타임라인 리마운트용 키
  const [replayKey, setReplayKey] = useState<number>(0);
  const [showSummary, setShowSummary] = useState<boolean>(false);

  const handleAllCardsShown = useCallback((): void => {
    setShowSummary(true);
  }, []);

  const handleReplay = useCallback((): void => {
    setShowSummary(false);
    setReplayKey((prev) => prev + 1);
  }, []);

  // 홈으로 이동 (나도 도전하기)
  const handleGoHome = useCallback((): void => {
    navigate('/');
  }, [navigate]);

  // 모바일 Web Share API — 지원 환경에서 네이티브 공유 시트 호출
  const handleNativeShare = useCallback(async (): Promise<void> => {
    if (!data) return;
    const shareUrl = window.location.href;
    const timeText = formatElapsed(data.elapsedMs, language);
    const pathCount = data.navPath.length;
    try {
      await navigator.share({
        title: t('share.webShareTitle', { nick: data.nick }),
        text: t('share.webShareText', { targetWord: data.targetWord, pathCount: String(pathCount), timeText }),
        url: shareUrl,
      });
    } catch {
      // 사용자 취소 또는 API 미지원은 무시
    }
  }, [data, t, language]);

  // 공유 URL 복사
  const handleCopyLink = useCallback(async (): Promise<void> => {
    await navigator.clipboard.writeText(window.location.href);
    showSuccess(t('share.linkCopied'));
  }, [showSuccess, t]);

  // 헤더 문구 구성 — {{nick}}, {{targetWord}} 치환
  const headerMessage = data
    ? t('share.headerMessage', { nick: data.nick, targetWord: data.targetWord })
    : '';

  // headerMessage를 targetWord 기준으로 분리하여 하이라이트
  const [beforeTarget, afterTarget] = data
    ? headerMessage.split(data.targetWord)
    : ['', ''];

  // Web Share API 지원 여부
  const canNativeShare = typeof navigator.share === 'function';

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
              {/* 상단 헤더 메시지 — "OOO님의 목적지(제시어)까지의 여정을 한번 살펴봅시다!" */}
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

              {/* 결과 요약 + 나도 도전하기 버튼 (mode='shared') */}
              <ResultSummary
                history={data.navPath}
                elapsedMs={data.elapsedMs}
                targetWord={data.targetWord}
                isVisible={showSummary}
                onRestart={handleGoHome}
                onReplay={handleReplay}
                mode="shared"
              />

              {/* 모바일 Web Share 버튼 — navigator.share 지원 환경에서만 표시 */}
              {showSummary && canNativeShare && (
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
              {showSummary && !canNativeShare && (
                <div className="-mt-3 w-full max-w-sm animate-result-summary-in">
                  <EmbossButton
                    variant="secondary"
                    className="w-full h-10 text-sm flex items-center justify-center gap-2" // [수정] 아이콘 정렬
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
