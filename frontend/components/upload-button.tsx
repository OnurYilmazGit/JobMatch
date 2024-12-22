'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Upload, CheckCircle } from 'lucide-react'

export function UploadButton() {
  const [uploading, setUploading] = useState(false)
  const [uploaded, setUploaded] = useState(false)
  const router = useRouter()
  
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return
    
    setUploading(true)
    const file = e.target.files[0]
    const formData = new FormData()
    formData.append('file', file)

    try {
      const response = await fetch('http://localhost:8000/upload-cv/', {
        method: 'POST',
        body: formData,
      })

      if (response.ok) {
        setUploaded(true)
        // Trigger job upload
        await fetch('http://localhost:8000/upload-jobs/', { method: 'POST' })
        // Redirect to matched jobs page
        router.push('/matched-jobs')
      } else {
        console.error('Failed to upload CV')
      }
    } catch (error) {
      console.error('Error uploading CV:', error)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div>
      <input
        type="file"
        id="cv-upload"
        className="hidden"
        accept=".pdf"
        onChange={handleFileChange}
      />
      <label htmlFor="cv-upload">
        <Button
          size="lg"
          className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
          disabled={uploading}
          asChild
        >
          <span>
            {uploaded ? (
              <CheckCircle className="mr-2 h-5 w-5 text-green-500" />
            ) : (
              <Upload className="mr-2 h-5 w-5" />
            )}
            {uploading ? 'Uploading...' : uploaded ? 'CV Uploaded' : 'Upload My CV'}
          </span>
        </Button>
      </label>
    </div>
  )
}

