"use client";

import { useState } from "react";
import { useHolding } from "@/lib/hooks/use-holding";
import { filialeService } from "@/lib/services/filiale-service";
import { FilialeCard } from "@/components/filiales/filiale-card";
import { EmptyState } from "@/components/common/empty-state";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
} from "@/components/ui/dialog";
import { Building2, Plus, Search } from "lucide-react";
import { PageHeader, PageShell } from "@/components/layout/page-shell";
import { cn } from "@/lib/utils/cn";

const FILIALE_COLORS = [
    "#6366f1", "#8b5cf6", "#ec4899", "#f43f5e",
    "#f97316", "#eab308", "#22c55e", "#14b8a6",
    "#06b6d4", "#3b82f6",
];

export default function FilialesPage() {
    const { holding, filiales, loading, refetch } = useHolding();
    const [dialogOpen, setDialogOpen] = useState(false);
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [selectedColor, setSelectedColor] = useState(FILIALE_COLORS[0]);
    const [creating, setCreating] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");

    const filteredFiliales = filiales.filter(f => 
        f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.description?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleCreate = async () => {
        if (!name.trim() || !holding) return;
        setCreating(true);
        try {
            await filialeService.createFiliale(holding.id, name, description, selectedColor);
            setDialogOpen(false);
            setName("");
            setDescription("");
            setSelectedColor(FILIALE_COLORS[0]);
            refetch();
        } catch (error: any) {
            console.error("Failed to create filiale:", JSON.stringify(error, null, 2));
            console.error("Erreur de création:", error);
        }
        setCreating(false);
    };

    if (loading) {
        return (
            <PageShell>
                <PageHeader
                    eyebrow="Filiales"
                    title="Filiales"
                    description="Gérez vos différentes entités"
                />
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[...Array(3)].map((_, i) => (
                        <div key={i} className={cn("h-44 skeleton", `animate-stagger-${i + 1}`)} />
                    ))}
                </div>
            </PageShell>
        );
    }

    return (
        <PageShell>
            <PageHeader
                eyebrow="Filiales"
                title={holding?.name || "Filiales"}
                description={`${filiales.length} filiale${filiales.length !== 1 ? "s" : ""} enregistrée${filiales.length !== 1 ? "s" : ""}`}
                primaryAction={
                    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                        <DialogTrigger asChild>
                            <Button className="active-press hover-lift">
                                <Plus className="h-4 w-4 mr-2" />
                                Nouvelle Filiale
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="animate-scale-in">
                            <DialogHeader>
                                <DialogTitle>Créer une Filiale</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label>Nom</Label>
                                    <Input
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        placeholder="Ex: ADEM, Urban Park..."
                                        className="transition-shadow duration-200 focus:shadow-md focus:shadow-[hsl(var(--primary))]/10"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Description (optionnel)</Label>
                                    <Textarea
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        placeholder="Décrivez l'activité de cette filiale..."
                                        className="transition-shadow duration-200 focus:shadow-md focus:shadow-[hsl(var(--primary))]/10"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Couleur</Label>
                                    <div className="flex gap-2 flex-wrap">
                                        {FILIALE_COLORS.map((color) => (
                                            <button
                                                key={color}
                                                type="button"
                                                onClick={() => setSelectedColor(color)}
                                                className={cn(
                                                    "w-8 h-8 rounded-lg transition-all duration-200",
                                                    selectedColor === color
                                                        ? "ring-2 ring-offset-2 ring-[hsl(var(--primary))] scale-110"
                                                        : "hover:scale-105"
                                                )}
                                                style={{ backgroundColor: color }}
                                            />
                                        ))}
                                    </div>
                                </div>
                            </div>
                            <DialogFooter>
                                <Button variant="outline" onClick={() => setDialogOpen(false)}>Annuler</Button>
                                <Button onClick={handleCreate} disabled={creating || !name.trim()} className="active-press">
                                    {creating ? "Création..." : "Créer"}
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                }
                secondaryAction={
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Rechercher..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-9 w-64"
                        />
                    </div>
                }
            />

            {filiales.length === 0 ? (
                <EmptyState
                    icon={<Building2 className="h-8 w-8" />}
                    title="Aucune filiale"
                    description="Créez une filiale pour organiser vos projets et collaborer avec vos équipes."
                    action={
                        <Button onClick={() => setDialogOpen(true)} className="active-press">
                            <Plus className="mr-2 h-4 w-4" />
                            Créer une Filiale
                        </Button>
                    }
                />
            ) : filteredFiliales.length === 0 ? (
                <EmptyState
                    icon={<Search className="h-8 w-8" />}
                    title="Aucun résultat"
                    description="Aucune filiale ne correspond à votre recherche."
                />
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredFiliales.map((filiale, i) => (
                        <div key={filiale.id} className={cn("animate-fade-in-up", `animate-stagger-${Math.min(i + 1, 6)}`)}>
                            <FilialeCard filiale={filiale} />
                        </div>
                    ))}
                </div>
            )}
        </PageShell>
    );
}
