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
      chat_messages: {
        Row: {
          id: number
          user_id: string | null
          role: string | null
          content: string | null
          suggested_product_id: string | null
          created_at: string | null
        }
        Insert: {
          id?: number
          user_id?: string | null
          role?: string | null
          content?: string | null
          suggested_product_id?: string | null
          created_at?: string | null
        }
        Update: {
          id?: number
          user_id?: string | null
          role?: string | null
          content?: string | null
          suggested_product_id?: string | null
          created_at?: string | null
        }
      }
      post_comments: {
        Row: {
          id: number
          post_id: string | null
          user_id: string | null
          content: string | null
          created_at: string | null
        }
        Insert: {
          id?: number
          post_id?: string | null
          user_id?: string | null
          content?: string | null
          created_at?: string | null
        }
        Update: {
          id?: number
          post_id?: string | null
          user_id?: string | null
          content?: string | null
          created_at?: string | null
        }
      }
      post_likes: {
        Row: {
          post_id: string
          user_id: string
          created_at: string | null
        }
        Insert: {
          post_id: string
          user_id: string
          created_at?: string | null
        }
        Update: {
          post_id?: string
          user_id?: string
          created_at?: string | null
        }
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
      }
      posts: {
        Row: {
          id: string
          user_id: string | null
          content: string | null
          views_count: number | null
          created_at: string | null
        }
        Insert: {
          id: string
          user_id?: string | null
          content?: string | null
          views_count?: number | null
          created_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string | null
          content?: string | null
          views_count?: number | null
          created_at?: string | null
        }
      }
      products: {
        Row: {
          id: string
          vendor_id: string | null
          category: string | null
          name: string | null
          price: number | null
          image_url: string | null
        }
        Insert: {
          id: string
          vendor_id?: string | null
          category?: string | null
          name?: string | null
          price?: number | null
          image_url?: string | null
        }
        Update: {
          id?: string
          vendor_id?: string | null
          category?: string | null
          name?: string | null
          price?: number | null
          image_url?: string | null
        }
      }
      reviews: {
        Row: {
          id: number
          user_id: string | null
          product_id: string | null
          rating: number | null
          comment: string | null
          created_at: string | null
        }
        Insert: {
          id?: number
          user_id?: string | null
          product_id?: string | null
          rating?: number | null
          comment?: string | null
          created_at?: string | null
        }
        Update: {
          id?: number
          user_id?: string | null
          product_id?: string | null
          rating?: number | null
          comment?: string | null
          created_at?: string | null
        }
      }
      tags: {
        Row: {
          id: string
          name: string | null
        }
        Insert: {
          id: string
          name?: string | null
        }
        Update: {
          id?: string
          name?: string | null
        }
      }
      task_dictionary: {
        Row: {
          id: string
          name: string | null
          is_mandatory: boolean | null
        }
        Insert: {
          id: string
          name?: string | null
          is_mandatory?: boolean | null
        }
        Update: {
          id?: string
          name?: string | null
          is_mandatory?: boolean | null
        }
      }
      user_favorite_products: {
        Row: {
          id: number
          user_id: string | null
          product_id: string | null
          saved_at: string | null
        }
        Insert: {
          id?: number
          user_id?: string | null
          product_id?: string | null
          saved_at?: string | null
        }
        Update: {
          id?: number
          user_id?: string | null
          product_id?: string | null
          saved_at?: string | null
        }
      }
      user_journey_tasks: {
        Row: {
          id: number
          user_id: string | null
          task_id: string | null
          status: string | null
          completed_at: string | null
        }
        Insert: {
          id?: number
          user_id?: string | null
          task_id?: string | null
          status?: string | null
          completed_at?: string | null
        }
        Update: {
          id?: number
          user_id?: string | null
          task_id?: string | null
          status?: string | null
          completed_at?: string | null
        }
      }
      user_vouchers: {
        Row: {
          id: number
          user_id: string | null
          voucher_id: string | null
          status: string | null
          unlocked_at: string | null
        }
        Insert: {
          id?: number
          user_id?: string | null
          voucher_id?: string | null
          status?: string | null
          unlocked_at?: string | null
        }
        Update: {
          id?: number
          user_id?: string | null
          voucher_id?: string | null
          status?: string | null
          unlocked_at?: string | null
        }
      }
      users: {
        Row: {
          id: string
          username: string | null
          email: string | null
          avatar_url: string | null
          is_new: boolean | null
        }
        Insert: {
          id: string
          username?: string | null
          email?: string | null
          avatar_url?: string | null
          is_new?: boolean | null
        }
        Update: {
          id?: string
          username?: string | null
          email?: string | null
          avatar_url?: string | null
          is_new?: boolean | null
        }
      }
      vendors: {
        Row: {
          id: string
          name: string | null
          category: string | null
          address: string | null
          rating: number | null
          image_url: string | null
        }
        Insert: {
          id: string
          name?: string | null
          category?: string | null
          address?: string | null
          rating?: number | null
          image_url?: string | null
        }
        Update: {
          id?: string
          name?: string | null
          category?: string | null
          address?: string | null
          rating?: number | null
          image_url?: string | null
        }
      }
      vouchers: {
        Row: {
          id: string
          vendor_id: string | null
          required_task_id: string | null
          title: string | null
          discount_value: string | null
        }
        Insert: {
          id: string
          vendor_id?: string | null
          required_task_id?: string | null
          title?: string | null
          discount_value?: string | null
        }
        Update: {
          id?: string
          vendor_id?: string | null
          required_task_id?: string | null
          title?: string | null
          discount_value?: string | null
        }
      }
    }
  }
}
