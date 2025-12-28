export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      ws_media: {
        Row: {
          category: string
          end_timestamp: string
          index: number
          start_timestamp: string
          title: string
          transcript: string
          youtube_id: string
          youtube_timestamp: string
        }
        Insert: {
          category: string
          end_timestamp: string
          index?: number
          start_timestamp: string
          title: string
          transcript: string
          youtube_id: string
          youtube_timestamp: string
        }
        Update: {
          category?: string
          end_timestamp?: string
          index?: number
          start_timestamp?: string
          title?: string
          transcript?: string
          youtube_id?: string
          youtube_timestamp?: string
        }
        Relationships: []
      }
      ws_music_albums: {
        Row: {
          artist: string
          description: string | null
          id: string
          name: string
          release_date: string
        }
        Insert: {
          artist: string
          description?: string | null
          id?: string
          name: string
          release_date?: string
        }
        Update: {
          artist?: string
          description?: string | null
          id?: string
          name?: string
          release_date?: string
        }
        Relationships: [
          {
            foreignKeyName: "ws_music_albums_artist_fkey"
            columns: ["artist"]
            isOneToOne: false
            referencedRelation: "ws_music_artists"
            referencedColumns: ["id"]
          },
        ]
      }
      ws_music_artists: {
        Row: {
          description: string | null
          display_priority: number
          id: string
          image_url: string
          name: string
        }
        Insert: {
          description?: string | null
          display_priority?: number
          id?: string
          image_url?: string
          name: string
        }
        Update: {
          description?: string | null
          display_priority?: number
          id?: string
          image_url?: string
          name?: string
        }
        Relationships: []
      }
      ws_music_categories: {
        Row: {
          description: string | null
          display_priority: number
          id: string
          name: string
        }
        Insert: {
          description?: string | null
          display_priority?: number
          id?: string
          name: string
        }
        Update: {
          description?: string | null
          display_priority?: number
          id?: string
          name?: string
        }
        Relationships: []
      }
      ws_music_tracks: {
        Row: {
          album: string | null
          artist: string
          category: string
          featured: boolean
          id: string
          name: string
          release_date: string
          url: string
        }
        Insert: {
          album?: string | null
          artist: string
          category: string
          featured?: boolean
          id?: string
          name: string
          release_date?: string
          url: string
        }
        Update: {
          album?: string | null
          artist?: string
          category?: string
          featured?: boolean
          id?: string
          name?: string
          release_date?: string
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "ws_music_tracks_album_fkey"
            columns: ["album"]
            isOneToOne: false
            referencedRelation: "ws_music_albums"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ws_music_tracks_artist_fkey"
            columns: ["artist"]
            isOneToOne: false
            referencedRelation: "ws_music_artists"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ws_music_tracks_category_fkey"
            columns: ["category"]
            isOneToOne: false
            referencedRelation: "ws_music_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      ws_newsletters: {
        Row: {
          content: string | null
          html_tag: string
          index: number
          month: string
          page: number
          year: number
        }
        Insert: {
          content?: string | null
          html_tag: string
          index?: number
          month: string
          page: number
          year: number
        }
        Update: {
          content?: string | null
          html_tag?: string
          index?: number
          month?: string
          page?: number
          year?: number
        }
        Relationships: []
      }
      ws_quran_appendices: {
        Row: {
          appendix_number: number
          appendix_preview_text: string
          appendix_title: string
        }
        Insert: {
          appendix_number: number
          appendix_preview_text: string
          appendix_title: string
        }
        Update: {
          appendix_number?: number
          appendix_preview_text?: string
          appendix_title?: string
        }
        Relationships: []
      }
      ws_quran_chapters: {
        Row: {
          chapter_number: number
          chapter_verses: number
          revelation_order: number
          title_arabic: string
          title_bahasa: string
          title_bengali: string
          title_english: string
          title_french: string
          title_german: string
          title_persian: string
          title_russian: string
          title_spanish: string
          title_swedish: string
          title_tamil: string
          title_transliterated: string
          title_turkish: string
          title_urdu: string
        }
        Insert: {
          chapter_number: number
          chapter_verses: number
          revelation_order: number
          title_arabic: string
          title_bahasa: string
          title_bengali: string
          title_english: string
          title_french: string
          title_german: string
          title_persian: string
          title_russian: string
          title_spanish?: string
          title_swedish: string
          title_tamil: string
          title_transliterated: string
          title_turkish: string
          title_urdu?: string
        }
        Update: {
          chapter_number?: number
          chapter_verses?: number
          revelation_order?: number
          title_arabic?: string
          title_bahasa?: string
          title_bengali?: string
          title_english?: string
          title_french?: string
          title_german?: string
          title_persian?: string
          title_russian?: string
          title_spanish?: string
          title_swedish?: string
          title_tamil?: string
          title_transliterated?: string
          title_turkish?: string
          title_urdu?: string
        }
        Relationships: []
      }
      ws_quran_footnotes: {
        Row: {
          bahasa: string
          bengali: string
          chapter_number: number
          english: string
          french: string
          german: string
          persian: string
          russian: string
          spanish: string
          swedish: string
          tamil: string
          turkish: string
          urdu: string
          verse_id: string
          verse_index: number
          verse_number: number
        }
        Insert: {
          bahasa: string
          bengali: string
          chapter_number: number
          english: string
          french: string
          german: string
          persian: string
          russian: string
          spanish: string
          swedish: string
          tamil: string
          turkish: string
          urdu: string
          verse_id: string
          verse_index?: number
          verse_number: number
        }
        Update: {
          bahasa?: string
          bengali?: string
          chapter_number?: number
          english?: string
          french?: string
          german?: string
          persian?: string
          russian?: string
          spanish?: string
          swedish?: string
          tamil?: string
          turkish?: string
          urdu?: string
          verse_id?: string
          verse_index?: number
          verse_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "ws-quran-footnotes_chapter_number_fkey"
            columns: ["chapter_number"]
            isOneToOne: false
            referencedRelation: "ws_quran_chapters"
            referencedColumns: ["chapter_number"]
          },
          {
            foreignKeyName: "ws-quran-footnotes_verse_id_fkey"
            columns: ["verse_id"]
            isOneToOne: true
            referencedRelation: "ws_quran_index"
            referencedColumns: ["verse_id"]
          },
          {
            foreignKeyName: "ws-quran-footnotes_verse_id_fkey1"
            columns: ["verse_id"]
            isOneToOne: true
            referencedRelation: "ws_quran_text"
            referencedColumns: ["verse_id"]
          },
        ]
      }
      ws_quran_index: {
        Row: {
          chapter_number: number
          chapter_verses: number
          verse_id: string
          verse_id_arabic: string
          verse_index: number
          verse_number: number
        }
        Insert: {
          chapter_number: number
          chapter_verses: number
          verse_id: string
          verse_id_arabic: string
          verse_index?: number
          verse_number: number
        }
        Update: {
          chapter_number?: number
          chapter_verses?: number
          verse_id?: string
          verse_id_arabic?: string
          verse_index?: number
          verse_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "ws-quran_chapter_number_fkey"
            columns: ["chapter_number"]
            isOneToOne: false
            referencedRelation: "ws_quran_chapters"
            referencedColumns: ["chapter_number"]
          },
        ]
      }
      ws_quran_subtitles: {
        Row: {
          bahasa: string
          bengali: string
          chapter_number: number
          english: string
          french: string
          german: string
          persian: string
          russian: string
          spanish: string
          swedish: string
          tamil: string
          turkish: string
          urdu: string
          verse_id: string
          verse_index: number
          verse_number: number
        }
        Insert: {
          bahasa: string
          bengali: string
          chapter_number: number
          english: string
          french: string
          german: string
          persian: string
          russian: string
          spanish: string
          swedish: string
          tamil: string
          turkish: string
          urdu: string
          verse_id: string
          verse_index?: number
          verse_number: number
        }
        Update: {
          bahasa?: string
          bengali?: string
          chapter_number?: number
          english?: string
          french?: string
          german?: string
          persian?: string
          russian?: string
          spanish?: string
          swedish?: string
          tamil?: string
          turkish?: string
          urdu?: string
          verse_id?: string
          verse_index?: number
          verse_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "ws-quran-subtitles_chapter_number_fkey"
            columns: ["chapter_number"]
            isOneToOne: false
            referencedRelation: "ws_quran_chapters"
            referencedColumns: ["chapter_number"]
          },
          {
            foreignKeyName: "ws-quran-subtitles_verse_id_fkey"
            columns: ["verse_id"]
            isOneToOne: true
            referencedRelation: "ws_quran_index"
            referencedColumns: ["verse_id"]
          },
          {
            foreignKeyName: "ws-quran-subtitles_verse_id_fkey1"
            columns: ["verse_id"]
            isOneToOne: true
            referencedRelation: "ws_quran_text"
            referencedColumns: ["verse_id"]
          },
        ]
      }
      ws_quran_text: {
        Row: {
          arabic: string
          arabic_clean: string
          bahasa: string
          bengali: string
          chapter_number: number
          english: string
          french: string
          german: string
          persian: string
          persian_new: string
          russian: string
          spanish: string
          swedish: string
          tamil: string
          transliterated: string
          turkish: string
          urdu: string
          verse_id: string
          verse_index: number
          verse_number: number
        }
        Insert: {
          arabic: string
          arabic_clean: string
          bahasa: string
          bengali: string
          chapter_number: number
          english: string
          french: string
          german: string
          persian: string
          persian_new: string
          russian: string
          spanish?: string
          swedish: string
          tamil: string
          transliterated: string
          turkish: string
          urdu: string
          verse_id: string
          verse_index?: number
          verse_number: number
        }
        Update: {
          arabic?: string
          arabic_clean?: string
          bahasa?: string
          bengali?: string
          chapter_number?: number
          english?: string
          french?: string
          german?: string
          persian?: string
          persian_new?: string
          russian?: string
          spanish?: string
          swedish?: string
          tamil?: string
          transliterated?: string
          turkish?: string
          urdu?: string
          verse_id?: string
          verse_index?: number
          verse_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "ws-quran-text_chapter_number_fkey"
            columns: ["chapter_number"]
            isOneToOne: false
            referencedRelation: "ws_quran_chapters"
            referencedColumns: ["chapter_number"]
          },
          {
            foreignKeyName: "ws-quran-text_verse_id_fkey"
            columns: ["verse_id"]
            isOneToOne: true
            referencedRelation: "ws_quran_index"
            referencedColumns: ["verse_id"]
          },
        ]
      }
      ws_quran_word_by_word: {
        Row: {
          arabic: string
          chapter_number: number
          english: string
          index: number
          meanings: string | null
          root_word: string
          transliterated: string
          verse_id: string
          verse_index: number
          verse_number: number
          word_index: number
        }
        Insert: {
          arabic: string
          chapter_number?: number
          english: string
          index?: number
          meanings?: string | null
          root_word: string
          transliterated: string
          verse_id: string
          verse_index: number
          verse_number?: number
          word_index: number
        }
        Update: {
          arabic?: string
          chapter_number?: number
          english?: string
          index?: number
          meanings?: string | null
          root_word?: string
          transliterated?: string
          verse_id?: string
          verse_index?: number
          verse_number?: number
          word_index?: number
        }
        Relationships: [
          {
            foreignKeyName: "ws-quran-word-by-word_chapter_number_fkey"
            columns: ["chapter_number"]
            isOneToOne: false
            referencedRelation: "ws_quran_chapters"
            referencedColumns: ["chapter_number"]
          },
          {
            foreignKeyName: "ws-quran-word-by-word_verse_id_fkey"
            columns: ["verse_id"]
            isOneToOne: false
            referencedRelation: "ws_quran_index"
            referencedColumns: ["verse_id"]
          },
          {
            foreignKeyName: "ws-quran-word-by-word_verse_id_fkey1"
            columns: ["verse_id"]
            isOneToOne: false
            referencedRelation: "ws_quran_text"
            referencedColumns: ["verse_id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      issue_api_key: { Args: { name?: string }; Returns: string }
      validate_api_key: { Args: { provided_key: string }; Returns: string }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
  | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
  | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
  ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
    DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
  : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
    DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
  ? R
  : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
    DefaultSchema["Views"])
  ? (DefaultSchema["Tables"] &
    DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
      Row: infer R
    }
  ? R
  : never
  : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
  | keyof DefaultSchema["Tables"]
  | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
  ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
  : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
    Insert: infer I
  }
  ? I
  : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
  ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
    Insert: infer I
  }
  ? I
  : never
  : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
  | keyof DefaultSchema["Tables"]
  | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
  ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
  : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
    Update: infer U
  }
  ? U
  : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
  ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
    Update: infer U
  }
  ? U
  : never
  : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
  | keyof DefaultSchema["Enums"]
  | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
  ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
  : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
  ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
  : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
  | keyof DefaultSchema["CompositeTypes"]
  | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
  ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
  : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
  ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
  : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
