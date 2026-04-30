// ISO 3166-1 alpha-2 국가 코드의 국기 이미지 URL 반환
// 코드가 null이거나 유효하지 않으면 null 반환
export function getCountryFlagUrl(code: string | null | undefined): string | null {
  if (!code || code.length !== 2) return null;

  const upper = code.toUpperCase();

  // 영문 2자리 국가 코드만 허용
  if (!/^[A-Z]{2}$/.test(upper)) return null;

  // flagcdn은 소문자 코드를 사용
  return `https://flagcdn.com/24x18/${upper.toLowerCase()}.png`;
}

// 고해상도 디스플레이 대응 srcSet 반환
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
  code: string;
  nameKo: string;
  nameEn: string;
  nameJa: string;
  nameZh: string;
};

// 주요 국가 목록 (알파벳 code 순)
export const COUNTRY_LIST: CountryOption[] = [
  { code: 'AE', nameKo: '아랍에미리트', nameEn: 'United Arab Emirates', nameJa: 'アラブ首長国連邦', nameZh: '阿拉伯联合酋长国' },
  { code: 'AR', nameKo: '아르헨티나', nameEn: 'Argentina', nameJa: 'アルゼンチン', nameZh: '阿根廷' },
  { code: 'AT', nameKo: '오스트리아', nameEn: 'Austria', nameJa: 'オーストリア', nameZh: '奥地利' },
  { code: 'AU', nameKo: '오스트레일리아', nameEn: 'Australia', nameJa: 'オーストラリア', nameZh: '澳大利亚' },
  { code: 'BE', nameKo: '벨기에', nameEn: 'Belgium', nameJa: 'ベルギー', nameZh: '比利时' },
  { code: 'BR', nameKo: '브라질', nameEn: 'Brazil', nameJa: 'ブラジル', nameZh: '巴西' },
  { code: 'CA', nameKo: '캐나다', nameEn: 'Canada', nameJa: 'カナダ', nameZh: '加拿大' },
  { code: 'CH', nameKo: '스위스', nameEn: 'Switzerland', nameJa: 'スイス', nameZh: '瑞士' },
  { code: 'CL', nameKo: '칠레', nameEn: 'Chile', nameJa: 'チリ', nameZh: '智利' },
  { code: 'CN', nameKo: '중국', nameEn: 'China', nameJa: '中国', nameZh: '中国' },
  { code: 'CO', nameKo: '콜롬비아', nameEn: 'Colombia', nameJa: 'コロンビア', nameZh: '哥伦比亚' },
  { code: 'CZ', nameKo: '체코', nameEn: 'Czech Republic', nameJa: 'チェコ', nameZh: '捷克' },
  { code: 'DE', nameKo: '독일', nameEn: 'Germany', nameJa: 'ドイツ', nameZh: '德国' },
  { code: 'DK', nameKo: '덴마크', nameEn: 'Denmark', nameJa: 'デンマーク', nameZh: '丹麦' },
  { code: 'EG', nameKo: '이집트', nameEn: 'Egypt', nameJa: 'エジプト', nameZh: '埃及' },
  { code: 'ES', nameKo: '스페인', nameEn: 'Spain', nameJa: 'スペイン', nameZh: '西班牙' },
  { code: 'FI', nameKo: '핀란드', nameEn: 'Finland', nameJa: 'フィンランド', nameZh: '芬兰' },
  { code: 'FR', nameKo: '프랑스', nameEn: 'France', nameJa: 'フランス', nameZh: '法国' },
  { code: 'GB', nameKo: '영국', nameEn: 'United Kingdom', nameJa: 'イギリス', nameZh: '英国' },
  { code: 'GR', nameKo: '그리스', nameEn: 'Greece', nameJa: 'ギリシャ', nameZh: '希腊' },
  { code: 'HK', nameKo: '홍콩', nameEn: 'Hong Kong', nameJa: '香港', nameZh: '中国香港' },
  { code: 'HU', nameKo: '헝가리', nameEn: 'Hungary', nameJa: 'ハンガリー', nameZh: '匈牙利' },
  { code: 'ID', nameKo: '인도네시아', nameEn: 'Indonesia', nameJa: 'インドネシア', nameZh: '印度尼西亚' },
  { code: 'IN', nameKo: '인도', nameEn: 'India', nameJa: 'インド', nameZh: '印度' },
  { code: 'IT', nameKo: '이탈리아', nameEn: 'Italy', nameJa: 'イタリア', nameZh: '意大利' },
  { code: 'JP', nameKo: '일본', nameEn: 'Japan', nameJa: '日本', nameZh: '日本' },
  { code: 'KR', nameKo: '대한민국', nameEn: 'South Korea', nameJa: '韓国', nameZh: '韩国' },
  { code: 'MX', nameKo: '멕시코', nameEn: 'Mexico', nameJa: 'メキシコ', nameZh: '墨西哥' },
  { code: 'MY', nameKo: '말레이시아', nameEn: 'Malaysia', nameJa: 'マレーシア', nameZh: '马来西亚' },
  { code: 'NG', nameKo: '나이지리아', nameEn: 'Nigeria', nameJa: 'ナイジェリア', nameZh: '尼日利亚' },
  { code: 'NL', nameKo: '네덜란드', nameEn: 'Netherlands', nameJa: 'オランダ', nameZh: '荷兰' },
  { code: 'NO', nameKo: '노르웨이', nameEn: 'Norway', nameJa: 'ノルウェー', nameZh: '挪威' },
  { code: 'NZ', nameKo: '뉴질랜드', nameEn: 'New Zealand', nameJa: 'ニュージーランド', nameZh: '新西兰' },
  { code: 'PH', nameKo: '필리핀', nameEn: 'Philippines', nameJa: 'フィリピン', nameZh: '菲律宾' },
  { code: 'PK', nameKo: '파키스탄', nameEn: 'Pakistan', nameJa: 'パキスタン', nameZh: '巴基斯坦' },
  { code: 'PL', nameKo: '폴란드', nameEn: 'Poland', nameJa: 'ポーランド', nameZh: '波兰' },
  { code: 'PT', nameKo: '포르투갈', nameEn: 'Portugal', nameJa: 'ポルトガル', nameZh: '葡萄牙' },
  { code: 'RO', nameKo: '루마니아', nameEn: 'Romania', nameJa: 'ルーマニア', nameZh: '罗马尼亚' },
  { code: 'RU', nameKo: '러시아', nameEn: 'Russia', nameJa: 'ロシア', nameZh: '俄罗斯' },
  { code: 'SA', nameKo: '사우디아라비아', nameEn: 'Saudi Arabia', nameJa: 'サウジアラビア', nameZh: '沙特阿拉伯' },
  { code: 'SE', nameKo: '스웨덴', nameEn: 'Sweden', nameJa: 'スウェーデン', nameZh: '瑞典' },
  { code: 'SG', nameKo: '싱가포르', nameEn: 'Singapore', nameJa: 'シンガポール', nameZh: '新加坡' },
  { code: 'TH', nameKo: '태국', nameEn: 'Thailand', nameJa: 'タイ', nameZh: '泰国' },
  { code: 'TR', nameKo: '튀르키예', nameEn: 'Türkiye', nameJa: 'トルコ', nameZh: '土耳其' },
  { code: 'TW', nameKo: '대만', nameEn: 'Taiwan', nameJa: '台湾', nameZh: '中国台湾' },
  { code: 'UA', nameKo: '우크라이나', nameEn: 'Ukraine', nameJa: 'ウクライナ', nameZh: '乌克兰' },
  { code: 'US', nameKo: '미국', nameEn: 'United States', nameJa: 'アメリカ', nameZh: '美国' },
  { code: 'VN', nameKo: '베트남', nameEn: 'Vietnam', nameJa: 'ベトナム', nameZh: '越南' },
  { code: 'ZA', nameKo: '남아프리카공화국', nameEn: 'South Africa', nameJa: '南アフリカ', nameZh: '南非' },
];
