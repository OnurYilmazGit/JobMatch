import { UploadButton } from '@/components/upload-button'

export default function Home() {
  return (
    <main className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center p-4 text-center bg-gradient-to-b from-background to-muted">
      <div className="max-w-3xl mx-auto">
        <h1 className="mb-4 text-6xl font-bold tracking-tight bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
          Your Perfect Job Awaits!
        </h1>
        <p className="mb-8 text-xl text-muted-foreground">
          Upload your CV and let our AI find your dream job.
        </p>
        <UploadButton />
      </div>
    </main>
  )
}

