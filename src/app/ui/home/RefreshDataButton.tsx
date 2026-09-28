import { ActionIcon, Tooltip } from "@mantine/core";
import { ArrowClockwise } from "react-bootstrap-icons";

export default function RefreshDataButton({
  updateData,
}: {
  updateData: () => void;
}) {
  return (
    <Tooltip label={"Refresh"}>
      <ActionIcon
        size={"lg"}
        variant={"outline"}
        color={"dark"}
        onClick={() => updateData()}
      >
        <ArrowClockwise size={22} />
      </ActionIcon>
    </Tooltip>
  );
}
