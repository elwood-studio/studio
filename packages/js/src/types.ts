import { type FileSystemOperation } from './constants.ts';

export type FileSystemListItem = {
  hashes: {
    [key: string]: string | undefined;
    'SHA-1'?: string;
    MD5?: string;
    dropboxHash?: string;
  } | null;
  id: string;
  origID: string;
  isBucket: boolean;
  isDir: boolean;
  mimeType: string;
  modTime: string;
  name: string;
  encrypted: string;
  encryptedPath: string;
  path: string;
  size: number;
  tier: string;
};

export type FileSystemListInput = {
  remote: string;
  path: string;
  options?: {
    recurse?: boolean; // - If set recurse directories
    noModTime?: boolean; // - If set return modification time
    showEncrypted?: boolean; // - If set show decrypted names
    showOrigIDs?: boolean; // - If set show the IDs for each item if known
    showHash?: boolean; // - If set return a dictionary of hashes
    noMimeType?: boolean; // - If set don't show mime types
    dirsOnly?: boolean; // - If set only show directories
    filesOnly?: boolean; // - If set only show files
    metadata?: boolean; // - If set return metadata of objects also
    hashTypes?: boolean; // - array of strings of hash types to show if showHash set
  };
};

export type FileSystemListOutput = {
  remote: string;
  list: FileSystemListItem[];
};

export type FileSystemStatInput = {
  remote: string;
  path: string;
  options?: FileSystemListInput['options'];
};

export type FileSystemStatOutput = { item: FileSystemListItem | null };

export type Fetch = typeof fetch;
export type FileSystemFetch = <R = unknown>(
  operation: FileSystemOperation,
  body: Record<string, unknown>,
) => Promise<R>;

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json }
  | Json[];

export interface Database {
  elwood: {
    Tables: {
      access: {
        Row: {
          added_by_user_id: string | null;
          allow_pattern: string[] | null;
          block_pattern: string[] | null;
          can_download: boolean;
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
          share_password: string | null;
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
          share_password?: string | null;
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
          share_password?: string | null;
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
            foreignKeyName: 'object_added_by_user_id';
            columns: ['added_by_user_id'];
            referencedRelation: 'account';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'object_user_id';
            columns: ['user_id'];
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'object_user_id';
            columns: ['user_id'];
            referencedRelation: 'account';
            referencedColumns: ['id'];
          },
        ];
      };
      object: {
        Row: {
          created_at: string | null;
          created_by_user_id: string | null;
          current_version: number;
          display_name: string;
          id: string;
          last_accessed_at: string | null;
          metadata: Json | null;
          mime_type: string | null;
          name: string;
          parent_id: string | null;
          remote_id: string | null;
          remote_urn: string[] | null;
          root_user_id: string | null;
          sidecar_type: string | null;
          size: number | null;
          skip_workflows: boolean;
          state: Database['elwood']['Enums']['object_state'];
          type: Database['elwood']['Enums']['object_type'];
          updated_at: string | null;
        };
        Insert: {
          created_at?: string | null;
          created_by_user_id?: string | null;
          current_version?: number;
          display_name: string;
          id?: string;
          last_accessed_at?: string | null;
          metadata?: Json | null;
          mime_type?: string | null;
          name: string;
          parent_id?: string | null;
          remote_id?: string | null;
          remote_urn?: string[] | null;
          root_user_id?: string | null;
          sidecar_type?: string | null;
          size?: number | null;
          skip_workflows?: boolean;
          state?: Database['elwood']['Enums']['object_state'];
          type?: Database['elwood']['Enums']['object_type'];
          updated_at?: string | null;
        };
        Update: {
          created_at?: string | null;
          created_by_user_id?: string | null;
          current_version?: number;
          display_name?: string;
          id?: string;
          last_accessed_at?: string | null;
          metadata?: Json | null;
          mime_type?: string | null;
          name?: string;
          parent_id?: string | null;
          remote_id?: string | null;
          remote_urn?: string[] | null;
          root_user_id?: string | null;
          sidecar_type?: string | null;
          size?: number | null;
          skip_workflows?: boolean;
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
            foreignKeyName: 'object_created_by_user_id';
            columns: ['created_by_user_id'];
            referencedRelation: 'account';
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
          {
            foreignKeyName: 'object_root_user_id';
            columns: ['root_user_id'];
            referencedRelation: 'account';
            referencedColumns: ['id'];
          },
        ];
      };
      project: {
        Row: {
          created_at: string | null;
          description: string | null;
          display_name: string | null;
          id: string;
          name: string;
          type: Database['elwood']['Enums']['project_type'];
          updated_at: string | null;
        };
        Insert: {
          created_at?: string | null;
          description?: string | null;
          display_name?: string | null;
          id?: string;
          name: string;
          type?: Database['elwood']['Enums']['project_type'];
          updated_at?: string | null;
        };
        Update: {
          created_at?: string | null;
          description?: string | null;
          display_name?: string | null;
          id?: string;
          name?: string;
          type?: Database['elwood']['Enums']['project_type'];
          updated_at?: string | null;
        };
        Relationships: [];
      };
      project_members: {
        Row: {
          created_at: string | null;
          id: string;
          project_id: string;
          updated_at: string | null;
          user_id: string;
        };
        Insert: {
          created_at?: string | null;
          id?: string;
          project_id: string;
          updated_at?: string | null;
          user_id: string;
        };
        Update: {
          created_at?: string | null;
          id?: string;
          project_id?: string;
          updated_at?: string | null;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'project_members_project_id';
            columns: ['project_id'];
            referencedRelation: 'project';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'project_members_user_id';
            columns: ['user_id'];
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'project_members_user_id';
            columns: ['user_id'];
            referencedRelation: 'account';
            referencedColumns: ['id'];
          },
        ];
      };
      project_object: {
        Row: {
          created_at: string | null;
          id: string;
          object_id: string;
          project_id: string;
          updated_at: string | null;
        };
        Insert: {
          created_at?: string | null;
          id?: string;
          object_id: string;
          project_id: string;
          updated_at?: string | null;
        };
        Update: {
          created_at?: string | null;
          id?: string;
          object_id?: string;
          project_id?: string;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'project_object_object_id';
            columns: ['object_id'];
            referencedRelation: 'object';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'project_object_project_id';
            columns: ['project_id'];
            referencedRelation: 'project';
            referencedColumns: ['id'];
          },
        ];
      };
    };
    Views: {
      account: {
        Row: {
          id: string | null;
          root_dir_id: string | null;
          username: string | null;
        };
        Insert: {
          id?: string | null;
          root_dir_id?: never;
          username?: never;
        };
        Update: {
          id?: string | null;
          root_dir_id?: never;
          username?: never;
        };
        Relationships: [];
      };
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
      get_share_link: {
        Args: {
          id: string;
          password: string;
        };
        Returns: Database['elwood']['CompositeTypes']['share_link_access'];
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
      access_type: 'MEMBER' | 'LINK';
      object_state:
        | 'CREATING'
        | 'PENDING'
        | 'UPLOADED'
        | 'PROCESSING'
        | 'FAILED'
        | 'READY';
      object_type: 'TREE' | 'BLOB' | 'LINK';
      project_type: 'SCRATCH' | 'STANDARD';
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
      share_link_access: {
        has_access: boolean;
        password_required: boolean;
      };
    };
  };
}

export type ObjectModel = Database['elwood']['Tables']['object']['Row'];
export type AccessModel = Database['elwood']['Tables']['access']['Row'];
