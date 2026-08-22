export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Rating = 'not_for_me' | 'kinda_like' | 'love_it'
export type QuizStatus = 'draft' | 'published' | 'archived'

export type PublicQuizItem = {
  id: string
  position: number
  image_path: string
  prompt: string | null
}

export type PublicQuizResponse = {
  quiz_item_id: string
  rating: Rating
  updated_at: string
}

export type PublicQuizPayload = {
  client: { name: string; logo_url: string | null }
  quiz: { id: string; title: string; intro_text: string | null; status: QuizStatus }
  items: PublicQuizItem[]
  responses: PublicQuizResponse[]
}

export type Database = {
  public: {
    Tables: {
      admin_users: {
        Row: { user_id: string; created_at: string }
        Insert: { user_id: string; created_at?: string }
        Update: { user_id?: string; created_at?: string }
        Relationships: []
      }
      clients: {
        Row: { id: string; name: string; slug: string; logo_url: string | null; created_by: string | null; created_at: string; updated_at: string }
        Insert: { id?: string; name: string; slug: string; logo_url?: string | null; created_by?: string | null; created_at?: string; updated_at?: string }
        Update: { id?: string; name?: string; slug?: string; logo_url?: string | null; created_by?: string | null; created_at?: string; updated_at?: string }
        Relationships: []
      }
      quizzes: {
        Row: { id: string; client_id: string; title: string; slug: string; intro_text: string | null; status: QuizStatus; access_token: string; created_by: string | null; created_at: string; updated_at: string; published_at: string | null }
        Insert: { id?: string; client_id: string; title: string; slug: string; intro_text?: string | null; status?: QuizStatus; access_token?: string; created_by?: string | null; created_at?: string; updated_at?: string; published_at?: string | null }
        Update: { id?: string; client_id?: string; title?: string; slug?: string; intro_text?: string | null; status?: QuizStatus; access_token?: string; created_by?: string | null; created_at?: string; updated_at?: string; published_at?: string | null }
        Relationships: []
      }
      quiz_items: {
        Row: { id: string; quiz_id: string; position: number; image_path: string; prompt: string | null; created_at: string }
        Insert: { id?: string; quiz_id: string; position: number; image_path: string; prompt?: string | null; created_at?: string }
        Update: { id?: string; quiz_id?: string; position?: number; image_path?: string; prompt?: string | null; created_at?: string }
        Relationships: []
      }
      responses: {
        Row: { id: string; quiz_id: string; quiz_item_id: string; rating: Rating; answered_at: string; updated_at: string }
        Insert: { id?: string; quiz_id: string; quiz_item_id: string; rating: Rating; answered_at?: string; updated_at?: string }
        Update: { id?: string; quiz_id?: string; quiz_item_id?: string; rating?: Rating; answered_at?: string; updated_at?: string }
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: {
      get_public_quiz: {
        Args: { p_client_slug: string; p_quiz_slug: string; p_access_token: string }
        Returns: PublicQuizPayload | null
      }
      save_public_response: {
        Args: { p_access_token: string; p_quiz_item_id: string; p_rating: Rating }
        Returns: { ok: boolean; quiz_item_id: string; rating: Rating }
      }
      is_admin: { Args: Record<string, never>; Returns: boolean }
    }
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}
