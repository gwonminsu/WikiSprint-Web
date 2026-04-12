import { apiClient, API_ENDPOINTS, ApiException } from '@shared';
import type { Language } from '@shared';
import type { WikiSummary, TargetWordResponse } from '@entities';

/**
 * Wikipedia API 클라이언트 (백엔드 경유)
 * 콘텐츠 출처: Wikipedia (CC BY-SA 3.0)
 */

// 랜덤 문서 요약 조회 (언어별)
export async function getRandomArticle(lang: Language): Promise<WikiSummary> {
  const endpoint = `${API_ENDPOINTS.WIKI.RANDOM}?lang=${lang}`;
  const res = await apiClient.get<WikiSummary>(endpoint, true);
  if (!res.data) throw new ApiException('랜덤 문서 데이터가 없습니다.', 0);
  return res.data;
}

// 특정 문서 HTML 조회 (언어별)
export async function getArticleHtml(title: string, lang: Language): Promise<string> {
  const endpoint = `${API_ENDPOINTS.WIKI.PAGE_HTML}/${encodeURIComponent(title)}?lang=${lang}`;
  const res = await apiClient.get<{ html: string }>(endpoint, true);
  if (!res.data) throw new ApiException('문서 HTML 데이터가 없습니다.', 0);
  return res.data.html;
}

// 특정 문서 요약 조회 (언어별)
export async function getArticleSummary(title: string, lang: Language): Promise<WikiSummary> {
  const endpoint = `${API_ENDPOINTS.WIKI.PAGE_SUMMARY}/${encodeURIComponent(title)}?lang=${lang}`;
  const res = await apiClient.get<WikiSummary>(endpoint, true);
  if (!res.data) throw new ApiException('문서 요약 데이터가 없습니다.', 0);
  return res.data;
}

// 랜덤 제시어 조회 (DB에서 관리, 언어별 + 선택적 난이도 필터)
// difficulty: 미전달 또는 0이면 오마카세(전체 풀), 1~3이면 해당 난이도만
export async function getRandomTargetWord(lang: Language, difficulty?: number): Promise<TargetWordResponse> {
  let endpoint = `${API_ENDPOINTS.WIKI.TARGET_RANDOM}?lang=${lang}`;
  if (difficulty !== undefined && difficulty >= 1 && difficulty <= 3) {
    endpoint += `&difficulty=${difficulty}`;
  }
  const res = await apiClient.get<TargetWordResponse>(endpoint, true);
  if (!res.data) throw new ApiException('제시어 데이터가 없습니다.', 0);
  return res.data;
}
