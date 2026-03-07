"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Copy, Check, QrCode, Code, Mail, Link as LinkIcon, ExternalLink } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { cn } from "@/lib/utils/cn";

interface ShareDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  formUrl: string;
  formTitle: string;
  formSlug: string;
  embedUrl: string;
}

export function ShareDialog({
  open,
  onOpenChange,
  formUrl,
  formTitle,
  formSlug,
  embedUrl,
}: ShareDialogProps) {
  const [copied, setCopied] = useState<string | null>(null);

  const copyToClipboard = async (text: string, key: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  const embedCode = `<iframe src="${embedUrl}" width="100%" height="800" frameborder="0" style="border:none;max-width:720px;margin:0 auto;display:block;"></iframe>`;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg animate-scale-in">
        <DialogHeader>
          <DialogTitle>Share Form</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="link">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="link" className="text-xs">
              <LinkIcon className="h-3.5 w-3.5 mr-1" />
              Link
            </TabsTrigger>
            <TabsTrigger value="qr" className="text-xs">
              <QrCode className="h-3.5 w-3.5 mr-1" />
              QR
            </TabsTrigger>
            <TabsTrigger value="embed" className="text-xs">
              <Code className="h-3.5 w-3.5 mr-1" />
              Embed
            </TabsTrigger>
            <TabsTrigger value="email" className="text-xs">
              <Mail className="h-3.5 w-3.5 mr-1" />
              Email
            </TabsTrigger>
          </TabsList>

          {/* Link Tab */}
          <TabsContent value="link" className="space-y-4 mt-4 animate-fade-in">
            <div className="space-y-2">
              <Label className="text-xs">Form URL</Label>
              <div className="flex gap-2">
                <Input value={formUrl} readOnly className="text-sm" />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => copyToClipboard(formUrl, "link")}
                  className="transition-all duration-200"
                >
                  {copied === "link" ? (
                    <Check className="h-4 w-4 text-green-500 animate-scale-in" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
            <Button variant="outline" className="w-full hover-lift" asChild>
              <a href={formUrl} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4 mr-2" />
                Open Form
              </a>
            </Button>
          </TabsContent>

          {/* QR Tab */}
          <TabsContent value="qr" className="mt-4 animate-fade-in">
            <div className="flex flex-col items-center gap-4 py-4">
              <div className="p-4 bg-white rounded-xl shadow-sm">
                <QRCodeSVG value={formUrl} size={200} />
              </div>
              <p className="text-sm text-[hsl(var(--muted-foreground))]">
                Scan to open form
              </p>
              <Button
                variant="outline"
                onClick={() => copyToClipboard(formUrl, "qr")}
                className="hover-lift"
              >
                {copied === "qr" ? (
                  <Check className="h-4 w-4 mr-2 text-green-500 animate-scale-in" />
                ) : (
                  <Copy className="h-4 w-4 mr-2" />
                )}
                Copy URL
              </Button>
            </div>
          </TabsContent>

          {/* Embed Tab */}
          <TabsContent value="embed" className="space-y-4 mt-4 animate-fade-in">
            <div className="space-y-2">
              <Label className="text-xs">Embed Code</Label>
              <Textarea
                value={embedCode}
                readOnly
                rows={4}
                className="font-mono text-xs"
              />
              <Button
                variant="outline"
                className="w-full hover-lift"
                onClick={() => copyToClipboard(embedCode, "embed")}
              >
                {copied === "embed" ? (
                  <Check className="h-4 w-4 mr-2 text-green-500 animate-scale-in" />
                ) : (
                  <Copy className="h-4 w-4 mr-2" />
                )}
                Copy Embed Code
              </Button>
            </div>
          </TabsContent>

          {/* Email Tab */}
          <TabsContent value="email" className="space-y-4 mt-4 animate-fade-in">
            <div className="space-y-2">
              <Label className="text-xs">Send by email</Label>
              <Input
                placeholder="Enter email addresses (comma separated)"
                className="transition-shadow duration-200 focus:shadow-md focus:shadow-[hsl(var(--primary))]/10"
              />
              <Textarea
                placeholder="Add a personal message (optional)"
                rows={3}
                className="transition-shadow duration-200 focus:shadow-md focus:shadow-[hsl(var(--primary))]/10"
              />
              <Button className="w-full active-press">
                <Mail className="h-4 w-4 mr-2" />
                Send Invitation
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
