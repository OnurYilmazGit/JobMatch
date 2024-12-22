export interface JobMatch {
  id: string
  positionName: string
  company: string
  matchScore: number
  matchedSkills: string[]
  missingSkills: string[]
  description: string
  url: string
  location?: string
  salary?: string
  type?: string
}

export interface SavedJob extends JobMatch {
  savedAt: string
}

