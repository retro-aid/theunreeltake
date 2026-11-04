import { Stack, Badge, Group, Text } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { ExclamationTriangleFill } from "react-bootstrap-icons";

interface ErrorNotificationProps {
  message?: string;
  title?: string;
  httpCode?: number | string;
}

/**
 * The component for error notifications
 *
 *
 * @param message - The error message that will be displayed on the notification
 * @param title - The title displayed above the message
 * @param httpCode - The HTTP status code associated with the error
 */
export function ErrorNotification({
  message = "",
  title = "An error has occurred",
  httpCode,
}: ErrorNotificationProps) {
  notifications.show({
    color: "red",
    icon: <ExclamationTriangleFill></ExclamationTriangleFill>,
    title: (
      <Stack>
        <Group wrap="nowrap" pr={"20px"}>
          <Text style={{ flex: 1 }}>{title}</Text>
          <Badge size="xs" style={{ flexShrink: 0 }}>
            HTTP {httpCode}
          </Badge>
        </Group>
      </Stack>
    ),
    message: (
      <Stack>
        <Text size="xs">{message}</Text>
      </Stack>
    ),
    autoClose: 5000,
    withBorder: true,
    styles: {
      root: {
        backgroundColor: "var(--mantine-color-red-2",
      },
      title: {
        fontWeight: 700,
        fontSize: "14px",
      },
      description: {
        fontSize: "11px",
      },
      closeButton: {
        position: "absolute",
        top: "3px",
        right: "8px",
        color: "dark",
      },
    },
  });
}
