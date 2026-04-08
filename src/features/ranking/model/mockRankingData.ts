// 수정: 랭킹 프론트 UI 테스트용 대량 더미 데이터 (me 고정값 반영)
import type { RankingDifficulty, RankingPeriod } from '@/entities/ranking/types';

type RankingRecord = {
  id: number;
  accountId: string;
  nickname: string;
  profileImageUrl: string | null;
  periodType: RankingPeriod;
  difficulty: RankingDifficulty;
  elapsedMs: number;
  targetWord: string;
  startDoc: string;
  pathLength: number;
  createdAt: string;
};

type RankingResponse = {
  bucketDate: string;
  serverNow: string;
  me: RankingRecord | null;
  top100: RankingRecord[];
};

const MY_ACCOUNT_ID = 'ACC-019d1d37-e0c4-7b83-906d-2a4de6609acd';
const MY_NICKNAME = '아름민수22';
const MY_PROFILE_IMAGE_URL =
  'ACC-019d1d37-e0c4-7b83-906d-2a4de6609acd/ACC-019d1d37-e0c4-7b83-906d-2a4de6609acd/profile/FIL-019d695b-893a-7e1e-954b-4cb344d081b1.jpg';

const SERVER_NOW = '2026-04-8T02:28:42.285945600';

const TARGET_WORDS = [
  '피라미드', '양자역학', '사하라 사막', '대한민국', '화성',
  '나폴레옹', '고양이', '제우스', '블랙홀', '커피',
  '조선', 'DNA', '인터넷', '파스타', '서울',
  '상대성 이론', '태풍', '미토콘드리아', '민주주의', '초전도체',
  '이집트', '그리스 신화', '우주', '포유류', '에티오피아',
  '컴퓨터 네트워크', '산소', '중력', '한글', '축구',
];

const START_DOCS = [
  '이집트', '알베르트 아인슈타인', '낙타', '아시아', '태양계',
  '프랑스 혁명', '포유류', '그리스 신화', '우주', '에티오피아',
  '한반도', '유전학', '컴퓨터 네트워크', '이탈리아', '대한민국',
  '물리학', '기상학', '세포생물학', '정치학', '전자기학',
  '카이로', '아테네', '은하', '동물', '아프리카',
  '네트워크', '화학', '아이작 뉴턴', '한국사', '스포츠',
];

const NICKNAMES = [
  '스피드헌터', '위키폭주기관차', '도파민주인', '링크만타면간다', '문서사냥개',
  '클릭의신', '위키닌자', '문서러너', '타임어택장인', '문서점프왕',
  '위키도적', '링크추적자', '논스톱클릭커', '탭킬러', '청와대폭격기',
  '초고속정주행', '파란링크수집가', '위키스프린터', '문서매미', '클릭폭탄',
];

function profile(seed: number): string {
  return `https://i.pravatar.cc/150?img=${(seed % 70) + 1}`;
}

function getMixedDifficultyByIndex(index: number): 'easy' | 'normal' | 'hard' {
  const mod = index % 3;
  if (mod === 0) return 'easy';
  if (mod === 1) return 'normal';
  return 'hard';
}

function getBucketDate(period: RankingPeriod): string {
  switch (period) {
    case 'daily':
      return '2026-04-08';
    case 'weekly':
      return '2026-04-06';
    case 'monthly':
      return '2026-04-01';
  }
}

function getDifficultyBaseMs(difficulty: RankingDifficulty): number {
  switch (difficulty) {
    case 'easy':
      return 68000;
    case 'normal':
      return 98000;
    case 'hard':
      return 128000;
    case 'all':
    default:
      return 72000;
  }
}

function buildCreatedAt(period: RankingPeriod, index: number): string {
  const date = getBucketDate(period);
  const hour = String(8 + (index % 12)).padStart(2, '0');
  const minute = String((index * 7) % 60).padStart(2, '0');
  const second = String((index * 13) % 60).padStart(2, '0');
  return `${date}T${hour}:${minute}:${second}`;
}

function buildElapsedMs(
  difficulty: RankingDifficulty,
  index: number,
  period: RankingPeriod,
): number {
  const base = getDifficultyBaseMs(difficulty);
  const periodOffset =
    period === 'daily' ? 0 : period === 'weekly' ? 5000 : 11000;

  return base + periodOffset + index * 1300 + (index % 5) * 111;
}

function buildTargetWord(index: number): string {
  const base = TARGET_WORDS[index % TARGET_WORDS.length];
  if (index % 19 === 0) return `${base} 관련 심화 문서`;
  return base;
}

function buildStartDoc(index: number): string {
  const base = START_DOCS[index % START_DOCS.length];
  if (index % 23 === 0) return `${base} 개요`;
  return base;
}

function buildNickname(index: number): string {
  const base = NICKNAMES[index % NICKNAMES.length];
  if (index % 17 === 0) return `${base}테스트${index}`;
  return `${base}${index}`;
}

function createRecord(params: {
  id: number;
  accountId: string;
  nickname: string;
  profileImageUrl: string | null;
  periodType: RankingPeriod;
  difficulty: RankingDifficulty;
  elapsedMs: number;
  targetWord: string;
  startDoc: string;
  pathLength: number;
  createdAt: string;
}): RankingRecord {
  return {
    id: params.id,
    accountId: params.accountId,
    nickname: params.nickname,
    profileImageUrl: params.profileImageUrl,
    periodType: params.periodType,
    difficulty: params.difficulty,
    elapsedMs: params.elapsedMs,
    targetWord: params.targetWord,
    startDoc: params.startDoc,
    pathLength: params.pathLength,
    createdAt: params.createdAt,
  };
}

