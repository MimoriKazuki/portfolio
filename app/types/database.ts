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
          technologies: string[]
          featured: boolean
          category: 'hp-lp' | 'web-app' | 'mobile-app'
          order: number
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          title: string
          description: string
          thumbnail: string
          live_url?: string | null
          technologies?: string[]
          featured?: boolean
          category?: 'hp-lp' | 'web-app' | 'mobile-app'
          order?: number
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          title?: string
          description?: string
          thumbnail?: string
          live_url?: string | null
          technologies?: string[]
          featured?: boolean
          category?: 'hp-lp' | 'web-app' | 'mobile-app'
          order?: number
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