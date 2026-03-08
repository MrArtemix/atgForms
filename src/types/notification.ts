export type NotificationType =
  | 'invitation_received'
  | 'invitation_accepted'
  | 'invitation_declined'
  | 'response_received'
  | 'form_published'
  | 'member_added'
  | 'member_removed';

export type InvitationStatus = 'pending' | 'accepted' | 'declined' | 'expired';

export type EntityType = 'holding' | 'filiale' | 'workspace';

export interface NotificationData {
  link?: string;
  entity_type?: EntityType;
  entity_id?: string;
  entity_name?: string;
  invitation_id?: string;
  invitation_token?: string;
  form_id?: string;
  form_title?: string;
  response_id?: string;
  [key: string]: unknown;
}

export interface Notification {
  id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  message: string;
  data: NotificationData;
  read: boolean;
  created_at: string;
}

export interface Invitation {
  id: string;
  token: string;
  email: string;
  entity_type: EntityType;
  entity_id: string;
  role: string;
  status: InvitationStatus;
  invited_by: string | null;
  expires_at: string;
  created_at: string;
  updated_at: string;
  inviter?: { full_name: string | null; email: string };
}
