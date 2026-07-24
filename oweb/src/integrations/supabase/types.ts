export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          first_name: string;
          last_name: string;
          avatar: string | null;
          timezone: string;
          language: string;
          default_organization_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          first_name?: string;
          last_name?: string;
          avatar?: string | null;
          timezone?: string;
          language?: string;
          default_organization_id?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["profiles"]["Insert"]>;
      };
      organizations: {
        Row: {
          id: string;
          name: string;
          slug: string;
          description: string | null;
          avatar: string | null;
          owner_id: string;
          archive: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          description?: string | null;
          avatar?: string | null;
          owner_id: string;
          archive?: boolean;
        };
        Update: Partial<Database["public"]["Tables"]["organizations"]["Insert"]>;
      };
      organization_members: {
        Row: {
          id: string;
          organization_id: string;
          user_id: string;
          role: "OWNER" | "ADMIN" | "MEMBER" | "VIEWER";
          is_default: boolean;
          joined_at: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          organization_id: string;
          user_id: string;
          role?: "OWNER" | "ADMIN" | "MEMBER" | "VIEWER";
          is_default?: boolean;
        };
        Update: Partial<
          Database["public"]["Tables"]["organization_members"]["Insert"]
        >;
      };
      workspaces: {
        Row: {
          id: string;
          organization_id: string;
          name: string;
          slug: string;
          description: string | null;
          color: string | null;
          archive: boolean;
          created_by_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          organization_id: string;
          name: string;
          slug: string;
          description?: string | null;
          color?: string | null;
          archive?: boolean;
          created_by_id?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["workspaces"]["Insert"]>;
      };
      workspace_members: {
        Row: {
          id: string;
          workspace_id: string;
          user_id: string;
          role: "OWNER" | "ADMIN" | "MEMBER" | "VIEWER";
          joined_at: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          workspace_id: string;
          user_id: string;
          role?: "OWNER" | "ADMIN" | "MEMBER" | "VIEWER";
        };
        Update: Partial<
          Database["public"]["Tables"]["workspace_members"]["Insert"]
        >;
      };
      project_members: {
        Row: {
          id: string;
          project_id: string;
          user_id: string;
          role: "OWNER" | "ADMIN" | "MEMBER" | "VIEWER";
          joined_at: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          project_id: string;
          user_id: string;
          role?: "OWNER" | "ADMIN" | "MEMBER" | "VIEWER";
        };
        Update: Partial<
          Database["public"]["Tables"]["project_members"]["Insert"]
        >;
      };
      workflows: {
        Row: {
          id: string;
          organization_id: string;
          name: string;
          description: string | null;
          is_default: boolean;
          created_by_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          organization_id: string;
          name: string;
          description?: string | null;
          is_default?: boolean;
          created_by_id?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["workflows"]["Insert"]>;
      };
      task_statuses: {
        Row: {
          id: string;
          workflow_id: string;
          name: string;
          color: string;
          category: "TODO" | "IN_PROGRESS" | "DONE";
          position: number;
          is_default: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          workflow_id: string;
          name: string;
          color: string;
          category: "TODO" | "IN_PROGRESS" | "DONE";
          position?: number;
          is_default?: boolean;
        };
        Update: Partial<Database["public"]["Tables"]["task_statuses"]["Insert"]>;
      };
      projects: {
        Row: {
          id: string;
          workspace_id: string;
          workflow_id: string;
          name: string;
          slug: string;
          task_prefix: string | null;
          description: string | null;
          avatar: string | null;
          color: string;
          status: "PLANNING" | "ACTIVE" | "ON_HOLD" | "COMPLETED" | "CANCELLED";
          priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
          visibility: "PRIVATE" | "TEAM" | "PUBLIC";
          archive: boolean;
          created_by_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          workspace_id: string;
          workflow_id: string;
          name: string;
          slug: string;
          task_prefix?: string | null;
          description?: string | null;
          avatar?: string | null;
          color?: string;
          status?: Database["public"]["Tables"]["projects"]["Row"]["status"];
          priority?: Database["public"]["Tables"]["projects"]["Row"]["priority"];
          visibility?: Database["public"]["Tables"]["projects"]["Row"]["visibility"];
          archive?: boolean;
          created_by_id?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["projects"]["Insert"]>;
      };
      tasks: {
        Row: {
          id: string;
          project_id: string;
          status_id: string;
          title: string;
          description: string | null;
          type: "TASK" | "BUG" | "STORY" | "EPIC" | "SUBTASK";
          priority: "LOWEST" | "LOW" | "MEDIUM" | "HIGH" | "HIGHEST";
          task_number: number;
          slug: string;
          start_date: string | null;
          due_date: string | null;
          completed_at: string | null;
          story_points: number | null;
          parent_task_id: string | null;
          is_archived: boolean;
          is_recurring: boolean;
          created_by_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          project_id: string;
          status_id: string;
          title: string;
          description?: string | null;
          type?: Database["public"]["Tables"]["tasks"]["Row"]["type"];
          priority?: Database["public"]["Tables"]["tasks"]["Row"]["priority"];
          task_number: number;
          slug: string;
          start_date?: string | null;
          due_date?: string | null;
          completed_at?: string | null;
          story_points?: number | null;
          parent_task_id?: string | null;
          is_archived?: boolean;
          is_recurring?: boolean;
          created_by_id?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["tasks"]["Insert"]>;
      };
      recurring_tasks: {
        Row: {
          id: string;
          task_id: string;
          recurrence_type: "DAILY" | "WEEKLY" | "MONTHLY" | "YEARLY";
          interval: number;
          days_of_week: number[];
          day_of_month: number | null;
          month_of_year: number | null;
          end_type: "NEVER" | "ON_DATE" | "AFTER_COUNT";
          end_date: string | null;
          occurrence_count: number | null;
          current_occurrence: number;
          is_active: boolean;
          next_occurrence: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          task_id: string;
          recurrence_type: Database["public"]["Tables"]["recurring_tasks"]["Row"]["recurrence_type"];
          interval?: number;
          days_of_week?: number[];
          day_of_month?: number | null;
          month_of_year?: number | null;
          end_type?: Database["public"]["Tables"]["recurring_tasks"]["Row"]["end_type"];
          end_date?: string | null;
          occurrence_count?: number | null;
          current_occurrence?: number;
          is_active?: boolean;
          next_occurrence: string;
        };
        Update: Partial<
          Database["public"]["Tables"]["recurring_tasks"]["Insert"]
        >;
      };
    };
    Views: Record<string, never>;
    Functions: {
      is_org_member: { Args: { org_id: string }; Returns: boolean };
      is_workspace_member: { Args: { ws_id: string }; Returns: boolean };
      is_project_member: { Args: { proj_id: string }; Returns: boolean };
    };
    Enums: Record<string, never>;
  };
};
