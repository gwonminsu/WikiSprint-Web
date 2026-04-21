import { useState, useEffect } from 'react';

type ProfileAvatarProps = {
  imageUrl: string | null;
  name: string;
  size?: 'sm' | 'md' | 'rg' | 'lg' | 'xl';
  className?: string;
  fallbackContent?: React.ReactNode;
};

// 이름에서 첫 글자 추출
const getInitial = (name: string): string => {
  if (!name) return '?';
  return name.charAt(0).toUpperCase();
};

// 이름 기반으로 일관된 배경색 생성 (붉은 계통 제외, 밝은 색상)
const getBackgroundColor = (name: string): string => {
  const colors = [
    'bg-[#FDB755]', // 메인 노란색 추가
    'bg-amber-500',
    'bg-yellow-500',
    'bg-orange-500', // 오렌지 추가
    'bg-lime-500',
    'bg-green-500',
    'bg-emerald-500',
    'bg-teal-500',
    'bg-cyan-500',
    'bg-sky-500',
    'bg-blue-500',
    'bg-indigo-500',
    'bg-violet-500',
    'bg-purple-500',
  ];

  // 이름을 기반으로 일관된 인덱스 생성
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % colors.length;
  return colors[index];
};

// 사이즈별 클래스
const sizeClasses = {
  sm: 'w-8 h-8 text-sm',
  md: 'w-10 h-10 text-base',
  rg: 'w-14 h-14 text-lg',
  lg: 'w-16 h-16 text-xl',
  xl: 'w-24 h-24 text-3xl',
};

// 프로필 아바타 컴포넌트
export function ProfileAvatar({
  imageUrl,
  name,
  size = 'md',
  className = '',
  fallbackContent,
}: ProfileAvatarProps): React.ReactElement {
  const [imageError, setImageError] = useState(false);

  // imageUrl이 변경되면 에러 상태 초기화
  useEffect(() => {
    setImageError(false);
  }, [imageUrl]);

  const showFallback = !imageUrl || imageError;

  return (
    <div
      className={`rounded-full flex items-center justify-center overflow-hidden shrink-0 ${sizeClasses[size]} ${
        showFallback ? getBackgroundColor(name) : 'bg-gray-200 dark:bg-gray-700'
      } ${className}`}
    >
      {showFallback ? (
        fallbackContent ?? <span className="font-semibold text-white">{getInitial(name)}</span>
      ) : (
        <img
          src={imageUrl}
          alt={name}
          className="w-full h-full object-cover"
          onError={() => setImageError(true)}
        />
      )}
    </div>
  );
}
