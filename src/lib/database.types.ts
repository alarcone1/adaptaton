export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export type Database = {
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
            cohort_instructors: {
                Row: {
                    assigned_at: string | null
                    cohort_id: string
                    user_id: string
                }
                Insert: {
                    assigned_at?: string | null
                    cohort_id: string
                    user_id: string
                }
                Update: {
                    assigned_at?: string | null
                    cohort_id?: string
                    user_id?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "cohort_instructors_cohort_id_fkey"
                        columns: ["cohort_id"]
                        isOneToOne: false
                        referencedRelation: "cohorts"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "cohort_instructors_user_id_fkey"
                        columns: ["user_id"]
                        isOneToOne: false
                        referencedRelation: "profiles"
                        referencedColumns: ["id"]
                    }
                ]
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
            course_activities: {
                Row: {
                    cohort_id: string
                    course_id: string | null
                    created_at: string
                    custom_instructions: string | null
                    due_date: string | null
                    id: string
                    is_active: boolean
                    prerequisite_activity_id: string | null
                    resource_id: string
                    sequence_order: number | null
                }
                Insert: {
                    cohort_id: string
                    course_id?: string | null
                    created_at?: string
                    custom_instructions?: string | null
                    due_date?: string | null
                    id?: string
                    is_active?: boolean
                    prerequisite_activity_id?: string | null
                    resource_id: string
                    sequence_order?: number | null
                }
                Update: {
                    cohort_id?: string
                    course_id?: string | null
                    created_at?: string
                    custom_instructions?: string | null
                    due_date?: string | null
                    id?: string
                    is_active?: boolean
                    prerequisite_activity_id?: string | null
                    resource_id?: string
                    sequence_order?: number | null
                }
                Relationships: [
                    {
                        foreignKeyName: "course_activities_cohort_id_fkey"
                        columns: ["cohort_id"]
                        isOneToOne: false
                        referencedRelation: "cohorts"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "course_activities_course_id_fkey"
                        columns: ["course_id"]
                        isOneToOne: false
                        referencedRelation: "courses"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "course_activities_prerequisite_activity_id_fkey"
                        columns: ["prerequisite_activity_id"]
                        isOneToOne: false
                        referencedRelation: "course_activities"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "course_activities_resource_id_fkey"
                        columns: ["resource_id"]
                        isOneToOne: false
                        referencedRelation: "resource_library"
                        referencedColumns: ["id"]
                    }
                ]
            }
            course_attendance: {
                Row: {
                    course_id: string
                    created_at: string
                    date: string
                    id: string
                    status: string
                    student_id: string
                }
                Insert: {
                    course_id: string
                    created_at?: string
                    date: string
                    id?: string
                    status: string
                    student_id: string
                }
                Update: {
                    course_id?: string
                    created_at?: string
                    date?: string
                    id?: string
                    status?: string
                    student_id?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "course_attendance_course_id_fkey"
                        columns: ["course_id"]
                        isOneToOne: false
                        referencedRelation: "courses"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "course_attendance_student_id_fkey"
                        columns: ["student_id"]
                        isOneToOne: false
                        referencedRelation: "profiles"
                        referencedColumns: ["id"]
                    }
                ]
            }
            course_enrollments: {
                Row: {
                    course_id: string
                    created_at: string
                    id: string
                    status: Database["public"]["Enums"]["enrollment_status"]
                    student_id: string
                }
                Insert: {
                    course_id: string
                    created_at?: string
                    id?: string
                    status?: Database["public"]["Enums"]["enrollment_status"]
                    student_id: string
                }
                Update: {
                    course_id?: string
                    created_at?: string
                    id?: string
                    status?: Database["public"]["Enums"]["enrollment_status"]
                    student_id?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "course_enrollments_course_id_fkey"
                        columns: ["course_id"]
                        isOneToOne: false
                        referencedRelation: "courses"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "course_enrollments_student_id_fkey"
                        columns: ["student_id"]
                        isOneToOne: false
                        referencedRelation: "profiles"
                        referencedColumns: ["id"]
                    }
                ]
            }
            courses: {
                Row: {
                    cohort_id: string
                    created_at: string
                    end_date: string | null
                    id: string
                    start_date: string | null
                    subject_id: string
                    teacher_id: string
                }
                Insert: {
                    cohort_id: string
                    created_at?: string
                    end_date?: string | null
                    id?: string
                    start_date?: string | null
                    subject_id: string
                    teacher_id: string
                }
                Update: {
                    cohort_id?: string
                    created_at?: string
                    end_date?: string | null
                    id?: string
                    start_date?: string | null
                    subject_id?: string
                    teacher_id?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "courses_cohort_id_fkey"
                        columns: ["cohort_id"]
                        isOneToOne: false
                        referencedRelation: "cohorts"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "courses_subject_id_fkey"
                        columns: ["subject_id"]
                        isOneToOne: false
                        referencedRelation: "subjects"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "courses_teacher_id_fkey"
                        columns: ["teacher_id"]
                        isOneToOne: false
                        referencedRelation: "profiles"
                        referencedColumns: ["id"]
                    }
                ]
            }
            evidences: {
                Row: {
                    attempt_number: number | null
                    challenge_id: string | null
                    course_activity_id: string | null
                    created_at: string | null
                    description: string | null
                    feedback: string | null
                    gps_coords: Json | null
                    id: string
                    impact_data: Json | null
                    is_highlighted: boolean | null
                    media_url: string | null
                    parent_evidence_id: string | null
                    status: Database["public"]["Enums"]["evidence_status"] | null
                    user_id: string
                }
                Insert: {
                    attempt_number?: number | null
                    challenge_id?: string | null
                    course_activity_id?: string | null
                    created_at?: string | null
                    description?: string | null
                    feedback?: string | null
                    gps_coords?: Json | null
                    id?: string
                    impact_data?: Json | null
                    is_highlighted?: boolean | null
                    media_url?: string | null
                    parent_evidence_id?: string | null
                    status?: Database["public"]["Enums"]["evidence_status"] | null
                    user_id: string
                }
                Update: {
                    attempt_number?: number | null
                    challenge_id?: string | null
                    course_activity_id?: string | null
                    created_at?: string | null
                    description?: string | null
                    feedback?: string | null
                    gps_coords?: Json | null
                    id?: string
                    impact_data?: Json | null
                    is_highlighted?: boolean | null
                    media_url?: string | null
                    parent_evidence_id?: string | null
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
                        foreignKeyName: "evidences_parent_evidence_id_fkey"
                        columns: ["parent_evidence_id"]
                        isOneToOne: false
                        referencedRelation: "evidences"
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
            Opportunities: {
                Row: {
                    created_at: string | null
                    description: string | null
                    id: string
                    is_active: boolean | null
                    logo_url: string | null
                    partner_id: string | null
                    partner_name: string | null
                    target_cohort_type: Database["public"]["Enums"]["cohort_type"] | null
                    title: string
                }
                Insert: {
                    created_at?: string | null
                    description?: string | null
                    id?: string
                    is_active?: boolean | null
                    logo_url?: string | null
                    partner_id?: string | null
                    partner_name?: string | null
                    target_cohort_type?: Database["public"]["Enums"]["cohort_type"] | null
                    title: string
                }
                Update: {
                    created_at?: string | null
                    description?: string | null
                    id?: string
                    is_active?: boolean | null
                    logo_url?: string | null
                    partner_id?: string | null
                    partner_name?: string | null
                    target_cohort_type?: Database["public"]["Enums"]["cohort_type"] | null
                    title?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "opportunities_partner_id_fkey"
                        columns: ["partner_id"]
                        isOneToOne: false
                        referencedRelation: "profiles"
                        referencedColumns: ["id"]
                    }
                ]
            }
            profiles: {
                Row: {
                    avatar_url: string | null
                    bio: string | null
                    cedula: string | null
                    cohort_id: string | null
                    created_at: string | null
                    email: string | null
                    full_name: string | null
                    id: string
                    last_name: string | null
                    phone: string | null
                    role: Database["public"]["Enums"]["user_role"]
                }
                Insert: {
                    avatar_url?: string | null
                    bio?: string | null
                    cedula?: string | null
                    cohort_id?: string | null
                    created_at?: string | null
                    email?: string | null
                    full_name?: string | null
                    id: string
                    last_name?: string | null
                    phone?: string | null
                    role?: Database["public"]["Enums"]["user_role"]
                }
                Update: {
                    avatar_url?: string | null
                    bio?: string | null
                    cedula?: string | null
                    cohort_id?: string | null
                    created_at?: string | null
                    email?: string | null
                    full_name?: string | null
                    id?: string
                    last_name?: string | null
                    phone?: string | null
                    role?: Database["public"]["Enums"]["user_role"]
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
            resource_library: {
                Row: {
                    base_description: string | null
                    created_at: string | null
                    id: string
                    metrics_schema: Json | null
                    resource_url: string | null
                    title: string
                }
                Insert: {
                    base_description?: string | null
                    created_at?: string | null
                    id?: string
                    metrics_schema?: Json | null
                    resource_url?: string | null
                    title: string
                }
                Update: {
                    base_description?: string | null
                    created_at?: string | null
                    id?: string
                    metrics_schema?: Json | null
                    resource_url?: string | null
                    title?: string
                }
                Relationships: []
            }
            subjects: {
                Row: {
                    created_at: string
                    credits: number | null
                    description: string | null
                    id: string
                    name: string
                }
                Insert: {
                    created_at?: string
                    credits?: number | null
                    description?: string | null
                    id?: string
                    name: string
                }
                Update: {
                    created_at?: string
                    credits?: number | null
                    description?: string | null
                    id?: string
                    name?: string
                }
                Relationships: []
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
            enrollment_status: "active" | "completed" | "failed" | "dropped"
            evidence_status: "draft" | "submitted" | "validated" | "rejected"
            lead_status: "pending" | "contacted" | "closed"
            user_role: "student" | "teacher" | "partner" | "admin"
        }
        CompositeTypes: {
            [_ in never]: never
        }
    }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
    PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
    TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]] & any)["Tables"] &
    keyof (Database[PublicTableNameOrOptions["schema"]] & any)["Views"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
    ? (Database[PublicTableNameOrOptions["schema"]] & any)["Tables"][TableName] extends {
        Row: infer R
    }
    ? R
    : (Database[PublicTableNameOrOptions["schema"]] & any)["Views"][TableName] extends {
        Row: infer R
    }
    ? R
    : never
    : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
            Row: infer R
        }
    ? R
    : never
    : never

export type TablesInsert<
    PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
    TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]] & any)["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
    ? (Database[PublicTableNameOrOptions["schema"]] & any)["Tables"][TableName] extends {
        Insert: infer I
    }
    ? I
    : never
    : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
    }
    ? I
    : never
    : never

export type TablesUpdate<
    PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
    TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]] & any)["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
    ? (Database[PublicTableNameOrOptions["schema"]] & any)["Tables"][TableName] extends {
        Update: infer U
    }
    ? U
    : never
    : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
    }
    ? U
    : never
    : never

export type Enums<
    PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
    EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicEnumNameOrOptions["schema"]] & any)["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
    ? (Database[PublicEnumNameOrOptions["schema"]] & any)["Enums"][EnumName]
    : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
    PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
    CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
        schema: keyof Database
    }
    ? keyof (Database[PublicCompositeTypeNameOrOptions["schema"]] & any)["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
    ? (Database[PublicCompositeTypeNameOrOptions["schema"]] & any)["CompositeTypes"][CompositeTypeName]
    : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
