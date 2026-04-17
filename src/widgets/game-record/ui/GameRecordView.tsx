import { useTranslation, useAuthStore } from '@shared';
import { useGameRecords } from '@features';
import { RecordSummaryBar } from './RecordSummaryBar';
import { RecordCard } from './RecordCard';
import { EmptyRecordView } from './EmptyRecordView';

// 전적 페이지 메인 컨테이너
export function GameRecordView(): React.ReactElement {
  const { t } = useTranslation();
  const hasHydrated = useAuthStore((s) => s.hasHydrated);
  const { data, isLoading, isError } = useGameRecords();

  // 로딩 상태
  if (!hasHydrated || isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <div className="w-8 h-8 border-2 border-gray-300 border-t-primary rounded-full animate-spin" />
        <p className="text-sm text-gray-400">{t('common.loading')}</p>
      </div>
    );
  }

  // 에러 상태
  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3 text-center">
        <span className="text-3xl">⚠️</span>
        <p className="text-sm text-gray-500 dark:text-gray-400">{t('common.error')}</p>
      </div>
    );
  }

  const records = data?.records ?? [];
  const summary = data?.summary;

  return (
    <div className="flex flex-col gap-5">
      {/* 페이지 타이틀 */}
      <div className="flex items-center gap-2">
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">
          {t('record.title')}
        </h1>
        <span className="text-sm text-gray-400 dark:text-gray-500">
          {t('record.titleDesc')} ({records.length}/5)
        </span>
      </div>

      {/* 상단 요약 통계 바 */}
      {summary && <RecordSummaryBar summary={summary} />}

      {/* 전적 카드 리스트 */}
      {records.length === 0 ? (
        <EmptyRecordView />
      ) : (
        <div className="flex flex-col gap-3">
          {records.map((record, index) => (
            <RecordCard key={record.recordId} record={record} index={index} />
          ))}
        </div>
      )}
    </div>
  );
}
