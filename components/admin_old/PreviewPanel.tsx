'use client'

import NoteBoxRenderer from '@/components/NoteBoxRenderer'

interface PreviewPanelProps {
  item: any
}

export default function PreviewPanel({ item }: PreviewPanelProps) {
  if (!item) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500">
        Select an item to preview
      </div>
    )
  }

  return (
    <div className="h-full overflow-y-auto p-6 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold mb-4">Preview</h2>
        {item.type && <NoteBoxRenderer note={item} index={0} />}
        {!item.type && (
          <div className="prose dark:prose-invert">
            <h1>{item.title}</h1>
            <p>{item.description}</p>
          </div>
        )}
      </div>
    </div>
  )
}
