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
  enterprise_service?: string
  individual_service?: string
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
  audio_url?: string
  published_date: string
  tags?: string[]
  is_published: boolean
  is_featured?: boolean
  view_count?: number
  category?: 'ai-tools' | 'industry' | 'topics-news'
  created_at: string
  updated_at: string
  enterprise_service?: string
  individual_service?: string
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

export interface Notice {
  id: string
  title: string
  category: 'news' | 'webinar' | 'event' | 'maintenance' | 'other'
  site_url?: string
  thumbnail?: string
  description?: string
  is_featured: boolean
  is_published: boolean
  published_date: string
  created_at: string
  updated_at: string
}

export interface YouTubeVideo {
  id: string
  title: string
  description: string
  youtube_url: string
  youtube_video_id: string
  thumbnail_url: string
  featured: boolean
  display_order: number
  view_count: number
  enterprise_service: string
  individual_service: string
  created_at: string
  updated_at: string
  // YouTube Data API v3 fields
  published_at?: string
  channel_title?: string
  channel_id?: string
  like_count?: number
  comment_count?: number
  duration?: string
  import_source?: 'manual' | 'api'
  last_synced_at?: string
  is_own_channel: boolean // 自社チャンネルかどうか（手動で切り替え可能）
}

// eラーニング関連の型定義
export interface ELearningCategory {
  id: string
  name: string
  slug: string
  description?: string
  display_order: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface ELearningContent {
  id: string
  title: string
  description?: string
  thumbnail_url?: string
  video_url: string
  category_id?: string
  category?: ELearningCategory
  is_free: boolean
  price: number
  stripe_price_id?: string
  display_order: number
  is_published: boolean
  is_featured: boolean
  view_count: number
  created_at: string
  updated_at: string
  materials?: ELearningMaterial[]
}

export interface ELearningMaterial {
  id: string
  content_id: string
  title: string
  file_url: string
  file_size?: number
  display_order: number
  created_at: string
}

export interface ELearningUser {
  id: string
  auth_user_id: string
  email: string
  display_name?: string
  avatar_url?: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface ELearningPurchase {
  id: string
  user_id: string
  content_id: string
  stripe_session_id?: string
  amount: number
  status: 'pending' | 'completed' | 'refunded'
  created_at: string
}