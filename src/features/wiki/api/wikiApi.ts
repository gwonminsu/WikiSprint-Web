import { apiClient, API_ENDPOINTS } from '@shared';
import type { Language } from '@shared';
import type { WikiSummary, TargetWordResponse } from '@entities';

// Wikipedia API 응답 래퍼 타입 (백엔드 ApiResponse<T>)
type WikiResponse<T> = { data: T };

/**
 * Wikipedia API 클라이언트 (백엔드 경유)
 * 콘텐츠 출처: Wikipedia (CC BY-SA 3.0)
 */

// 랜덤 문서 요약 조회 (언어별)
export async function getRandomArticle(lang: Language): Promise<WikiSummary> {
  const endpoint = `${API_ENDPOINTS.WIKI.RANDOM}?lang=${lang}`;
  const res = await apiClient.get<WikiSummary>(endpoint, true);
  return (res as unknown as WikiResponse<WikiSummary>).data;
}

// 특정 문서 HTML 조회 (언어별)
export async function getArticleHtml(title: string, lang: Language): Promise<string> {
  const endpoint = `${API_ENDPOINTS.WIKI.PAGE_HTML}/${encodeURIComponent(title)}?lang=${lang}`;
  const res = await apiClient.get<{ html: string }>(endpoint, true);
  return (res as unknown as WikiResponse<{ html: string }>).data.html;
}

// 특정 문서 요약 조회 (언어별)
export async function getArticleSummary(title: string, lang: Language): Promise<WikiSummary> {
  const endpoint = `${API_ENDPOINTS.WIKI.PAGE_SUMMARY}/${encodeURIComponent(title)}?lang=${lang}`;
  const res = await apiClient.get<WikiSummary>(endpoint, true);
  return (res as unknown as WikiResponse<WikiSummary>).data;
}

// 랜덤 제시어 조회 (DB에서 관리, 언어별)
export async function getRandomTargetWord(lang: Language): Promise<TargetWordResponse> {
  const endpoint = `${API_ENDPOINTS.WIKI.TARGET_RANDOM}?lang=${lang}`;
  const res = await apiClient.get<TargetWordResponse>(endpoint, true);
  return (res as unknown as WikiResponse<TargetWordResponse>).data;
}
