"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useUser } from "@/lib/hooks/use-user";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Save, Loader2, User, Upload, Lock, Eye, EyeOff } from "lucide-react";
import { PageHeader, PageShell } from "@/components/layout/page-shell";
import { PasswordStrength } from "@/components/auth/password-strength";
import { cn } from "@/lib/utils/cn";

export default function ProfilePage() {
  const { user, profile, loading } = useUser();
  const [fullName, setFullName] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Avatar
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Password
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || "");
      setAvatarUrl(profile.avatar_url || null);
    }
  }, [profile]);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    setSaveSuccess(false);
    const supabase = createClient();
    await supabase.from("profiles").update({ full_name: fullName }).eq("id", user.id);
    setSaving(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
  };

  const handleAvatarUpload = useCallback(async (file: File) => {
    if (!user) return;
    setUploadingAvatar(true);
    try {
      const supabase = createClient();
      const ext = file.name.split(".").pop();
      const path = `avatars/${user.id}.${ext}`;

      await supabase.storage.from("avatars").upload(path, file, { upsert: true });
      const { data: urlData } = supabase.storage.from("avatars").getPublicUrl(path);

      const publicUrl = `${urlData.publicUrl}?t=${Date.now()}`;
      await supabase.from("profiles").update({ avatar_url: publicUrl }).eq("id", user.id);
      setAvatarUrl(publicUrl);
    } catch (error) {
      console.error("Failed to upload avatar:", error);
    } finally {
      setUploadingAvatar(false);
    }
  }, [user]);

  const handleChangePassword = async () => {
    setPasswordError("");
    setPasswordSuccess(false);

    if (newPassword !== confirmPassword) {
      setPasswordError("Les mots de passe ne correspondent pas.");
      return;
    }
    if (newPassword.length < 8) {
      setPasswordError("Le mot de passe doit contenir au moins 8 caractères.");
      return;
    }

    setChangingPassword(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) {
        setPasswordError(error.message);
      } else {
        setPasswordSuccess(true);
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setTimeout(() => setPasswordSuccess(false), 3000);
      }
    } catch {
      setPasswordError("Une erreur est survenue.");
    } finally {
      setChangingPassword(false);
    }
  };

  const initials = (profile?.full_name || "U")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  if (loading) {
    return (
      <PageShell>
        <PageHeader
          eyebrow="Compte"
          title="Profil"
          description="Gérez vos informations personnelles"
        />
        <div className="max-w-2xl space-y-6">
          <div className="h-[200px] skeleton" />
          <div className="h-[200px] skeleton" />
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <PageHeader
        eyebrow="Compte"
        title="Profil"
        description="Gérez vos informations personnelles et préférences"
      />

      <div className="max-w-2xl space-y-6">
        {/* Section: Informations personnelles */}
        <Card className="animate-fade-in-up animate-stagger-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5 text-[hsl(var(--muted-foreground))]" />
              Informations personnelles
            </CardTitle>
            <CardDescription>
              Mettez à jour votre photo de profil et vos informations.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Avatar Upload */}
            <div className="flex items-center gap-6">
              <div className="relative group">
                <Avatar className="h-20 w-20 ring-2 ring-[hsl(var(--border))] transition-all group-hover:ring-[hsl(var(--primary))]/30">
                  <AvatarImage src={avatarUrl || ""} />
                  <AvatarFallback className="bg-[hsl(var(--primary))]/10 text-[hsl(var(--primary))] text-lg">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingAvatar}
                  className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                >
                  {uploadingAvatar ? (
                    <Loader2 className="h-5 w-5 text-white animate-spin" />
                  ) : (
                    <Upload className="h-5 w-5 text-white" />
                  )}
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) void handleAvatarUpload(file);
                  }}
                />
              </div>
              <div>
                <p className="font-medium">{profile?.full_name || "Utilisateur"}</p>
                <p className="text-sm text-[hsl(var(--muted-foreground))]">{profile?.email}</p>
                <Button
                  variant="ghost"
                  size="sm"
                  className="mt-1 h-7 text-xs text-[hsl(var(--primary))]"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingAvatar}
                >
                  <Upload className="h-3 w-3 mr-1" />
                  Changer la photo
                </Button>
              </div>
            </div>

            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="full-name">Nom complet</Label>
              <Input
                id="full-name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Votre nom complet"
                className="transition-shadow duration-200 focus:shadow-md focus:shadow-[hsl(var(--primary))]/10"
              />
            </div>

            {/* Email (read-only) */}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" value={profile?.email || ""} disabled className="opacity-60" />
            </div>

            <Button
              onClick={() => void handleSave()}
              disabled={saving}
              className={cn("active-press hover-lift", saveSuccess && "bg-emerald-600 hover:bg-emerald-700")}
            >
              {saving ? (
                <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
              ) : saveSuccess ? (
                <span className="inline-flex items-center gap-1.5">Enregistré !</span>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-1.5" />
                  Enregistrer
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Section: Sécurité */}
        <Card className="animate-fade-in-up animate-stagger-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5 text-[hsl(var(--muted-foreground))]" />
              Sécurité
            </CardTitle>
            <CardDescription>
              Changez votre mot de passe pour sécuriser votre compte.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="current-password">Mot de passe actuel</Label>
              <div className="relative">
                <Input
                  id="current-password"
                  type={showCurrentPassword ? "text" : "password"}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Entrez votre mot de passe actuel"
                  className="pr-10 transition-shadow duration-200 focus:shadow-md focus:shadow-[hsl(var(--primary))]/10"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition-colors"
                >
                  {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="new-password">Nouveau mot de passe</Label>
              <div className="relative">
                <Input
                  id="new-password"
                  type={showNewPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Entrez un nouveau mot de passe"
                  className="pr-10 transition-shadow duration-200 focus:shadow-md focus:shadow-[hsl(var(--primary))]/10"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition-colors"
                >
                  {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <PasswordStrength password={newPassword} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirmer le mot de passe</Label>
              <Input
                id="confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirmez le nouveau mot de passe"
                className={cn(
                  "transition-shadow duration-200 focus:shadow-md focus:shadow-[hsl(var(--primary))]/10",
                  confirmPassword && confirmPassword !== newPassword && "border-[hsl(var(--destructive))] focus-visible:ring-[hsl(var(--destructive))]"
                )}
              />
              {confirmPassword && confirmPassword !== newPassword && (
                <p className="text-xs text-[hsl(var(--destructive))] animate-fade-in">
                  Les mots de passe ne correspondent pas.
                </p>
              )}
            </div>

            {passwordError && (
              <p className="text-sm text-[hsl(var(--destructive))] animate-fade-in">{passwordError}</p>
            )}
            {passwordSuccess && (
              <p className="text-sm text-emerald-600 dark:text-emerald-400 animate-fade-in">
                Mot de passe modifié avec succès !
              </p>
            )}

            <Button
              onClick={() => void handleChangePassword()}
              disabled={changingPassword || !newPassword || !confirmPassword}
              variant="outline"
              className="active-press"
            >
              {changingPassword ? (
                <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
              ) : (
                <Lock className="h-4 w-4 mr-1.5" />
              )}
              Changer le mot de passe
            </Button>
          </CardContent>
        </Card>
      </div>
    </PageShell>
  );
}
