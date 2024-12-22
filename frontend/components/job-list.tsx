'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Building2, Briefcase, BarChart } from 'lucide-react'

interface JobMatch {
  positionName: string
  company: string
  matchScore: number
  matchedSkills: string[]
  missingSkills: string[]
}

export function JobList() {
  const [jobs, setJobs] = useState<JobMatch[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-pulse text-xl text-muted-foreground">
          Finding your perfect matches...
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-destructive text-center">
          <p className="text-xl font-semibold">Oops! Something went wrong</p>
          <p className="text-muted-foreground">{error}</p>
        </div>
      </div>
    )
  }

  if (jobs.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-xl font-semibold">No matches found</p>
          <p className="text-muted-foreground">Try uploading a different CV or check back later</p>
        </div>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {jobs.map((job, index) => (
        <Card key={index} className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-start justify-between">
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <Briefcase className="h-4 w-4 text-muted-foreground" />
                  <span className="font-semibold">{job.positionName}</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <Building2 className="h-4 w-4" />
                  <span>{job.company}</span>
                </div>
              </div>
              <div className="flex items-center space-x-1">
                <BarChart className="h-4 w-4 text-primary" />
                <span className="font-bold text-primary">{job.matchScore}%</span>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="text-sm font-semibold mb-2">Matched Skills</h4>
              <div className="flex flex-wrap gap-2">
                {job.matchedSkills.map((skill, skillIndex) => (
                  <Badge key={skillIndex} variant="secondary" className="bg-green-500/10 text-green-500 hover:bg-green-500/20">
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>
            <div>
              <h4 className="text-sm font-semibold mb-2">Missing Skills</h4>
              <div className="flex flex-wrap gap-2">
                {job.missingSkills.map((skill, skillIndex) => (
                  <Badge key={skillIndex} variant="secondary" className="bg-red-500/10 text-red-500 hover:bg-red-500/20">
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

