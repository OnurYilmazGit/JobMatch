import { JobList } from '@/components/job-list';

export default function MatchedJobsPage() {
  return (
    <div className="min-h-screen bg-[#020817]">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-8 text-center text-[#6366f1]">
          Matched Jobs
        </h1>
        <JobList />
      </div>
    </div>
  )
}

