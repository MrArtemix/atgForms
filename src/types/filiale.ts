import { Workspace } from './workspace';

export type FilialeRole = 'admin' | 'manager' | 'member';

export interface Filiale {
    id: string;
    holding_id: string;
    name: string;
    slug: string;
    description: string | null;
    logo_url: string | null;
    color: string;
    dot_color: string | null;
    created_at: string;
    updated_at: string;
}

export interface FilialeMember {
    id: string;
    filiale_id: string;
    user_id: string;
    role: FilialeRole;
    joined_at: string;
    profile?: import('./user').Profile;
}

export interface FilialeWithProjets extends Filiale {
    projets: Workspace[];
    member_count?: number;
}
