import { useState, useCallback, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGameStore, useTranslation, useAuthStore, EmbossButton, useToast } from '@shared';
import { PathTimeline } from './PathTimeline';
import { ResultSummary } from './ResultSummary';
import { buildShareUrl, shareKakao } from '../lib';

// 게임 결과 화면 컨테이너
// — navigationHistory를 카드 타임라인으로 순차 표시 후 결과 요약과 버튼 렌더링
export function GameResultView(): React.ReactElement {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { warning: showWarning, success: showSuccess } = useToast();

  const navigationHistory = useGameStore((s) => s.navigationHistory);
  const elapsedMs = useGameStore((s) => s.elapsedMs);
  const targetWord = useGameStore((s) => s.targetWord);
  const resetGame = useGameStore((s) => s.resetGame);
  const recordId = useGameStore((s) => s.recordId);

  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const accountInfo = useAuthStore((s) => s.accountInfo);
  const checkAuth = useAuthStore((s) => s.checkAuth);

  const [beforeTargetWord, afterTargetWord] = t('game.resultHeader').split('???');

  // 모든 카드 등장 후 결과 요약 표시 여부
  const [showSummary, setShowSummary] = useState<boolean>(false);
  // 타임라인 리마운트용 키 — 변경 시 PathTimeline이 처음부터 다시 재생
  const [replayKey, setReplayKey] = useState<number>(0);

  // hydration 경합 방지 — 마운트 시 토큰 실제 존재 여부 재확인
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // 공유 URL — 로그인 + recordId 있을 때만 생성
  const shareUrl = useMemo((): string | undefined => {
    if (!isAuthenticated || !recordId) return undefined;
    return buildShareUrl(recordId);
  }, [isAuthenticated, recordId]);

  // PathTimeline에서 모든 카드 등장 완료 시 호출 — 결과 요약 표시
  const handleAllCardsShown = useCallback((): void => {
    setShowSummary(true);
  }, []);

  // 결과 화면 애니메이션 다시 재생
  const handleReplay = useCallback((): void => {
    setShowSummary(false);
    setReplayKey((prev: number) => prev + 1);
  }, []);

  // 카카오톡 공유 핸들러
  const handleShareKakao = useCallback(async (): Promise<void> => {
    if (!isAuthenticated) {
      showWarning(t('share.loginRequired'));
      return;
    }
    if (!recordId) return;

    const url = buildShareUrl(recordId);
    const nick = accountInfo?.nick ?? t('common.user');

    const success = await shareKakao({
      nick,
      targetWord,
      shareUrl: url,
      elapsedMs,
      pathCount: navigationHistory.length,
    });

    if (!success) {
      // 카카오 SDK 실패 시 링크 복사 fallback
      await navigator.clipboard.writeText(url);
      showSuccess(t('share.linkCopied'));
    }
  }, [isAuthenticated, recordId, accountInfo, targetWord, elapsedMs, navigationHistory, showWarning, showSuccess, t]);

  // 공유 링크 복사 핸들러
  const handleCopyLink = useCallback(async (): Promise<void> => {
    if (!isAuthenticated) {
      showWarning(t('share.loginRequired'));
      return;
    }
    if (!recordId) return;

    const url = buildShareUrl(recordId);
    await navigator.clipboard.writeText(url);
    showSuccess(t('share.linkCopied'));
  }, [isAuthenticated, recordId, showWarning, showSuccess, t]);

  return (
    <div className="flex flex-col flex-1 bg-gray-50 dark:bg-gray-900">
      {/* 스크롤 가능한 컨텐츠 영역 */}
      <div className="flex-1 overflow-y-auto">
        <div className="flex flex-col items-center px-4 py-8">
          {/* 상단 헤더 메시지 */}
          <h2 className="animate-result-header text-lg font-bold text-gray-800 dark:text-gray-100 mb-8 text-center leading-relaxed">
            {beforeTargetWord}
            <span className="inline-flex items-center mx-1 px-2 py-0.5 rounded-md bg-red-100 text-red-500 dark:bg-red-900/30 dark:text-red-300 shadow-sm">
              {targetWord}
            </span>
            {afterTargetWord}
          </h2>

          {/* 문서 경로 카드 타임라인 — replayKey 변경 시 리마운트하여 처음부터 재생 */}
          <PathTimeline
            key={replayKey}
            history={navigationHistory}
            onAllCardsShown={handleAllCardsShown}
          />

          {/* 결과 요약 + 하단 버튼 */}
          <ResultSummary
            history={navigationHistory}
            elapsedMs={elapsedMs}
            targetWord={targetWord}
            isVisible={showSummary}
            onRestart={resetGame}
            onReplay={handleReplay}
            mode="own"
            onShareKakao={handleShareKakao}
            shareUrl={shareUrl}
            onCopyLink={handleCopyLink}
          />

          {/* 비로그인 상태: 전적 저장 로그인 안내 */}
          {!isAuthenticated && showSummary && (
            <div className="mt-6 w-full max-w-md animate-result-summary-in">
              <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800/50 px-5 py-4 text-center">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {t('record.loginToSave')}
                </p>
                <EmbossButton
                  variant="primary"
                  className="px-5 h-9 text-sm"
                  onClick={() => navigate('/auth')}
                >
                  {t('auth.login')}
                </EmbossButton>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
