import { LANGUAGES, WidgetDropdown, useTranslation, type Language } from '@shared';

type LanguageOption = {
  value: Language;
  label: string;
};

const LANGUAGE_OPTIONS: LanguageOption[] = [
  { value: 'ko', label: LANGUAGES.ko.nativeName },
  { value: 'en', label: LANGUAGES.en.nativeName },
  { value: 'ja', label: LANGUAGES.ja.nativeName },
  { value: 'zh', label: LANGUAGES.zh.nativeName },
];

export function AuthLanguageDropdown(): React.ReactElement {
  const { t, language, setLanguage } = useTranslation();
  const currentLanguage = LANGUAGE_OPTIONS.find((option) => option.value === language) ?? LANGUAGE_OPTIONS[0];

  return (
    <WidgetDropdown
      align="end"
      sideOffset={10}
      contentClassName="
        min-w-[172px] rounded-2xl border border-gray-200 bg-white p-1.5 shadow-xl shadow-black/10
        outline-none dark:border-gray-700 dark:bg-gray-800
      "
      trigger={(triggerProps) => (
        <button
          {...triggerProps}
          className="
            inline-flex items-center gap-2 rounded-full border border-gray-200/90 bg-white/90 px-3 py-2
            text-sm font-semibold text-gray-700 shadow-lg shadow-black/5 backdrop-blur-md transition-all
            hover:border-orange-300 hover:bg-white focus-visible:outline-none focus-visible:ring-2
            focus-visible:ring-orange-400 focus-visible:ring-offset-2 dark:border-gray-700/90
            dark:bg-gray-800/90 dark:text-gray-100 dark:hover:border-orange-400 dark:hover:bg-gray-800
          "
          aria-label={t('auth.languageSelectorLabel')}
        >
          <span className="text-xs font-bold tracking-[0.18em] text-gray-400 dark:text-gray-500">
            LANG
          </span>
          <span>{currentLanguage.label}</span>
          <svg
            className="h-4 w-4 text-gray-400"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      )}
    >
      {({ getItemProps }) => LANGUAGE_OPTIONS.map((option, index) => {
        const isSelected = option.value === language;

        return (
          <button
            key={option.value}
            {...getItemProps({
              index,
              onSelect: () => setLanguage(option.value),
            })}
            className={`
              flex w-full cursor-pointer items-center justify-between rounded-xl px-3 py-2 text-left text-sm outline-none
              transition-colors ${isSelected
                ? 'bg-orange-50 font-semibold text-orange-700 dark:bg-orange-950/30 dark:text-orange-300'
                : 'text-gray-700 hover:bg-gray-50 dark:text-gray-200 dark:hover:bg-gray-700/70'}
            `}
          >
            <span>{option.label}</span>
            <span
              className={`h-2 w-2 rounded-full transition-opacity ${
                isSelected ? 'bg-orange-400 opacity-100' : 'opacity-0'
              }`}
              aria-hidden="true"
            />
          </button>
        );
      })}
    </WidgetDropdown>
  );
}
