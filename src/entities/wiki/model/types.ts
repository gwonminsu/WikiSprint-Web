// Wikipedia REST API 응답 타입

// 문서 요약 (random/summary, page/summary)
export type WikiSummary = {
  title: string;
  displaytitle: string;
  extract: string;
  thumbnail?: {
    source: string;
    width: number;
    height: number;
  };
  content_urls: {
    desktop: { page: string };
    mobile: { page: string };
  };
  lang: string;
  dir: string;
  timestamp: string;
};

// 위키 문서 렌더링용 타입
export type WikiArticle = {
  title: string;
  html: string;
  sourceUrl: string;
};

// 제시어 응답 타입
export type TargetWordResponse = {
  wordId: number;
  word: string;
  difficulty: number; // 1: 쉬움, 2: 보통, 3: 어려움
  createdAt: string;
};
