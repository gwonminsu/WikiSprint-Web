import { useState } from 'react';
import {
  censorAccountNickname,
  censorAccountProfile,
  getAccountReportSummary,
  grantAccountAdmin,
  resolveAccountReports,
  useAdminAccounts,
} from '@features';
import { getProfileImageUrl } from '@features/account';
import { ProfileAvatar, queryClient, useDialog, useToast, useTranslation } from '@shared';
import type {
  AdminAccountDirection,
  AdminAccountItem,
  AdminAccountListRequest,
  AdminAccountListView,
  AdminAccountSort,
  ReportSummary,
} from '@/entities';

const PAGE_SIZE = 10;

export function AdminAccountManagementView(): React.ReactElement {
  const { t } = useTranslation();
  const toast = useToast();
  const { showConfirm } = useDialog();
  const [view, setView] = useState<AdminAccountListView>('REPORTED');
  const [sort, setSort] = useState<AdminAccountSort>('RECENT_LOGIN');
  const [direction, setDirection] = useState<AdminAccountDirection>('DESC');
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [summaries, setSummaries] = useState<Record<string, ReportSummary>>({});
  const [busyIds, setBusyIds] = useState<Set<string>>(new Set());

  const request: AdminAccountListRequest = {
    view,
    sort,
    direction,
    search,
    page,
    size: PAGE_SIZE,
  };
  const { data, isLoading, isError } = useAdminAccounts(request, true);

  const setBusy = (accountId: string, busy: boolean): void => {
    setBusyIds((prev) => {
      const next = new Set(prev);
      if (busy) {
        next.add(accountId);
      } else {
        next.delete(accountId);
      }
      return next;
    });
  };

  const toggleAccount = (accountId: string): void => {
    setExpandedId((current) => current === accountId ? null : accountId);
    if (!summaries[accountId]) {
      void getAccountReportSummary(accountId)
        .then((summary) => setSummaries((prev) => ({ ...prev, [accountId]: summary })))
        .catch(() => toast.error(t('report.summaryError')));
    }
  };

  const runAction = (accountId: string, action: () => Promise<string | null>): void => {
    setBusy(accountId, true);
    void action()
      .then((message) => {
        toast.success(message ?? t('common.success'));
        void queryClient.invalidateQueries({ queryKey: ['admin-accounts'] });
        void queryClient.invalidateQueries({ queryKey: ['admin-reports', 'pending-count'] });
        void getAccountReportSummary(accountId)
          .then((summary) => setSummaries((prev) => ({ ...prev, [accountId]: summary })))
          .catch(() => undefined);
      })
      .catch((error) => toast.error(error instanceof Error ? error.message : t('common.error')))
      .finally(() => setBusy(accountId, false));
  };

  const totalPages = data?.totalPages ?? 1;
  const pageButtons = Array.from({ length: Math.min(totalPages, 5) }, (_, index) => {
    const start = Math.max(1, Math.min(page - 2, totalPages - 4));
    return start + index;
  }).filter((value) => value <= totalPages);

  return (
    <section className="space-y-5">
      <div className="rounded-4xl border border-white/70 bg-white/90 p-6 shadow-[0_18px_40px_rgba(15,23,42,0.08)] dark:border-gray-700 dark:bg-gray-900/85">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-black tracking-[0.18em] text-orange-500">{t('adminAccount.eyebrow')}</p>
            <h1 className="mt-2 text-3xl font-black text-gray-950 dark:text-white">{t('adminAccount.title')}</h1>
          </div>
          <div className="flex flex-wrap gap-2">
            <select value={view} onChange={(event) => { setView(event.target.value as AdminAccountListView); setPage(1); }} className="shrink-0 rounded-2xl border border-gray-200 bg-white px-3 py-2 text-sm font-bold dark:border-gray-700 dark:bg-gray-800 dark:text-white">
              <option value="REPORTED">{t('adminAccount.viewReported')}</option>
              <option value="ALL">{t('adminAccount.viewAll')}</option>
            </select>
            <select value={sort} onChange={(event) => { setSort(event.target.value as AdminAccountSort); setPage(1); }} className="shrink-0 rounded-2xl border border-gray-200 bg-white px-3 py-2 text-sm font-bold dark:border-gray-700 dark:bg-gray-800 dark:text-white">
              <option value="RECENT_LOGIN">{t('adminAccount.sortRecentLogin')}</option>
              <option value="RECENT_JOIN">{t('adminAccount.sortRecentJoin')}</option>
              <option value="NAME">{t('adminAccount.sortName')}</option>
            </select>
            <button
              type="button"
              onClick={() => { setDirection(direction === 'ASC' ? 'DESC' : 'ASC'); setPage(1); }}
              className="inline-flex shrink-0 items-center gap-2 rounded-2xl border border-gray-200 bg-white px-3 py-2 text-sm font-black dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              aria-label={direction === 'ASC' ? t('adminAccount.asc') : t('adminAccount.desc')}
            >
              <svg className={direction === 'ASC' ? 'rotate-180 transition-transform' : 'transition-transform'} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v14m0 0 6-6m-6 6-6-6" />
              </svg>
              {direction === 'ASC' ? t('adminAccount.asc') : t('adminAccount.desc')}
            </button>
            <div className="flex min-w-0 flex-1 gap-2">
              <input
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
                onKeyDown={(event) => { if (event.key === 'Enter') { setSearch(searchInput.trim()); setPage(1); } }}
                className="min-w-0 flex-1 rounded-2xl border border-gray-200 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                placeholder={t('adminAccount.searchPlaceholder')}
              />
              <button type="button" onClick={() => { setSearch(searchInput.trim()); setPage(1); }} className="shrink-0 rounded-2xl bg-orange-500 px-4 py-2 text-sm font-black text-white">
                {t('common.search')}
              </button>
            </div>
          </div>
          <div className="mt-3 text-sm text-gray-500 dark:text-gray-400">
            {search.trim() ? (
              <>
                {t('adminAccount.searchResultPrefix', { keyword: search })}
                <strong className="text-lg font-black text-rose-500">{data?.totalCount ?? 0}</strong>
                {t('adminAccount.searchResultSuffix')}
              </>
            ) : (
              <>
                {t('adminAccount.totalCountPrefix')}
                <strong className="text-lg font-black text-rose-500">{data?.totalCount ?? 0}</strong>
                {t('adminAccount.totalCountSuffix')}
              </>
            )}
          </div>
        </div>
      </div>

      {isLoading ? <p className="text-sm text-gray-500">{t('common.loading')}</p> : null}
      {isError ? <p className="text-sm text-rose-500">{t('common.error')}</p> : null}

      <div className="space-y-3">
        {data?.accounts.map((account) => (
          <AdminAccountCard
            key={account.accountId}
            account={account}
            expanded={expandedId === account.accountId}
            summary={summaries[account.accountId]}
            busy={busyIds.has(account.accountId)}
            onToggle={() => toggleAccount(account.accountId)}
            onCensorProfile={() => showConfirm({
              title: t('adminAccount.censorProfileConfirmTitle'),
              message: t('adminAccount.censorProfileConfirmMessage'),
              confirmText: t('adminAccount.censorProfile'),
              onConfirm: () => runAction(account.accountId, () => censorAccountProfile(account.accountId)),
            })}
            onCensorNickname={() => showConfirm({
              title: t('adminAccount.censorNicknameConfirmTitle'),
              message: t('adminAccount.censorNicknameConfirmMessage'),
              confirmText: t('adminAccount.censorNickname'),
              onConfirm: () => runAction(account.accountId, () => censorAccountNickname(account.accountId)),
            })}
            onGrantAdmin={() => showConfirm({
              title: t('adminAccount.grantAdminConfirmTitle'),
              message: t('adminAccount.grantAdminConfirmMessage'),
              confirmText: t('adminAccount.grantAdmin'),
              onConfirm: () => runAction(account.accountId, () => grantAccountAdmin(account.accountId)),
            })}
            onResolve={() => showConfirm({
              title: t('adminAccount.resolveConfirmTitle'),
              message: t('adminAccount.resolveConfirmMessage'),
              confirmText: t('report.resolve'),
              onConfirm: () => runAction(account.accountId, () => resolveAccountReports(account.accountId)),
            })}
          />
        ))}
      </div>

      <div className="flex flex-wrap items-center justify-center gap-2">
        <PageButton disabled={page <= 1} onClick={() => setPage(1)} label="<<" />
        <PageButton disabled={page <= 1} onClick={() => setPage((prev) => Math.max(1, prev - 1))} label="<" />
        {pageButtons.map((value) => (
          <PageButton key={value} active={value === page} onClick={() => setPage(value)} label={String(value)} />
        ))}
        <PageButton disabled={page >= totalPages} onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))} label=">" />
        <PageButton disabled={page >= totalPages} onClick={() => setPage(totalPages)} label=">>" />
      </div>
    </section>
  );
}

