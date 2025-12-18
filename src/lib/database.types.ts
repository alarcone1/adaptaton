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
        PostgrestVersion: "14.1"
    }
    public: {
        Tables: {
            challenges: {
                Row: {
                    created_at: string | null
                    description: string | null
                    id: string
                    points: number | null
                    resource_url: string | null
                    title: string
                }
                Insert: {
                    created_at?: string | null
                    description?: string | null
                    id?: string
                    points?: number | null
                    resource_url?: string | null
                    title: string
                }
                Update: {
                    created_at?: string | null
                    description?: string | null
                    id?: string
                    points?: number | null
                    resource_url?: string | null
                    title?: string
                }
                Relationships: []
            }
            cohorts: {
                Row: {
                    created_at: string | null
                    end_date: string | null
                    id: string
                    name: string
                    start_date: string | null
                    type: Database["public"]["Enums"]["cohort_type"]
                }
                Insert: {
                    created_at?: string | null
                    end_date?: string | null
                    id?: string
                    name: string
                    start_date?: string | null
                    type: Database["public"]["Enums"]["cohort_type"]
                }
                Update: {
                    created_at?: string | null
                    end_date?: string | null
                    id?: string
                    name?: string
                    start_date?: string | null
                    type?: Database["public"]["Enums"]["cohort_type"]
                }
                Relationships: []
            }
            evidences: {
                Row: {
                    challenge_id: string
                    created_at: string | null
                    description: string | null
                    gps_coords: unknown | null
                    id: string
                    impact_data: Json | null
                    is_highlighted: boolean | null
                    media_url: string | null
                    status: Database["public"]["Enums"]["evidence_status"] | null
                    user_id: string
                }
                Insert: {
                    challenge_id: string
                    created_at?: string | null
                    description?: string | null
                    gps_coords?: unknown | null
                    id?: string
                    impact_data?: Json | null
                    is_highlighted?: boolean | null
                    media_url?: string | null
                    status?: Database["public"]["Enums"]["evidence_status"] | null
                    user_id: string
                }
                Update: {
                    challenge_id?: string
                    created_at?: string | null
                    description?: string | null
                    gps_coords?: unknown | null
                    id?: string
                    impact_data?: Json | null
                    is_highlighted?: boolean | null
                    media_url?: string | null
                    status?: Database["public"]["Enums"]["evidence_status"] | null
                    user_id?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "evidences_challenge_id_fkey"
                        columns: ["challenge_id"]
                        isOneToOne: false
                        referencedRelation: "challenges"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "evidences_user_id_fkey"
                        columns: ["user_id"]
                        isOneToOne: false
                        referencedRelation: "profiles"
                        referencedColumns: ["id"]
                    }
                ]
            }
            leads: {
                Row: {
                    created_at: string | null
                    id: string
                    partner_id: string | null
                    status: Database["public"]["Enums"]["lead_status"] | null
                    student_id: string | null
                }
                Insert: {
                    created_at?: string | null
                    id?: string
                    partner_id?: string | null
                    status?: Database["public"]["Enums"]["lead_status"] | null
                    student_id?: string | null
                }
                Update: {
                    created_at?: string | null
                    id?: string
                    partner_id?: string | null
                    status?: Database["public"]["Enums"]["lead_status"] | null
                    student_id?: string | null
                }
                Relationships: [
                    {
                        foreignKeyName: "leads_partner_id_fkey"
                        columns: ["partner_id"]
                        isOneToOne: false
                        referencedRelation: "profiles"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "leads_student_id_fkey"
                        columns: ["student_id"]
                        isOneToOne: false
                        referencedRelation: "profiles"
                        referencedColumns: ["id"]
                    }
                ]
            }
            opportunities: {
                Row: {
                    created_at: string | null
                    description: string | null
                    id: string
                    logo_url: string | null
                    partner_name: string | null
                    target_cohort_type: Database["public"]["Enums"]["cohort_type"] | null
                    title: string
                }
                Insert: {
                    created_at?: string | null
                    description?: string | null
                    id?: string
                    logo_url?: string | null
                    partner_name?: string | null
                    target_cohort_type?: Database["public"]["Enums"]["cohort_type"] | null
                    title: string
                }
                Update: {
                    created_at?: string | null
                    description?: string | null
                    id?: string
                    logo_url?: string | null
                    partner_name?: string | null
                    target_cohort_type?: Database["public"]["Enums"]["cohort_type"] | null
                    title: string
                }
                Relationships: []
            }
            profiles: {
                Row: {
                    avatar_url: string | null
                    bio: string | null
                    cohort_id: string | null
                    created_at: string | null
                    full_name: string | null
                    id: string
                    role: Database["public"]["Enums"]["user_role"]
                    cedula: string | null
                    phone: string | null
                    last_name: string | null
                }
                Insert: {
                    avatar_url?: string | null
                    bio?: string | null
                    cohort_id?: string | null
                    created_at?: string | null
                    full_name?: string | null
                    id: string
                    role?: Database["public"]["Enums"]["user_role"]
                    cedula?: string | null
                    phone?: string | null
                    last_name?: string | null
                }
                Update: {
                    avatar_url?: string | null
                    bio?: string | null
                    cohort_id?: string | null
                    created_at?: string | null
                    full_name?: string | null
                    id?: string
                    role?: Database["public"]["Enums"]["user_role"]
                    cedula?: string | null
                    phone?: string | null
                    last_name?: string | null
                }
                Relationships: [
                    {
                        foreignKeyName: "profiles_cohort_id_fkey"
                        columns: ["cohort_id"]
                        isOneToOne: false
                        referencedRelation: "cohorts"
                        referencedColumns: ["id"]
                    }
                ]
            }
        }
        Views: {
            [_ in never]: never
        }
        Functions: {
            [_ in never]: never
        }
        Enums: {
            cohort_type: "minor" | "adult"
            evidence_status: "draft" | "submitted" | "validated" | "rejected"
            lead_status: "pending" | "contacted" | "closed"
            user_role: "student" | "teacher" | "partner" | "admin"
        }
        CompositeTypes: {
            [_ in never]: never
        }
    }
}

