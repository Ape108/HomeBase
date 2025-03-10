export interface Panel {
  id?: string;
  workspace_id?: string;
  position: string;
  document_id?: string;
  document_name?: string;
  document_type?: string;
  zoom?: number;
  mode?: 'read' | 'write';
  created_at?: string;
}

export interface Workspace {
  id: string;
  name: string;
  user_id: string;
  created_at: string;
  updated_at: string;
  panels?: Panel[];
} 