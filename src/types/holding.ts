export type HoldingRole = 'super_admin' | 'admin';

export interface Holding {
    id: string;
    name: string;
    slug: string;
    logo_url: string | null;
    description: string | null;
    created_at: string;
    updated_at: string;
}

export interface HoldingMember {
    id: string;
    holding_id: string;
    user_id: string;
    role: HoldingRole;
    joined_at: string;
    profile?: import('./user').Profile;
}

export interface HoldingWithFiliales extends Holding {
    filiales: import('./filiale').Filiale[];
}
