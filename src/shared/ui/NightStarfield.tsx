import { useEffect, useMemo, useRef, useState, type CSSProperties, type ReactElement } from 'react';

type NightStarfieldVariant = 'toggle' | 'system';

type NightStarfieldProps = {
  active: boolean;
  variant: NightStarfieldVariant;
  className: string;
  starClassName: string;
};

type StarParticle = {
  id: number;
  x: number;
  y: number;
  sizeRem: number;
  opacity: number;
  durationMs: number;
  progress: number;
  travelXRem: number;
  travelYRem: number;
};

const STARFIELD_PRESET: Record<NightStarfieldVariant, {
  initialCount: number;
  maxCount: number;
  spawnIntervalMs: number;
  durationRange: [number, number];
  startXRange: [number, number];
  startYRange: [number, number];
  travelXRange: [number, number];
  travelYRange: [number, number];
  sizeRange: [number, number];
}> = {
  toggle: {
    initialCount: 8,
    maxCount: 10,
    spawnIntervalMs: 900,
    durationRange: [8200, 11400],
    startXRange: [8, 92],
    startYRange: [18, 86],
    travelXRange: [1.3, 2.1],
    travelYRange: [-0.9, -1.7],
    sizeRange: [0.05, 0.11],
  },
  system: {
    initialCount: 4,
    maxCount: 5,
    spawnIntervalMs: 1250,
    durationRange: [9800, 13200],
    startXRange: [10, 88],
    startYRange: [22, 80],
    travelXRange: [1.1, 1.8],
    travelYRange: [-0.7, -1.35],
    sizeRange: [0.05, 0.1],
  },
};

function randomBetween([min, max]: readonly [number, number]): number {
  return min + ((max - min) * Math.random());
}

function createStarParticle(
  variant: NightStarfieldVariant,
  progress: number,
  nextId: () => number,
): StarParticle {
  const preset = STARFIELD_PRESET[variant];

  return {
    id: nextId(),
    x: randomBetween(preset.startXRange),
    y: randomBetween(preset.startYRange),
    sizeRem: randomBetween(preset.sizeRange),
    opacity: randomBetween([0.46, 0.92]),
    durationMs: randomBetween(preset.durationRange),
    progress,
    travelXRem: randomBetween(preset.travelXRange),
    travelYRem: randomBetween(preset.travelYRange),
  };
}

function usePrefersReducedMotion(): boolean {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const updatePreference = (): void => {
      setPrefersReducedMotion(mediaQuery.matches);
    };

    updatePreference();
    mediaQuery.addEventListener('change', updatePreference);

    return () => {
      mediaQuery.removeEventListener('change', updatePreference);
    };
  }, []);

  return prefersReducedMotion;
}

export function NightStarfield({
  active,
  variant,
  className,
  starClassName,
}: NightStarfieldProps): ReactElement {
  const prefersReducedMotion = usePrefersReducedMotion();
  const [stars, setStars] = useState<StarParticle[]>([]);
  const intervalRef = useRef<number | null>(null);
  const timeoutIdsRef = useRef<number[]>([]);
  const starIdSequenceRef = useRef(0);

  const preset = STARFIELD_PRESET[variant];

  const getNextStarId = (): number => {
    starIdSequenceRef.current += 1;
    return starIdSequenceRef.current;
  };

  const clearTimers = (): void => {
    if (intervalRef.current !== null) {
      window.clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    timeoutIdsRef.current.forEach((timeoutId) => {
      window.clearTimeout(timeoutId);
    });
    timeoutIdsRef.current = [];
  };

  useEffect(() => {
    clearTimers();

    if (!active) {
      setStars([]);
      return;
    }

    const initialStars = Array.from(
      { length: preset.initialCount },
      () => createStarParticle(
        variant,
        prefersReducedMotion ? 0 : randomBetween([0.12, 0.78]),
        getNextStarId,
      ),
    );

    setStars(initialStars);

    if (prefersReducedMotion) {
      return;
    }

    const scheduleRemoval = (star: StarParticle): void => {
      const remainingMs = Math.max(200, Math.round(star.durationMs * (1 - star.progress)));

      const timeoutId = window.setTimeout(() => {
        setStars((currentStars) => currentStars.filter((currentStar) => currentStar.id !== star.id));
        timeoutIdsRef.current = timeoutIdsRef.current.filter((currentId) => currentId !== timeoutId);
      }, remainingMs);

      timeoutIdsRef.current.push(timeoutId);
    };

    initialStars.forEach(scheduleRemoval);

    intervalRef.current = window.setInterval(() => {
      setStars((currentStars) => {
        if (currentStars.length >= preset.maxCount) {
          return currentStars;
        }

        const nextStar = createStarParticle(variant, 0, getNextStarId);
        scheduleRemoval(nextStar);
        return [...currentStars, nextStar];
      });
    }, preset.spawnIntervalMs);

    return () => {
      clearTimers();
    };
  }, [active, prefersReducedMotion, preset.initialCount, preset.maxCount, preset.spawnIntervalMs, variant]);

  const starNodes = useMemo(() => stars.map((star) => {
    const style = {
      left: `${star.x}%`,
      top: `${star.y}%`,
      width: `${star.sizeRem}rem`,
      height: `${star.sizeRem}rem`,
      opacity: star.opacity,
      animationDuration: `${star.durationMs}ms`,
      animationDelay: `${-Math.round(star.durationMs * star.progress)}ms`,
      '--theme-star-travel-x': `${star.travelXRem}rem`,
      '--theme-star-travel-y': `${star.travelYRem}rem`,
    } as CSSProperties;

    return (
      <span
        key={star.id}
        className={starClassName}
        data-reduced-motion={prefersReducedMotion ? 'true' : 'false'}
        style={style}
      />
    );
  }), [prefersReducedMotion, starClassName, stars]);

  return (
    <span
      className={className}
      aria-hidden="true"
      data-active={active ? 'true' : 'false'}
      data-reduced-motion={prefersReducedMotion ? 'true' : 'false'}
    >
      {starNodes}
    </span>
  );
}
