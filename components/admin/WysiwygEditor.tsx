"use client";

import React, { useCallback } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import Underline from '@tiptap/extension-underline';
import Placeholder from '@tiptap/extension-placeholder';
import { 
  Bold, Italic, Underline as UnderlineIcon, 
  List, ListOrdered, Quote, Heading1, Heading2, 
  Image as ImageIcon, Link as LinkIcon, Undo, Redo, Code
} from 'lucide-react';

interface WysiwygEditorProps {
  content: string;
  onChange: (html: string) => void;
}

const MenuBar = ({ editor }: { editor: any }) => {
  if (!editor) {
    return null;
  }

  const addImage = useCallback(() => {
    const url = window.prompt('URL of the image (or copy from Media Manager):');
    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  }, [editor]);

  const setLink = useCallback(() => {
    const previousUrl = editor.getAttributes('link').href;
    const url = window.prompt('URL', previousUrl);
    
    // cancelled
    if (url === null) {
      return;
    }

    // empty
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }

    // update link
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  }, [editor]);

  const toggleBtnClass = (isActive: boolean) => 
    `p-2 rounded-lg transition-colors ${isActive ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/10'}`;

  return (
    <div className="flex flex-wrap items-center gap-1 p-2 bg-gray-50 dark:bg-[#1a1a1a] border-b border-gray-200 dark:border-white/10">
      <button onClick={() => editor.chain().focus().toggleBold().run()} className={toggleBtnClass(editor.isActive('bold'))} title="Bold">
        <Bold className="w-4 h-4" />
      </button>
      <button onClick={() => editor.chain().focus().toggleItalic().run()} className={toggleBtnClass(editor.isActive('italic'))} title="Italic">
        <Italic className="w-4 h-4" />
      </button>
      <button onClick={() => editor.chain().focus().toggleUnderline().run()} className={toggleBtnClass(editor.isActive('underline'))} title="Underline">
        <UnderlineIcon className="w-4 h-4" />
      </button>
      
      <div className="w-px h-6 bg-gray-300 dark:bg-gray-700 mx-1" />
      
      <button onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} className={toggleBtnClass(editor.isActive('heading', { level: 1 }))} title="Heading 1">
        <Heading1 className="w-4 h-4" />
      </button>
      <button onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} className={toggleBtnClass(editor.isActive('heading', { level: 2 }))} title="Heading 2">
        <Heading2 className="w-4 h-4" />
      </button>
      
      <div className="w-px h-6 bg-gray-300 dark:bg-gray-700 mx-1" />
      
      <button onClick={() => editor.chain().focus().toggleBulletList().run()} className={toggleBtnClass(editor.isActive('bulletList'))} title="Bullet List">
        <List className="w-4 h-4" />
      </button>
      <button onClick={() => editor.chain().focus().toggleOrderedList().run()} className={toggleBtnClass(editor.isActive('orderedList'))} title="Ordered List">
        <ListOrdered className="w-4 h-4" />
      </button>
      <button onClick={() => editor.chain().focus().toggleBlockquote().run()} className={toggleBtnClass(editor.isActive('blockquote'))} title="Quote">
        <Quote className="w-4 h-4" />
      </button>
      <button onClick={() => editor.chain().focus().toggleCodeBlock().run()} className={toggleBtnClass(editor.isActive('codeBlock'))} title="Code Block">
        <Code className="w-4 h-4" />
      </button>
      
      <div className="w-px h-6 bg-gray-300 dark:bg-gray-700 mx-1" />
      
      <button onClick={setLink} className={toggleBtnClass(editor.isActive('link'))} title="Link">
        <LinkIcon className="w-4 h-4" />
      </button>
      <button onClick={addImage} className={toggleBtnClass(false)} title="Add Image">
        <ImageIcon className="w-4 h-4" />
      </button>
      
      <div className="flex-1" />
      
      <button onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()} className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 disabled:opacity-30">
        <Undo className="w-4 h-4" />
      </button>
      <button onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()} className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 disabled:opacity-30">
        <Redo className="w-4 h-4" />
      </button>
    </div>
  );
};

export default function WysiwygEditor({ content, onChange }: WysiwygEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Image.configure({
        HTMLAttributes: {
          class: 'rounded-xl max-w-full my-4 border border-gray-200 dark:border-white/10 shadow-sm',
        },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-emerald-500 hover:underline',
        },
      }),
      Underline,
      Placeholder.configure({
        placeholder: 'Start writing your amazing content here...',
      }),
    ],
    content: content,
    onUpdate: ({ editor }) => {
      // Return HTML. If you need strict Markdown, you would use turndown to convert HTML to Markdown.
      // But KD Method supports HTML inside notes.md!
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'prose dark:prose-invert prose-emerald max-w-none p-6 min-h-[400px] focus:outline-none',
      },
    },
  });

  return (
    <div className="flex flex-col h-full bg-white dark:bg-[#111111]">
      <MenuBar editor={editor} />
      <div className="flex-1 overflow-y-auto cursor-text" onClick={() => editor?.commands.focus()}>
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
