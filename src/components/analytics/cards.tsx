"use client";

import { getAmountOfCommentsAction } from "@/lib/actions/comment-actions";
import { Chat, Eye, Send, People } from "react-bootstrap-icons";
import GenericAnalyticsCard from "./GenericAnalyticsCard";
import { getPendingRequestCountAction } from "@/lib/actions/media-request-actions";
import {
  getTotalActiveUsersAction,
  getTotalViewsAction,
} from "@/lib/actions/analytics-actions";

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
  return (
    <GenericAnalyticsCard
      icon={Eye}
      subtitle={"Total views of posts"}
      onFetchDataAction={getTotalViewsAction}
    />
  );
}

export function TotalUsersCard() {
  return (
    <GenericAnalyticsCard
      icon={People}
      subtitle={"Total active users"}
      onFetchDataAction={getTotalActiveUsersAction}
    />
  );
}
