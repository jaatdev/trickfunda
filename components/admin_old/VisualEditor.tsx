'use client'

import { useState } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Image from '@tiptap/extension-image'
import Link from '@tiptap/extension-link'
import Underline from '@tiptap/extension-underline'
import { Bold, Italic, List, ListOrdered, Image as ImageIcon, Link as LinkIcon } from 'lucide-react'

interface VisualEditorProps {
  item: any
  onUpdate: (item: any) => void
}

export default function VisualEditor({ item, onUpdate }: VisualEditorProps) {
  const [title, setTitle] = useState(item?.title || '')
  
  const editor = useEditor({
    extensions: [
      StarterKit,
      Image,
      Link,
      Underline,
    ],
    content: item?.content?.body || '',
    onUpdate: ({ editor }) => {
      onUpdate({
        ...item,
        content: {
          ...item.content,
          body: editor.getHTML()
        }
      })
    },
  })

  if (!item) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500">
        Select an item to edit
      </div>
    )
  }

  return (
    <div className="h-full overflow-y-auto p-6">
      <div className="max-w-4xl mx-auto">
        <input
          type="text"
          value={title}
          onChange={(e) => {
            setTitle(e.target.value)
            onUpdate({ ...item, title: e.target.value })
          }}
          className="w-full text-3xl font-bold mb-6 bg-transparent border-none focus:outline-none"
          placeholder="Title"
        />

        <div className="mb-4 flex items-center gap-2 border-b pb-2">
          <button
            onClick={() => editor?.chain().focus().toggleBold().run()}
            className={`p-2 rounded ${editor?.isActive('bold') ? 'bg-gray-200' : ''}`}
          >
            <Bold className="w-4 h-4" />
          </button>
          <button
            onClick={() => editor?.chain().focus().toggleItalic().run()}
            className={`p-2 rounded ${editor?.isActive('italic') ? 'bg-gray-200' : ''}`}
          >
            <Italic className="w-4 h-4" />
          </button>
          <button
            onClick={() => editor?.chain().focus().toggleBulletList().run()}
            className={`p-2 rounded ${editor?.isActive('bulletList') ? 'bg-gray-200' : ''}`}
          >
            <List className="w-4 h-4" />
          </button>
          <button
            onClick={() => editor?.chain().focus().toggleOrderedList().run()}
            className={`p-2 rounded ${editor?.isActive('orderedList') ? 'bg-gray-200' : ''}`}
          >
            <ListOrdered className="w-4 h-4" />
          </button>
        </div>

        <EditorContent editor={editor} className="prose max-w-none" />
      </div>
    </div>
  )
}
