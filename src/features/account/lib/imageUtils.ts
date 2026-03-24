import type { Area } from 'react-easy-crop';
import * as nsfwjs from 'nsfwjs';

// nsfwjs 모델 캐시 (lazy load)
let nsfwModel: nsfwjs.NSFWJS | null = null;

// 원본 이미지에서 크롭 영역을 잘라 File 객체로 반환
export async function cropImageToFile(imageSrc: string, pixelCrop: Area): Promise<File> {
  // 오프스크린 캔버스에 이미지 로드
  const image = await loadImage(imageSrc);
  const canvas = document.createElement('canvas');
  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('캔버스 컨텍스트를 가져올 수 없습니다');

  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height,
  );

  return new Promise<File>((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error('이미지 변환에 실패했습니다'));
          return;
        }
        resolve(new File([blob], 'profile.jpg', { type: 'image/jpeg' }));
      },
      'image/jpeg',
      0.9,
    );
  });
}

// NSFW 이미지 여부 감지 (true = 부적절, false = 안전)
export async function checkNsfw(file: File): Promise<boolean> {
  const HARD_THRESHOLD = 0.6;
  const SOFT_THRESHOLD = 0.9;

  if (!nsfwModel) {
    nsfwModel = await nsfwjs.load();
  }

  const url = URL.createObjectURL(file);

  try {
    const img = await loadImage(url);
    const predictions = await nsfwModel.classify(img);

    // 1단계: 강한 NSFW 필터
    const isHardNsfw = predictions.some(
      (p) =>
        (p.className === 'Porn' || p.className === 'Hentai') &&
        p.probability > HARD_THRESHOLD // 기준 적용
    );

    if (isHardNsfw) {
      return true;
    }

    // 2단계: Sexy 조건부 필터
    const sexy = predictions.find((p) => p.className === 'Sexy');

    if (sexy && sexy.probability > SOFT_THRESHOLD) { // 높은 기준 적용
      return true;
    }

    // 통과
    return false;

  } finally {
    URL.revokeObjectURL(url);
  }
}

// 이미지 로드 헬퍼
function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('이미지 로드에 실패했습니다'));
    img.src = src;
  });
}
