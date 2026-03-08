"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useWorkspace } from "@/lib/hooks/use-workspace";
import { useForms } from "@/lib/hooks/use-forms";
import { formService } from "@/lib/services/form-service";
import { workspaceService } from "@/lib/services/workspace-service";
import { FormCard } from "@/components/common/form-card";
import { EmptyState } from "@/components/common/empty-state";
import { ConfirmDialog } from "@/components/common/confirm-dialog";
import { LogoUploader } from "@/components/common/logo-uploader";
import { ShareDialog } from "@/components/sharing/share-dialog";
import { InviteDialog } from "@/components/invitations/invite-dialog";
import { Form } from "@/types/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Plus,
  FileText,
  Users,
  ArrowLeft,
  ClipboardList,
  Pencil,
  Trash2,
  Building2,
} from "lucide-react";
import Link from "next/link";

export default function ProjetDetailPage() {
  const params = useParams();
  const router = useRouter();
  const filialeId = params.filialeId as string;
  const projetId = params.projetId as string;
  const { workspace, members, loading: wsLoading, refetch: refetchWorkspace } = useWorkspace(projetId);
  const { forms, loading: formsLoading, refetch } = useForms(projetId);
  const [shareForm, setShareForm] = useState<Form | null>(null);

  // Delete form confirmation
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingFormId, setDeletingFormId] = useState<string | null>(null);

  // Edit projet dialog
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editLogoUrl, setEditLogoUrl] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Delete projet
  const [deleteProjetDialogOpen, setDeleteProjetDialogOpen] = useState(false);

  const openEditDialog = () => {
    if (!workspace) return;
    setEditName(workspace.name);
    setEditDescription(workspace.description || "");
    setEditLogoUrl(workspace.logo_url || null);
    setEditDialogOpen(true);
  };

  const handleSaveProjet = async () => {
    if (!editName.trim() || !workspace) return;
    setSaving(true);
    try {
      await workspaceService.updateWorkspace(workspace.id, {
        name: editName,
        description: editDescription || null,
        logo_url: editLogoUrl,
      });
      setEditDialogOpen(false);
      await refetchWorkspace();
    } catch (error) {
      console.error("Failed to update projet:", error);
    }
    setSaving(false);
  };

  const handleDeleteProjet = async () => {
    if (!workspace) return;
    try {
      await workspaceService.deleteWorkspace(workspace.id);
      router.push(`/filiales/${filialeId}`);
    } catch (error) {
      console.error("Failed to delete projet:", error);
    }
  };

  const handleCreateForm = async () => {
    const form = await formService.createForm(projetId);
    router.push(`/forms/${form.id}/edit`);
  };

  const handleDuplicate = async (formId: string) => {
    await formService.duplicateForm(formId);
    await refetch();
  };

  const handleDeleteRequest = (formId: string) => {
    setDeletingFormId(formId);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingFormId) return;
    try {
      await formService.deleteForm(deletingFormId);
      await refetch();
    } catch (error) {
      console.error("Erreur de suppression:", error);
    } finally {
      setDeleteDialogOpen(false);
      setDeletingFormId(null);
    }
  };

  if (wsLoading) {
    return (
      <div className="p-6 space-y-4">
        <div className="h-8 w-48 skeleton" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="h-28 skeleton animate-stagger-1" />
          <div className="h-28 skeleton animate-stagger-2" />
        </div>
        <div className="h-[400px] skeleton animate-stagger-3" />
      </div>
    );
  }

  if (!workspace) {
    return (
      <div className="p-6">
        <p className="text-[hsl(var(--muted-foreground))]">Projet non trouvé.</p>
        <Button asChild variant="ghost" className="mt-2">
          <Link href={`/filiales/${filialeId}`}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour à la filiale
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="animate-fade-in-up">
        <Button asChild variant="ghost" size="sm" className="mb-4">
          <Link href={`/filiales/${filialeId}`}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour
          </Link>
        </Button>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center overflow-hidden">
              {workspace.logo_url ? (
                <img src={workspace.logo_url} alt={workspace.name} className="w-full h-full object-cover" />
              ) : (
                <Building2 className="h-6 w-6 text-primary" />
              )}
            </div>
            <div>
              <h1 className="text-2xl font-semibold">{workspace.name}</h1>
              {workspace.description && (
                <p className="text-[hsl(var(--muted-foreground))] mt-1">{workspace.description}</p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={openEditDialog} className="active-press">
              <Pencil className="h-4 w-4 mr-1" />
              Modifier
            </Button>
            <Button onClick={() => void handleCreateForm()} className="active-press hover-lift">
              <Plus className="h-4 w-4 mr-1" />
              Nouveau formulaire
            </Button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card className="animate-fade-in-up animate-stagger-1 hover-lift">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-[hsl(var(--muted-foreground))]">
              Formulaires
            </CardTitle>
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-100">
              <ClipboardList className="h-4 w-4 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{forms.length}</div>
          </CardContent>
        </Card>
        <Card className="animate-fade-in-up animate-stagger-2 hover-lift">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-[hsl(var(--muted-foreground))]">
              Membres
            </CardTitle>
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-purple-100">
              <Users className="h-4 w-4 text-purple-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{members.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Formulaires Section */}
      <div className="animate-fade-in-up animate-stagger-3">
        <h2 className="text-lg font-semibold mb-4">Formulaires</h2>
        {formsLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className={`h-32 skeleton animate-stagger-${i + 1}`} />
            ))}
          </div>
        ) : forms.length === 0 ? (
          <EmptyState
            icon={<FileText className="h-8 w-8" />}
            title="Aucun formulaire"
            description="Créez votre premier formulaire dans ce projet."
            action={
              <Button onClick={() => void handleCreateForm()} className="active-press">
                <Plus className="mr-2 h-4 w-4" />
                Créer un formulaire
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
                  onDelete={handleDeleteRequest}
                  onShare={setShareForm}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Membres Section */}
      <Card className="animate-fade-in-up animate-stagger-4">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <Users className="h-4 w-4" />
              Membres ({members.length})
            </CardTitle>
            <InviteDialog
              entityType="workspace"
              entityId={projetId}
              entityName={workspace.name}
              roles={[
                { value: "viewer", label: "Lecteur" },
                { value: "editor", label: "Éditeur" },
              ]}
              defaultRole="viewer"
            />
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
                      {member.profile?.full_name || member.invited_email || "Utilisateur"}
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

      {/* Edit Projet Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="animate-scale-in">
          <DialogHeader>
            <DialogTitle>Modifier le Projet</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Logo</Label>
              <LogoUploader
                currentUrl={editLogoUrl}
                onUpload={setEditLogoUrl}
                onRemove={() => setEditLogoUrl(null)}
                path="projets"
              />
            </div>
            <div className="space-y-2">
              <Label>Nom</Label>
              <Input
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                placeholder="Nom du projet"
                className="transition-shadow duration-200 focus:shadow-md focus:shadow-[hsl(var(--primary))]/10"
              />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                placeholder="Description du projet..."
                className="transition-shadow duration-200 focus:shadow-md focus:shadow-[hsl(var(--primary))]/10"
              />
            </div>
          </div>
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button
              variant="destructive"
              size="sm"
              onClick={() => {
                setEditDialogOpen(false);
                setDeleteProjetDialogOpen(true);
              }}
              className="mr-auto"
            >
              <Trash2 className="h-4 w-4 mr-1" />
              Supprimer
            </Button>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>Annuler</Button>
            <Button onClick={() => void handleSaveProjet()} disabled={saving || !editName.trim()} className="active-press">
              {saving ? "Enregistrement..." : "Enregistrer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Form Confirmation Dialog */}
      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Supprimer ce formulaire ?"
        description="Cette action est irréversible. Toutes les réponses associées seront également supprimées."
        confirmLabel="Supprimer"
        cancelLabel="Annuler"
        variant="destructive"
        onConfirm={() => void handleDeleteConfirm()}
      />

      {/* Delete Projet Confirmation Dialog */}
      <ConfirmDialog
        open={deleteProjetDialogOpen}
        onOpenChange={setDeleteProjetDialogOpen}
        title="Supprimer ce projet ?"
        description="Cette action est irréversible. Tous les formulaires et réponses associés seront supprimés."
        confirmLabel="Supprimer"
        cancelLabel="Annuler"
        variant="destructive"
        onConfirm={() => void handleDeleteProjet()}
      />

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
