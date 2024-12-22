import { JobMatch } from '@/types/job'

// Local storage keys
export const SAVED_JOBS_KEY = 'savedJobs'

// Save job to local storage
export const saveJob = (job: JobMatch) => {
  const savedJobs = getSavedJobs()
  const updatedJobs = [
    ...savedJobs,
    {
      ...job,
      savedAt: new Date().toISOString(),
    },
  ]
  localStorage.setItem(SAVED_JOBS_KEY, JSON.stringify(updatedJobs))
  return updatedJobs
}

// Remove job from local storage
export const removeJob = (jobId: string) => {
  const savedJobs = getSavedJobs()
  const updatedJobs = savedJobs.filter((job) => job.id !== jobId)
  localStorage.setItem(SAVED_JOBS_KEY, JSON.stringify(updatedJobs))
  return updatedJobs
}

// Get all saved jobs from local storage
export const getSavedJobs = () => {
  if (typeof window === 'undefined') return []
  const saved = localStorage.getItem(SAVED_JOBS_KEY)
  return saved ? JSON.parse(saved) : []
}

// Check if a job is saved
export const isJobSaved = (jobId: string) => {
  const savedJobs = getSavedJobs()
  return savedJobs.some((job) => job.id === jobId)
}

