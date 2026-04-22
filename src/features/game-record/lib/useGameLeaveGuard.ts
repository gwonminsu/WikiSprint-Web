import { useCallback, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDialog, useGameStore, useToast, useTranslation } from '@shared';
import { useGameRecord } from './useGameRecord';

const GAME_LEAVE_GUARD_KEY = '__wsGameLeaveGuard';

type LeaveCallbacks = {
  onLeave: () => void;
  onStay?: () => void;
};

function isGuardHistoryState(state: unknown): boolean {
  if (typeof state !== 'object' || state === null) return false;

  const historyState = state as Record<string, unknown>;
  return historyState[GAME_LEAVE_GUARD_KEY] === true;
}

function useGameLeaveConfirm(): {
  confirmLeave: (callbacks: LeaveCallbacks) => void;
} {
  const { showConfirm } = useDialog();
  const { t } = useTranslation();
  const { info: showInfo } = useToast();
  const resetGame = useGameStore((state) => state.resetGame);
  const { abandonRecord } = useGameRecord();
  const isConfirmOpenRef = useRef(false);

  const confirmLeave = useCallback(({ onLeave, onStay }: LeaveCallbacks): void => {
    if (isConfirmOpenRef.current) return;

    isConfirmOpenRef.current = true;
    showConfirm({
      message: t('game.leaveConfirm'),
      onConfirm: () => {
        isConfirmOpenRef.current = false;
        abandonRecord();
        resetGame();
        onLeave();
        showInfo(t('game.abandonedByNavigation'));
      },
      onCancel: () => {
        isConfirmOpenRef.current = false;
        onStay?.();
      },
    });
  }, [abandonRecord, resetGame, showConfirm, showInfo, t]);

  return { confirmLeave };
}

export function useGameLeaveGuard(): {
  guardedNavigate: (path: string) => void;
} {
  const navigate = useNavigate();
  const phase = useGameStore((state) => state.phase);
  const resetGame = useGameStore((state) => state.resetGame);
  const { confirmLeave } = useGameLeaveConfirm();

  const guardedNavigate = useCallback((path: string): void => {
    if (phase === 'playing') {
      confirmLeave({
        onLeave: () => {
          navigate(path, { replace: isGuardHistoryState(window.history.state) });
        },
      });
      return;
    }

    if (phase === 'completed' || phase === 'result') {
      if (path === '/auth') {
        navigate(path, { replace: isGuardHistoryState(window.history.state) });
        return;
      }

      resetGame();
      navigate(path, { replace: isGuardHistoryState(window.history.state) });
      return;
    }

    navigate(path);
  }, [confirmLeave, navigate, phase, resetGame]);

  return { guardedNavigate };
}

export function GameLeaveGuard(): null {
  const phase = useGameStore((state) => state.phase);
  const { confirmLeave } = useGameLeaveConfirm();
  const hasSentinelRef = useRef(false);
  const ignoreNextPopRef = useRef(false);

  useEffect(() => {
    const hasGuardState = isGuardHistoryState(window.history.state);

    if (phase === 'playing') {
      if (hasSentinelRef.current || hasGuardState) {
        hasSentinelRef.current = true;
        return;
      }

      window.history.pushState(
        { ...(window.history.state as Record<string, unknown> | null), [GAME_LEAVE_GUARD_KEY]: true },
        '',
        window.location.href
      );
      hasSentinelRef.current = true;
      return;
    }

    if (!hasSentinelRef.current) return;

    if (hasGuardState) {
      ignoreNextPopRef.current = true;
      hasSentinelRef.current = false;
      window.history.back();
      return;
    }

    hasSentinelRef.current = false;
  }, [phase]);

  useEffect(() => {
    const handlePopState = (): void => {
      if (ignoreNextPopRef.current) {
        ignoreNextPopRef.current = false;
        hasSentinelRef.current = isGuardHistoryState(window.history.state);
        return;
      }

      const hasGuardState = isGuardHistoryState(window.history.state);

      if (phase !== 'playing') {
        hasSentinelRef.current = hasGuardState;
        return;
      }

      if (hasGuardState) {
        hasSentinelRef.current = true;
        return;
      }

      if (!hasSentinelRef.current) return;

      confirmLeave({
        onLeave: () => {
          ignoreNextPopRef.current = true;
          hasSentinelRef.current = false;
          window.history.back();
        },
        onStay: () => {
          window.history.pushState(
            { ...(window.history.state as Record<string, unknown> | null), [GAME_LEAVE_GUARD_KEY]: true },
            '',
            window.location.href
          );
          hasSentinelRef.current = true;
        },
      });
    };

    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [confirmLeave, phase]);

  return null;
}
