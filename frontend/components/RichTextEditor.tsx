'use client';

import { useRef, useState } from 'react';
import type { ReactNode } from 'react';
import {
  EditorContent,
  NodeViewWrapper,
  ReactNodeViewRenderer,
  useEditor,
  type NodeViewProps,
} from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import ImageExtension from '@tiptap/extension-image';
import {
  Bold,
  Italic,
  Heading2,
  List,
  ListOrdered,
  Quote,
  Redo2,
  Undo2,
  Image as ImageIcon,
} from 'lucide-react';
import { api, assetUrl } from '@/lib/api';

type Props = {
  value: string;
  onChange: (html: string) => void;
  onError?: (message: string) => void;
};

const buttonBase =
  'inline-flex h-8 w-8 items-center justify-center rounded-md text-gray-600 hover:bg-gray-200 hover:text-gray-900 disabled:opacity-40 disabled:hover:bg-transparent';

// NodeView chỉ quyết định cách hiển thị ảnh TRONG editor: preview dùng src tuyệt đối (assetUrl).
// Bản lưu (editor.getHTML()) vẫn giữ `/uploads/x` nhờ renderHTML mặc định của Image extension.
function ImageView(props: NodeViewProps) {
  const { src, alt, title } = props.node.attrs as { src?: string; alt?: string; title?: string };
  return (
    <NodeViewWrapper as="span" className="inline-block">
      <img
        src={assetUrl(src)}
        alt={alt ?? ''}
        title={title}
        className={`max-w-full rounded-lg align-middle ${
          props.selected ? 'outline outline-2 outline-offset-2 outline-primary-500' : ''
        }`}
        draggable={false}
        data-drag-handle
      />
    </NodeViewWrapper>
  );
}

const ResolvedImage = ImageExtension.extend({
  addNodeView() {
    return ReactNodeViewRenderer(ImageView);
  },
});

export default function RichTextEditor({ value, onChange, onError }: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const editor = useEditor({
    extensions: [StarterKit, ResolvedImage],
    content: value,
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: 'rich-content min-h-[200px] px-4 py-3 focus:outline-none',
      },
    },
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
  });

  const insertImage = async (file: File) => {
    setUploading(true);
    const fd = new FormData();
    fd.append('file', file);
    const res = await api.upload<{ url: string }>('/api/admin/uploads', fd);
    setUploading(false);
    if (res.error) {
      (onError ?? ((m) => window.alert(m)))(res.error);
      return;
    }
    if (res.data?.url) {
      editor?.chain().focus().setImage({ src: res.data.url }).run();
    }
  };

  if (!editor) {
    return <div className="min-h-[200px] rounded-lg border border-gray-300" />;
  }

  const ToolbarButton = ({
    onClick,
    active,
    label,
    children,
    disabled,
  }: {
    onClick: () => void;
    active?: boolean;
    label: string;
    children: ReactNode;
    disabled?: boolean;
  }) => (
    <button
      type="button"
      aria-label={label}
      title={label}
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      disabled={disabled}
      className={`${buttonBase} ${active ? 'bg-gray-200 text-gray-900' : ''}`}
    >
      {children}
    </button>
  );

  return (
    <div className="overflow-hidden rounded-lg border border-gray-300 focus-within:border-primary-500">
      <div className="flex flex-wrap items-center gap-1 border-b border-gray-200 bg-gray-50 px-2 py-1.5">
        <ToolbarButton label="Hoàn tác" onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()}>
          <Undo2 className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton label="Làm lại" onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()}>
          <Redo2 className="h-4 w-4" />
        </ToolbarButton>
        <span className="mx-1 h-5 w-px bg-gray-300" />
        <ToolbarButton label="Đậm" active={editor.isActive('bold')} onClick={() => editor.chain().focus().toggleBold().run()}>
          <Bold className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton label="Nghiêng" active={editor.isActive('italic')} onClick={() => editor.chain().focus().toggleItalic().run()}>
          <Italic className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton label="Tiêu đề" active={editor.isActive('heading', { level: 2 })} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>
          <Heading2 className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton label="Danh sách" active={editor.isActive('bulletList')} onClick={() => editor.chain().focus().toggleBulletList().run()}>
          <List className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton label="Danh sách số" active={editor.isActive('orderedList')} onClick={() => editor.chain().focus().toggleOrderedList().run()}>
          <ListOrdered className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton label="Trích dẫn" active={editor.isActive('blockquote')} onClick={() => editor.chain().focus().toggleBlockquote().run()}>
          <Quote className="h-4 w-4" />
        </ToolbarButton>
        <span className="mx-1 h-5 w-px bg-gray-300" />
        <ToolbarButton label="Chèn ảnh" onClick={() => fileRef.current?.click()} disabled={uploading}>
          <ImageIcon className="h-4 w-4" />
        </ToolbarButton>
        <input
          ref={fileRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            e.target.value = '';
            if (f) insertImage(f);
          }}
        />
      </div>
      <EditorContent editor={editor} />
    </div>
  );
}