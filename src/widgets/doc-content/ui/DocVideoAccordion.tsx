import { useEffect, useRef, useState } from 'react';
import { Accordion, useTranslation } from '@shared';

type Props = {
  videoId: string;
};

// 문서 페이지의 유튜브 아코디언. 닫히면 재생을 일시정지한다.
export function DocVideoAccordion({ videoId }: Props): React.ReactElement {
  const { t } = useTranslation();
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [hasOpenedOnce, setHasOpenedOnce] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen) {
      setHasOpenedOnce(true);
      return;
    }

    const iframe = iframeRef.current;
    if (!iframe?.contentWindow) return;

    iframe.contentWindow.postMessage(
      JSON.stringify({
        event: 'command',
        func: 'pauseVideo',
        args: [],
      }),
      '*',
    );
  }, [isOpen]);

  const src = `https://www.youtube.com/embed/${videoId}?enablejsapi=1&rel=0&modestbranding=1&playsinline=1&origin=${encodeURIComponent(window.location.origin)}`;

  return (
    <Accordion
      title={t('doc.video.accordionTitle')}
      icon={(
        <svg
          viewBox="0 0 24 24"
          aria-hidden="true"
          className="h-5 w-5"
          fill="none"
        >
          <rect x="3.5" y="5.5" width="17" height="13" rx="3" fill="currentColor" opacity="0.16" />
          <path d="M10 9.2v5.6l5-2.8-5-2.8Z" fill="currentColor" />
          <rect x="3.5" y="5.5" width="17" height="13" rx="3" stroke="currentColor" strokeWidth="1.5" />
        </svg>
      )}
      isOpen={isOpen}
      onOpenChange={setIsOpen}
      contentClassName="px-5 py-5"
    >
      <div className="space-y-4">
        <div className="overflow-hidden rounded-3xl border border-gray-200 bg-black shadow-lg dark:border-gray-700">
          <div className="aspect-video w-full">
            {hasOpenedOnce ? (
              <iframe
                ref={iframeRef}
                src={src}
                title={t('doc.video.iframeTitle')}
                className="h-full w-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-[radial-gradient(circle_at_top,_rgba(253,183,85,0.18),_transparent_45%),linear-gradient(135deg,_#161616,_#080808)] px-6 text-center">
                <div>
                  <p className="text-xs font-black tracking-[0.18em] text-amber-300">
                    YOUTUBE
                  </p>
                  <p className="mt-3 text-base font-semibold text-white">
                    {t('doc.video.placeholderTitle')}
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-gray-300">
                    {t('doc.video.placeholderBody')}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Accordion>
  );
}
