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
      employees: {
        Row: {
          id: string
          name: string
          staff_id: string
          position: string
          department: string
          contact_number: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          staff_id: string
          position: string
          department: string
          contact_number: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          staff_id?: string
          position?: string
          department?: string
          contact_number?: string
          created_at?: string
          updated_at?: string
        }
      }
      attendance_records: {
        Row: {
          id: string
          employee_id: string
          date: string
          duty_time: string | null
          in_time1: string | null
          out_time1: string | null
          in_time2: string | null
          out_time2: string | null
          in_time3: string | null
          out_time3: string | null
          medical: boolean
          absent: boolean
          remarks: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          employee_id: string
          date: string
          duty_time?: string | null
          in_time1?: string | null
          out_time1?: string | null
          in_time2?: string | null
          out_time2?: string | null
          in_time3?: string | null
          out_time3?: string | null
          medical?: boolean
          absent?: boolean
          remarks?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          employee_id?: string
          date?: string
          duty_time?: string | null
          in_time1?: string | null
          out_time1?: string | null
          in_time2?: string | null
          out_time2?: string | null
          in_time3?: string | null
          out_time3?: string | null
          medical?: boolean
          absent?: boolean
          remarks?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}