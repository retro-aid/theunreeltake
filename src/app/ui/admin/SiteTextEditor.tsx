import { useEditor } from "@tiptap/react";
import { useEffect } from "react";
import Link from "@tiptap/extension-link";
import StarterKit from "@tiptap/starter-kit";
import Highlight from "@tiptap/extension-highlight";
import TextAlign from "@tiptap/extension-text-align";
import Superscript from "@tiptap/extension-superscript";
import SubScript from "@tiptap/extension-subscript";

/**
 * URT 386 changes: implement a description for how the post/template in the Rich Text Editor should followed
 * Changes:
 * - import the Box, Text
 * - Box serves as like a lightweight layout
 * - Text renders the placeholder label
 * - In the interface, placeholder is added so it can be pass dynamic placeholders strings directly
 * - Placeholders would be called in PostForm and AdminTemplate
 * - Placeholder would include on instructions to write a Post or creating a template
 */
import { Box, Text } from "@mantine/core";

import { RichTextEditor } from "@mantine/tiptap";

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function SiteTextEditor({ value, onChange, placeholder, }: RichTextEditorProps) {
  const editor = useEditor({
    shouldRerenderOnTransaction: true,
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({ link: false }),
      Link,
      Superscript,
      SubScript,
      Highlight,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
    ],
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  useEffect(() => {
    if (!editor) return;

    const current = editor.getHTML();
    if (value !== current) {
      editor.commands.setContent(value, { emitUpdate: false });
    }
  }, [value, editor]);

/**
 * URT 386 change: add a const to represent if the document contains actual text or media
 */

  const isEmpty = editor ? editor.isEmpty : !value || value === "<p></p>";
/**
 * Near the end of the return, Box is added with the conditional Text component
 * This allows so the placeholder can be showed before the user types
 */
  return (
    <RichTextEditor editor={editor}>
      <RichTextEditor.Toolbar sticky stickyOffset="var(--docs-header-height)">
        <RichTextEditor.ControlsGroup>
          <RichTextEditor.Bold />
          <RichTextEditor.Italic />
          <RichTextEditor.Underline />
          <RichTextEditor.Strikethrough />
          <RichTextEditor.ClearFormatting />
          <RichTextEditor.Highlight />
          <RichTextEditor.Code />
        </RichTextEditor.ControlsGroup>

        <RichTextEditor.ControlsGroup>
          <RichTextEditor.H1 />
          <RichTextEditor.H2 />
          <RichTextEditor.H3 />
          <RichTextEditor.H4 />
        </RichTextEditor.ControlsGroup>

        <RichTextEditor.ControlsGroup>
          <RichTextEditor.Blockquote />
          <RichTextEditor.Hr />
          <RichTextEditor.BulletList />
          <RichTextEditor.OrderedList />
          <RichTextEditor.Subscript />
          <RichTextEditor.Superscript />
        </RichTextEditor.ControlsGroup>

        <RichTextEditor.ControlsGroup>
          <RichTextEditor.Link />
          <RichTextEditor.Unlink />
        </RichTextEditor.ControlsGroup>

        <RichTextEditor.ControlsGroup>
          <RichTextEditor.AlignLeft />
          <RichTextEditor.AlignCenter />
          <RichTextEditor.AlignJustify />
          <RichTextEditor.AlignRight />
        </RichTextEditor.ControlsGroup>

        <RichTextEditor.ControlsGroup>
          <RichTextEditor.Undo />
          <RichTextEditor.Redo />
        </RichTextEditor.ControlsGroup>
      </RichTextEditor.Toolbar>
 
      <Box style={{ position: "relative" }}>
        {isEmpty && placeholder && (
          <Text
            c="dimmed"
            size="sm"
            onClick={() => editor?.commands.focus()}
            style={{
              position: "absolute",
              top: "var(--mantine-spacing-md, 16px)",
              left: "var(--mantine-spacing-md, 16px)",
              pointerEvents: "none", // lets clicks pass straight to the editor
              userSelect: "none",
            }}
          >
            {placeholder}
          </Text>
        )}
        <RichTextEditor.Content />
      </Box>
    </RichTextEditor>
  );
}