export type Tables<
    PublicTableNameOrOptions extends
    | keyof (Database["public"]["Tables"] & Database["public"]["Views"])
    | { schema: keyof Database },
    TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
    ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
            Row: infer R
        }
    ? R
    : never
    : PublicTableNameOrOptions extends keyof (Database["public"]["Tables"] &
        Database["public"]["Views"])
    ? (Database["public"]["Tables"] &
        Database["public"]["Views"])[PublicTableNameOrOptions] extends {
            Row: infer R
        }
    ? R
    : never
    : never

export type TablesInsert<
    PublicTableNameOrOptions extends
    | keyof Database["public"]["Tables"]
    | { schema: keyof Database },
    TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
    ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
        Insert: infer I
    }
    ? I
    : never
    : PublicTableNameOrOptions extends keyof Database["public"]["Tables"]
    ? Database["public"]["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
    }
    ? I
    : never
    : never

export type TablesUpdate<
    PublicTableNameOrOptions extends
    | keyof Database["public"]["Tables"]
    | { schema: keyof Database },
    TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
    ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
        Update: infer U
    }
    ? U
    : never
    : PublicTableNameOrOptions extends keyof Database["public"]["Tables"]
    ? Database["public"]["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
    }
    ? U
    : never
    : never

export type Enums<
    DefaultSchemaEnumNameOrOptions extends
    | keyof Database["public"]["Enums"]
    | { schema: keyof Database },
    EnumName extends DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
    ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
    : DefaultSchemaEnumNameOrOptions extends keyof Database["public"]["Enums"]
    ? Database["public"]["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
    PublicCompositeTypeNameOrOptions extends
    | keyof Database["public"]["CompositeTypes"]
    | { schema: keyof Database },
    CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
        schema: keyof Database
    }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
    ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
    : PublicCompositeTypeNameOrOptions extends keyof Database["public"]["CompositeTypes"]
    ? Database["public"]["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
