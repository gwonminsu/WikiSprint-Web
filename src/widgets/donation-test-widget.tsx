import { useState } from 'react';
import { queryClient, useAuthStore, useToast } from '@shared';
import { API_BASE_URL, API_ENDPOINTS } from '@shared/api';

const KOFI_WEBHOOK_TEST_TOKEN = 'eabe9b05-f9aa-4671-b6fb-3de83fc07b10';

function createTestPayload(accountId: string | null): string {
  return JSON.stringify({
    account_id: accountId,
    message_id: `frontend-test-${Date.now()}`,
    type: 'Donation',
    is_public: true,
    from_name: 'Frontend Test',
    message: 'Temporary 2 dollar support test',
    amount: '2',
    currency: 'USD',
    email: 'frontend-test@example.com',
  });
}

// 테스트가 끝나면 이 위젯만 제거하면 된다.
export function DonationTestWidget(): React.ReactElement {
  const { success: showSuccess, error: showError } = useToast();
  const accountInfo = useAuthStore((state) => state.accountInfo);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleTestDonation = async (): Promise<void> => {
    if (isSubmitting) {
      return;
    }

    setIsSubmitting(true);

    try {
      const formData = new URLSearchParams();
      formData.set('verification_token', KOFI_WEBHOOK_TEST_TOKEN);
      formData.set('data', createTestPayload(accountInfo?.uuid ?? null));

      const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.DONATION.WEBHOOK_KOFI}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData.toString(),
      });

      if (!response.ok) {
        throw new Error('Webhook test failed');
      }

      await queryClient.invalidateQueries({ queryKey: ['donations', 'latest'] });
      showSuccess('2달러 테스트 후원을 전송했습니다.');
    } catch {
      showError('테스트 후원 전송에 실패했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-[11.5rem] z-40 max-w-[calc(100vw-13rem)]">
      <button
        type="button"
        onClick={() => void handleTestDonation()}
        disabled={isSubmitting}
        className="rounded-[1.2rem] border border-amber-200 bg-white px-4 py-3 text-sm font-black text-amber-700 shadow-[0_16px_32px_rgba(245,158,11,0.18)] transition hover:-translate-y-[1px] hover:bg-amber-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-amber-300/20 dark:bg-slate-950 dark:text-amber-300 dark:hover:bg-slate-900"
      >
        {isSubmitting ? '테스트 전송 중...' : '2$ 후원 테스트'}
      </button>
    </div>
  );
}
