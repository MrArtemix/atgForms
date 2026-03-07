import { Profile } from './user';

export type WorkspaceRole = 'owner' | 'editor' | 'viewer';

export interface Workspace {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  logo_url: string | null;
  owner_id: string;
  filiale_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface WorkspaceMember {
  id: string;
  workspace_id: string;
  user_id: string;
  role: WorkspaceRole;
  invited_email: string | null;
  joined_at: string;
  profile?: Profile;
}

export interface WorkspaceWithMembers extends Workspace {
  members: WorkspaceMember[];
}
