"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { useFiliale } from "@/lib/hooks/use-filiale";
import { workspaceService } from "@/lib/services/workspace-service";
import { WorkspaceCard } from "@/components/workspaces/workspace-card";
import { EmptyState } from "@/components/common/empty-state";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
} from "@/components/ui/dialog";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    ArrowLeft,
    FolderKanban,
    Plus,
    Users,
} from "lucide-react";
import Link from "next/link";

export default function FilialeDetailPage() {
    const params = useParams();
    const filialeId = params.filialeId as string;
    const { filiale, members, loading, refetch } = useFiliale(filialeId);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [projetName, setProjetName] = useState("");
    const [projetDescription, setProjetDescription] = useState("");
    const [creating, setCreating] = useState(false);

    const handleCreateProjet = async () => {
        if (!projetName.trim() || !filialeId) return;
        setCreating(true);
        try {
            await workspaceService.createWorkspace(projetName, projetDescription, filialeId);
            setDialogOpen(false);
            setProjetName("");
            setProjetDescription("");
            refetch();
        } catch (error: any) {
            console.error("Failed to create projet:", JSON.stringify(error, null, 2));
            console.error("Erreur de création:", error);
        }
        setCreating(false);
    };

    if (loading) {
        return (
            <div className="p-6 space-y-6">
                <div className="h-8 w-48 skeleton" />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[...Array(3)].map((_, i) => (
                        <div key={i} className={`h-28 skeleton animate-stagger-${i + 1}`} />
                    ))}
                </div>
                <div className="h-64 skeleton" />
            </div>
        );
    }

    if (!filiale) {
        return (
            <div className="p-6">
                <p className="text-[hsl(var(--muted-foreground))]">Filiale non trouvée.</p>
                <Button asChild variant="ghost" className="mt-2">
                    <Link href="/filiales">
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Retour aux filiales
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
                    <Link href="/filiales">
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Filiales
                    </Link>
                </Button>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div
                            className="w-14 h-14 rounded-2xl flex items-center justify-center text-white font-bold text-2xl shadow-lg"
                            style={{ backgroundColor: filiale.color || "#6366f1" }}
                        >
                            {filiale.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold">{filiale.name}</h1>
                            {filiale.description && (
                                <p className="text-sm text-[hsl(var(--muted-foreground))] mt-1">
                                    {filiale.description}
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Card className="animate-fade-in-up animate-stagger-1 hover-lift">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-[hsl(var(--muted-foreground))]">
                            Projets
                        </CardTitle>
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-100">
                            <FolderKanban className="h-4 w-4 text-blue-600" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{filiale.projets.length}</div>
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

            {/* Projets List */}
            <div className="space-y-4 animate-fade-in-up animate-stagger-3">
                <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold">Projets</h2>
                    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                        <DialogTrigger asChild>
                            <Button className="active-press hover-lift">
                                <Plus className="h-4 w-4 mr-1" />
                                Nouveau Projet
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="animate-scale-in">
                            <DialogHeader>
                                <DialogTitle>Créer un Projet</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label>Nom du projet</Label>
                                    <Input
                                        value={projetName}
                                        onChange={(e) => setProjetName(e.target.value)}
                                        placeholder="Ex: Brobroli..."
                                        className="transition-shadow duration-200 focus:shadow-md focus:shadow-[hsl(var(--primary))]/10"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Description (optionnel)</Label>
                                    <Textarea
                                        value={projetDescription}
                                        onChange={(e) => setProjetDescription(e.target.value)}
                                        placeholder="Décrivez ce projet..."
                                        className="transition-shadow duration-200 focus:shadow-md focus:shadow-[hsl(var(--primary))]/10"
                                    />
                                </div>
                            </div>
                            <DialogFooter>
                                <Button variant="outline" onClick={() => setDialogOpen(false)}>Annuler</Button>
                                <Button onClick={handleCreateProjet} disabled={creating || !projetName.trim()} className="active-press">
                                    {creating ? "Création..." : "Créer"}
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>

                {filiale.projets.length === 0 ? (
                    <EmptyState
                        icon={<FolderKanban className="h-8 w-8" />}
                        title="Aucun projet"
                        description={`Créez un premier projet dans ${filiale.name} pour organiser vos formulaires.`}
                        action={
                            <Button onClick={() => setDialogOpen(true)} className="active-press">
                                <Plus className="mr-2 h-4 w-4" />
                                Créer un Projet
                            </Button>
                        }
                    />
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filiale.projets.map((projet, i) => (
                            <div key={projet.id} className={`animate-fade-in-up animate-stagger-${Math.min(i + 1, 6)}`}>
                                <WorkspaceCard workspace={projet} />
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Members */}
            <div className="space-y-4 animate-fade-in-up animate-stagger-4">
                <h2 className="text-lg font-semibold">Membres</h2>
                {members.length === 0 ? (
                    <p className="text-sm text-[hsl(var(--muted-foreground))]">Aucun membre pour le moment.</p>
                ) : (
                    <div className="space-y-2">
                        {members.map((member) => (
                            <div
                                key={member.id}
                                className="flex items-center justify-between rounded-xl border border-[hsl(var(--border))] p-3 transition-colors hover:bg-[hsl(var(--muted))]/50"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-[hsl(var(--primary))]/10 flex items-center justify-center">
                                        <span className="text-sm font-medium text-[hsl(var(--primary))]">
                                            {(member.profile?.full_name || member.profile?.email || "?").charAt(0).toUpperCase()}
                                        </span>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium">{member.profile?.full_name || member.profile?.email}</p>
                                        <p className="text-xs text-[hsl(var(--muted-foreground))]">{member.profile?.email}</p>
                                    </div>
                                </div>
                                <Badge variant="secondary" className="text-xs capitalize">
                                    {member.role}
                                </Badge>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
