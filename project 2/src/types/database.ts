export interface Database {
  public: {
    Tables: {
      clients: {
        Row: {
          id: string
          user_id: string
          first_name: string
          last_name: string
          email: string
          phone: string
          address: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          first_name: string
          last_name: string
          email: string
          phone?: string
          address?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          first_name?: string
          last_name?: string
          email?: string
          phone?: string
          address?: string
          updated_at?: string
        }
      }
      cases: {
        Row: {
          id: string
          client_id: string
          lawyer_id: string
          title: string
          description: string
          status: 'active' | 'pending' | 'closed'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          client_id: string
          lawyer_id: string
          title: string
          description: string
          status?: 'active' | 'pending' | 'closed'
          created_at?: string
          updated_at?: string
        }
        Update: {
          title?: string
          description?: string
          status?: 'active' | 'pending' | 'closed'
          updated_at?: string
        }
      }
      documents: {
        Row: {
          id: string
          case_id: string
          name: string
          file_path: string
          file_size: number
          mime_type: string
          uploaded_by: string
          created_at: string
        }
        Insert: {
          id?: string
          case_id: string
          name: string
          file_path: string
          file_size: number
          mime_type: string
          uploaded_by: string
          created_at?: string
        }
        Update: {
          name?: string
        }
      }
      messages: {
        Row: {
          id: string
          case_id: string
          sender_id: string
          content: string
          created_at: string
          read_at?: string
        }
        Insert: {
          id?: string
          case_id: string
          sender_id: string
          content: string
          created_at?: string
          read_at?: string
        }
        Update: {
          read_at?: string
        }
      }
      audit_logs: {
        Row: {
          id: string
          user_id: string
          action: string
          details: any
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          action: string
          details: any
          created_at?: string
        }
        Update: never
      }
    }
  }
}