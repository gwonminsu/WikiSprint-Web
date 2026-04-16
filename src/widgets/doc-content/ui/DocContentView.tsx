import { useEffect, useRef, useState } from 'react';
import type { RefObject } from 'react';
import { useNavigate } from 'react-router-dom';
import { Accordion, EmbossButton, getLogoByLanguage, talkerFinger, talkerStart, useTranslation } from '@shared';
import { DocInteractiveTutorial } from './DocInteractiveTutorial';
import { DocVideoAccordion } from './DocVideoAccordion';

type DocSectionId = 'overview' | 'tutorial' | 'rules' | 'faq' | 'video' | 'play';

function useScrollReveal(): RefObject<HTMLElement | null> {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('scroll-revealed');
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.15 },
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return ref;
}

function SectionHeading({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}): React.ReactElement {
  return (
    <div className="space-y-3">
      <p className="text-xs font-black tracking-[0.22em] text-amber-600 dark:text-amber-300">
        {eyebrow}
      </p>
      <h2 className="text-2xl font-black tracking-tight text-gray-900 dark:text-white sm:text-3xl">
        {title}
      </h2>
      <p className="max-w-3xl whitespace-pre-line text-base leading-relaxed text-gray-600 dark:text-gray-300">
        {description}
      </p>
    </div>
  );
}

function TocFloatingIcon(): React.ReactElement {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="h-6 w-6"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="4" y="4" width="16" height="16" rx="3" />
      <path d="M8 8.5h8" />
      <path d="M8 12h8" />
      <path d="M8 15.5h5" />
    </svg>
  );
}

