import { Suspense } from 'react';
import { requireAdmin } from '@/lib/dal/utils';
import { list as listSubscribersAction } from '@/lib/actions/email/subscribers-actions';
import SubscriberTable from '@/components/email/SubscriberTable';
import Loading from './loading';

export const dynamic = 'force-dynamic';

/**
 * Async Server Component that fetches the first batch of Resend audience contacts.
 * Wrapped inside a React Suspense boundary to allow instant UI streaming.
 *
 * @returns The populated {@link SubscriberTable} component.
 */
async function SubscribersContent() {
  const result = (await listSubscribersAction({
    paginateOption: 'none',
    limit: 10,
  } as any)) as { data?: { data: any[]; has_more: boolean }; error?: any };

  const subscribers = result?.data?.data ?? [];
  const hasMore = Boolean(result?.data?.has_more);

  return (
    <SubscriberTable
      initialSubscribers={subscribers}
      initialHasMore={hasMore}
    />
  );
}

/**
 * Administrative Email Dashboard page.
 * Enforces admin authorization prior to streaming the skeleton and content.
 *
 * @returns The page layout with Suspense streaming boundary.
 */
export default async function EmailPage() {
  await requireAdmin();

  return (
    <Suspense fallback={<Loading />}>
      <SubscribersContent />
    </Suspense>
  );
}
