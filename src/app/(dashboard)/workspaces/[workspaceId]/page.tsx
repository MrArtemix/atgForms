"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useWorkspace } from "@/lib/hooks/use-workspace";
import { useForms } from "@/lib/hooks/use-forms";
import { formService } from "@/lib/services/form-service";
import { workspaceService } from "@/lib/services/workspace-service";
import { FormCard } from "@/components/common/form-card";
import { EmptyState } from "@/components/common/empty-state";
import { ShareDialog } from "@/components/sharing/share-dialog";
import { Form } from "@/types/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, FileText, Users, UserPlus } from "lucide-react";

export default function WorkspaceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const workspaceId = params.workspaceId as string;
  const { workspace, members, loading: wsLoading } = useWorkspace(workspaceId);
  const { forms, loading: formsLoading, refetch } = useForms(workspaceId);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("viewer");
  const [inviteOpen, setInviteOpen] = useState(false);
  const [shareForm, setShareForm] = useState<Form | null>(null);

  const handleCreateForm = async () => {
    const form = await formService.createForm(workspaceId);
    router.push(`/forms/${form.id}/edit`);
  };

  const handleDuplicate = async (formId: string) => {
    await formService.duplicateForm(formId);
    refetch();
  };

  const handleDelete = async (formId: string) => {
    if (!confirm("Are you sure you want to delete this form?")) return;
    await formService.deleteForm(formId);
    refetch();
  };

  const handleInvite = async () => {
    if (!inviteEmail.trim()) return;
    await workspaceService.inviteMember(workspaceId, inviteEmail, inviteRole as any);
    setInviteEmail("");
    setInviteOpen(false);
  };

  if (wsLoading) {
    return (
      <div className="p-6 space-y-4">
        <div className="h-8 w-48 skeleton" />
        <div className="h-[400px] skeleton animate-stagger-1" />
      </div>
    );
  }

  if (!workspace) {
    return <div className="p-6 text-[hsl(var(--muted-foreground))]">Workspace not found</div>;
  }

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between animate-fade-in-up">
        <div>
          <h1 className="text-2xl font-semibold">{workspace.name}</h1>
          {workspace.description && (
            <p className="text-[hsl(var(--muted-foreground))] mt-1">{workspace.description}</p>
          )}
        </div>
        <Button onClick={handleCreateForm} className="active-press hover-lift">
          <Plus className="h-4 w-4 mr-1" />
          New Form
        </Button>
      </div>

      {/* Members */}
      <Card className="animate-fade-in-up animate-stagger-1">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <Users className="h-4 w-4" />
              Members ({members.length})
            </CardTitle>
            <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="hover-lift">
                  <UserPlus className="h-4 w-4 mr-1" />
                  Invite
                </Button>
              </DialogTrigger>
              <DialogContent className="animate-scale-in">
                <DialogHeader>
                  <DialogTitle>Invite Member</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      placeholder="colleague@example.com"
                      type="email"
                      className="transition-shadow duration-200 focus:shadow-md focus:shadow-[hsl(var(--primary))]/10"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Role</Label>
                    <Select value={inviteRole} onValueChange={setInviteRole}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="viewer">Viewer</SelectItem>
                        <SelectItem value="editor">Editor</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setInviteOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleInvite} className="active-press">Send Invite</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {members.map((member, i) => (
              <div
                key={member.id}
                className={`flex items-center justify-between py-2.5 animate-fade-in-up animate-stagger-${Math.min(i + 1, 5)}`}
              >
                <div className="flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="text-xs bg-[hsl(var(--primary))]/10 text-[hsl(var(--primary))]">
                      {(member.profile?.full_name || member.invited_email || "U")
                        .charAt(0)
                        .toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium">
                      {member.profile?.full_name || member.invited_email || "User"}
                    </p>
                    <p className="text-xs text-[hsl(var(--muted-foreground))]">
                      {member.profile?.email || member.invited_email}
                    </p>
                  </div>
                </div>
                <Badge variant="secondary">{member.role}</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Separator />

      {/* Forms */}
      <div className="animate-fade-in-up animate-stagger-2">
        <h2 className="text-lg font-semibold mb-4">Forms</h2>
        {formsLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className={`h-32 skeleton animate-stagger-${i + 1}`} />
            ))}
          </div>
        ) : forms.length === 0 ? (
          <EmptyState
            icon={<FileText className="h-8 w-8" />}
            title="No forms yet"
            description="Create your first form in this workspace."
            action={
              <Button onClick={handleCreateForm} className="active-press">
                <Plus className="mr-2 h-4 w-4" />
                Create Form
              </Button>
            }
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {forms.map((form, i) => (
              <div key={form.id} className={`animate-fade-in-up animate-stagger-${Math.min(i + 1, 6)}`}>
                <FormCard
                  form={form}
                  onDuplicate={handleDuplicate}
                  onDelete={handleDelete}
                  onShare={setShareForm}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Share Dialog */}
      {shareForm && (
        <ShareDialog
          open={!!shareForm}
          onOpenChange={() => setShareForm(null)}
          formUrl={`${window.location.origin}/f/${shareForm.slug}`}
          formTitle={shareForm.title}
          formSlug={shareForm.slug || ""}
          embedUrl={`${window.location.origin}/embed/${shareForm.slug}`}
        />
      )}
    </div>
  );
}