function TocPanel({
  title,
  items,
  activeSectionId,
  onSelect,
}: {
  title: string;
  items: Array<{ id: DocSectionId; label: string; icon: string }>;
  activeSectionId: DocSectionId;
  onSelect: (sectionId: DocSectionId) => void;
}): React.ReactElement {
  return (
    <div className="overflow-hidden rounded-[1.75rem] border border-white/60 bg-white/85 p-5 shadow-[0_18px_40px_rgba(15,23,42,0.08)] backdrop-blur dark:border-gray-700 dark:bg-gray-900/80 dark:shadow-[0_18px_40px_rgba(0,0,0,0.28)]">
      <p className="text-xs font-black tracking-[0.22em] text-gray-400 dark:text-gray-500">
        {title}
      </p>
      <div className="mt-4 space-y-2">
        {items.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => onSelect(item.id)}
            className={`flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-semibold transition-all duration-200 ${
              activeSectionId === item.id
                ? 'bg-amber-100 text-amber-800 shadow-sm dark:bg-amber-500/15 dark:text-amber-200'
                : 'bg-gray-50 text-gray-600 hover:bg-gray-100 dark:bg-gray-800/70 dark:text-gray-300 dark:hover:bg-gray-800'
            }`}
          >
            <span className="text-base">{item.icon}</span>
            <span>{item.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

// WikiSprint 문서 페이지 콘텐츠 위젯
export function DocContentView(): React.ReactElement {
  const navigate = useNavigate();
  const { t, language } = useTranslation();
  const [activeSectionId, setActiveSectionId] = useState<DocSectionId>('overview');
  const [floatingTocOpacity, setFloatingTocOpacity] = useState<number>(0);
  const [isFloatingTocOpen, setIsFloatingTocOpen] = useState<boolean>(false);

  const heroRef = useScrollReveal();
  const overviewRef = useScrollReveal();
  const tutorialRef = useScrollReveal();
  const rulesRef = useScrollReveal();
  const faqRef = useScrollReveal();
  const videoRef = useScrollReveal();
  const ctaRef = useScrollReveal();
  const tocSectionRef = useRef<HTMLElement>(null);
  useEffect(() => {
    const updateActiveSection = (): void => {
      const docSections = [
        { id: 'overview', ref: overviewRef },
        { id: 'tutorial', ref: tutorialRef },
        { id: 'rules', ref: rulesRef },
        { id: 'faq', ref: faqRef },
        { id: 'video', ref: videoRef },
        { id: 'play', ref: ctaRef },
      ] as const satisfies ReadonlyArray<{ id: DocSectionId; ref: RefObject<HTMLElement | null> }>;
      const viewportAnchor = window.innerHeight * 0.28;
      let nextActiveSectionId: DocSectionId = 'overview';

      for (const section of docSections) {
        const element = section.ref.current;
        if (!element) continue;

        const rect = element.getBoundingClientRect();
        if (rect.top <= viewportAnchor) {
          nextActiveSectionId = section.id;
        } else {
          break;
        }
      }

      const scrollBottom = window.scrollY + window.innerHeight;
      const documentBottom = document.documentElement.scrollHeight;
      if (documentBottom - scrollBottom <= 32) {
        nextActiveSectionId = 'play';
      }

      setActiveSectionId(nextActiveSectionId);
    };

    updateActiveSection();
    window.addEventListener('scroll', updateActiveSection, { passive: true });
    window.addEventListener('resize', updateActiveSection);

    return () => {
      window.removeEventListener('scroll', updateActiveSection);
      window.removeEventListener('resize', updateActiveSection);
    };
  }, [overviewRef, tutorialRef, rulesRef, faqRef, videoRef, ctaRef]);

  useEffect(() => {
    const handleFloatingTocOpacity = (): void => {
      const tocElement = tocSectionRef.current;
      if (!tocElement) return;

      if (window.innerWidth >= 1024) {
        setFloatingTocOpacity(0);
        setIsFloatingTocOpen(false);
        return;
      }

      const rect = tocElement.getBoundingClientRect();
      const fadeDistance = 120;

      if (rect.bottom >= fadeDistance) {
        setFloatingTocOpacity(0);
        return;
      }

      if (rect.bottom <= 0) {
        setFloatingTocOpacity(1);
        return;
      }

      const nextOpacity = 1 - (rect.bottom / fadeDistance);
      setFloatingTocOpacity(Math.min(1, Math.max(0, nextOpacity)));
    };

    handleFloatingTocOpacity();

    window.addEventListener('scroll', handleFloatingTocOpacity, { passive: true });
    window.addEventListener('resize', handleFloatingTocOpacity);

    return () => {
      window.removeEventListener('scroll', handleFloatingTocOpacity);
      window.removeEventListener('resize', handleFloatingTocOpacity);
    };
  }, []);

  const tocItems: Array<{ id: DocSectionId; label: string; icon: string }> = [
    { id: 'overview', label: t('doc.toc.overview'), icon: '🌐' },
    { id: 'tutorial', label: t('doc.toc.tutorial'), icon: '🎮' },
    { id: 'rules', label: t('doc.toc.rules'), icon: '📋' },
    { id: 'faq', label: t('doc.toc.faq'), icon: '🧠' },
    { id: 'video', label: t('doc.toc.video'), icon: '🎬' },
    { id: 'play', label: t('doc.toc.play'), icon: '🏁' },
  ];

  const handleScrollToSection = (sectionId: DocSectionId): void => {
    document.getElementById(sectionId)?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });
  };

  return (
    <div className="relative overflow-x-hidden bg-[radial-gradient(circle_at_top,rgba(253,183,85,0.18),transparent_32%),linear-gradient(180deg,rgba(255,250,240,0.96),rgba(249,250,251,1)_22%,rgba(248,250,252,1)_100%)] dark:bg-[radial-gradient(circle_at_top,rgba(253,183,85,0.16),transparent_30%),linear-gradient(180deg,rgba(17,24,39,1),rgba(10,15,28,1)_45%,rgba(3,7,18,1)_100%)]">
      <div className="pointer-events-none absolute inset-0 opacity-40">
        <div className="absolute -left-32 top-14 h-48 w-48 rounded-full bg-amber-300/25 blur-3xl dark:bg-amber-500/10" />
        <div className="absolute -right-24 top-72 h-56 w-56 rounded-full bg-sky-300/20 blur-3xl dark:bg-sky-500/10" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 pb-24 pt-8 sm:px-6 lg:px-8">
        <div className="fixed top-24 z-30 hidden w-[260px] lg:block lg:left-[max(2rem,calc((100vw-80rem)/2+2rem))]">
          <div className="max-h-[calc(100vh-6rem)] overflow-y-auto rounded-[1.75rem]">
            <TocPanel
              title={t('doc.toc.title')}
              items={tocItems}
              activeSectionId={activeSectionId}
              onSelect={handleScrollToSection}
            />
          </div>
        </div>

        <div className="relative min-w-0 lg:ml-[292px]">
          <aside
            ref={tocSectionRef}
            className="mb-8 min-w-0 lg:hidden"
          >
            <TocPanel
              title={t('doc.toc.title')}
              items={tocItems}
              activeSectionId={activeSectionId}
              onSelect={handleScrollToSection}
            />
          </aside>

        <div
          className="fixed bottom-5 left-4 z-40 lg:hidden"
          style={{
            opacity: floatingTocOpacity,
            transform: `translateY(${(1 - floatingTocOpacity) * 10}px) scale(${0.96 + floatingTocOpacity * 0.04})`,
            pointerEvents: floatingTocOpacity > 0.05 ? 'auto' : 'none',
          }}
        >
          <div className="flex flex-col items-start gap-3">
            <div
              className={`flex origin-bottom-left flex-col gap-2 overflow-hidden rounded-3xl border border-amber-200/80 bg-white/92 p-2 shadow-[0_18px_36px_rgba(15,23,42,0.18)] backdrop-blur transition-all duration-300 dark:border-amber-400/20 dark:bg-gray-900/88 dark:shadow-[0_18px_36px_rgba(0,0,0,0.35)] ${
                isFloatingTocOpen
                  ? 'max-h-80 translate-y-0 opacity-100'
                  : 'max-h-0 translate-y-2 border-transparent p-0 opacity-0'
              }`}
            >
              {tocItems.map((item) => (
                <button
                  key={`floating-${item.id}`}
                  type="button"
                  onClick={() => handleScrollToSection(item.id)}
                  aria-label={item.label}
                  className={`inline-flex h-12 w-12 items-center justify-center rounded-2xl text-xl transition-all duration-200 ${
                    activeSectionId === item.id
                      ? 'bg-amber-100 shadow-sm dark:bg-amber-500/15'
                      : 'bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700'
                  }`}
                >
                  <span aria-hidden="true">{item.icon}</span>
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={() => setIsFloatingTocOpen((prev) => !prev)}
              aria-label={t('doc.toc.title')}
              aria-expanded={isFloatingTocOpen}
              className="inline-flex w-14 flex-col items-center justify-center gap-1 rounded-[1.4rem] bg-amber-400 px-2 py-3 text-black shadow-lg shadow-amber-400/30 transition-transform duration-200 hover:-translate-y-1"
            >
              <TocFloatingIcon />
              <svg
                viewBox="0 0 20 20"
                aria-hidden="true"
                className={`h-4 w-4 transition-transform duration-300 ${isFloatingTocOpen ? 'rotate-0' : 'rotate-180'}`}
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="m5 7 5 6 5-6" />
              </svg>
            </button>
          </div>
        </div>

        <div className="min-w-0 space-y-8 lg:space-y-10">
          <section ref={heroRef} className="scroll-reveal-section overflow-hidden rounded-4xl border border-white/70 bg-white/85 p-6 shadow-[0_24px_60px_rgba(15,23,42,0.10)] backdrop-blur dark:border-gray-700 dark:bg-gray-900/82 dark:shadow-[0_24px_60px_rgba(0,0,0,0.35)] sm:p-8">
            <div className="grid items-center gap-8 lg:grid-cols-[1.2fr_0.8fr]">
              <div className="space-y-6">
                <div className="inline-flex items-center gap-2 rounded-full bg-amber-100 px-4 py-2 text-xs font-black tracking-[0.18em] text-amber-700 dark:bg-amber-500/10 dark:text-amber-300">
                  <span>DOC</span>
                  <span className="h-1 w-1 rounded-full bg-amber-600 dark:bg-amber-300" />
                  <span>{t('doc.hero.badge')}</span>
                </div>

                <div className="space-y-4">
                  <img
                    src={getLogoByLanguage(language)}
                    alt="WikiSprint"
                    className="h-16 object-contain sm:h-20"
                  />
                  <h1 className="max-w-3xl text-2xl font-black tracking-tight text-gray-900 dark:text-white sm:text-3xl">
                    {t('doc.hero.title')}
                  </h1>
                  <p className="max-w-3xl whitespace-pre-line text-lg font-semibold text-amber-700 dark:text-amber-300">
                    {t('doc.hero.subtitle')}
                  </p>
                  <p className="max-w-2xl whitespace-pre-line text-base leading-relaxed text-gray-600 dark:text-gray-300 sm:text-lg">
                    {t('doc.hero.description')}
                  </p>
                </div>

                <div className="flex flex-wrap gap-3">
                  <EmbossButton
                    onClick={() => handleScrollToSection('tutorial')}
                    variant="primary"
                    className="px-6"
                  >
                    {t('doc.hero.primaryAction')}
                  </EmbossButton>
                  <EmbossButton
                    onClick={() => navigate('/')}
                    variant="secondary"
                    className="px-6"
                  >
                    {t('doc.hero.secondaryAction')}
                  </EmbossButton>
                </div>
              </div>

              <div className="grid gap-4">
                <div className="rounded-[1.75rem] border border-amber-200 bg-linear-to-br from-amber-50 via-white to-amber-100 p-5 dark:border-amber-400/20 dark:from-amber-500/10 dark:via-gray-900 dark:to-gray-900">
                  <div className="mb-4 flex items-center gap-4">
                    <img
                      src={talkerStart}
                      alt="talker"
                      className="h-16 w-16 shrink-0 object-contain"
                    />
                    <div>
                      <p className="text-xs font-black tracking-[0.18em] text-amber-700 dark:text-amber-300">
                        {t('doc.hero.cardEyebrow')}
                      </p>
                      <p className="mt-2 text-lg font-bold text-gray-900 dark:text-white">
                        {t('doc.hero.cardTitle')}
                      </p>
                      <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-gray-600 dark:text-gray-300">
                        {t('doc.hero.cardBody')}
                      </p>
                    </div>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
                    <div className="rounded-2xl bg-white/80 px-4 py-3 shadow-sm dark:bg-gray-800/80">
                      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gray-400 dark:text-gray-500">
                        {t('doc.hero.metricWordTitle')}
                      </p>
                      <p className="mt-1 text-sm font-black text-gray-900 dark:text-white">
                        {t('doc.hero.metricWordValue')}
                      </p>
                    </div>
                    <div className="rounded-2xl bg-white/80 px-4 py-3 shadow-sm dark:bg-gray-800/80">
                      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gray-400 dark:text-gray-500">
                        {t('doc.hero.metricRuleTitle')}
                      </p>
                      <p className="mt-1 text-sm font-black text-gray-900 dark:text-white">
                        {t('doc.hero.metricRuleValue')}
                      </p>
                    </div>
                    <div className="rounded-2xl bg-white/80 px-4 py-3 shadow-sm dark:bg-gray-800/80">
                      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gray-400 dark:text-gray-500">
                        {t('doc.hero.metricGoalTitle')}
                      </p>
                      <p className="mt-1 text-sm font-black text-gray-900 dark:text-white">
                        {t('doc.hero.metricGoalValue')}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section
            id="overview"
            data-doc-section=""
            ref={overviewRef}
            className="scroll-reveal-section rounded-4xl border border-white/70 bg-white/85 p-6 shadow-[0_18px_40px_rgba(15,23,42,0.08)] backdrop-blur dark:border-gray-700 dark:bg-gray-900/80 dark:shadow-[0_18px_40px_rgba(0,0,0,0.28)] sm:p-8"
          >
            <SectionHeading
              eyebrow={t('doc.overview.eyebrow')}
              title={t('doc.overview.title')}
              description={t('doc.overview.description')}
            />

            <div className="mt-8 grid gap-4 md:grid-cols-3">
              {([
                {
                  icon: '🎯',
                  title: t('doc.overview.card1Title'),
                  body: t('doc.overview.card1Body'),
                },
                {
                  icon: '🔗',
                  title: t('doc.overview.card2Title'),
                  body: t('doc.overview.card2Body'),
                },
                {
                  icon: '🏆',
                  title: t('doc.overview.card3Title'),
                  body: t('doc.overview.card3Body'),
                },
              ] as const).map((item) => (
                <article
                  key={item.title}
                  className="rounded-3xl border border-gray-200 bg-gray-50/90 p-5 dark:border-gray-700 dark:bg-gray-800/70"
                >
                  <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-100 text-2xl dark:bg-amber-500/10">
                    {item.icon}
                  </div>
                  <h3 className="mt-4 text-lg font-black text-gray-900 dark:text-white">
                    {item.title}
                  </h3>
                  <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-gray-600 dark:text-gray-300">
                    {item.body}
                  </p>
                </article>
              ))}
            </div>

            <div className="mt-8 grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
              <div className="rounded-[1.75rem] border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-900/70">
                <p className="text-xs font-black tracking-[0.18em] text-gray-400 dark:text-gray-500">
                  {t('doc.overview.flowEyebrow')}
                </p>
                <div className="mt-4 space-y-4">
                  {([
                    {
                      index: '01',
                      title: t('doc.overview.flow1Title'),
                      body: t('doc.overview.flow1Body'),
                    },
                    {
                      index: '02',
                      title: t('doc.overview.flow2Title'),
                      body: t('doc.overview.flow2Body'),
                    },
                    {
                      index: '03',
                      title: t('doc.overview.flow3Title'),
                      body: t('doc.overview.flow3Body'),
                    },
                  ] as const).map((item) => (
                    <div key={item.index} className="flex gap-4 rounded-2xl bg-gray-50 p-4 dark:bg-gray-800/70">
                      <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gray-900 text-sm font-black text-white dark:bg-amber-400 dark:text-black">
                        {item.index}
                      </span>
                      <div>
                        <p className="font-bold text-gray-900 dark:text-white">{item.title}</p>
                        <p className="mt-1 whitespace-pre-line text-sm leading-relaxed text-gray-600 dark:text-gray-300">
                          {item.body}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-[1.75rem] border border-amber-200 bg-amber-50/80 p-6 dark:border-amber-400/25 dark:bg-amber-500/10">
                <div className="flex-col items-start gap-4">
                  <p className="text-xs font-black tracking-[0.18em] text-amber-700 dark:text-amber-300">
                    {t('doc.overview.tipEyebrow')}
                  </p>
                  <div className="flex items-center justify-between">
                    <img
                      src={talkerFinger}
                      alt="talker"
                      className="hidden h-20 w-20 mr-3 object-contain sm:block"
                    />
                    <div>

                      <h3 className="mt-2 text-lg font-black text-gray-900 dark:text-white">
                        {t('doc.overview.tipTitle')}
                      </h3>
                    </div>
                  </div>

                  <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-gray-700 dark:text-gray-200">
                    {t('doc.overview.tipBody')}
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section
            id="tutorial"
            data-doc-section=""
            ref={tutorialRef}
            className="scroll-reveal-section space-y-6"
          >
            <div className="rounded-4xl border border-white/70 bg-white/85 p-6 shadow-[0_18px_40px_rgba(15,23,42,0.08)] backdrop-blur dark:border-gray-700 dark:bg-gray-900/80 dark:shadow-[0_18px_40px_rgba(0,0,0,0.28)] sm:p-8">
              <SectionHeading
                eyebrow={t('doc.tutorial.eyebrow')}
                title={t('doc.tutorial.title')}
                description={t('doc.tutorial.description')}
              />
              <div className="mt-8">
                <DocInteractiveTutorial />
              </div>
            </div>
          </section>

          <section
            id="rules"
            data-doc-section=""
            ref={rulesRef}
            className="scroll-reveal-section rounded-4xl border border-white/70 bg-white/85 p-6 shadow-[0_18px_40px_rgba(15,23,42,0.08)] backdrop-blur dark:border-gray-700 dark:bg-gray-900/80 dark:shadow-[0_18px_40px_rgba(0,0,0,0.28)] sm:p-8"
          >
            <SectionHeading
              eyebrow={t('doc.rules.eyebrow')}
              title={t('doc.rules.title')}
              description={t('doc.rules.description')}
            />

            <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {([
                {
                  icon: '👤',
                  title: t('doc.rules.quick1Title'),
                  body: t('doc.rules.quick1Body'),
                },
                {
                  icon: '📊',
                  title: t('doc.rules.quick2Title'),
                  body: t('doc.rules.quick2Body'),
                },
                {
                  icon: '🧩',
                  title: t('doc.rules.quick3Title'),
                  body: t('doc.rules.quick3Body'),
                },
                {
                  icon: '🚪',
                  title: t('doc.rules.quick4Title'),
                  body: t('doc.rules.quick4Body'),
                },
              ] as const).map((item) => (
                <div
                  key={item.title}
                  className="rounded-3xl border border-gray-200 bg-gray-50/90 p-5 dark:border-gray-700 dark:bg-gray-800/70"
                >
                  <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gray-900 text-2xl text-white dark:bg-gray-800">
                    {item.icon}
                  </div>
                  <h3 className="mt-4 text-lg font-black text-gray-900 dark:text-white">
                    {item.title}
                  </h3>
                  <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-gray-600 dark:text-gray-300">
                    {item.body}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-8 space-y-3">
              <Accordion
                title={t('doc.rules.accordionBasicTitle')}
                subtitle={t('doc.rules.accordionBasicSubtitle')}
                icon="⏱"
                defaultOpen={true}
                contentClassName="px-5 py-5"
              >
                <p className="whitespace-pre-line text-sm leading-relaxed text-gray-600 dark:text-gray-300">
                  {t('doc.rules.accordionBasicBody')}
                </p>
              </Accordion>
              <Accordion
                title={t('doc.rules.accordionDifficultyTitle')}
                subtitle={t('doc.rules.accordionDifficultySubtitle')}
                icon="🎚"
                contentClassName="px-5 py-5"
              >
                <p className="whitespace-pre-line text-sm leading-relaxed text-gray-600 dark:text-gray-300">
                  {t('doc.rules.accordionDifficultyBody')}
                </p>
              </Accordion>
              <Accordion
                title={t('doc.rules.accordionRankingTitle')}
                subtitle={t('doc.rules.accordionRankingSubtitle')}
                icon="🏆"
                contentClassName="px-5 py-5"
              >
                <p className="whitespace-pre-line text-sm leading-relaxed text-gray-600 dark:text-gray-300">
                  {t('doc.rules.accordionRankingBody')}
                </p>
              </Accordion>
              <Accordion
                title={t('doc.rules.accordionNavigationTitle')}
                subtitle={t('doc.rules.accordionNavigationSubtitle')}
                icon="🧭"
                contentClassName="px-5 py-5"
              >
                <p className="whitespace-pre-line text-sm leading-relaxed text-gray-600 dark:text-gray-300">
                  {t('doc.rules.accordionNavigationBody')}
                </p>
              </Accordion>
            </div>
          </section>

          <section
            id="faq"
            data-doc-section=""
            ref={faqRef}
            className="scroll-reveal-section rounded-4xl border border-white/70 bg-white/85 p-6 shadow-[0_18px_40px_rgba(15,23,42,0.08)] backdrop-blur dark:border-gray-700 dark:bg-gray-900/80 dark:shadow-[0_18px_40px_rgba(0,0,0,0.28)] sm:p-8"
          >
            <SectionHeading
              eyebrow={t('doc.faq.eyebrow')}
              title={t('doc.faq.title')}
              description={t('doc.faq.description')}
            />

            <div className="mt-8 space-y-3">
              <Accordion
                title={t('doc.faq.item1Title')}
                icon="❓"
                contentClassName="px-5 py-5"
              >
                <p className="whitespace-pre-line text-sm leading-relaxed text-gray-600 dark:text-gray-300">
                  {t('doc.faq.item1Body')}
                </p>
              </Accordion>
              <Accordion
                title={t('doc.faq.item2Title')}
                icon="🪤"
                contentClassName="px-5 py-5"
              >
                <p className="whitespace-pre-line text-sm leading-relaxed text-gray-600 dark:text-gray-300">
                  {t('doc.faq.item2Body')}
                </p>
              </Accordion>
              <Accordion
                title={t('doc.faq.item3Title')}
                icon="🧾"
                contentClassName="px-5 py-5"
              >
                <p className="whitespace-pre-line text-sm leading-relaxed text-gray-600 dark:text-gray-300">
                  {t('doc.faq.item3Body')}
                </p>
              </Accordion>
            </div>
          </section>

          <section
            id="video"
            data-doc-section=""
            ref={videoRef}
            className="scroll-reveal-section rounded-4xl border border-white/70 bg-white/85 p-6 shadow-[0_18px_40px_rgba(15,23,42,0.08)] backdrop-blur dark:border-gray-700 dark:bg-gray-900/80 dark:shadow-[0_18px_40px_rgba(0,0,0,0.28)] sm:p-8"
          >
            <SectionHeading
              eyebrow={t('doc.video.eyebrow')}
              title={t('doc.video.title')}
              description={t('doc.video.description')}
            />

            <div className="mt-8 space-y-5">
              <div className="rounded-3xl border border-gray-200 bg-gray-50/85 px-5 py-4 dark:border-gray-700 dark:bg-gray-800/70">
                <p className="whitespace-pre-line text-sm leading-relaxed text-gray-600 dark:text-gray-300">
                  {t('doc.video.body')}
                </p>
              </div>
              <DocVideoAccordion videoId="EONlXsPEoJA" />
            </div>
          </section>

          <section
            id="play"
            data-doc-section=""
            ref={ctaRef}
            className="scroll-reveal-section overflow-hidden rounded-4xl border border-amber-200 bg-linear-to-br from-amber-50 via-white to-sky-50 p-6 shadow-[0_24px_60px_rgba(15,23,42,0.10)] dark:border-amber-400/20 dark:from-amber-500/10 dark:via-gray-900 dark:to-slate-900 dark:shadow-[0_24px_60px_rgba(0,0,0,0.35)] sm:p-8"
          >
            <div className="grid gap-6">
              <div>
                <p className="text-xs font-black tracking-[0.22em] text-amber-700 dark:text-amber-300">
                  {t('doc.cta.eyebrow')}
                </p>
                <h2 className="mt-3 text-3xl font-black tracking-tight text-gray-900 dark:text-white">
                  {t('doc.cta.title')}
                </h2>
                <p className="mt-3 max-w-3xl whitespace-pre-line text-base leading-relaxed text-gray-700 dark:text-gray-200">
                  {t('doc.cta.description')}
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <EmbossButton onClick={() => navigate('/')} variant="primary" className="px-8">
                  {t('doc.cta.primaryAction')}
                </EmbossButton>
                <EmbossButton onClick={() => handleScrollToSection('tutorial')} variant="secondary" className="px-8">
                  {t('doc.cta.secondaryAction')}
                </EmbossButton>
              </div>
              <p className="text-xs leading-relaxed text-gray-400 dark:text-gray-500">
                {t('doc.wikiLicense')}
              </p>
            </div>
          </section>
        </div>
        </div>
      </div>
    </div>
  );
}
