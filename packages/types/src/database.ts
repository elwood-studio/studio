import { Json } from './scalar';

export interface Database {
  elwood: {
    Tables: {
      access: {
        Row: {
          added_by_user_id: string | null;
          allow_pattern: string[] | null;
          block_pattern: string[] | null;
          can_download: boolean;
          can_preview: boolean;
          can_share: boolean;
          can_view_children: boolean;
          can_view_descendants: boolean;
          can_write_blob: boolean;
          can_write_tree: boolean;
          created_at: string | null;
          description: string | null;
          id: string;
          is_public: boolean;
          object_id: string;
          share_password_secret_id: string | null;
          state: Database['elwood']['Enums']['access_state'];
          type: Database['elwood']['Enums']['access_type'];
          updated_at: string | null;
          user_id: string | null;
        };
        Insert: {
          added_by_user_id?: string | null;
          allow_pattern?: string[] | null;
          block_pattern?: string[] | null;
          can_download?: boolean;
          can_preview?: boolean;
          can_share?: boolean;
          can_view_children?: boolean;
          can_view_descendants?: boolean;
          can_write_blob?: boolean;
          can_write_tree?: boolean;
          created_at?: string | null;
          description?: string | null;
          id?: string;
          is_public?: boolean;
          object_id: string;
          share_password_secret_id?: string | null;
          state?: Database['elwood']['Enums']['access_state'];
          type?: Database['elwood']['Enums']['access_type'];
          updated_at?: string | null;
          user_id?: string | null;
        };
        Update: {
          added_by_user_id?: string | null;
          allow_pattern?: string[] | null;
          block_pattern?: string[] | null;
          can_download?: boolean;
          can_preview?: boolean;
          can_share?: boolean;
          can_view_children?: boolean;
          can_view_descendants?: boolean;
          can_write_blob?: boolean;
          can_write_tree?: boolean;
          created_at?: string | null;
          description?: string | null;
          id?: string;
          is_public?: boolean;
          object_id?: string;
          share_password_secret_id?: string | null;
          state?: Database['elwood']['Enums']['access_state'];
          type?: Database['elwood']['Enums']['access_type'];
          updated_at?: string | null;
          user_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'access_object_id';
            columns: ['object_id'];
            referencedRelation: 'object';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'object_added_by_user_id';
            columns: ['added_by_user_id'];
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'object_user_id';
            columns: ['user_id'];
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'share_password_secret_id';
            columns: ['share_password_secret_id'];
            referencedRelation: 'secrets';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'share_password_secret_id';
            columns: ['share_password_secret_id'];
            referencedRelation: 'decrypted_secrets';
            referencedColumns: ['id'];
          },
        ];
      };
      event: {
        Row: {
          created_at: string | null;
          has_processed: boolean;
          id: string;
          job_ids: string[] | null;
          payload: Json | null;
          processed_at: string | null;
          trigger: string | null;
          trigger_by_user_id: string | null;
          type: string[];
          updated_at: string | null;
        };
        Insert: {
          created_at?: string | null;
          has_processed?: boolean;
          id?: string;
          job_ids?: string[] | null;
          payload?: Json | null;
          processed_at?: string | null;
          trigger?: string | null;
          trigger_by_user_id?: string | null;
          type: string[];
          updated_at?: string | null;
        };
        Update: {
          created_at?: string | null;
          has_processed?: boolean;
          id?: string;
          job_ids?: string[] | null;
          payload?: Json | null;
          processed_at?: string | null;
          trigger?: string | null;
          trigger_by_user_id?: string | null;
          type?: string[];
          updated_at?: string | null;
        };
        Relationships: [];
      };
      object: {
        Row: {
          content_hash: string | null;
          created_at: string | null;
          created_by_user_id: string | null;
          current_version: number;
          data: Json | null;
          display_name: string;
          id: string;
          last_accessed_at: string | null;
          metadata: Json | null;
          mime_type: string | null;
          name: string;
          parent_id: string | null;
          remote_urn: string[] | null;
          root_user_id: string | null;
          sidecar_type: string | null;
          size: number | null;
          state: Database['elwood']['Enums']['object_state'];
          type: Database['elwood']['Enums']['object_type'];
          updated_at: string | null;
        };
        Insert: {
          content_hash?: string | null;
          created_at?: string | null;
          created_by_user_id?: string | null;
          current_version?: number;
          data?: Json | null;
          display_name: string;
          id?: string;
          last_accessed_at?: string | null;
          metadata?: Json | null;
          mime_type?: string | null;
          name: string;
          parent_id?: string | null;
          remote_urn?: string[] | null;
          root_user_id?: string | null;
          sidecar_type?: string | null;
          size?: number | null;
          state?: Database['elwood']['Enums']['object_state'];
          type?: Database['elwood']['Enums']['object_type'];
          updated_at?: string | null;
        };
        Update: {
          content_hash?: string | null;
          created_at?: string | null;
          created_by_user_id?: string | null;
          current_version?: number;
          data?: Json | null;
          display_name?: string;
          id?: string;
          last_accessed_at?: string | null;
          metadata?: Json | null;
          mime_type?: string | null;
          name?: string;
          parent_id?: string | null;
          remote_urn?: string[] | null;
          root_user_id?: string | null;
          sidecar_type?: string | null;
          size?: number | null;
          state?: Database['elwood']['Enums']['object_state'];
          type?: Database['elwood']['Enums']['object_type'];
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'object_created_by_user_id';
            columns: ['created_by_user_id'];
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'object_parent_id';
            columns: ['parent_id'];
            referencedRelation: 'object';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'object_root_user_id';
            columns: ['root_user_id'];
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
      };
      remote: {
        Row: {
          created_at: string | null;
          id: string;
          name: string;
          options: Json;
          parameters: Json;
          type: string;
          updated_at: string | null;
        };
        Insert: {
          created_at?: string | null;
          id?: string;
          name: string;
          options?: Json;
          parameters?: Json;
          type: string;
          updated_at?: string | null;
        };
        Update: {
          created_at?: string | null;
          id?: string;
          name?: string;
          options?: Json;
          parameters?: Json;
          type?: string;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      run: {
        Row: {
          completed_at: string | null;
          created_at: string | null;
          data: Json | null;
          description: string | null;
          event_id: string | null;
          has_failed: boolean;
          id: string;
          input: Json | null;
          instructions: Json | null;
          job_id: string[] | null;
          name: string;
          output: Json | null;
          report: Json | null;
          state: string;
          trigger: Database['elwood']['Enums']['run_trigger'];
          updated_at: string | null;
        };
        Insert: {
          completed_at?: string | null;
          created_at?: string | null;
          data?: Json | null;
          description?: string | null;
          event_id?: string | null;
          has_failed?: boolean;
          id?: string;
          input?: Json | null;
          instructions?: Json | null;
          job_id?: string[] | null;
          name: string;
          output?: Json | null;
          report?: Json | null;
          state?: string;
          trigger?: Database['elwood']['Enums']['run_trigger'];
          updated_at?: string | null;
        };
        Update: {
          completed_at?: string | null;
          created_at?: string | null;
          data?: Json | null;
          description?: string | null;
          event_id?: string | null;
          has_failed?: boolean;
          id?: string;
          input?: Json | null;
          instructions?: Json | null;
          job_id?: string[] | null;
          name?: string;
          output?: Json | null;
          report?: Json | null;
          state?: string;
          trigger?: Database['elwood']['Enums']['run_trigger'];
          updated_at?: string | null;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      can_create_object: {
        Args: {
          parent_id: string;
        };
        Returns: boolean;
      };
      create_object: {
        Args: {
          input: Database['elwood']['CompositeTypes']['create_object_input'];
        };
        Returns: string;
      };
      get_object_access: {
        Args: {
          object_id: string;
        };
        Returns: Database['elwood']['CompositeTypes']['object_access'];
      };
      get_object_breadcrumbs: {
        Args: {
          object_id: string;
        };
        Returns: {
          id: string;
          name: string;
          display_name: string;
          parent_id: string;
          depth_from_parent: number;
        }[];
      };
      has_access_to_object: {
        Args: {
          object_id: string;
        };
        Returns: boolean;
      };
    };
    Enums: {
      access_state: 'PENDING' | 'ACTIVE' | 'DISABLED';
      access_type: 'USER' | 'LINK';
      object_state:
        | 'CREATING'
        | 'PENDING'
        | 'UPLOADED'
        | 'PROCESSING'
        | 'FAILED'
        | 'READY';
      object_type: 'TREE' | 'BLOB' | 'LINK' | 'BACKEND';
      run_trigger: 'EVENT' | 'USER';
    };
    CompositeTypes: {
      create_object_input: {
        type: Database['elwood']['Enums']['object_type'];
        name: string;
        display_name: string;
        parent_id: string;
        mime_type: string;
        metadata: Json;
        size: number;
        sidecar_type: string;
        skip_workflows: boolean;
      };
      object_access: {
        has_access: boolean;
        can_view_children: boolean;
        can_view_descendants: boolean;
        can_share: boolean;
        can_write_blob: boolean;
        can_write_tree: boolean;
        block_pattern: unknown;
        allow_pattern: unknown;
      };
    };
  };
}
