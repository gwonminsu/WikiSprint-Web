// Tailwind CSS 클래스 병합 유틸리티 (간단 버전)
export function cn(...inputs: (string | undefined | null | false)[]): string {
  return inputs.filter(Boolean).join(' ');
}
