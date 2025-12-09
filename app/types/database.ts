export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      projects: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          title: string
          description: string
          thumbnail: string
          live_url: string | null
          video_url: string | null
          github_url: string | null
          technologies: string[]
          featured: boolean
          category: 'homepage' | 'landing-page' | 'web-app' | 'mobile-app' | 'video'
          order: number
          duration: string | null
          client: string | null
          prompt: string | null
          prompt_filename: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          title: string
          description: string
          thumbnail: string
          live_url?: string | null
          video_url?: string | null
          github_url?: string | null
          technologies?: string[]
          featured?: boolean
          category?: 'homepage' | 'landing-page' | 'web-app' | 'mobile-app' | 'video'
          order?: number
          duration?: string | null
          client?: string | null
          prompt?: string | null
          prompt_filename?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          title?: string
          description?: string
          thumbnail?: string
          live_url?: string | null
          video_url?: string | null
          github_url?: string | null
          technologies?: string[]
          featured?: boolean
          category?: 'homepage' | 'landing-page' | 'web-app' | 'mobile-app' | 'video'
          order?: number
          duration?: string | null
          client?: string | null
          prompt?: string | null
          prompt_filename?: string | null
        }
      }
      profiles: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          name: string
          title: string
          bio: string
          avatar: string
          github_url: string | null
          twitter_url: string | null
          linkedin_url: string | null
          email: string | null
          location: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          name: string
          title: string
          bio: string
          avatar: string
          github_url?: string | null
          twitter_url?: string | null
          linkedin_url?: string | null
          email?: string | null
          location?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          name?: string
          title?: string
          bio?: string
          avatar?: string
          github_url?: string | null
          twitter_url?: string | null
          linkedin_url?: string | null
          email?: string | null
          location?: string | null
        }
      }
      contacts: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          name: string
          company: string | null
          email: string
          message: string
          inquiry_type: 'service' | 'partnership' | 'recruit' | 'other'
          status: 'new' | 'in_progress' | 'completed'
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          name: string
          company?: string | null
          email: string
          message: string
          inquiry_type?: 'service' | 'partnership' | 'recruit' | 'other'
          status?: 'new' | 'in_progress' | 'completed'
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          name?: string
          company?: string | null
          email?: string
          message?: string
          inquiry_type?: 'service' | 'partnership' | 'recruit' | 'other'
          status?: 'new' | 'in_progress' | 'completed'
        }
      }
      youtube_videos: {
        Row: {
          id: string
          created_at: string
          updated_at: string
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
          published_at: string | null
          channel_title: string | null
          channel_id: string | null
          like_count: number | null
          comment_count: number | null
          duration: string | null
          import_source: string | null
          last_synced_at: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          title: string
          description: string
          youtube_url: string
          youtube_video_id: string
          thumbnail_url: string
          featured?: boolean
          display_order?: number
          view_count?: number
          enterprise_service?: string
          individual_service?: string
          published_at?: string
          channel_title?: string
          channel_id?: string
          like_count?: number
          comment_count?: number
          duration?: string
          import_source?: string
          last_synced_at?: string
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          title?: string
          description?: string
          youtube_url?: string
          youtube_video_id?: string
          thumbnail_url?: string
          featured?: boolean
          display_order?: number
          view_count?: number
          enterprise_service?: string
          individual_service?: string
          published_at?: string
          channel_title?: string
          channel_id?: string
          like_count?: number
          comment_count?: number
          duration?: string
          import_source?: string
          last_synced_at?: string
        }
      }
      documents: {
        Row: {
          id: string
          title: string
          description: string | null
          thumbnail: string | null
          file_url: string | null
          category: string | null
          tags: string[] | null
          is_active: boolean
          is_featured: boolean
          download_count: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          thumbnail?: string | null
          file_url?: string | null
          category?: string | null
          tags?: string[] | null
          is_active?: boolean
          is_featured?: boolean
          download_count?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          thumbnail?: string | null
          file_url?: string | null
          category?: string | null
          tags?: string[] | null
          is_active?: boolean
          is_featured?: boolean
          download_count?: number
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}