import React from 'react';
import { useTranslation, getTranslations } from '@shared';

type WikiLoadingOverlayProps = {
  isVisible: boolean;
};

// 배열 셔플 함수
function shuffleArray<T>(array: T[]): T[] {
  const newArray = [...array];

  for (let i = newArray.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }

  return newArray;
}

export function WikiLoadingOverlay({
  isVisible,
}: WikiLoadingOverlayProps): React.ReactElement | null {
  const { t, language } = useTranslation();

  // 최초 렌더 시 한 번만 랜덤 순서 생성 — 언어별 칩 목록에서 셔플
  const [shuffledMessages] = React.useState<string[]>(() =>
    shuffleArray([...getTranslations(language).game.loadingChips])
  );

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-20 flex items-center justify-center bg-white/70 backdrop-blur-md dark:bg-gray-950/70">
      {/* 메인 카드 */}
      <div className="relative w-[340px] overflow-hidden rounded-[30px] border border-black/5 bg-white/90 px-6 py-7 shadow-[0_20px_70px_rgba(0,0,0,0.12)] dark:border-white/10 dark:bg-gray-900/90">
        {/* 배경 글로우 */}
        <div className="pointer-events-none absolute left-1/2 top-1/2 h-40 w-40 -translate-x-1/2 -translate-y-1/2 rounded-full bg-sky-200/30 blur-3xl dark:bg-sky-500/10" />

        {/* 공전 애니메이션 영역 */}
        <div className="relative mx-auto mb-6 flex h-[190px] w-[190px] items-center justify-center">
          {/* 바깥 은은한 링 */}
          <div className="absolute h-[164px] w-[164px] rounded-full border border-slate-200/80 dark:border-slate-700/80" />
          <div className="absolute h-[126px] w-[126px] rounded-full border border-slate-100 dark:border-slate-800" />

          {/* 중앙 문서 카드 */}
          <div className="relative z-10 flex h-[108px] w-[82px] items-center justify-center rounded-[22px] border border-slate-200 bg-white shadow-[0_12px_28px_rgba(0,0,0,0.08)] dark:border-slate-700 dark:bg-slate-800">
            <div className="w-12">
              <div className="mb-2 h-2.5 w-8 rounded-full bg-slate-200 dark:bg-slate-600" />
              <div className="mb-1.5 h-1.5 w-10 rounded-full bg-slate-200 dark:bg-slate-700" />
              <div className="mb-1.5 h-1.5 w-7 rounded-full bg-slate-200 dark:bg-slate-700" />
              <div className="h-1.5 w-12 rounded-full bg-slate-200 dark:bg-slate-700" />
            </div>
          </div>

          {/* 바깥 공전 레이어 */}
          <div className="orbit orbit-slow absolute inset-0">
            <div className="orbit-item top-2 left-1/2 h-8 w-8 -translate-x-1/2 rounded-xl bg-linear-to-br from-cyan-400 to-sky-400 shadow-md" />
            <div className="orbit-item top-1/2 right-1.5 h-7 w-12 -translate-y-1/2 rounded-full bg-linear-to-r from-violet-400 to-fuchsia-400 shadow-md" />
            <div className="orbit-item bottom-2.5 left-1/2 h-8 w-8 -translate-x-1/2 rounded-lg bg-linear-to-br from-emerald-400 to-teal-400 shadow-md" />
            <div className="orbit-item top-1/2 left-1 h-7 w-10 -translate-y-1/2 rounded-full bg-linear-to-r from-amber-400 to-orange-400 shadow-md" />
          </div>

          {/* 안쪽 공전 레이어 */}
          <div className="orbit orbit-fast absolute inset-6">
            <div className="orbit-item top-0.5 left-1/2 h-3 w-3 -translate-x-1/2 rounded-full bg-slate-400 dark:bg-slate-500" />
            <div className="orbit-item top-1/2 right-0.5 h-3 w-3 -translate-y-1/2 rounded-full bg-slate-300 dark:bg-slate-600" />
            <div className="orbit-item bottom-0.5 left-1/2 h-3 w-3 -translate-x-1/2 rounded-full bg-slate-400 dark:bg-slate-500" />
            <div className="orbit-item top-1/2 left-0.5 h-3 w-3 -translate-y-1/2 rounded-full bg-slate-300 dark:bg-slate-600" />
          </div>

          {/* 중앙 은은한 펄스 */}
          <div className="pointer-events-none absolute h-[120px] w-[120px] rounded-full bg-sky-300/10 animate-pulse dark:bg-sky-400/10" />
        </div>

        {/* 텍스트 */}
        <div className="text-center">
          <h3 className="text-[20px] font-bold tracking-[-0.03em] text-slate-900 dark:text-white">
            {t('game.loadingTitle')}
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
            {t('game.loadingDesc')}
          </p>
        </div>

        {/* 하단 흐르는 상태 칩 */}
        <div className="mt-5 overflow-hidden">
          <div className="loading-marquee flex gap-2 whitespace-nowrap">
            {shuffledMessages.map((message, index) => (
              <span
                key={`loading-message-${index}`}
                className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-500 dark:bg-slate-800 dark:text-slate-400"
              >
                {message}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}