'use client'

import { useState, useEffect } from 'react'

interface CodeEditorProps {
  item: any
  onUpdate: (item: any) => void
}

export default function CodeEditor({ item, onUpdate }: CodeEditorProps) {
  const [code, setCode] = useState('')

  useEffect(() => {
    if (item) {
      setCode(JSON.stringify(item, null, 2))
    }
  }, [item])

  const handleChange = (value: string) => {
    setCode(value)
    try {
      const parsed = JSON.parse(value)
      onUpdate(parsed)
    } catch (e) {
      // Invalid JSON, don't update
    }
  }

  if (!item) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500">
        Select an item to edit
      </div>
    )
  }

  return (
    <div className="h-full overflow-y-auto p-6 bg-gray-900">
      <textarea
        value={code}
        onChange={(e) => handleChange(e.target.value)}
        className="w-full h-full font-mono text-sm bg-transparent text-gray-100 border-none focus:outline-none resize-none"
        spellCheck={false}
      />
    </div>
  )
}
