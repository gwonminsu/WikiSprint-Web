import { useMemo, useState } from 'react';
import { WidgetDropdown, useTranslation, useToast, useDialog, EmbossButton } from '@shared';
import { useTargetWords, useAddTargetWord, useDeleteTargetWord } from '@features';
import type { TargetWordResponse } from '@entities';

type LangFilter = 'all' | 'ko' | 'en' | 'ja';
type DiffFilter = 0 | 1 | 2 | 3;
type SortOption = 'newest' | 'name' | 'difficulty';

const LANG_STYLE: Record<string, string> = {
  ko: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  en: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
  ja: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300',
};

const DIFF_STYLE: Record<number, string> = {
  1: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
  2: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300',
  3: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
};

function SelectDropdown({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
}): React.ReactElement {
  const currentLabel = options.find((option) => option.value === value)?.label ?? label;

  return (
    <WidgetDropdown
      align="start"
      sideOffset={4}
      contentClassName="min-w-[120px] bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg py-1 animate-scale-in"
      trigger={(triggerProps) => (
        <button
          {...triggerProps}
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:border-primary hover:text-primary transition-colors min-w-0"
        >
          <span className="truncate">{currentLabel}</span>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </button>
      )}
    >
      {({ getItemProps }) => options.map((option, index) => (
        <button
          key={option.value}
          {...getItemProps({
            index,
            onSelect: () => onChange(option.value),
          })}
          className={`w-full px-3 py-1.5 text-left text-sm cursor-pointer outline-none transition-colors ${
            option.value === value
              ? 'text-primary font-medium'
              : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
          }`}
        >
          {option.label}
        </button>
      ))}
    </WidgetDropdown>
  );
}

