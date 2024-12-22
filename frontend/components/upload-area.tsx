'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useDropzone } from 'react-dropzone'
import { Upload, FileText, CheckCircle, AlertCircle } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useToast } from '@/hooks/use-toast'

export function UploadArea() {
  const [uploading, setUploading] = useState(false)
  const [uploaded, setUploaded] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const { toast } = useToast()

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return

    setUploading(true)
    setError(null)
    const file = acceptedFiles[0]
    const formData = new FormData()
    formData.append('file', file)

    try {
      const response = await fetch('http://localhost:8000/upload-cv/', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error(await response.text() || 'Failed to upload CV')
      }

      setUploaded(true)
      toast({
        title: "CV uploaded successfully!",
        description: "Processing your CV to find matching jobs...",
      })

      // Trigger job upload
      const jobsResponse = await fetch('http://localhost:8000/upload-jobs/', {
        method: 'POST',
      })

      if (!jobsResponse.ok) {
        throw new Error('Failed to process jobs')
      }

      // Redirect to matched jobs page
      router.push('/matched-jobs')
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to upload CV')
      setUploaded(false)
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : 'Failed to upload CV',
        variant: "destructive",
      })
    } finally {
      setUploading(false)
    }
  }, [router, toast])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
    },
    multiple: false,
    disabled: uploading,
  })

  return (
    <div
      {...getRootProps()}
      className={`
        p-8 border-2 border-dashed rounded-lg cursor-pointer
        transition-all duration-300 ease-in-out
        ${isDragActive ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-300 dark:border-gray-700'}
        ${uploaded ? 'bg-green-50 dark:bg-green-900/20 border-green-500' : ''}
        ${error ? 'bg-red-50 dark:bg-red-900/20 border-red-500' : ''}
        ${uploading ? 'pointer-events-none opacity-70' : ''}
      `}
    >
      <input {...getInputProps()} />
      <AnimatePresence mode="wait">
        <motion.div
          key={uploading ? 'uploading' : uploaded ? 'uploaded' : error ? 'error' : 'default'}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="flex flex-col items-center justify-center text-center"
        >
          {error ? (
            <>
              <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
              <p className="text-lg font-semibold text-red-600 mb-2">Upload Failed</p>
              <p className="text-sm text-red-500">{error}</p>
              <p className="text-xs text-gray-400 mt-2">Click or drag to try again</p>
            </>
          ) : uploading ? (
            <>
              <div className="w-16 h-16 mb-4 relative">
                <motion.div
                  className="absolute inset-0 border-4 border-blue-500 rounded-full"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                />
                <Upload className="w-8 h-8 text-blue-500 absolute inset-0 m-auto" />
              </div>
              <p className="text-lg font-semibold">Uploading your CV...</p>
              <p className="text-sm text-gray-500">Please wait while we process your file</p>
            </>
          ) : uploaded ? (
            <>
              <CheckCircle className="w-16 h-16 text-green-500 mb-4" />
              <p className="text-lg font-semibold text-green-600">CV Uploaded Successfully!</p>
              <p className="text-sm text-gray-500">Redirecting to matched jobs...</p>
            </>
          ) : (
            <>
              <FileText className="w-16 h-16 text-gray-400 mb-4" />
              <p className="text-lg font-semibold mb-2">
                {isDragActive ? 'Drop your CV here' : 'Drag & Drop your CV here'}
              </p>
              <p className="text-sm text-gray-500">or click to select a file</p>
              <p className="text-xs text-gray-400 mt-2">Supported format: PDF</p>
            </>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

