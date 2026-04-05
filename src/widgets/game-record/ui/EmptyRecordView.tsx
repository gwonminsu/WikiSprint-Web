import { useTranslation } from '@shared';

// 전적이 없을 때 표시하는 빈 상태 UI
export function EmptyRecordView(): React.ReactElement {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col items-center justify-center py-20 gap-5 text-center">
      {/* 게임 컨트롤러 아이콘 */}
      <div className="w-20 h-20 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
        <svg
          width="40"
          height="40"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-gray-400 dark:text-gray-500"
        >
          {/* 게임패드 모양 SVG */}
          <rect x="2" y="6" width="20" height="12" rx="3" />
          <path d="M7 12h4M9 10v4" />
          <circle cx="16" cy="11" r="1" fill="currentColor" />
          <circle cx="18" cy="13" r="1" fill="currentColor" />
        </svg>
      </div>

      <div className="flex flex-col gap-1.5">
        <p className="text-base font-semibold text-gray-700 dark:text-gray-300">
          {t('record.emptyTitle')}
        </p>
        <p className="text-sm text-gray-400 dark:text-gray-500">
          {t('record.emptyDescription')}
        </p>
      </div>
    </div>
  );
}
