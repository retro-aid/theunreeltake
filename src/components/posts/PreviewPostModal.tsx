"use client";

import { Button, Modal } from "@mantine/core";
import { ArrowLeft } from "react-bootstrap-icons";
import {
  PostContent,
  PostLayout,
  type PostContentData,
} from "@/components/posts/post-content";

/**
 * Defines the props accepted by the preview post modal.
 *
 * @property opened - Whether the modal is visible
 * @property onClose - Callback invoked when the user returns to editing.
 * @property post - The post data to preview.
 */
interface PreviewPostModalProps {
  opened: boolean;
  onClose: () => void;
  post: PostContentData;
}

/**
 * Renders a full screen modal that previews a post the way it will look when published.
 * Only the post content is shown. Comments, related posts and tags are left out
 *
 * @param props - the modals properties
 * @param props.opened - Whether the modal is visible.
 * @param props.onClose - Closes the preview so the user can keep editing.
 * @param props.post - The current, unsaved post values to preview.
 */
export function PreviewPostModal({
  opened,
  onClose,
  post,
}: PreviewPostModalProps) {
  return (
    <Modal.Root opened={opened} onClose={onClose} fullScreen>
      <Modal.Overlay />
      <Modal.Content bg={"gray.0"}>
        <Modal.Header bg={"gray.0"}>
          <Modal.Title fw={700}>Post Preview</Modal.Title>
          <Button
            variant={"default"}
            leftSection={<ArrowLeft size={16} />}
            onClick={onClose}
          >
            Return
          </Button>
        </Modal.Header>
        <Modal.Body px={0}>
          <PostLayout>
            <PostContent post={post} />
          </PostLayout>
        </Modal.Body>
      </Modal.Content>
    </Modal.Root>
  );
}
