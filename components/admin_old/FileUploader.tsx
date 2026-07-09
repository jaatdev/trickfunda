'use client'

import { useState } from 'react'
import { Upload, X } from 'lucide-react'

interface FileUploaderProps {
  onUpload: (url: string) => void
}

export default function FileUploader({ onUpload }: FileUploaderProps) {
  const [uploading, setUploading] = useState(false)
  const [preview, setPreview] = useState<string | null>(null)

  const handleUpload = async (file: File) => {
    setUploading(true)
    const formData = new FormData()
    formData.append('file', file)

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })
      const data = await response.json()
      onUpload(data.url)
      setPreview(data.url)
    } catch (error) {
      console.error('Upload failed:', error)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-6">
      <input
        type="file"
        id="file-upload"
        className="hidden"
        accept="image/*"
        onChange={(e) => e.target.files?.[0] && handleUpload(e.target.files[0])}
      />
      <label
        htmlFor="file-upload"
        className="flex flex-col items-center justify-center cursor-pointer"
      >
        <Upload className="w-12 h-12 text-gray-400 mb-2" />
        <span className="text-sm text-gray-600 dark:text-gray-400">
          {uploading ? 'Uploading...' : 'Click to upload image'}
        </span>
      </label>
      {preview && (
        <div className="mt-4 relative">
          <img src={preview} alt="Preview" className="max-w-full rounded" />
          <button
            onClick={() => setPreview(null)}
            className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  )
}
