export type SystemRole = 'super_admin' | 'filiale_admin' | 'project_manager' | 'member';

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  system_role: SystemRole;
  created_at: string;
  updated_at: string;
}
