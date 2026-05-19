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
          full_name: string | null
          phone: string | null
          city: string | null
          area: string | null
          loyalty_status: 'new' | 'returning'
          language_preference: 'en' | 'ur-rom' | 'ur'
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          full_name?: string | null
          phone?: string | null
          city?: string | null
          area?: string | null
          loyalty_status?: 'new' | 'returning'
          language_preference?: 'en' | 'ur-rom' | 'ur'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          full_name?: string | null
          phone?: string | null
          city?: string | null
          area?: string | null
          loyalty_status?: 'new' | 'returning'
          language_preference?: 'en' | 'ur-rom' | 'ur'
          created_at?: string
          updated_at?: string
        }
      }
      providers: {
        Row: {
          id: string
          name: string
          phone: string | null
          skill: string
          specializations: string[]
          job_complexity_handled: string[]
          certifications: string[]
          city: string
          areas: string[]
          lat: number | null
          lng: number | null
          rating: number
          total_reviews: number
          recent_review_date: string | null
          recent_review_sentiment: string | null
          on_time_score: number
          cancellation_rate: number
          reliability_score: number
          risk_score: 'low' | 'medium' | 'high'
          dispute_count: number
          visit_fee: number
          hourly_rate_pkr: number
          rate_per_km: number
          loyalty_discount: number
          available: boolean
          booked_slots: string[]
          max_daily_capacity: number
          current_day_bookings: number
          years_experience: number
          languages_spoken: string[]
          tier: 'basic' | 'standard' | 'premium'
          created_at: string
        }
        Insert: {
          id: string
          name: string
          phone?: string | null
          skill: string
          specializations?: string[]
          job_complexity_handled?: string[]
          certifications?: string[]
          city: string
          areas?: string[]
          lat?: number | null
          lng?: number | null
          rating?: number
          total_reviews?: number
          recent_review_date?: string | null
          recent_review_sentiment?: string | null
          on_time_score?: number
          cancellation_rate?: number
          reliability_score?: number
          risk_score?: 'low' | 'medium' | 'high'
          dispute_count?: number
          visit_fee?: number
          hourly_rate_pkr?: number
          rate_per_km?: number
          loyalty_discount?: number
          available?: boolean
          booked_slots?: string[]
          max_daily_capacity?: number
          current_day_bookings?: number
          years_experience?: number
          languages_spoken?: string[]
          tier?: 'basic' | 'standard' | 'premium'
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          phone?: string | null
          skill?: string
          specializations?: string[]
          job_complexity_handled?: string[]
          certifications?: string[]
          city?: string
          areas?: string[]
          lat?: number | null
          lng?: number | null
          rating?: number
          total_reviews?: number
          recent_review_date?: string | null
          recent_review_sentiment?: string | null
          on_time_score?: number
          cancellation_rate?: number
          reliability_score?: number
          risk_score?: 'low' | 'medium' | 'high'
          dispute_count?: number
          visit_fee?: number
          hourly_rate_pkr?: number
          rate_per_km?: number
          loyalty_discount?: number
          available?: boolean
          booked_slots?: string[]
          max_daily_capacity?: number
          current_day_bookings?: number
          years_experience?: number
          languages_spoken?: string[]
          tier?: 'basic' | 'standard' | 'premium'
          created_at?: string
        }
      }
      bookings: {
        Row: {
          id: string
          user_id: string
          provider_id: string | null
          service_type: string
          issue_description: string | null
          severity: 'low' | 'medium' | 'high' | null
          location: string | null
          preferred_date: string | null
          preferred_time_window: string | null
          iso_time_from: string | null
          iso_time_to: string | null
          price_sensitivity: 'low' | 'medium' | 'high' | null
          job_complexity: 'basic' | 'intermediate' | 'complex' | null
          status: string
          total_price_pkr: number | null
          price_breakdown: Json | null
          provider_earning_pkr: number | null
          platform_fee_pkr: number | null
          surge_applied: boolean
          feedback_rating: number | null
          feedback_comment: string | null
          feedback_sentiment_score: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          provider_id?: string | null
          service_type: string
          issue_description?: string | null
          severity?: 'low' | 'medium' | 'high' | null
          location?: string | null
          preferred_date?: string | null
          preferred_time_window?: string | null
          iso_time_from?: string | null
          iso_time_to?: string | null
          price_sensitivity?: 'low' | 'medium' | 'high' | null
          job_complexity?: 'basic' | 'intermediate' | 'complex' | null
          status?: string
          total_price_pkr?: number | null
          price_breakdown?: Json | null
          provider_earning_pkr?: number | null
          platform_fee_pkr?: number | null
          surge_applied?: boolean
          feedback_rating?: number | null
          feedback_comment?: string | null
          feedback_sentiment_score?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          provider_id?: string | null
          service_type?: string
          issue_description?: string | null
          severity?: 'low' | 'medium' | 'high' | null
          location?: string | null
          preferred_date?: string | null
          preferred_time_window?: string | null
          iso_time_from?: string | null
          iso_time_to?: string | null
          price_sensitivity?: 'low' | 'medium' | 'high' | null
          job_complexity?: 'basic' | 'intermediate' | 'complex' | null
          status?: string
          total_price_pkr?: number | null
          price_breakdown?: Json | null
          provider_earning_pkr?: number | null
          platform_fee_pkr?: number | null
          surge_applied?: boolean
          feedback_rating?: number | null
          feedback_comment?: string | null
          feedback_sentiment_score?: number | null
          created_at?: string
          updated_at?: string
        }
      }
      disputes: {
        Row: {
          id: string
          booking_id: string
          user_id: string
          provider_id: string | null
          dispute_type: string
          user_description: string | null
          dispute_severity: 'low' | 'medium' | 'high' | null
          likely_fault: 'user' | 'provider' | 'unclear' | null
          recommended_action: string | null
          compensation_pkr: number
          compensation_reason: string | null
          message_to_user: string | null
          message_to_provider: string | null
          escalate_to_human: boolean
          escalation_reason: string | null
          provider_penalty_applied: boolean
          penalty_details: string | null
          status: 'pending' | 'resolved' | 'escalated'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          booking_id: string
          user_id: string
          provider_id?: string | null
          dispute_type: string
          user_description?: string | null
          dispute_severity?: 'low' | 'medium' | 'high' | null
          likely_fault?: 'user' | 'provider' | 'unclear' | null
          recommended_action?: string | null
          compensation_pkr?: number
          compensation_reason?: string | null
          message_to_user?: string | null
          message_to_provider?: string | null
          escalate_to_human?: boolean
          escalation_reason?: string | null
          provider_penalty_applied?: boolean
          penalty_details?: string | null
          status?: 'pending' | 'resolved' | 'escalated'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          booking_id?: string
          user_id?: string
          provider_id?: string | null
          dispute_type?: string
          user_description?: string | null
          dispute_severity?: 'low' | 'medium' | 'high' | null
          likely_fault?: 'user' | 'provider' | 'unclear' | null
          recommended_action?: string | null
          compensation_pkr?: number
          compensation_reason?: string | null
          message_to_user?: string | null
          message_to_provider?: string | null
          escalate_to_human?: boolean
          escalation_reason?: string | null
          provider_penalty_applied?: boolean
          penalty_details?: string | null
          status?: 'pending' | 'resolved' | 'escalated'
          created_at?: string
          updated_at?: string
        }
      }
      agent_traces: {
        Row: {
          id: string
          booking_id: string | null
          user_id: string | null
          agent_id: string
          agent_name: string
          input_summary: string | null
          decision: string | null
          rationale: string | null
          output_summary: string | null
          confidence_score: number | null
          fallback_triggered: boolean
          processing_time_ms: number | null
          created_at: string
        }
        Insert: {
          id?: string
          booking_id?: string | null
          user_id?: string | null
          agent_id: string
          agent_name: string
          input_summary?: string | null
          decision?: string | null
          rationale?: string | null
          output_summary?: string | null
          confidence_score?: number | null
          fallback_triggered?: boolean
          processing_time_ms?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          booking_id?: string | null
          user_id?: string | null
          agent_id?: string
          agent_name?: string
          input_summary?: string | null
          decision?: string | null
          rationale?: string | null
          output_summary?: string | null
          confidence_score?: number | null
          fallback_triggered?: boolean
          processing_time_ms?: number | null
          created_at?: string
        }
      }
    }
  }
}