function sortRecords(list: RankingRecord[]): RankingRecord[] {
  return [...list].sort((a, b) => {
    if (a.elapsedMs !== b.elapsedMs) return a.elapsedMs - b.elapsedMs;
    return a.createdAt.localeCompare(b.createdAt);
  });
}

function generateTop100(
  period: RankingPeriod,
  difficulty: RankingDifficulty,
  seed: number,
): RankingRecord[] {
  const records: RankingRecord[] = [];

  for (let i = 0; i < 100; i += 1) {
    const actualDifficulty =
      difficulty === 'all' ? getMixedDifficultyByIndex(i) : difficulty;

    records.push(
      createRecord({
        id: seed + i + 1,
        accountId: `ACC-${period}-${difficulty}-${String(i + 1).padStart(3, '0')}`,
        nickname: buildNickname(seed + i),
        profileImageUrl: profile(seed + i),
        periodType: period,
        difficulty,
        elapsedMs: buildElapsedMs(difficulty, i, period),
        targetWord:
          difficulty === 'all'
            ? `[${actualDifficulty.toUpperCase()}] ${buildTargetWord(i)}`
            : buildTargetWord(i),
        startDoc: buildStartDoc(i),
        pathLength: 4 + (i % 11),
        createdAt: buildCreatedAt(period, i),
      }),
    );
  }

  return sortRecords(records);
}

// me 고정값
function getFixedMe(
  period: RankingPeriod,
  difficulty: RankingDifficulty,
): RankingRecord | null {
  const bucketDate = getBucketDate(period);

  if (difficulty !== 'easy' && difficulty !== 'all') {
    return null;
  }

  const idMap: Record<string, number> = {
    'daily-easy': 1,
    'weekly-easy': 2,
    'monthly-easy': 3,
    'daily-all': 4,
    'weekly-all': 5,
    'monthly-all': 6,
  };

  const key = `${period}-${difficulty}`;

  return {
    id: idMap[key],
    accountId: MY_ACCOUNT_ID,
    nickname: MY_NICKNAME,
    profileImageUrl: MY_PROFILE_IMAGE_URL,
    periodType: period,
    difficulty,
    elapsedMs: 146301,
    targetWord: '사하라 사막',
    startDoc: '박인환 (배우)',
    pathLength: 9,
    createdAt: '2026-04-08T02:26:45.226539',
  };
}

// me를 top100 안에 삽입할지 여부 설정
function injectMeIntoTop100(
  top100: RankingRecord[],
  me: RankingRecord | null,
  insertRank?: number,
): RankingRecord[] {
  if (!me || !insertRank) return top100;

  const index = Math.max(0, Math.min(insertRank - 1, 99));
  const copied = [...top100];

  // 해당 위치에 me를 넣고 다시 정렬하지 않고 순위 테스트가 쉽도록 직접 삽입
  copied.splice(index, 0, me);

  return copied.slice(0, 100);
}

function buildResponse(params: {
  period: RankingPeriod;
  difficulty: RankingDifficulty;
  seed: number;
  meInsertRank?: number;
}): RankingResponse {
  const baseTop100 = generateTop100(params.period, params.difficulty, params.seed);
  const me = getFixedMe(params.period, params.difficulty);

  return {
    bucketDate: getBucketDate(params.period),
    serverNow: SERVER_NOW,
    me,
    top100: injectMeIntoTop100(baseTop100, me, params.meInsertRank),
  };
}

export const mockRankingData: Record<
  RankingPeriod,
  Record<RankingDifficulty, RankingResponse>
> = {
  daily: {
    all: buildResponse({
      period: 'daily',
      difficulty: 'all',
      seed: 0,
      meInsertRank: 18,
    }),
    easy: buildResponse({
      period: 'daily',
      difficulty: 'easy',
      seed: 1000,
      meInsertRank: 22,
    }),
    normal: buildResponse({
      period: 'daily',
      difficulty: 'normal',
      seed: 2000,
    }),
    hard: buildResponse({
      period: 'daily',
      difficulty: 'hard',
      seed: 3000,
    }),
  },

  weekly: {
    all: buildResponse({
      period: 'weekly',
      difficulty: 'all',
      seed: 4000,
      meInsertRank: 31,
    }),
    easy: buildResponse({
      period: 'weekly',
      difficulty: 'easy',
      seed: 5000,
      meInsertRank: 28,
    }),
    normal: buildResponse({
      period: 'weekly',
      difficulty: 'normal',
      seed: 6000,
    }),
    hard: buildResponse({
      period: 'weekly',
      difficulty: 'hard',
      seed: 7000,
    }),
  },

  monthly: {
    all: buildResponse({
      period: 'monthly',
      difficulty: 'all',
      seed: 8000,
      meInsertRank: 44,
    }),
    easy: buildResponse({
      period: 'monthly',
      difficulty: 'easy',
      seed: 9000,
      meInsertRank: 39,
    }),
    normal: buildResponse({
      period: 'monthly',
      difficulty: 'normal',
      seed: 10000,
    }),
    hard: buildResponse({
      period: 'monthly',
      difficulty: 'hard',
      seed: 11000,
    }),
  },
};