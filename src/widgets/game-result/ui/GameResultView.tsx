import { useState, useCallback, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGameStore, useTranslation, useAuthStore, EmbossButton, useToast } from '@shared';
import { PathTimeline } from './PathTimeline';
import { ResultSummary } from './ResultSummary';
import { buildShareUrl, shareKakao, formatElapsed, copyShareText } from '../lib';

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

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const shareUrl = useMemo((): string | undefined => {
    if (!recordId) return undefined;
    return buildShareUrl(recordId);
  }, [recordId]);

  const handleAllCardsShown = useCallback((): void => {
    setShowSummary(true);
  }, []);

  const handleReplay = useCallback((): void => {
    setShowSummary(false);
    setReplayKey((prev: number) => prev + 1);
  }, []);

  const handleCopyFallback = useCallback(async (url: string): Promise<boolean> => {
    const copied = await copyShareText(url);
    if (copied) {
      showSuccess(t('share.linkCopied'));
      return true;
    }

    showError(t('common.error'));
    return false;
  }, [showError, showSuccess, t]);

  const handleShareKakao = useCallback(async (): Promise<void> => {
    if (!recordId) {
      showWarning(t(isAuthenticated ? 'share.preparingLink' : 'share.loginRequired'));
      return;
    }

    const url = buildShareUrl(recordId);
    const nick = accountInfo?.nick ?? t('common.user');
    const timeText = formatElapsed(elapsedMs, language);

    const success = await shareKakao({
      title: t('share.kakaoTitle', { nick }),
      description: t('share.kakaoDescription', {
        targetWord,
        pathCount: String(navigationHistory.length),
        timeText,
      }),
      buttonTitle: t('share.kakaoButton'),
      shareUrl: url,
    });

    if (!success) {
      await handleCopyFallback(url);
    }
  }, [isAuthenticated, recordId, accountInfo, targetWord, elapsedMs, navigationHistory, showWarning, handleCopyFallback, t, language]);

  const handleCopyLink = useCallback(async (): Promise<void> => {
    if (!recordId) {
      showWarning(t(isAuthenticated ? 'share.preparingLink' : 'share.loginRequired'));
      return;
    }

    const url = buildShareUrl(recordId);
    const nick = accountInfo?.nick ?? t('common.user');
    const timeText = formatElapsed(elapsedMs, language);
    const pathCount = navigationHistory.length;

    if (typeof navigator.share === 'function') {
      try {
        await navigator.share({
          title: t('share.webShareTitle', { nick }),
          text: t('share.webShareText', { targetWord, pathCount: String(pathCount), timeText }),
          url,
        });
        return;
      } catch {
        // 사용자가 닫았거나 미지원이면 링크 복사로 fallback
      }
    }

    await handleCopyFallback(url);
  }, [isAuthenticated, recordId, accountInfo, targetWord, elapsedMs, navigationHistory, showWarning, handleCopyFallback, t, language]);

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
            shareUrl={shareUrl}
            onCopyLink={handleCopyLink}
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
