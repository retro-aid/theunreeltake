"use client";

import { getAmountOfCommentsAction } from "@/lib/actions/comment-actions";
import { Chat, Eye, Send } from "react-bootstrap-icons";
import GenericAnalyticsCard from "./GenericAnalyticsCard";
import { getPendingRequestCountAction, getTotalViewsAction } from "@/lib/actions/media-request-actions";

export function AmountCommentsCard() {
  return (
    <GenericAnalyticsCard
      icon={Chat}
      subtitle={"Comments in last 30 days"}
      onFetchDataAction={() => getAmountOfCommentsAction("month")}
    />
  );
}

export function PendingRequestsCard() {
  return (
    <GenericAnalyticsCard
      icon={Send}
      subtitle={"Requests pending"}
      onFetchDataAction={getPendingRequestCountAction}
    />
  );
}

export function ViewsCard() {
  return(
    <GenericAnalyticsCard
      icon={Eye}
      subtitle={"Total views of posts"}
      onFetchDataAction={async () => {
        const result = await getTotalViewsAction();
        return result.success ? result.total : 0;
      }}
    />
  );
}