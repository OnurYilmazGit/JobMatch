import { JobList } from '@/components/job-list'

export default function MatchedJobsPage() {
  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8 text-center bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
        Matched Jobs
      </h1>
      <JobList />
    </main>
  )
}

