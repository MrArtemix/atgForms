import { WorkspaceRole } from "@/types/workspace";

export const ROLE_HIERARCHY: Record<WorkspaceRole, number> = {
  viewer: 0,
  editor: 1,
  owner: 2,
};

export function hasMinRole(userRole: WorkspaceRole, requiredRole: WorkspaceRole): boolean {
  return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[requiredRole];
}

export const PERMISSIONS = {
  workspace: {
    view: "viewer" as WorkspaceRole,
    edit: "editor" as WorkspaceRole,
    delete: "owner" as WorkspaceRole,
    manage_members: "editor" as WorkspaceRole,
  },
  form: {
    view: "viewer" as WorkspaceRole,
    create: "editor" as WorkspaceRole,
    edit: "editor" as WorkspaceRole,
    delete: "editor" as WorkspaceRole,
    publish: "editor" as WorkspaceRole,
  },
  response: {
    view: "viewer" as WorkspaceRole,
    delete: "editor" as WorkspaceRole,
    export: "viewer" as WorkspaceRole,
  },
};
