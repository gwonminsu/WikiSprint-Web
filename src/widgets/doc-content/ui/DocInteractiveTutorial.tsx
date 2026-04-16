import { useState } from 'react';
import { EmbossButton, SpeechBubble, gameClear, talkerFinger, talkerGood, talkerIdle, talkerStart, talkerWarn, useTranslation } from '@shared';

type TutorialStage = 'ready' | 'intro' | 'hint' | 'clear';
type TutorialFeedback = 'none' | 'external' | 'redlink' | 'detour';

type TutorialChoice = {
  id: string;
  label: string;
  tone?: 'neutral' | 'warning' | 'success';
  onClick: () => void;
};

function MultilineLabel({ text }: { text: string }): React.ReactElement {
  const lines = text.split('\n');

  return (
    <span className="flex max-w-full flex-col items-center justify-center text-center leading-snug">
      {lines.map((line, index) => (
        <span
          key={`${line}-${index}`}
          className="max-w-full whitespace-normal break-keep text-balance"
        >
          {line}
        </span>
      ))}
    </span>
  );
}

function ChoiceButton({
  label,
  tone = 'neutral',
  onClick,
}: {
  label: string;
  tone?: 'neutral' | 'warning' | 'success';
  onClick: () => void;
}): React.ReactElement {
  const toneClassName: Record<NonNullable<typeof tone>, string> = {
    neutral: 'border-gray-200 bg-white text-gray-700 hover:border-amber-300 hover:bg-amber-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:hover:border-amber-400/40 dark:hover:bg-gray-700',
    warning: 'border-red-200 bg-red-50 text-red-600 hover:border-red-300 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300',
    success: 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:border-emerald-300 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300',
  };

  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex w-full min-w-0 min-h-12 items-center justify-center rounded-2xl border px-2 py-3 text-center text-[11px] font-semibold leading-snug transition-all duration-200 hover:-translate-y-px sm:px-3 sm:text-xs md:px-4 md:text-sm ${toneClassName[tone]}`}
    >
      <MultilineLabel text={label} />
    </button>
  );
}

function DemoLinkCard({
  label,
  tone = 'neutral',
}: {
  label: string;
  tone?: 'neutral' | 'warning' | 'success';
}): React.ReactElement {
  const className = tone === 'warning'
    ? 'border-red-200 bg-red-50 text-red-500 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300'
    : tone === 'success'
      ? 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300'
      : 'border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-500/30 dark:bg-sky-500/10 dark:text-sky-300';

  return (
    <div className={`flex w-full min-w-0 min-h-20 items-center justify-center rounded-2xl border px-2 py-3 text-center text-[11px] font-semibold leading-snug sm:px-3 sm:text-xs md:text-sm ${className}`}>
      <MultilineLabel text={label} />
    </div>
  );
}

export function DocInteractiveTutorial(): React.ReactElement {
  const { t } = useTranslation();
  const [stage, setStage] = useState<TutorialStage>('ready');
  const [feedback, setFeedback] = useState<TutorialFeedback>('none');

  const handleReset = (): void => {
    setStage('ready');
    setFeedback('none');
  };

  const handleStart = (): void => {
    setStage('intro');
    setFeedback('none');
  };

  const handleHelpfulChoice = (): void => {
    setStage('hint');
    setFeedback('none');
  };

  const handleClear = (): void => {
    setStage('clear');
    setFeedback('none');
  };

  const timerText = stage === 'ready'
    ? '00:00.00'
    : stage === 'intro'
      ? '00:12.48'
      : stage === 'hint'
        ? '00:28.91'
        : '00:41.32';

  const currentDoc = stage === 'ready'
    ? t('doc.tutorial.readyDoc')
    : stage === 'intro'
      ? t('doc.tutorial.startDoc')
      : stage === 'hint'
        ? t('doc.tutorial.midDoc')
        : t('doc.tutorial.targetWord');

  const pathItems = stage === 'ready'
    ? [t('doc.tutorial.readyDoc')]
    : stage === 'intro'
      ? [t('doc.tutorial.startDoc')]
      : stage === 'hint'
        ? [t('doc.tutorial.startDoc'), t('doc.tutorial.midDoc')]
        : [t('doc.tutorial.startDoc'), t('doc.tutorial.midDoc'), t('doc.tutorial.targetWord')];

  const bubbleText = stage === 'ready'
    ? t('doc.tutorial.bubbleReady')
    : feedback === 'external'
      ? t('doc.tutorial.feedbackExternal')
      : feedback === 'redlink'
        ? t('doc.tutorial.feedbackRedlink')
        : feedback === 'detour'
          ? t('doc.tutorial.feedbackDetour')
          : stage === 'intro'
            ? t('doc.tutorial.bubbleStart')
            : stage === 'hint'
              ? t('doc.tutorial.bubbleHint')
              : t('doc.tutorial.bubbleClear');

  const helperText = feedback === 'external'
    ? t('doc.tutorial.helperExternal')
    : feedback === 'redlink'
      ? t('doc.tutorial.helperRedlink')
      : feedback === 'detour'
        ? t('doc.tutorial.helperDetour')
        : stage === 'ready'
          ? t('doc.tutorial.helperReady')
          : stage === 'intro'
            ? t('doc.tutorial.helperStart')
            : stage === 'hint'
              ? t('doc.tutorial.helperHint')
              : t('doc.tutorial.helperClear');

  const talkerImage = feedback === 'external' || feedback === 'redlink'
    ? talkerWarn
    : stage === 'ready'
      ? talkerStart
      : stage === 'clear'
        ? talkerGood
        : stage === 'hint'
          ? talkerFinger
          : talkerIdle;

  const choices: TutorialChoice[] = stage === 'ready'
    ? [
        {
          id: 'start',
          label: t('doc.tutorial.actions.start'),
          tone: 'success',
          onClick: handleStart,
        },
      ]
    : stage === 'intro'
      ? [
          {
            id: 'external',
            label: t('doc.tutorial.actions.external'),
            tone: 'warning',
            onClick: () => setFeedback('external'),
          },
          {
            id: 'redlink',
            label: t('doc.tutorial.actions.redlink'),
            tone: 'warning',
            onClick: () => setFeedback('redlink'),
          },
          {
            id: 'mammal',
            label: t('doc.tutorial.actions.progress'),
            tone: 'success',
            onClick: handleHelpfulChoice,
          },
        ]
      : stage === 'hint'
        ? [
            {
              id: 'detour',
              label: t('doc.tutorial.actions.detour'),
              tone: 'neutral',
              onClick: () => setFeedback('detour'),
            },
            {
              id: 'target',
              label: t('doc.tutorial.actions.finish'),
              tone: 'success',
              onClick: handleClear,
            },
          ]
        : [
            {
              id: 'restart',
              label: t('doc.tutorial.actions.restart'),
              tone: 'success',
              onClick: handleReset,
            },
          ];

  return (
    <div className="overflow-hidden rounded-4xl border border-amber-200/80 bg-white shadow-[0_24px_60px_rgba(15,23,42,0.10)] dark:border-gray-700 dark:bg-gray-900 dark:shadow-[0_24px_60px_rgba(0,0,0,0.35)]">
      <div className="grid min-w-0 gap-0 lg:grid-cols-[minmax(0,1.15fr)_360px]">
        <div className="min-w-0 border-b border-gray-200 p-6 dark:border-gray-700 lg:border-b-0 lg:border-r">
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-black tracking-[0.18em] text-amber-700 dark:bg-amber-500/10 dark:text-amber-300">
              {t('doc.tutorial.demoBadge')}
            </span>
            <span className="rounded-full bg-sky-100 px-3 py-1 text-xs font-semibold text-sky-700 dark:bg-sky-500/10 dark:text-sky-300">
              {t('doc.tutorial.demoLive')}
            </span>
          </div>

          <div className="rounded-[1.75rem] border border-gray-200 bg-linear-to-br from-amber-50 via-white to-sky-50 p-4 dark:border-gray-700 dark:from-gray-800 dark:via-gray-900 dark:to-slate-900">
            <div className="mb-4 flex items-center justify-between gap-3 rounded-2xl border border-gray-200 bg-white/80 px-4 py-3 dark:border-gray-700 dark:bg-gray-800/80">
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gray-400 dark:text-gray-500">
                  {t('doc.tutorial.targetLabel')}
                </p>
                <p className="truncate text-lg font-black text-gray-900 dark:text-white">
                  {t('doc.tutorial.targetWord')}
                </p>
              </div>
              <div className="rounded-full bg-gray-900 px-3 py-1.5 font-mono text-sm font-bold text-amber-300 dark:bg-black">
                {timerText}
              </div>
            </div>

            <div className="mb-4 flex items-start gap-3">
              <img
                src={talkerImage}
                alt="talker"
                className="h-20 w-20 shrink-0 object-contain"
              />
              <div className="min-w-0 flex-1">
                <SpeechBubble text={bubbleText} isTyping={false} />
              </div>
            </div>

            <div className="rounded-3xl border border-gray-200 bg-white/90 p-4 shadow-sm dark:border-gray-700 dark:bg-gray-900/90">
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-600 dark:bg-gray-800 dark:text-gray-300">
                  {t('doc.tutorial.currentDocLabel')}
                </span>
                <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700 dark:bg-amber-500/10 dark:text-amber-300">
                  {currentDoc}
                </span>
              </div>

              <div className="grid min-w-0 grid-cols-3 gap-3">
                {stage === 'ready' ? (
                  <>
                    <DemoLinkCard label={t('doc.tutorial.previewLink1')} />
                    <DemoLinkCard label={t('doc.tutorial.previewLink2')} />
                    <DemoLinkCard label={t('doc.tutorial.previewLink3')} />
                  </>
                ) : stage === 'intro' ? (
                  <>
                    <DemoLinkCard label={t('doc.tutorial.linkHelpful')} tone="success" />
                    <DemoLinkCard label={t('doc.tutorial.linkExternal')} tone="warning" />
                    <DemoLinkCard label={t('doc.tutorial.linkMissing')} tone="warning" />
                  </>
                ) : stage === 'hint' ? (
                  <>
                    <DemoLinkCard label={t('doc.tutorial.linkTarget')} tone="success" />
                    <DemoLinkCard label={t('doc.tutorial.linkDetour')} />
                    <DemoLinkCard label={t('doc.tutorial.linkSafe')} />
                  </>
                ) : (
                  <>
                    <div className="col-span-2 rounded-3xl border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-500/30 dark:bg-emerald-500/10">
                      <div className="flex items-center gap-3">
                        <img
                          src={gameClear}
                          alt="clear"
                          className="h-16 w-16 shrink-0 object-contain"
                        />
                        <div>
                          <p className="text-xs font-black tracking-[0.18em] text-emerald-700 dark:text-emerald-300">
                            CLEAR
                          </p>
                          <p className="mt-1 text-sm font-semibold text-emerald-900 dark:text-emerald-100">
                            {t('doc.tutorial.clearCardTitle')}
                          </p>
                        </div>
                      </div>
                    </div>
                    <DemoLinkCard label={t('doc.tutorial.linkTarget')} tone="success" />
                  </>
                )}
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3">
              {choices.map((choice) => (
                <ChoiceButton
                  key={choice.id}
                  label={choice.label}
                  tone={choice.tone}
                  onClick={choice.onClick}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="bg-gray-50/90 p-6 dark:bg-gray-950/70">
          <div className="rounded-[1.75rem] border border-gray-200 bg-white/95 p-5 dark:border-gray-700 dark:bg-gray-900/90">
            <h3 className="text-lg font-black text-gray-900 dark:text-white">
              {t('doc.tutorial.sidebarTitle')}
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-gray-600 dark:text-gray-300">
              {helperText}
            </p>

            <div className="mt-5 space-y-3">
              <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800/70">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gray-400 dark:text-gray-500">
                  {t('doc.tutorial.pathLabel')}
                </p>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  {pathItems.map((item, index) => (
                    <div key={`${item}-${index}`} className="flex items-center gap-2">
                      <span className="rounded-full bg-gray-900 px-3 py-1.5 text-xs font-bold text-white dark:bg-gray-700">
                        {item}
                      </span>
                      {index < pathItems.length - 1 ? (
                        <span className="text-sm text-gray-400">→</span>
                      ) : null}
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800/70">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gray-400 dark:text-gray-500">
                  {t('doc.tutorial.statusLabel')}
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <span className={`rounded-full px-3 py-1 text-xs font-bold ${stage === 'ready' ? 'bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300' : 'bg-gray-200 text-gray-500 dark:bg-gray-800 dark:text-gray-400'}`}>
                    {t('doc.tutorial.statusReady')}
                  </span>
                  <span className={`rounded-full px-3 py-1 text-xs font-bold ${stage === 'intro' || stage === 'hint' ? 'bg-sky-100 text-sky-700 dark:bg-sky-500/10 dark:text-sky-300' : 'bg-gray-200 text-gray-500 dark:bg-gray-800 dark:text-gray-400'}`}>
                    {t('doc.tutorial.statusPlaying')}
                  </span>
                  <span className={`rounded-full px-3 py-1 text-xs font-bold ${stage === 'clear' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300' : 'bg-gray-200 text-gray-500 dark:bg-gray-800 dark:text-gray-400'}`}>
                    {t('doc.tutorial.statusClear')}
                  </span>
                </div>
              </div>

              <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-400/30 dark:bg-amber-500/10">
                <p className="text-xs font-black tracking-[0.16em] text-amber-700 dark:text-amber-300">
                  {t('doc.tutorial.tipTitle')}
                </p>
                <p className="mt-2 text-sm leading-relaxed text-amber-900 dark:text-amber-100">
                  {t('doc.tutorial.tipBody')}
                </p>
              </div>

              <EmbossButton
                onClick={handleReset}
                variant="secondary"
                fullWidth={true}
                className="mt-1"
              >
                {t('doc.tutorial.actions.restart')}
              </EmbossButton>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
