import { useEffect } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Placeholder from "@tiptap/extension-placeholder";

type Props = {
  value: string;
  onChange: (html: string) => void;
};

const PostEditor = ({ value, onChange }: Props) => {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Placeholder.configure({
        placeholder: "What's on your mind?",
        emptyEditorClass: "is-editor-empty",
        emptyNodeClass: "is-empty",
      }),
    ],
    content: value,
    editorProps: {
      attributes: {
        class:
          "tiptap min-h-[180px] w-full p-5 outline-none prose prose-invert prose-neutral max-w-none text-[15px] leading-7 text-neutral-200",
      },
    },
    onUpdate({ editor }) {
      onChange(editor.getHTML());
    },
  });

  useEffect(() => {
    if (!editor) return;

    if (value !== editor.getHTML()) {
      editor.commands.setContent(value || "", {
        emitUpdate: false,
      });
    }
  }, [value, editor]);

  if (!editor) return null;

  return (
    <div className="overflow-hidden rounded-xl border border-neutral-800 bg-neutral-900 transition-colors focus-within:border-neutral-700">
      <div className="flex items-center gap-1 border-b border-neutral-800 bg-neutral-950 px-3 py-2">
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`rounded-lg px-3 py-1.5 text-sm font-bold transition ${
            editor.isActive("bold")
              ? "bg-violet-600 text-white"
              : "text-neutral-400 hover:bg-neutral-800 hover:text-white"
          }`}
        >
          B
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`rounded-lg px-3 py-1.5 text-sm italic transition ${
            editor.isActive("italic")
              ? "bg-violet-600 text-white"
              : "text-neutral-400 hover:bg-neutral-800 hover:text-white"
          }`}
        >
          I
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={`rounded-lg px-3 py-1.5 text-sm underline transition ${
            editor.isActive("underline")
              ? "bg-violet text-white"
              : "text-neutral-400 hover:bg-neutral-800 hover:text-white"
          }`}
        >
          U
        </button>
      </div>

      <EditorContent editor={editor} />
    </div>
  );
};

export default PostEditor;
