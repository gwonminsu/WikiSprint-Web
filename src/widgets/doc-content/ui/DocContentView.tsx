import { useEffect, useRef } from 'react';
import type { RefObject } from 'react';
import { useNavigate } from 'react-router-dom';
import { Accordion, EmbossButton, getLogoByLanguage, talkerStart, talkerFinger, useTranslation } from '@shared';

// 스크롤 등장 애니메이션 훅
function useScrollReveal(): RefObject<HTMLDivElement | null> {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('scroll-revealed');
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.12 },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return ref;
}

// WikiSprint 문서 페이지 콘텐츠 위젯
export function DocContentView(): React.ReactElement {
  const navigate = useNavigate();
  const { t, language } = useTranslation();

  // 각 섹션별 스크롤 등장 ref
  const heroRef = useScrollReveal();
  const introRef = useScrollReveal();
  const howToRef = useScrollReveal();
  const rulesRef = useScrollReveal();
  const inspirationRef = useScrollReveal();
  const ctaRef = useScrollReveal();

  const handleGoHome = (): void => {
    navigate('/');
  };

  return (
    <div className="max-w-3xl mx-auto px-4 pb-24 pt-8 space-y-16">

      {/* Hero 섹션 */}
      <section ref={heroRef} className="scroll-reveal-section text-center space-y-4">
        <img
          src={getLogoByLanguage(language)}
          alt="WikiSprint"
          className="h-16 mx-auto object-contain"
        />
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">
          {t('doc.title')}
        </h1>
        <p className="text-lg text-primary font-semibold">{t('doc.subtitle')}</p>
        <div className="w-16 h-1 bg-primary rounded-full mx-auto opacity-60" />
      </section>

      {/* 게임 소개 섹션 */}
      <section ref={introRef} className="scroll-reveal-section space-y-6">
        <div className="flex items-start gap-6">
          {/* 캐릭터 장식 */}
          <img
            src={talkerStart}
            alt="character"
            className="w-24 h-24 object-contain flex-shrink-0 hidden sm:block"
          />
          <div className="space-y-3">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <span className="text-2xl">🌐</span>
              WikiSprint
            </h2>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
              {t('doc.introText')}
            </p>
          </div>
        </div>
      </section>

      {/* 홈 안내 섹션 */}
      <section ref={ctaRef} className="scroll-reveal-section">
        <div className="text-center space-y-5 p-8 bg-amber-50 dark:bg-amber-950/20 rounded-2xl border border-amber-200 dark:border-amber-800/40">
          <p className="text-gray-700 dark:text-gray-300 font-medium text-lg">
            {t('doc.backToHome')}
          </p>
          <EmbossButton onClick={handleGoHome} variant="primary" className="px-8">
            🏠 {t('doc.goHome')}
          </EmbossButton>
        </div>
      </section>

      {/* 게임 방법 섹션 */}
      <section ref={howToRef} className="scroll-reveal-section space-y-5">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <span className="text-2xl">🎮</span>
          {t('doc.howToPlay')}
        </h2>
        <div className="space-y-3">
          {([
            t('doc.howToPlayStep1'),
            t('doc.howToPlayStep2'),
            t('doc.howToPlayStep3'),
            t('doc.howToPlayStep4'),
          ] as string[]).map((step, index) => (
            <div
              key={index}
              className="flex items-start gap-4 p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm"
            >
              <span className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-black font-bold text-sm flex items-center justify-center">
                {index + 1}
              </span>
              <p className="text-gray-700 dark:text-gray-200 pt-1">{step}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 게임 규칙 섹션 */}
      <section ref={rulesRef} className="scroll-reveal-section space-y-4">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <span className="text-2xl">📋</span>
          {t('doc.rulesTitle')}
        </h2>
        <div className="space-y-3">
          <Accordion title={`⏱ ${t('doc.rulesBasic')}`} defaultOpen={true}>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
              {t('doc.rulesBasicDesc')}
            </p>
          </Accordion>
          <Accordion title={`🏆 ${t('doc.rulesRanking')}`}>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
              {t('doc.rulesRankingDesc')}
            </p>
          </Accordion>
        </div>
      </section>

      {/* 영감 섹션 */}
      <section ref={inspirationRef} className="scroll-reveal-section space-y-4">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <span className="text-2xl">💡</span>
          {t('doc.inspirationTitle')}
        </h2>
        <div className="flex items-start gap-4 mb-4">
          <img
            src={talkerFinger}
            alt="character"
            className="w-16 h-16 object-contain flex-shrink-0 hidden sm:block"
          />
          <p className="text-gray-600 dark:text-gray-300 leading-relaxed pt-2">
            {t('doc.inspirationDesc')}
          </p>
        </div>
        <Accordion title={`▶ ${t('doc.inspirationVideo')}`}>
          {/* 침착맨 유튜브 영상 임베드 */}
          <div className="aspect-video w-full rounded-lg overflow-hidden">
            <iframe
              src="https://www.youtube.com/embed/EONlXsPEoJA"
              title={t('doc.inspirationVideo')}
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </Accordion>
      </section>

    </div>
  );
}
