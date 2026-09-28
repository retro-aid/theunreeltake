import {getAmountOfCommentsAction} from "@/lib/actions/comment-actions";
import {Chat, Send} from "react-bootstrap-icons";
import GenericAnalyticsCard from "./GenericAnalyticsCard";
import {getPendingRequestCountAction} from "@/lib/actions/media-request-actions";

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