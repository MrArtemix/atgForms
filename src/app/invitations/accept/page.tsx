"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { invitationService } from "@/lib/services/invitation-service";
import { Invitation } from "@/types/notification";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Check,
  X,
  Mail,
  Loader2,
  AlertCircle,
  Building2,
  FolderKanban,
  Landmark,
} from "lucide-react";

const ENTITY_LABELS: Record<string, string> = {
  holding: "Holding",
  filiale: "Filiale",
  workspace: "Projet",
};

const ENTITY_ICONS: Record<string, typeof Building2> = {
  holding: Landmark,
  filiale: Building2,
  workspace: FolderKanban,
};

function AcceptInvitationContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");

  const [invitation, setInvitation] = useState<Invitation | null>(null);
  const [entityName, setEntityName] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<"accepted" | "declined" | null>(null);

  const fetchInvitation = useCallback(async () => {
    if (!token) {
      setError("Aucun token d'invitation fourni");
      setLoading(false);
      return;
    }

    const supabase = createClient();

    // Check auth
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      router.push(`/login?next=/invitations/accept?token=${token}`);
      return;
    }

    // Fetch invitation details
    const { data, error: fetchError } = await supabase
      .from("invitations")
      .select("*, inviter:profiles!invited_by(full_name, email)")
      .eq("token", token)
      .single();

    if (fetchError || !data) {
      setError("Invitation introuvable ou invalide");
      setLoading(false);
      return;
    }

    if (data.status !== "pending") {
      setError(`Cette invitation a déjà été ${data.status === "accepted" ? "acceptée" : "traitée"}`);
      setLoading(false);
      return;
    }

    if (new Date(data.expires_at) < new Date()) {
      setError("Cette invitation a expiré");
      setLoading(false);
      return;
    }

    setInvitation(data);

    // Fetch entity name
    const tableMap: Record<string, string> = {
      workspace: "workspaces",
      filiale: "filiales",
      holding: "holdings",
    };
    const tableName = tableMap[data.entity_type];
    if (tableName) {
      const { data: entity } = await supabase
        .from(tableName)
        .select("name")
        .eq("id", data.entity_id)
        .single();
      if (entity) setEntityName(entity.name);
    }

    setLoading(false);
  }, [token, router]);

  useEffect(() => {
    void fetchInvitation();
  }, [fetchInvitation]);

  const handleAccept = async () => {
    if (!token) return;
    setProcessing(true);
    try {
      const response = await invitationService.acceptInvitation(token);
      if (response.success) {
        setResult("accepted");
        // Redirect to the entity after a short delay
        setTimeout(() => {
          const link = response.entity_type === "filiale"
            ? `/filiales/${response.entity_id}`
            : response.entity_type === "workspace"
              ? "/filiales"
              : "/dashboard";
          router.push(link);
        }, 2000);
      } else {
        setError(response.error || "Erreur lors de l'acceptation");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inattendue");
    } finally {
      setProcessing(false);
    }
  };

  const handleDecline = async () => {
    if (!token) return;
    setProcessing(true);
    try {
      const response = await invitationService.declineInvitation(token);
      if (response.success) {
        setResult("declined");
      } else {
        setError(response.error || "Erreur lors du refus");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inattendue");
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[hsl(var(--background))]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-[hsl(var(--primary))]" />
          <p className="text-sm text-[hsl(var(--muted-foreground))]">
            Chargement de l&apos;invitation...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[hsl(var(--background))] p-4">
        <Card className="w-full max-w-md animate-scale-in">
          <CardContent className="flex flex-col items-center py-10 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
              <AlertCircle className="h-8 w-8 text-red-500" />
            </div>
            <h2 className="text-lg font-semibold mb-2">Invitation invalide</h2>
            <p className="text-sm text-[hsl(var(--muted-foreground))] mb-6">
              {error}
            </p>
            <Button onClick={() => router.push("/dashboard")}>
              Retour au tableau de bord
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (result) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[hsl(var(--background))] p-4">
        <Card className="w-full max-w-md animate-scale-in">
          <CardContent className="flex flex-col items-center py-10 text-center">
            <div
              className={`mb-4 flex h-16 w-16 items-center justify-center rounded-full ${
                result === "accepted" ? "bg-green-100" : "bg-orange-100"
              }`}
            >
              {result === "accepted" ? (
                <Check className="h-8 w-8 text-green-500" />
              ) : (
                <X className="h-8 w-8 text-orange-500" />
              )}
            </div>
            <h2 className="text-lg font-semibold mb-2">
              {result === "accepted"
                ? "Invitation acceptée !"
                : "Invitation déclinée"}
            </h2>
            <p className="text-sm text-[hsl(var(--muted-foreground))] mb-6">
              {result === "accepted"
                ? "Vous allez être redirigé..."
                : "Vous avez décliné cette invitation."}
            </p>
            <Button
              variant={result === "accepted" ? "default" : "outline"}
              onClick={() => router.push("/dashboard")}
            >
              Retour au tableau de bord
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!invitation) return null;

  const EntityIcon = ENTITY_ICONS[invitation.entity_type] || Building2;

  return (
    <div className="min-h-screen flex items-center justify-center bg-[hsl(var(--background))] p-4">
      <Card className="w-full max-w-md animate-scale-in">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
            <Mail className="h-8 w-8 text-blue-500" />
          </div>
          <CardTitle>Vous êtes invité(e)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg border border-[hsl(var(--border))] p-4 space-y-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[hsl(var(--primary))]/10">
                <EntityIcon className="h-5 w-5 text-[hsl(var(--primary))]" />
              </div>
              <div>
                <p className="text-xs text-[hsl(var(--muted-foreground))]">
                  {ENTITY_LABELS[invitation.entity_type] || invitation.entity_type}
                </p>
                <p className="font-medium">
                  {entityName || "—"}
                </p>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-[hsl(var(--muted-foreground))]">
                Rôle
              </span>
              <Badge variant="secondary" className="capitalize">
                {invitation.role}
              </Badge>
            </div>
            {invitation.inviter && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-[hsl(var(--muted-foreground))]">
                  Invité par
                </span>
                <span className="text-sm font-medium">
                  {invitation.inviter.full_name || invitation.inviter.email}
                </span>
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex gap-3">
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => void handleDecline()}
            disabled={processing}
          >
            {processing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <X className="h-4 w-4 mr-1" />
                Décliner
              </>
            )}
          </Button>
          <Button
            className="flex-1 active-press"
            onClick={() => void handleAccept()}
            disabled={processing}
          >
            {processing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <Check className="h-4 w-4 mr-1" />
                Accepter
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

export default function AcceptInvitationPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-[hsl(var(--primary))]" />
        </div>
      }
    >
      <AcceptInvitationContent />
    </Suspense>
  );
}
