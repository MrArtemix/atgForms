"use client";

import { useState } from "react";
import { EntityType } from "@/types/notification";
import { invitationService } from "@/lib/services/invitation-service";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { UserPlus } from "lucide-react";

interface InviteDialogProps {
  entityType: EntityType;
  entityId: string;
  entityName: string;
  roles: { value: string; label: string }[];
  defaultRole?: string;
  trigger?: React.ReactNode;
  onInvited?: () => void;
}

export function InviteDialog({
  entityType,
  entityId,
  entityName,
  roles,
  defaultRole,
  trigger,
  onInvited,
}: InviteDialogProps) {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState(defaultRole || roles[0]?.value || "member");
  const [sending, setSending] = useState(false);
  const { toast } = useToast();

  const handleInvite = async () => {
    if (!email.trim()) return;
    setSending(true);

    try {
      await invitationService.createInvitation(email, entityType, entityId, role);
      toast({
        title: "Invitation envoyée",
        description: `Une invitation a été envoyée à ${email}`,
      });
      setEmail("");
      setRole(defaultRole || roles[0]?.value || "member");
      setOpen(false);
      onInvited?.();
    } catch (error) {
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : "Impossible d'envoyer l'invitation",
        variant: "destructive",
      });
    } finally {
      setSending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm" className="hover-lift">
            <UserPlus className="h-4 w-4 mr-1" />
            Inviter
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="animate-scale-in">
        <DialogHeader>
          <DialogTitle>Inviter un membre</DialogTitle>
          <p className="text-sm text-[hsl(var(--muted-foreground))]">
            Inviter quelqu&apos;un à rejoindre &quot;{entityName}&quot;
          </p>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Email</Label>
            <Input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="collegue@exemple.com"
              type="email"
              className="transition-shadow duration-200 focus:shadow-md focus:shadow-[hsl(var(--primary))]/10"
            />
          </div>
          <div className="space-y-2">
            <Label>Rôle</Label>
            <Select value={role} onValueChange={setRole}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {roles.map((r) => (
                  <SelectItem key={r.value} value={r.value}>
                    {r.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Annuler
          </Button>
          <Button
            onClick={() => void handleInvite()}
            disabled={sending || !email.trim()}
            className="active-press"
          >
            {sending ? "Envoi..." : "Envoyer l'invitation"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
