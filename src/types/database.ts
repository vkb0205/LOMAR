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
      profiles: {
        Row: {
          id: string
          username: string | null
          full_name: string | null
          email: string | null
          avatar_url: string | null
          role: string
          onboarding_status: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          username?: string | null
          full_name?: string | null
          email?: string | null
          avatar_url?: string | null
          role?: string
          onboarding_status?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          username?: string | null
          full_name?: string | null
          email?: string | null
          avatar_url?: string | null
          role?: string
          onboarding_status?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      vendors: {
        Row: {
          id: string
          owner_id: string | null
          name: string
          slug: string
          category: string
          description: string | null
          address: string | null
          city: string | null
          phone: string | null
          email: string | null
          website_url: string | null
          image_url: string | null
          rating_avg: number
          rating_count: number
          status: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          owner_id?: string | null
          name: string
          slug: string
          category: string
          description?: string | null
          address?: string | null
          city?: string | null
          phone?: string | null
          email?: string | null
          website_url?: string | null
          image_url?: string | null
          rating_avg?: number
          rating_count?: number
          status?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          owner_id?: string | null
          name?: string
          slug?: string
          category?: string
          description?: string | null
          address?: string | null
          city?: string | null
          phone?: string | null
          email?: string | null
          website_url?: string | null
          image_url?: string | null
          rating_avg?: number
          rating_count?: number
          status?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      services: {
        Row: {
          id: string
          vendor_id: string
          category: string
          name: string
          description: string | null
          base_price: number
          currency: string
          thumbnail_url: string | null
          status: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          vendor_id: string
          category: string
          name: string
          description?: string | null
          base_price: number
          currency?: string
          thumbnail_url?: string | null
          status?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          vendor_id?: string
          category?: string
          name?: string
          description?: string | null
          base_price?: number
          currency?: string
          thumbnail_url?: string | null
          status?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      service_images: {
        Row: {
          id: string
          service_id: string
          image_url: string
          alt_text: string | null
          is_main: boolean
          display_order: number
          created_at: string
        }
        Insert: {
          id?: string
          service_id: string
          image_url: string
          alt_text?: string | null
          is_main?: boolean
          display_order?: number
          created_at?: string
        }
        Update: {
          id?: string
          service_id?: string
          image_url?: string
          alt_text?: string | null
          is_main?: boolean
          display_order?: number
          created_at?: string
        }
        Relationships: []
      }
      user_favorite_services: {
        Row: {
          user_id: string
          service_id: string
          saved_at: string
        }
        Insert: {
          user_id: string
          service_id: string
          saved_at?: string
        }
        Update: {
          user_id?: string
          service_id?: string
          saved_at?: string
        }
        Relationships: []
      }
      reviews: {
        Row: {
          id: string
          user_id: string
          vendor_id: string | null
          service_id: string | null
          rating: number
          comment: string | null
          status: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          vendor_id?: string | null
          service_id?: string | null
          rating: number
          comment?: string | null
          status?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          vendor_id?: string | null
          service_id?: string | null
          rating?: number
          comment?: string | null
          status?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      journey_tasks: {
        Row: {
          id: string
          code: string
          name: string
          description: string | null
          is_mandatory: boolean
          display_order: number
          active: boolean
        }
        Insert: {
          id?: string
          code: string
          name: string
          description?: string | null
          is_mandatory?: boolean
          display_order?: number
          active?: boolean
        }
        Update: {
          id?: string
          code?: string
          name?: string
          description?: string | null
          is_mandatory?: boolean
          display_order?: number
          active?: boolean
        }
        Relationships: []
      }
      user_journey_tasks: {
        Row: {
          user_id: string
          task_id: string
          status: string
          completed_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          user_id: string
          task_id: string
          status?: string
          completed_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          user_id?: string
          task_id?: string
          status?: string
          completed_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      vouchers: {
        Row: {
          id: string
          vendor_id: string | null
          code: string
          title: string
          description: string | null
          discount_type: string
          discount_value: number
          min_order_value: number | null
          required_task_id: string | null
          starts_at: string | null
          expires_at: string | null
          max_redemptions: number | null
          active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          vendor_id?: string | null
          code: string
          title: string
          description?: string | null
          discount_type: string
          discount_value: number
          min_order_value?: number | null
          required_task_id?: string | null
          starts_at?: string | null
          expires_at?: string | null
          max_redemptions?: number | null
          active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          vendor_id?: string | null
          code?: string
          title?: string
          description?: string | null
          discount_type?: string
          discount_value?: number
          min_order_value?: number | null
          required_task_id?: string | null
          starts_at?: string | null
          expires_at?: string | null
          max_redemptions?: number | null
          active?: boolean
          created_at?: string
        }
        Relationships: []
      }
      user_vouchers: {
        Row: {
          user_id: string
          voucher_id: string
          status: string
          unlocked_at: string | null
          redeemed_at: string | null
        }
        Insert: {
          user_id: string
          voucher_id: string
          status?: string
          unlocked_at?: string | null
          redeemed_at?: string | null
        }
        Update: {
          user_id?: string
          voucher_id?: string
          status?: string
          unlocked_at?: string | null
          redeemed_at?: string | null
        }
        Relationships: []
      }
      posts: {
        Row: {
          id: string
          user_id: string
          title: string | null
          content: string
          cover_image_url: string | null
          views_count: number
          status: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title?: string | null
          content: string
          cover_image_url?: string | null
          views_count?: number
          status?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string | null
          content?: string
          cover_image_url?: string | null
          views_count?: number
          status?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      post_comments: {
        Row: {
          id: string
          post_id: string
          user_id: string
          parent_comment_id: string | null
          content: string
          status: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          post_id: string
          user_id: string
          parent_comment_id?: string | null
          content: string
          status?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          post_id?: string
          user_id?: string
          parent_comment_id?: string | null
          content?: string
          status?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      post_likes: {
        Row: {
          post_id: string
          user_id: string
          created_at: string
        }
        Insert: {
          post_id: string
          user_id: string
          created_at?: string
        }
        Update: {
          post_id?: string
          user_id?: string
          created_at?: string
        }
        Relationships: []
      }
      tags: {
        Row: {
          id: string
          name: string
          slug: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
        }
        Relationships: []
      }
      post_tags: {
        Row: {
          post_id: string
          tag_id: string
        }
        Insert: {
          post_id: string
          tag_id: string
        }
        Update: {
          post_id?: string
          tag_id?: string
        }
        Relationships: []
      }
      follows: {
        Row: {
          id: string
          follower_id: string
          followee_type: string
          followee_user_id: string | null
          followee_vendor_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          follower_id: string
          followee_type: string
          followee_user_id?: string | null
          followee_vendor_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          follower_id?: string
          followee_type?: string
          followee_user_id?: string | null
          followee_vendor_id?: string | null
          created_at?: string
        }
        Relationships: []
      }
      chat_threads: {
        Row: {
          id: string
          user_id: string
          title: string | null
          context_type: string
          design_project_id: string | null
          service_id: string | null
          vendor_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title?: string | null
          context_type?: string
          design_project_id?: string | null
          service_id?: string | null
          vendor_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string | null
          context_type?: string
          design_project_id?: string | null
          service_id?: string | null
          vendor_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      chat_messages: {
        Row: {
          id: string
          thread_id: string
          user_id: string
          role: string
          content: string
          suggested_service_id: string | null
          metadata: Json
          created_at: string
        }
        Insert: {
          id?: string
          thread_id: string
          user_id: string
          role: string
          content: string
          suggested_service_id?: string | null
          metadata?: Json
          created_at?: string
        }
        Update: {
          id?: string
          thread_id?: string
          user_id?: string
          role?: string
          content?: string
          suggested_service_id?: string | null
          metadata?: Json
          created_at?: string
        }
        Relationships: []
      }
      ai_design_projects: {
        Row: {
          id: string
          user_id: string
          service_id: string | null
          title: string
          category: string
          bride_image_url: string | null
          groom_image_url: string | null
          reference_image_url: string | null
          selected_generation_id: string | null
          status: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          service_id?: string | null
          title?: string
          category: string
          bride_image_url?: string | null
          groom_image_url?: string | null
          reference_image_url?: string | null
          selected_generation_id?: string | null
          status?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          service_id?: string | null
          title?: string
          category?: string
          bride_image_url?: string | null
          groom_image_url?: string | null
          reference_image_url?: string | null
          selected_generation_id?: string | null
          status?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      ai_design_generations: {
        Row: {
          id: string
          project_id: string
          user_id: string
          prompt: string
          negative_prompt: string | null
          model_name: string
          input_payload: Json
          output_image_url: string | null
          output_metadata: Json
          status: string
          error_message: string | null
          cost_estimate: number | null
          created_at: string
          completed_at: string | null
        }
        Insert: {
          id?: string
          project_id: string
          user_id: string
          prompt: string
          negative_prompt?: string | null
          model_name: string
          input_payload?: Json
          output_image_url?: string | null
          output_metadata?: Json
          status?: string
          error_message?: string | null
          cost_estimate?: number | null
          created_at?: string
          completed_at?: string | null
        }
        Update: {
          id?: string
          project_id?: string
          user_id?: string
          prompt?: string
          negative_prompt?: string | null
          model_name?: string
          input_payload?: Json
          output_image_url?: string | null
          output_metadata?: Json
          status?: string
          error_message?: string | null
          cost_estimate?: number | null
          created_at?: string
          completed_at?: string | null
        }
        Relationships: []
      }
      ai_design_assets: {
        Row: {
          id: string
          project_id: string
          generation_id: string | null
          user_id: string
          asset_type: string
          file_url: string
          mime_type: string | null
          width: number | null
          height: number | null
          size_bytes: number | null
          created_at: string
        }
        Insert: {
          id?: string
          project_id: string
          generation_id?: string | null
          user_id: string
          asset_type: string
          file_url: string
          mime_type?: string | null
          width?: number | null
          height?: number | null
          size_bytes?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          generation_id?: string | null
          user_id?: string
          asset_type?: string
          file_url?: string
          mime_type?: string | null
          width?: number | null
          height?: number | null
          size_bytes?: number | null
          created_at?: string
        }
        Relationships: []
      }
      service_requests: {
        Row: {
          id: string
          user_id: string
          vendor_id: string
          service_id: string | null
          design_project_id: string | null
          event_date: string | null
          budget_min: number | null
          budget_max: number | null
          message: string | null
          status: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          vendor_id: string
          service_id?: string | null
          design_project_id?: string | null
          event_date?: string | null
          budget_min?: number | null
          budget_max?: number | null
          message?: string | null
          status?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          vendor_id?: string
          service_id?: string | null
          design_project_id?: string | null
          event_date?: string | null
          budget_min?: number | null
          budget_max?: number | null
          message?: string | null
          status?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [key: string]: {
        Row: Record<string, unknown>
        Relationships: []
      }
    }
    Functions: {
      [key: string]: {
        Args: Record<string, unknown>
        Returns: unknown
      }
    }
  }
}
