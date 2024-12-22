'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import { Building2, Briefcase, BarChart, ExternalLink, BookmarkPlus, BookmarkCheck, AlertCircle, SearchX } from 'lucide-react'

interface JobMatch {
  positionName: string
  company: string
  matchScore: number
  matchedSkills: string[]
  missingSkills: string[]
  description: string
  url: string
}

export function JobList() {
  const [jobs, setJobs] = useState<JobMatch[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [hoveredJob, setHoveredJob] = useState<string | null>(null)
  const [savedJobs, setSavedJobs] = useState<string[]>([])
  const { toast } = useToast()

  useEffect(() => {
    // Load saved jobs from localStorage
    const saved = localStorage.getItem('savedJobs')
    if (saved) {
      setSavedJobs(JSON.parse(saved))
    }

    const fetchJobs = async () => {
      try {
        const res = await fetch('http://localhost:8000/match-jobs/')
        if (!res.ok) {
          throw new Error('Failed to fetch matched jobs')
        }
        const data = await res.json()
        setJobs(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch jobs')
      } finally {
        setLoading(false)
      }
    }

    fetchJobs()
  }, [])

  const toggleSaveJob = (jobTitle: string) => {
    const newSavedJobs = savedJobs.includes(jobTitle)
      ? savedJobs.filter(job => job !== jobTitle)
      : [...savedJobs, jobTitle]
    
    setSavedJobs(newSavedJobs)
    localStorage.setItem('savedJobs', JSON.stringify(newSavedJobs))
    
    toast({
      title: savedJobs.includes(jobTitle) ? "Job removed from saved" : "Job saved!",
      description: savedJobs.includes(jobTitle)
        ? "The job has been removed from your saved jobs"
        : "You can find this job in your saved jobs section",
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="animate-pulse text-xl text-muted-foreground"
        >
          Finding your perfect matches...
        </motion.div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-destructive text-center"
        >
          <p className="text-xl font-semibold">Oops! Something went wrong</p>
          <p className="text-muted-foreground">{error}</p>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {jobs.map((job, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: index * 0.1 }}
        >
          <Card 
            className="relative group border-[#1e2334] bg-[#080b14] hover:border-[#2e3446] transition-all duration-200"
            onMouseEnter={() => setHoveredJob(job.positionName)}
            onMouseLeave={() => setHoveredJob(null)}
          >
            <CardHeader>
              <CardTitle className="flex items-start justify-between">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <Briefcase className="h-4 w-4 text-muted-foreground" />
                    <span className="font-semibold text-gray-200">{job.positionName}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <Building2 className="h-4 w-4" />
                    <span>{job.company}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => toggleSaveJob(job.positionName)}
                    className="text-gray-400 hover:text-blue-500 transition-colors"
                  >
                    {savedJobs.includes(job.positionName) ? (
                      <BookmarkCheck className="h-5 w-5" />
                    ) : (
                      <BookmarkPlus className="h-5 w-5" />
                    )}
                  </motion.button>
                  <div className="flex items-center space-x-1">
                    <BarChart className="h-4 w-4 text-[#6366f1]" />
                    <span className="font-bold text-[#6366f1]">{job.matchScore}%</span>
                  </div>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="text-sm font-semibold mb-2 text-gray-400">Matched Skills</h4>
                <div className="flex flex-wrap gap-2">
                  {job.matchedSkills.map((skill, skillIndex) => (
                    <Badge 
                      key={skillIndex} 
                      variant="secondary" 
                      className="bg-[#4ade80]/10 text-[#4ade80] hover:bg-[#4ade80]/20"
                    >
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="text-sm font-semibold mb-2 text-gray-400">Missing Skills</h4>
                <div className="flex flex-wrap gap-2">
                  {job.missingSkills.map((skill, skillIndex) => (
                    <Badge 
                      key={skillIndex} 
                      variant="secondary" 
                      className="bg-[#f43f5e]/10 text-[#f43f5e] hover:bg-[#f43f5e]/20"
                    >
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2 rounded-md hover:from-blue-600 hover:to-purple-700 transition-all duration-300 flex items-center justify-center space-x-2"
                onClick={() => window.open(job.url, '_blank')}
              >
                <span>Apply</span>
                <ExternalLink className="h-4 w-4" />
              </motion.button>
            </CardFooter>

            <AnimatePresence>
              {hoveredJob === job.positionName && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{ duration: 0.2 }}
                  className="absolute inset-0 bg-[#080b14]/95 p-6 rounded-lg"
                >
                  <div className="h-full flex flex-col">
                    <h4 className="text-lg font-medium text-gray-200 mb-4">Job Description</h4>
                    <div className="flex-grow overflow-y-auto mb-4 prose prose-sm dark:prose-invert">
                      {job.description.split('\n').map((paragraph, i) => (
                        paragraph.trim() && (
                          <p key={i} className="text-sm text-gray-400 mb-2">
                            {paragraph}
                          </p>
                        )
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2 rounded-md hover:from-blue-600 hover:to-purple-700 transition-all duration-300 flex items-center justify-center gap-2"
                        onClick={() => window.open(job.url, '_blank')}
                      >
                        Apply Now <ExternalLink className="h-4 w-4" />
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => toggleSaveJob(job.positionName)}
                        className={`px-4 py-2 rounded-md border transition-all duration-300 flex items-center justify-center gap-2
                          ${savedJobs.includes(job.positionName)
                            ? 'border-blue-500 text-blue-500'
                            : 'border-gray-600 text-gray-400 hover:border-blue-500 hover:text-blue-500'
                          }`}
                      >
                        {savedJobs.includes(job.positionName) ? (
                          <>
                            Saved <BookmarkCheck className="h-4 w-4" />
                          </>
                        ) : (
                          <>
                            Save <BookmarkPlus className="h-4 w-4" />
                          </>
                        )}
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </Card>
        </motion.div>
      ))}
    </div>
  )
}

