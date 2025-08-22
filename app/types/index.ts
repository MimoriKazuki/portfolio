export interface Project {
  id: string
  title: string
  description: string
  thumbnail: string
  live_url?: string
  github_url?: string
  demo?: string
  technologies: string[]
  featured?: boolean
  category: 'homepage' | 'landing-page' | 'web-app' | 'mobile-app' | 'video'
  duration: string
  prompt?: string
  prompt_filename?: string
}

export interface Skill {
  name: string
  category: 'frontend' | 'backend' | 'database' | 'devops' | 'other'
  level: number // 1-5
  icon?: string
}

export interface Profile {
  name: string
  title: string
  bio: string
  avatar: string
  social: {
    github?: string
    twitter?: string
    linkedin?: string
    youtube?: string
    twitch?: string
  }
  location?: string
  email?: string
}

export interface Column {
  id: string
  title: string
  slug: string
  excerpt?: string
  content: string
  thumbnail?: string
  author?: string
  published_date: string
  tags?: string[]
  is_published: boolean
  is_featured?: boolean
  view_count?: number
  category?: 'ai-tools' | 'industry' | 'topics-news'
  created_at: string
  updated_at: string
}

export interface Document {
  id: string
  title: string
  description?: string
  thumbnail?: string
  file_url?: string
  category?: string
  tags?: string[]
  is_active: boolean
  is_featured?: boolean
  download_count?: number
  created_at: string
  updated_at: string
}

export interface DocumentRequest {
  id?: string
  document_id: string
  company_name: string
  name: string
  email: string
  phone?: string
  department?: string
  position?: string
  message?: string
  created_at?: string
}