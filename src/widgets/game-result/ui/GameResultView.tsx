import { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGameStore, useTranslation, useAuthStore, EmbossButton, useToast } from '@shared';
import { createShareRecord } from '@features';
import { PathTimeline } from './PathTimeline';
import { ResultSummary } from './ResultSummary';
import { buildShareUrl, shareKakao, formatElapsed, copyShareText } from '../lib';

type PreparedShareLink = {
  shareId: string;
  shareUrl: string;
  expiresAt: string;
};

// 결과 화면 - 공유 링크를 서버에서 발급받아 재사용한다.
export function GameResultView(): React.ReactElement {
  const { t, language } = useTranslation();
  const navigate = useNavigate();
  const { warning: showWarning, success: showSuccess, error: showError } = useToast();

  const navigationHistory = useGameStore((s) => s.navigationHistory);
  const elapsedMs = useGameStore((s) => s.elapsedMs);
  const targetWord = useGameStore((s) => s.targetWord);
  const resetGame = useGameStore((s) => s.resetGame);
  const recordId = useGameStore((s) => s.recordId);

  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const accountInfo = useAuthStore((s) => s.accountInfo);
  const checkAuth = useAuthStore((s) => s.checkAuth);

  const [beforeTargetWord, afterTargetWord] = t('game.resultHeader').split('???');
  const [showSummary, setShowSummary] = useState<boolean>(false);
  const [replayKey, setReplayKey] = useState<number>(0);
  const [shareLink, setShareLink] = useState<PreparedShareLink | null>(null);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // recordId가 바뀌면 이전 공유 링크 캐시를 버린다.
  useEffect(() => {
    setShareLink(null);
  }, [recordId]);

  const handleAllCardsShown = useCallback((): void => {
    setShowSummary(true);
  }, []);

  const handleReplay = useCallback((): void => {
    setShowSummary(false);
    setReplayKey((prev: number) => prev + 1);
  }, []);

  // 클립보드 API가 실패하면 execCommand fallback으로 재시도한다.
  const handleCopyFallback = useCallback(async (url: string): Promise<boolean> => {
    const copied = await copyShareText(url);
    if (copied) {
      showSuccess(t('share.linkCopied'));
      return true;
    }

    showError(t('common.error'));
    return false;
  }, [showError, showSuccess, t]);

  // 같은 전적은 24시간 내 기존 shareId를 재사용한다.
  const ensureShareLink = useCallback(async (): Promise<PreparedShareLink | null> => {
    if (!recordId) {
      showWarning(t(isAuthenticated ? 'share.preparingLink' : 'share.loginRequired'));
      return null;
    }

    if (shareLink) {
      return shareLink;
    }

    try {
      const createdShare = await createShareRecord({ recordId });
      const preparedShare = {
        shareId: createdShare.shareId,
        shareUrl: buildShareUrl(createdShare.shareId),
        expiresAt: createdShare.expiresAt,
      };

      setShareLink(preparedShare);
      return preparedShare;
    } catch {
      showError(t('common.error'));
      return null;
    }
  }, [recordId, isAuthenticated, shareLink, showWarning, showError, t]);

  // 카카오 공유는 먼저 유효한 공유 링크를 확보한 뒤 실행한다.
  const handleShareKakao = useCallback(async (): Promise<void> => {
    const preparedShare = await ensureShareLink();
    if (!preparedShare) return;

    const nick = accountInfo?.nick ?? t('common.user');
    const timeText = formatElapsed(elapsedMs, language);

    const success = await shareKakao({
      title: t('share.kakaoTitle', { nick }),
      description: t('share.kakaoDescription', {
        targetWord,
        pathCount: String(navigationHistory.length),
        timeText,
        expiryNotice: t('share.validFor24Hours'),
        shareUrl: preparedShare.shareUrl,
      }),
      buttonTitle: t('share.kakaoButton'),
      shareUrl: preparedShare.shareUrl,
    });

    if (!success) {
      await handleCopyFallback(preparedShare.shareUrl);
    }
  }, [ensureShareLink, accountInfo, t, elapsedMs, language, targetWord, navigationHistory, handleCopyFallback]);

  // Web Share 또는 링크 복사는 동일한 공유 링크를 사용한다.
  const handleCopyLink = useCallback(async (): Promise<void> => {
    const preparedShare = await ensureShareLink();
    if (!preparedShare) return;

    const nick = accountInfo?.nick ?? t('common.user');
    const timeText = formatElapsed(elapsedMs, language);
    const pathCount = navigationHistory.length;

    if (typeof navigator.share === 'function') {
      try {
        await navigator.share({
          title: t('share.webShareTitle', { nick }),
          text: t('share.webShareText', {
            targetWord,
            pathCount: String(pathCount),
            timeText,
            expiryNotice: t('share.validFor24Hours'),
          }),
          url: preparedShare.shareUrl,
        });
        return;
      } catch {
        // 사용자가 취소하거나 미지원 환경이면 링크 복사로 폴백한다.
      }
    }

    await handleCopyFallback(preparedShare.shareUrl);
  }, [ensureShareLink, accountInfo, t, elapsedMs, language, navigationHistory, targetWord, handleCopyFallback]);

  // 링크 패널을 열 때도 미리 공유 링크를 준비할 수 있게 한다.
  const handlePrepareShareLink = useCallback(async (): Promise<string | null> => {
    const preparedShare = await ensureShareLink();
    return preparedShare?.shareUrl ?? null;
  }, [ensureShareLink]);

  return (
    <div className="flex flex-col flex-1 bg-gray-50 dark:bg-gray-900">
      <div className="flex-1 overflow-y-auto">
        <div className="flex flex-col items-center px-4 py-8">
          <h2 className="animate-result-header text-lg font-bold text-gray-800 dark:text-gray-100 mb-8 text-center leading-relaxed">
            {beforeTargetWord}
            <span className="inline-flex items-center mx-1 px-2 py-0.5 rounded-md bg-red-100 text-red-500 dark:bg-red-900/30 dark:text-red-300 shadow-sm">
              {targetWord}
            </span>
            {afterTargetWord}
          </h2>

          <PathTimeline
            key={replayKey}
            history={navigationHistory}
            onAllCardsShown={handleAllCardsShown}
          />

          <ResultSummary
            history={navigationHistory}
            elapsedMs={elapsedMs}
            targetWord={targetWord}
            isVisible={showSummary}
            onRestart={resetGame}
            onReplay={handleReplay}
            mode="own"
            onShareKakao={handleShareKakao}
            shareUrl={shareLink?.shareUrl}
            onCopyLink={handleCopyLink}
            onPrepareShareLink={handlePrepareShareLink}
          />

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