export function AdminTargetWordsSection(): React.ReactElement {
  const { t } = useTranslation();
  const { success: toastSuccess, error: toastError } = useToast();
  const { showConfirm } = useDialog();

  const { data: words, isLoading } = useTargetWords();
  const addMutation = useAddTargetWord();
  const deleteMutation = useDeleteTargetWord();

  const [filterLang, setFilterLang] = useState<LangFilter>('all');
  const [filterDiff, setFilterDiff] = useState<DiffFilter>(0);
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [deletingIds, setDeletingIds] = useState<Set<number>>(new Set());
  const [newWord, setNewWord] = useState<string>('');
  const [newLang, setNewLang] = useState<string>('ko');
  const [newDiff, setNewDiff] = useState<string>('1');

  const filteredWords: TargetWordResponse[] = useMemo(() => {
    let result = words ?? [];

    if (filterLang !== 'all') result = result.filter((word) => word.lang === filterLang);
    if (filterDiff !== 0) result = result.filter((word) => word.difficulty === filterDiff);

    if (sortBy === 'name') {
      result = [...result].sort((left, right) => left.word.localeCompare(right.word));
    } else if (sortBy === 'difficulty') {
      result = [...result].sort((left, right) => left.difficulty - right.difficulty);
    } else {
      result = [...result].sort(
        (left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime(),
      );
    }

    return result;
  }, [words, filterLang, filterDiff, sortBy]);

  const handleAdd = async (): Promise<void> => {
    if (!newWord.trim()) return;

    try {
      await addMutation.mutateAsync({
        word: newWord.trim(),
        difficulty: Number(newDiff),
        lang: newLang,
      });
      toastSuccess(t('admin.addSuccess'));
      setNewWord('');
    } catch (error) {
      if (!(error instanceof Error)) {
        toastError(t('admin.addFail'));
        return;
      }

      if (error.message.includes('409') || error.message.includes('CONFLICT')) {
        toastError(t('admin.duplicateWord'));
      } else {
        toastError(t('admin.addFail'));
      }
    }
  };

  const handleDelete = (word: TargetWordResponse): void => {
    showConfirm({
      message: `"${word.word}" ${t('admin.deleteConfirm')}`,
      confirmText: t('common.delete'),
      cancelText: t('common.cancel'),
      onConfirm: () => {
        setDeletingIds((prev) => new Set(prev).add(word.wordId));
        void deleteMutation.mutateAsync({ wordId: word.wordId })
          .then(() => {
            toastSuccess(t('admin.deleteSuccess'));
          })
          .catch(() => {
            toastError(t('admin.deleteFail'));
          })
          .finally(() => {
            setDeletingIds((prev) => {
              const next = new Set(prev);
              next.delete(word.wordId);
              return next;
            });
          });
      },
    });
  };

  const langOptions = [
    { value: 'ko', label: '한국어 (ko)' },
    { value: 'en', label: 'English (en)' },
    { value: 'ja', label: '日本語 (ja)' },
  ];

  const diffOptions = [
    { value: '1', label: `1 - ${t('admin.difficultyEasy')}` },
    { value: '2', label: `2 - ${t('admin.difficultyNormal')}` },
    { value: '3', label: `3 - ${t('admin.difficultyHard')}` },
  ];

  const langFilterOptions = [
    { value: 'all', label: t('admin.filterAll') },
    { value: 'ko', label: 'ko' },
    { value: 'en', label: 'en' },
    { value: 'ja', label: 'ja' },
  ];

  const diffFilterOptions = [
    { value: '0', label: t('admin.filterAll') },
    { value: '1', label: `1 - ${t('admin.difficultyEasy')}` },
    { value: '2', label: `2 - ${t('admin.difficultyNormal')}` },
    { value: '3', label: `3 - ${t('admin.difficultyHard')}` },
  ];

  const sortOptions = [
    { value: 'newest', label: t('admin.sortNewest') },
    { value: 'name', label: t('admin.sortName') },
    { value: 'difficulty', label: t('admin.difficulty') },
  ];

  return (
    <section className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
      <h2 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-4">
        {t('admin.targetWords')}
      </h2>

      <div className="flex flex-wrap gap-2 mb-4">
        <input
          type="text"
          value={newWord}
          onChange={(event: React.ChangeEvent<HTMLInputElement>) => setNewWord(event.target.value)}
          onKeyDown={(event: React.KeyboardEvent<HTMLInputElement>) => {
            if (event.key === 'Enter') void handleAdd();
          }}
          placeholder={t('admin.inputPlaceholder')}
          className="flex-1 min-w-[140px] px-3 py-1.5 text-sm border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 outline-none focus:border-primary transition-colors"
        />
        <SelectDropdown
          label={t('admin.selectLanguage')}
          value={newLang}
          options={langOptions}
          onChange={setNewLang}
        />
        <SelectDropdown
          label={t('admin.selectDifficulty')}
          value={newDiff}
          options={diffOptions}
          onChange={setNewDiff}
        />
        <EmbossButton
          variant="primary"
          onClick={() => void handleAdd()}
          disabled={!newWord.trim() || addMutation.isPending}
          className="px-4 py-1.5 text-sm h-auto"
        >
          {addMutation.isPending ? '...' : t('admin.addWord')}
        </EmbossButton>
      </div>

      <div className="flex flex-wrap gap-2 mb-3">
        <SelectDropdown
          label={`${t('admin.language')}: ${t('admin.filterAll')}`}
          value={filterLang}
          options={langFilterOptions}
          onChange={(nextValue) => setFilterLang(nextValue as LangFilter)}
        />
        <SelectDropdown
          label={`${t('admin.difficulty')}: ${t('admin.filterAll')}`}
          value={String(filterDiff)}
          options={diffFilterOptions}
          onChange={(nextValue) => setFilterDiff(Number(nextValue) as DiffFilter)}
        />
        <SelectDropdown
          label={t('admin.sortNewest')}
          value={sortBy}
          options={sortOptions}
          onChange={(nextValue) => setSortBy(nextValue as SortOption)}
        />
        <span className="ml-auto text-xs text-gray-400 dark:text-gray-500 self-center">
          {filteredWords.length}개
        </span>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-8 text-gray-400 dark:text-gray-500 text-sm">
          <span>{t('common.loading')}</span>
        </div>
      ) : filteredWords.length === 0 ? (
        <div className="flex items-center justify-center py-8 text-gray-400 dark:text-gray-500 text-sm">
          <span>{t('admin.emptyWords')}</span>
        </div>
      ) : (
        <div className="space-y-1.5 max-h-80 overflow-y-auto scrollbar-thin-custom">
          {filteredWords.map((word) => (
            <div
              key={word.wordId}
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-50 dark:bg-gray-700/30 border border-transparent hover:border-gray-200 dark:hover:border-gray-600 transition-colors group"
            >
              <span className="flex-1 font-medium text-sm text-gray-900 dark:text-white truncate">
                {word.word}
              </span>
              <span className={`shrink-0 px-1.5 py-0.5 text-[10px] font-bold rounded-full ${LANG_STYLE[word.lang] ?? 'bg-gray-100 text-gray-600'}`}>
                {word.lang}
              </span>
              <span className={`shrink-0 px-1.5 py-0.5 text-[10px] font-bold rounded-full ${DIFF_STYLE[word.difficulty] ?? 'bg-gray-100 text-gray-600'}`}>
                {word.difficulty}
              </span>
              <button
                type="button"
                onClick={() => handleDelete(word)}
                disabled={deletingIds.has(word.wordId)}
                className="shrink-0 p-1 text-gray-300 dark:text-gray-600 hover:text-red-500 dark:hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all disabled:opacity-50"
                aria-label={t('admin.deleteWord')}
              >
                {deletingIds.has(word.wordId) ? (
                  <span className="text-xs">...</span>
                ) : (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="3 6 5 6 21 6" />
                    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                    <path d="M10 11v6M14 11v6" />
                    <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                  </svg>
                )}
              </button>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
