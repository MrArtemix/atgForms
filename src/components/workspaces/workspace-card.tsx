"use client";

import { Workspace } from "@/types/workspace";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building2, Users } from "lucide-react";
import Link from "next/link";
import { formatRelative } from "@/lib/utils/date";

interface WorkspaceCardProps {
  workspace: Workspace;
  memberCount?: number;
  formCount?: number;
}

export function WorkspaceCard({ workspace, memberCount = 0, formCount = 0 }: WorkspaceCardProps) {
  return (
    <Link href={`/workspaces/${workspace.id}`}>
      <Card className="hover:shadow-md transition-shadow cursor-pointer">
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
              <Building2 className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-base">{workspace.name}</CardTitle>
              <p className="text-xs text-muted-foreground">
                {formatRelative(workspace.created_at)}
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {workspace.description && (
            <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
              {workspace.description}
            </p>
          )}
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Users className="h-3.5 w-3.5" />
              {memberCount} membres
            </span>
            <span>{formCount} formulaires</span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
