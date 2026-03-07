"use client";

import { useState, useEffect } from "react";
import { useUser } from "@/lib/hooks/use-user";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Save, Loader2, User } from "lucide-react";
import { PageHeader, PageShell } from "@/components/layout/page-shell";
import { cn } from "@/lib/utils/cn";

export default function ProfilePage() {
  const { user, profile, loading } = useUser();
  const [fullName, setFullName] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || "");
    }
  }, [profile]);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    const supabase = createClient();
    await supabase.from("profiles").update({ full_name: fullName }).eq("id", user.id);
    setSaving(false);
  };

  if (loading) {
    return (
      <PageShell>
        <PageHeader
          eyebrow="Account"
          title="Profil"
          description="Gérez vos informations personnelles"
        />
        <div className="max-w-xl">
          <div className="h-[300px] skeleton animate-stagger-1" />
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <PageHeader
        eyebrow="Account"
        title="Profil"
        description="Gérez vos informations personnelles"
      />

      <Card className="max-w-xl animate-fade-in-up animate-stagger-1">
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="group relative">
              <Avatar className="h-16 w-16 ring-2 ring-transparent transition-all group-hover:ring-[hsl(var(--primary))]/20">
                <AvatarImage src={profile?.avatar_url || ""} />
                <AvatarFallback className="bg-[hsl(var(--primary))]/10 text-[hsl(var(--primary))]">
                  <User className="h-8 w-8" />
                </AvatarFallback>
              </Avatar>
            </div>
            <div>
              <CardTitle>{profile?.full_name || "Utilisateur"}</CardTitle>
              <p className="text-sm text-[hsl(var(--muted-foreground))]">{profile?.email}</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Nom complet</Label>
            <Input
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Votre nom"
              className="transition-shadow duration-200 focus:shadow-md focus:shadow-[hsl(var(--primary))]/10"
            />
          </div>
          <div className="space-y-2">
            <Label>Email</Label>
            <Input value={profile?.email || ""} disabled className="opacity-60" />
          </div>
          <Button onClick={handleSave} disabled={saving} className="active-press hover-lift">
            {saving ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Save className="h-4 w-4 mr-1" />}
            Enregistrer
          </Button>
        </CardContent>
      </Card>
    </PageShell>
  );
}
