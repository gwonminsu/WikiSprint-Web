// ISO 3166-1 alpha-2 국가 코드 → 국기 이미지 URL 반환
// 코드가 null이거나 유효하지 않으면 null 반환
export function getCountryFlagUrl(code: string | null | undefined): string | null {
  if (!code || code.length !== 2) return null;

  const upper = code.toUpperCase();

  // 영문 2자리 국가 코드만 허용
  if (!/^[A-Z]{2}$/.test(upper)) return null;

  // flagcdn은 소문자 코드 사용
  return `https://flagcdn.com/24x18/${upper.toLowerCase()}.png`;
}

// 고해상도 디스플레이 대응용 srcSet 반환
export function getCountryFlagSrcSet(code: string | null | undefined): string | undefined {
  if (!code || code.length !== 2) return undefined;

  const upper = code.toUpperCase();

  // 영문 2자리 국가 코드만 허용
  if (!/^[A-Z]{2}$/.test(upper)) return undefined;

  const lower = upper.toLowerCase();

  return [
    `https://flagcdn.com/24x18/${lower}.png 1x`,
    `https://flagcdn.com/48x36/${lower}.png 2x`,
    `https://flagcdn.com/72x54/${lower}.png 3x`,
  ].join(', ');
}

// 국가 옵션 타입
export type CountryOption = {
  code: string;      // ISO 3166-1 alpha-2
  nameKo: string;    // 한국어 명칭
  nameEn: string;    // 영어 명칭
  nameJa: string;    // 일본어 명칭
};

// 주요 국가 목록 (알파벳 code 순)
export const COUNTRY_LIST: CountryOption[] = [
  { code: 'AE', nameKo: '아랍에미리트', nameEn: 'United Arab Emirates', nameJa: 'アラブ首長国連邦' },
  { code: 'AR', nameKo: '아르헨티나', nameEn: 'Argentina', nameJa: 'アルゼンチン' },
  { code: 'AU', nameKo: '오스트레일리아', nameEn: 'Australia', nameJa: 'オーストラリア' },
  { code: 'AT', nameKo: '오스트리아', nameEn: 'Austria', nameJa: 'オーストリア' },
  { code: 'BE', nameKo: '벨기에', nameEn: 'Belgium', nameJa: 'ベルギー' },
  { code: 'BR', nameKo: '브라질', nameEn: 'Brazil', nameJa: 'ブラジル' },
  { code: 'CA', nameKo: '캐나다', nameEn: 'Canada', nameJa: 'カナダ' },
  { code: 'CH', nameKo: '스위스', nameEn: 'Switzerland', nameJa: 'スイス' },
  { code: 'CL', nameKo: '칠레', nameEn: 'Chile', nameJa: 'チリ' },
  { code: 'CN', nameKo: '중국', nameEn: 'China', nameJa: '中国' },
  { code: 'CO', nameKo: '콜롬비아', nameEn: 'Colombia', nameJa: 'コロンビア' },
  { code: 'CZ', nameKo: '체코', nameEn: 'Czech Republic', nameJa: 'チェコ' },
  { code: 'DE', nameKo: '독일', nameEn: 'Germany', nameJa: 'ドイツ' },
  { code: 'DK', nameKo: '덴마크', nameEn: 'Denmark', nameJa: 'デンマーク' },
  { code: 'EG', nameKo: '이집트', nameEn: 'Egypt', nameJa: 'エジプト' },
  { code: 'ES', nameKo: '스페인', nameEn: 'Spain', nameJa: 'スペイン' },
  { code: 'FI', nameKo: '핀란드', nameEn: 'Finland', nameJa: 'フィンランド' },
  { code: 'FR', nameKo: '프랑스', nameEn: 'France', nameJa: 'フランス' },
  { code: 'GB', nameKo: '영국', nameEn: 'United Kingdom', nameJa: 'イギリス' },
  { code: 'GR', nameKo: '그리스', nameEn: 'Greece', nameJa: 'ギリシャ' },
  { code: 'HK', nameKo: '홍콩', nameEn: 'Hong Kong', nameJa: '香港' },
  { code: 'HU', nameKo: '헝가리', nameEn: 'Hungary', nameJa: 'ハンガリー' },
  { code: 'ID', nameKo: '인도네시아', nameEn: 'Indonesia', nameJa: 'インドネシア' },
  { code: 'IN', nameKo: '인도', nameEn: 'India', nameJa: 'インド' },
  { code: 'IT', nameKo: '이탈리아', nameEn: 'Italy', nameJa: 'イタリア' },
  { code: 'JP', nameKo: '일본', nameEn: 'Japan', nameJa: '日本' },
  { code: 'KR', nameKo: '대한민국', nameEn: 'South Korea', nameJa: '韓国' },
  { code: 'MX', nameKo: '멕시코', nameEn: 'Mexico', nameJa: 'メキシコ' },
  { code: 'MY', nameKo: '말레이시아', nameEn: 'Malaysia', nameJa: 'マレーシア' },
  { code: 'NG', nameKo: '나이지리아', nameEn: 'Nigeria', nameJa: 'ナイジェリア' },
  { code: 'NL', nameKo: '네덜란드', nameEn: 'Netherlands', nameJa: 'オランダ' },
  { code: 'NO', nameKo: '노르웨이', nameEn: 'Norway', nameJa: 'ノルウェー' },
  { code: 'NZ', nameKo: '뉴질랜드', nameEn: 'New Zealand', nameJa: 'ニュージーランド' },
  { code: 'PH', nameKo: '필리핀', nameEn: 'Philippines', nameJa: 'フィリピン' },
  { code: 'PK', nameKo: '파키스탄', nameEn: 'Pakistan', nameJa: 'パキスタン' },
  { code: 'PL', nameKo: '폴란드', nameEn: 'Poland', nameJa: 'ポーランド' },
  { code: 'PT', nameKo: '포르투갈', nameEn: 'Portugal', nameJa: 'ポルトガル' },
  { code: 'RO', nameKo: '루마니아', nameEn: 'Romania', nameJa: 'ルーマニア' },
  { code: 'RU', nameKo: '러시아', nameEn: 'Russia', nameJa: 'ロシア' },
  { code: 'SA', nameKo: '사우디아라비아', nameEn: 'Saudi Arabia', nameJa: 'サウジアラビア' },
  { code: 'SE', nameKo: '스웨덴', nameEn: 'Sweden', nameJa: 'スウェーデン' },
  { code: 'SG', nameKo: '싱가포르', nameEn: 'Singapore', nameJa: 'シンガポール' },
  { code: 'TH', nameKo: '태국', nameEn: 'Thailand', nameJa: 'タイ' },
  { code: 'TR', nameKo: '튀르키예', nameEn: 'Türkiye', nameJa: 'トルコ' },
  { code: 'TW', nameKo: '대만', nameEn: 'Taiwan', nameJa: '台湾' },
  { code: 'UA', nameKo: '우크라이나', nameEn: 'Ukraine', nameJa: 'ウクライナ' },
  { code: 'US', nameKo: '미국', nameEn: 'United States', nameJa: 'アメリカ' },
  { code: 'VN', nameKo: '베트남', nameEn: 'Vietnam', nameJa: 'ベトナム' },
  { code: 'ZA', nameKo: '남아프리카공화국', nameEn: 'South Africa', nameJa: '南アフリカ' },
];