type AdminAccountCardProps = {
  account: AdminAccountItem;
  expanded: boolean;
  summary?: ReportSummary;
  busy: boolean;
  onToggle: () => void;
  onCensorProfile: () => void;
  onCensorNickname: () => void;
  onGrantAdmin: () => void;
  onResolve: () => void;
};

function AdminAccountCard({
  account,
  expanded,
  summary,
  busy,
  onToggle,
  onCensorProfile,
  onCensorNickname,
  onGrantAdmin,
  onResolve,
}: AdminAccountCardProps): React.ReactElement {
  const { t } = useTranslation();
  return (
    <article className="rounded-3xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-900">
      <button type="button" onClick={onToggle} className="flex w-full items-center gap-4 text-left">
        <ProfileAvatar imageUrl={getProfileImageUrl(account.profileImgUrl)} name={account.nick} size="md" />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="truncate text-base font-black text-gray-950 dark:text-white">{account.nick}</h2>
            {account.deletionRequestedAt ? <span className="rounded-full bg-rose-100 px-2 py-1 text-[10px] font-black text-rose-600 dark:bg-rose-400/15 dark:text-rose-200">{t('adminAccount.deletionPending')}</span> : null}
            {account.isAdmin ? <span className="rounded-full bg-amber-100 px-2 py-1 text-[10px] font-black text-amber-700 dark:bg-amber-400/15 dark:text-amber-200">{t('admin.badge')}</span> : null}
          </div>
          <p className="truncate text-xs text-gray-500">{account.email ?? '-'}</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-rose-100 px-3 py-1 text-xs font-black text-rose-600 dark:bg-rose-400/15 dark:text-rose-200">
            {account.pendingReportCount > 99 ? '99+' : account.pendingReportCount}
          </span>
          <svg
            className={`ranking-chevron shrink-0 text-xs text-gray-400 transition-transform duration-300 ${expanded ? 'rotate-180' : ''}`}
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="m6 9 6 6 6-6" />
          </svg>
        </div>
      </button>

      <div className={['ranking-expand-wrapper', expanded ? 'ranking-expand-wrapper--open' : 'ranking-expand-wrapper--closed'].join(' ')}>
        <div className="ranking-expand-inner">
          <div className="ranking-expand-panel space-y-4">
            <div className="flex flex-wrap gap-2">
              <ActionButton disabled={busy} onClick={onCensorProfile} label={t('adminAccount.censorProfile')} />
              <ActionButton disabled={busy} onClick={onCensorNickname} label={t('adminAccount.censorNickname')} />
              <ActionButton disabled={busy} onClick={onGrantAdmin} label={t('adminAccount.grantAdmin')} />
              <ActionButton disabled={busy} onClick={onResolve} label={t('report.resolve')} accent />
            </div>
            <dl className="grid grid-cols-1 gap-2 text-xs text-gray-600 dark:text-gray-300 sm:grid-cols-2">
              <div>{t('adminAccount.accountId')}: {account.accountId}</div>
              <div>{t('adminAccount.nationality')}: {account.nationality ?? '-'}</div>
              <div>{t('adminAccount.lastLogin')}: {account.lastLogin ?? '-'}</div>
              <div>{t('adminAccount.createdAt')}: {account.createdAt ?? '-'}</div>
              <div>{t('adminAccount.totalGames')}: {account.totalGames ?? 0}</div>
              <div>{t('adminAccount.bestRecord')}: {account.bestRecord ?? '-'}</div>
            </dl>
            {summary ? <ReportSummaryPanel summary={summary} /> : <p className="text-xs text-gray-500">{t('report.loadingSummary')}</p>}
          </div>
        </div>
      </div>
    </article>
  );
}

