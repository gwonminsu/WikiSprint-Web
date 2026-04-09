import { useEffect } from 'react';

// 헤더가 깨지지 않는 최소 레이아웃 너비 (px)
const MIN_VIEWPORT_WIDTH = 750;

/**
 * 뷰포트 너비가 최소 레이아웃 너비보다 좁을 때
 * 전체 화면을 축소하여 레이아웃 깨짐을 방지하는 훅
 *
 * - 모바일: viewport meta의 width를 고정하여 브라우저가 자동 축소
 * - 데스크톱: CSS zoom으로 축소
 */
export function useViewportScale(): void {
  useEffect(() => {
    const meta = document.querySelector<HTMLMetaElement>('meta[name="viewport"]');
    const root = document.documentElement;
    if (!meta) return;

    let rafId = 0;

    const adjust = (): void => {
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        // 모바일: screen.width는 기기 물리 너비 — viewport meta에 불변
        const deviceWidth = screen.width;
        if (deviceWidth < MIN_VIEWPORT_WIDTH) {
          meta.setAttribute('content', `width=${MIN_VIEWPORT_WIDTH}, user-scalable=no`);
        } else {
          meta.setAttribute('content', 'width=device-width, initial-scale=1.0');
        }

        // 데스크톱: zoom 초기화 → 실제 너비 측정 → 필요 시 zoom 적용
        // (동기 실행이므로 초기화~재적용 사이 화면 깜빡임 없음)
        root.style.zoom = '';
        root.style.minHeight = '';
        const realWidth = window.innerWidth;

        if (realWidth < MIN_VIEWPORT_WIDTH) {
          const zoom = realWidth / MIN_VIEWPORT_WIDTH;
          root.style.zoom = `${zoom}`;
          // zoom 축소 시 100vh가 실제 화면보다 작아지므로 보정
          root.style.minHeight = `${100 / zoom}vh`;
        }
      });
    };

    adjust();
    window.addEventListener('resize', adjust);
    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('resize', adjust);
      root.style.zoom = '';
      root.style.minHeight = '';
      meta.setAttribute('content', 'width=device-width, initial-scale=1.0');
    };
  }, []);
}
