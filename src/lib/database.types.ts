// Database types in the same format the Supabase CLI generates
// (`supabase gen types typescript`), written to match supabase/migrations/0001_schema.sql.
// If the schema changes, regenerate or update this file to match.

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          full_name: string
          role: Database['public']['Enums']['user_role']
          created_at: string
        }
        Insert: {
          id: string
          full_name: string
          role?: Database['public']['Enums']['user_role']
          created_at?: string
        }
        Update: {
          id?: string
          full_name?: string
          role?: Database['public']['Enums']['user_role']
          created_at?: string
        }
        Relationships: []
      }
      sites: {
        Row: {
          id: string
          name: string
          address: string | null
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          address?: string | null
          is_active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          address?: string | null
          is_active?: boolean
          created_at?: string
        }
        Relationships: []
      }
      submissions: {
        Row: {
          id: string
          user_id: string
          site_id: string
          work_date: string // 'YYYY-MM-DD'
          ppe_hard_hat: boolean
          ppe_vest: boolean
          ppe_boots: boolean
          ppe_eye_protection: boolean
          fall_protection: boolean
          ladders_inspected: boolean
          tools_cords_ok: boolean
          hazards_identified: boolean
          notes: string | null
          status: Database['public']['Enums']['submission_status']
          reviewed_by: string | null
          reviewed_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          site_id: string
          work_date?: string
          ppe_hard_hat: boolean
          ppe_vest: boolean
          ppe_boots: boolean
          ppe_eye_protection: boolean
          fall_protection: boolean
          ladders_inspected: boolean
          tools_cords_ok: boolean
          hazards_identified: boolean
          notes?: string | null
          status?: Database['public']['Enums']['submission_status']
          reviewed_by?: string | null
          reviewed_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          site_id?: string
          work_date?: string
          ppe_hard_hat?: boolean
          ppe_vest?: boolean
          ppe_boots?: boolean
          ppe_eye_protection?: boolean
          fall_protection?: boolean
          ladders_inspected?: boolean
          tools_cords_ok?: boolean
          hazards_identified?: boolean
          notes?: string | null
          status?: Database['public']['Enums']['submission_status']
          reviewed_by?: string | null
          reviewed_at?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'submissions_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'submissions_site_id_fkey'
            columns: ['site_id']
            isOneToOne: false
            referencedRelation: 'sites'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'submissions_reviewed_by_fkey'
            columns: ['reviewed_by']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
        ]
      }
      submission_photos: {
        Row: {
          id: string
          submission_id: string
          storage_path: string
          mime_type: string
          size_bytes: number
          created_at: string
        }
        Insert: {
          id?: string
          submission_id: string
          storage_path: string
          mime_type: string
          size_bytes: number
          created_at?: string
        }
        Update: {
          id?: string
          submission_id?: string
          storage_path?: string
          mime_type?: string
          size_bytes?: number
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'submission_photos_submission_id_fkey'
            columns: ['submission_id']
            isOneToOne: false
            referencedRelation: 'submissions'
            referencedColumns: ['id']
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
    }
    Enums: {
      user_role: 'framer' | 'admin'
      submission_status: 'submitted' | 'reviewed' | 'flagged'
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

// Short helpers, e.g. Tables<'sites'>, TablesInsert<'submissions'>, Enums<'user_role'>.
type PublicSchema = Database['public']
export type Tables<T extends keyof PublicSchema['Tables']> = PublicSchema['Tables'][T]['Row']
export type TablesInsert<T extends keyof PublicSchema['Tables']> = PublicSchema['Tables'][T]['Insert']
export type TablesUpdate<T extends keyof PublicSchema['Tables']> = PublicSchema['Tables'][T]['Update']
export type Enums<T extends keyof PublicSchema['Enums']> = PublicSchema['Enums'][T]