function ReportSummaryPanel({ summary }: { summary: ReportSummary }): React.ReactElement {
  const { t } = useTranslation();
  return (
    <div className="space-y-3 text-xs">
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <span>{t('report.reason.PROFILE_IMAGE')}: {summary.profileImageCount}</span>
        <span>{t('report.reason.NICKNAME')}: {summary.nicknameCount}</span>
        <span>{t('report.reason.DONATION_CONTENT')}: {summary.donationContentCount}</span>
        <span>{t('report.reason.OTHER')}: {summary.otherCount}</span>
      </div>
      {summary.otherDetails.length > 0 ? (
        <ul className="overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900">
          {summary.otherDetails.map((detail, index) => (
            <li
              key={`${detail}-${index}`}
              className={[
                'flex gap-3 px-3 py-3 text-gray-600 dark:text-gray-300',
                index > 0 ? 'border-t border-gray-200 dark:border-gray-700' : '',
              ].join(' ')}
            >
              <span className="shrink-0 rounded-full bg-rose-100 px-2 py-0.5 text-[10px] font-black text-rose-600 dark:bg-rose-400/15 dark:text-rose-200">
                {index + 1}
              </span>
              <span className="min-w-0 leading-relaxed">{detail}</span>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

function ActionButton({ disabled, onClick, label, accent = false }: { disabled: boolean; onClick: () => void; label: string; accent?: boolean }): React.ReactElement {
  return (
    <button type="button" disabled={disabled} onClick={onClick} className={`rounded-2xl px-3 py-2 text-xs font-black text-white disabled:opacity-60 ${accent ? 'bg-emerald-600' : 'bg-slate-900 dark:bg-white dark:text-slate-950'}`}>
      {label}
    </button>
  );
}

function PageButton({ label, disabled = false, active = false, onClick }: { label: string; disabled?: boolean; active?: boolean; onClick: () => void }): React.ReactElement {
  return (
    <button type="button" disabled={disabled} onClick={onClick} className={`min-w-10 rounded-xl px-3 py-2 text-sm font-black disabled:opacity-40 ${active ? 'bg-orange-500 text-white' : 'bg-white text-gray-700 dark:bg-gray-900 dark:text-gray-200'}`}>
      {label}
    </button>
  );
}
