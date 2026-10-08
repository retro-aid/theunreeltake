import { useEditor } from "@tiptap/react";
import { useEffect } from "react";
import Link from "@tiptap/extension-link";
import StarterKit from "@tiptap/starter-kit";
import Highlight from "@tiptap/extension-highlight";
import TextAlign from "@tiptap/extension-text-align";
import Superscript from "@tiptap/extension-superscript";
import SubScript from "@tiptap/extension-subscript";

/**
 * URT 386 changes: 
 * Include a TextInput in order to be used in PostForm and TemplateForm under the Page Content label
 * 
 * @remarks
 * TextInput is part of "@mantine/core"
 */
import {TextInput} from "@mantine/core";

import { RichTextEditor } from "@mantine/tiptap";

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  description?: string;
}

export function SiteTextEditor({ value, onChange, description, }: RichTextEditorProps) {
export function SiteTextEditor({
  value,
  onChange,
  placeholder,
}: RichTextEditorProps) {
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
 * returns the option to add an input description under the label for PageContent for the PostForm and TemplateForm
 */
  return (

    <>
      <TextInput
        description={description}
        styles={{ input: { display: "none" } }}
      />

    <RichTextEditor editor={editor} mt={description ? "xs" :undefined}>
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
    </RichTextEditor>
    </>
  );
}
