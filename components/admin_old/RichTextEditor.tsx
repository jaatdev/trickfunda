// components/admin/RichTextEditor.tsx
'use client';
import React, { useCallback, useState } from 'react';
import { useAuth } from '@clerk/nextjs';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import './RichTextEditor.css';

type Props = {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  minHeight?: number;
};

export default function RichTextEditor({ value, onChange, placeholder, minHeight = 180 }: Props) {
  const { getToken } = useAuth();
  const [isUploading, setIsUploading] = useState(false);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      // StarterKit includes: Document, Paragraph, Text, Bold, Italic, Strike, History, HardBreak, Heading, ListItem, BulletList, OrderedList, CodeBlock, Code, Blockquote
      StarterKit.configure({
        // Override Link config from StarterKit
        link: {
          openOnClick: false,
          HTMLAttributes: {
            class: 'text-blue-400 underline',
          },
        },
      }),
      // Don't double-register Link or Underline - StarterKit already includes them
      // Just configure them above if needed
      Image.configure({
        HTMLAttributes: {
          class: 'max-w-full h-auto',
        },
      }),
    ],
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'prose prose-invert max-w-none focus:outline-none px-4 py-3',
        style: `min-height: ${minHeight}px`,
      },
    },
  });

  // Update editor content when value prop changes (for loading drafts)
  React.useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value);
    }
  }, [value, editor]);

  const handleImageUpload = useCallback(async () => {
    const input = document.createElement('input');
    input.setAttribute('type', 'file');
    input.setAttribute('accept', 'image/*');
    input.click();
    
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file || !editor) return;
      
      setIsUploading(true);
      try {
        const reader = new FileReader();
        reader.onload = async () => {
          const base64 = reader.result as string;
          
          // Upload to Cloudinary
          const token = await getToken();
          const res = await fetch('/api/upload/image', {
            method: 'POST',
            headers: { 
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({ data: base64, folder: 'notty' }),
          });
          
          const json = await res.json();
          if (json.url) {
            // Insert image at current cursor position
            editor.chain().focus().setImage({ src: json.url }).run();
            setIsUploading(false);
          } else {
            console.error('upload failed', json);
            alert('Image upload failed');
            setIsUploading(false);
          }
        };
        reader.readAsDataURL(file);
      } catch (err) {
        console.error('image upload failed', err);
        alert('Image upload failed');
        setIsUploading(false);
      }
    };
  }, [editor]);

  if (!editor) {
    return null;
  }

  return (
    <div className="rich-text-editor border border-slate-700 rounded-md bg-slate-900">
      {/* Toolbar */}
      <div className="flex flex-wrap gap-1 p-2 border-b border-slate-700 bg-slate-800/50">
        {/* Text formatting */}
        <button
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`px-3 py-1 rounded text-sm ${
            editor.isActive('bold') ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
          }`}
          type="button"
        >
          Bold
        </button>
        <button
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`px-3 py-1 rounded text-sm ${
            editor.isActive('italic') ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
          }`}
          type="button"
        >
          Italic
        </button>
        <button
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={`px-3 py-1 rounded text-sm ${
            editor.isActive('underline') ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
          }`}
          type="button"
        >
          Underline
        </button>
        <button
          onClick={() => editor.chain().focus().toggleStrike().run()}
          className={`px-3 py-1 rounded text-sm ${
            editor.isActive('strike') ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
          }`}
          type="button"
        >
          Strike
        </button>

        <div className="w-px h-6 bg-slate-600 mx-1" />

        {/* Headings */}
        <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          className={`px-3 py-1 rounded text-sm ${
            editor.isActive('heading', { level: 1 }) ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
          }`}
          type="button"
        >
          H1
        </button>
        <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={`px-3 py-1 rounded text-sm ${
            editor.isActive('heading', { level: 2 }) ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
          }`}
          type="button"
        >
          H2
        </button>
        <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          className={`px-3 py-1 rounded text-sm ${
            editor.isActive('heading', { level: 3 }) ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
          }`}
          type="button"
        >
          H3
        </button>

        <div className="w-px h-6 bg-slate-600 mx-1" />

        {/* Lists */}
        <button
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`px-3 py-1 rounded text-sm ${
            editor.isActive('bulletList') ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
          }`}
          type="button"
        >
          Bullet List
        </button>
        <button
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`px-3 py-1 rounded text-sm ${
            editor.isActive('orderedList') ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
          }`}
          type="button"
        >
          Ordered List
        </button>

        <div className="w-px h-6 bg-slate-600 mx-1" />

        {/* Blocks */}
        <button
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={`px-3 py-1 rounded text-sm ${
            editor.isActive('blockquote') ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
          }`}
          type="button"
        >
          Quote
        </button>
        <button
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          className={`px-3 py-1 rounded text-sm ${
            editor.isActive('codeBlock') ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
          }`}
          type="button"
        >
          Code Block
        </button>

        <div className="w-px h-6 bg-slate-600 mx-1" />

        {/* Image */}
        <button
          onClick={handleImageUpload}
          className="px-3 py-1 rounded text-sm bg-slate-700 text-slate-300 hover:bg-slate-600"
          type="button"
          disabled={isUploading}
        >
          {isUploading ? '⏳ Uploading...' : '📷 Image'}
        </button>
      </div>

      {/* Editor Content */}
      <EditorContent editor={editor} />

      {isUploading && (
        <div className="px-4 py-2 text-sm text-blue-400 animate-pulse border-t border-slate-700">
          ⏳ Uploading image to cloud storage...
        </div>
      )}
    </div>
  );
}
