"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useForm } from "@/lib/hooks/use-form";
import { formService } from "@/lib/services/form-service";
import { FormSettings, FormStatus } from "@/types/form";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Save, Loader2, Trash2, Copy, ExternalLink } from "lucide-react";

export default function SettingsPage() {
  const params = useParams();
  const router = useRouter();
  const formId = params.formId as string;
  const { form, loading, refetch } = useForm(formId);
  const [settings, setSettings] = useState<Partial<FormSettings>>({});
  const [slug, setSlug] = useState("");
  const [status, setStatus] = useState<FormStatus>("draft");
  const [saving, setSaving] = useState(false);
  const [copyingLink, setCopyingLink] = useState(false);

  useEffect(() => {
    if (form) {
      setSettings(form.settings || {});
      setSlug(form.slug || "");
      setStatus(form.status);
    }
  }, [form]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await formService.updateForm(formId, { slug, status });
      await formService.updateFormSettings(formId, settings);
      await refetch();
    } catch (error) {
      console.error("Failed to save settings:", error);
    }
    setSaving(false);
  };

  const handleDelete = async () => {
    await formService.deleteForm(formId);
    router.push("/dashboard");
  };

  const publicUrl =
    typeof window !== "undefined" && slug
      ? `${window.location.origin}/f/${slug}`
      : "";

  const handleCopyLink = async () => {
    if (!publicUrl) return;
    try {
      setCopyingLink(true);
      await navigator.clipboard.writeText(publicUrl);
    } finally {
      setTimeout(() => setCopyingLink(false), 1500);
    }
  };

  if (loading) {
    return (
      <div className="p-6 max-w-3xl space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className={`h-48 skeleton animate-stagger-${i}`} />
        ))}
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-3xl animate-fade-in">
      <div className="flex items-center justify-between animate-fade-in-up">
        <h2 className="text-xl font-semibold">Settings</h2>
        <Button onClick={handleSave} disabled={saving} className="active-press hover-lift">
          {saving ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Save className="h-4 w-4 mr-1" />}
          Save
        </Button>
      </div>

      {/* Status */}
      <Card className="animate-fade-in-up animate-stagger-1">
        <CardHeader>
          <CardTitle className="text-base">Form Status</CardTitle>
        </CardHeader>
        <CardContent>
          <Select value={status} onValueChange={(v) => setStatus(v as FormStatus)}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="published">Published</SelectItem>
              <SelectItem value="closed">Closed</SelectItem>
              <SelectItem value="archived">Archived</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* URL Slug */}
      <Card className="animate-fade-in-up animate-stagger-2">
        <CardHeader>
          <CardTitle className="text-base">Custom URL</CardTitle>
          <CardDescription>Customize your form URL</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <span className="text-sm text-[hsl(var(--muted-foreground))]">/f/</span>
            <Input
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="my-form"
              className="transition-shadow duration-200 focus:shadow-md focus:shadow-[hsl(var(--primary))]/10"
            />
          </div>
          {slug && (
            <div className="mt-4 space-y-2">
              <Label className="text-xs text-[hsl(var(--muted-foreground))]">
                Public form link
              </Label>
              <div className="flex items-center gap-2">
                <Input
                  value={publicUrl}
                  readOnly
                  className="text-xs font-mono"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={handleCopyLink}
                  className="shrink-0"
                >
                  <Copy className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  asChild
                  disabled={!publicUrl}
                  className="shrink-0"
                >
                  <a
                    href={publicUrl || "#"}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </Button>
              </div>
              <p className="text-xs text-[hsl(var(--muted-foreground))]">
                {status === "published"
                  ? "Anyone with this link can fill out the form."
                  : "Publish the form to make this link active."}
              </p>
              {copyingLink && (
                <p className="text-xs text-[hsl(var(--primary))]">
                  Link copied to clipboard.
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Response Settings */}
      <Card className="animate-fade-in-up animate-stagger-3">
        <CardHeader>
          <CardTitle className="text-base">Response Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>Allow multiple responses</Label>
            <Switch
              checked={settings.allow_multiple_responses ?? false}
              onCheckedChange={(v) => setSettings({ ...settings, allow_multiple_responses: v })}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label>Show progress bar</Label>
            <Switch
              checked={settings.show_progress_bar ?? true}
              onCheckedChange={(v) => setSettings({ ...settings, show_progress_bar: v })}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label>Require login</Label>
            <Switch
              checked={settings.require_login ?? false}
              onCheckedChange={(v) => setSettings({ ...settings, require_login: v })}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label>Email notifications</Label>
            <Switch
              checked={settings.notify_on_response ?? true}
              onCheckedChange={(v) => setSettings({ ...settings, notify_on_response: v })}
            />
          </div>
          <Separator />
          <div className="space-y-2">
            <Label>Response limit</Label>
            <Input
              type="number"
              value={settings.limit_responses ?? ""}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  limit_responses: e.target.value ? Number(e.target.value) : null,
                })
              }
              placeholder="Unlimited"
              className="transition-shadow duration-200 focus:shadow-md focus:shadow-[hsl(var(--primary))]/10"
            />
          </div>
          <div className="space-y-2">
            <Label>Confirmation message</Label>
            <Textarea
              value={settings.confirmation_message ?? ""}
              onChange={(e) => setSettings({ ...settings, confirmation_message: e.target.value })}
              placeholder="Thank you for your response!"
              className="transition-shadow duration-200 focus:shadow-md focus:shadow-[hsl(var(--primary))]/10"
            />
          </div>
          <div className="space-y-2">
            <Label>Close message</Label>
            <Textarea
              value={settings.close_message ?? ""}
              onChange={(e) => setSettings({ ...settings, close_message: e.target.value })}
              placeholder="This form is no longer accepting responses."
              className="transition-shadow duration-200 focus:shadow-md focus:shadow-[hsl(var(--primary))]/10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-[hsl(var(--destructive))]/50 animate-fade-in-up animate-stagger-4">
        <CardHeader>
          <CardTitle className="text-base text-[hsl(var(--destructive))]">Danger Zone</CardTitle>
        </CardHeader>
        <CardContent>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" className="active-press">
                <Trash2 className="h-4 w-4 mr-1" />
                Delete Form
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="animate-scale-in">
              <AlertDialogHeader>
                <AlertDialogTitle>Delete form?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete the form and all its responses.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete} className="bg-[hsl(var(--destructive))] text-[hsl(var(--destructive-foreground))] hover:bg-[hsl(var(--destructive))]/90">
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardContent>
      </Card>
    </div>
  );
}
