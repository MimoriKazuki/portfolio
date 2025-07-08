export interface Project {
  id: string
  title: string
  description: string
  thumbnail: string
  demo?: string
  technologies: string[]
  featured?: boolean
  category: 'homepage' | 'landing-page' | 'web-app' | 'mobile-app'
  duration: string
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