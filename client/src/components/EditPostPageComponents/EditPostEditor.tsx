import { useEffect } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Placeholder from "@tiptap/extension-placeholder";

interface Props {
  value: string;
  onChange: (html: string) => void;
}

const EditPostEditor = ({ value, onChange }: Props) => {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,

      Placeholder.configure({
        placeholder: "Start editing your post...",
        emptyEditorClass: "is-editor-empty",
        emptyNodeClass: "is-empty",
      }),
    ],

    content: value,

    editorProps: {
      attributes: {
        class:
          "min-h-[300px] w-full px-5 py-5 outline-none prose prose-invert max-w-none text-[15px] leading-7",
      },
    },

    onUpdate({ editor }) {
      onChange(editor.getHTML());
    },
  });

  useEffect(() => {
    if (!editor || editor.isDestroyed) return;

    const currentContent = editor.getHTML();

    if (value !== currentContent) {
      editor.commands.setContent(value || "", {
        emitUpdate: false,
      });
    }
  }, [value, editor]);

  if (!editor) {
    return (
      <div className="flex min-h-[300px] items-center justify-center">
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-gray-600 border-t-white" />
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Toolbar */}
      <div className="flex items-center gap-1 border-b border-white/10 bg-white/[0.02] px-4 py-3">
        {/* Bold */}
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`rounded-md px-3 py-1.5 text-sm font-bold transition ${
            editor.isActive("bold")
              ? "bg-white text-black"
              : "text-gray-400 hover:bg-white/10 hover:text-white"
          }`}
          title="Bold"
        >
          B
        </button>

        {/* Italic */}
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`rounded-md px-3 py-1.5 text-sm italic transition ${
            editor.isActive("italic")
              ? "bg-white text-black"
              : "text-gray-400 hover:bg-white/10 hover:text-white"
          }`}
          title="Italic"
        >
          I
        </button>

        {/* Underline */}
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={`rounded-md px-3 py-1.5 text-sm underline transition ${
            editor.isActive("underline")
              ? "bg-white text-black"
              : "text-gray-400 hover:bg-white/10 hover:text-white"
          }`}
          title="Underline"
        >
          U
        </button>
      </div>

      {/* Editor */}
      <EditorContent editor={editor} />
    </div>
  );
};

export default EditPostEditor;
