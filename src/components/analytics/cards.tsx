import { getAmountOfCommentsAction } from "@/lib/actions/comment-actions";
import { Chat, Eye, People, Send } from "react-bootstrap-icons";
import GenericAnalyticsCard from "./GenericAnalyticsCard";
import { getPendingRequestCountAction } from "@/lib/actions/media-request-actions";
import { getTotalViewsAction } from "@/lib/actions/analytics-actions";
import { Suspense } from "react";
import { CardSkeleton } from "./CardSkeleton";
import { getTotalActiveUsers } from "@/lib/dal/dto/analytics";

export function AmountCommentsCard() {
  const amountOfComments = getAmountOfCommentsAction("month");

  return (
    <Suspense fallback={<CardSkeleton />}>
      <GenericAnalyticsCard
        icon={Chat}
        subtitle={"Comments in last 30 days"}
        valuePromise={amountOfComments}
      />
    </Suspense>
  );
}

export function PendingRequestsCard() {
  const pendingRequests = getPendingRequestCountAction();

  return (
    <Suspense fallback={<CardSkeleton />}>
      <GenericAnalyticsCard
        icon={Send}
        subtitle={"Requests pending"}
        valuePromise={pendingRequests}
      />
    </Suspense>
  );
}

export function ViewsCard() {
  const totalViews = getTotalViewsAction();

  return (
    <Suspense fallback={<CardSkeleton />}>
      <GenericAnalyticsCard
        icon={Eye}
        subtitle={"Total views of posts"}
        valuePromise={totalViews}
      />
    </Suspense>
  );
}

export function TotalUsersCard() {
  const totalActiveUsers = getTotalActiveUsers();

  return (
    <Suspense fallback={<CardSkeleton />}>
      <GenericAnalyticsCard
        icon={People}
        subtitle={"Total active users"}
        valuePromise={totalActiveUsers}
      />
    </Suspense>
  );
}
