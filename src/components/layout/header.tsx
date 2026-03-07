"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogOut, User, Bell, Plus, Settings, HelpCircle, ImagePlus, X } from "lucide-react";
import { MobileNav } from "@/components/layout/mobile-nav";
import { CommandPalette } from "@/components/layout/command-palette";
import { cn } from "@/lib/utils/cn";

interface HeaderProps {
  user: {
    id: string;
    email: string;
    fullName: string;
    avatarUrl: string;
  };
}

export function Header({ user }: HeaderProps) {
  const router = useRouter();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [notificationCount] = useState(3);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  const handleLogoClick = () => {
    fileInputRef.current?.click();
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setLogoUrl(url);
    }
  };

  const handleLogoRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    setLogoUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const initials = user.fullName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <>
      <header className="flex h-16 items-center justify-between border-b border-[hsl(var(--border))] bg-[hsl(var(--background))]/80 backdrop-blur-lg px-4 md:px-6">
        {/* Left side: Logo, Search & Quick Actions */}
        <div className="flex items-center gap-3">
          {/* Logo Upload Zone */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleLogoChange}
          />
          <button
            onClick={handleLogoClick}
            title="Cliquez pour ajouter un logo"
            className={cn(
              "relative group flex items-center justify-center rounded-lg transition-all duration-200 overflow-hidden shrink-0",
              logoUrl
                ? "h-10 w-10 ring-1 ring-[hsl(var(--border))]"
                : "h-10 w-auto px-3 gap-2 border-2 border-dashed border-[hsl(var(--border))] hover:border-[hsl(var(--primary))] hover:bg-[hsl(var(--primary))]/5"
            )}
          >
            {logoUrl ? (
              <>
                <img
                  src={logoUrl}
                  alt="Logo"
                  className="h-full w-full object-contain rounded-lg"
                />
                {/* Overlay on hover to change/remove */}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-lg">
                  <ImagePlus className="h-4 w-4 text-white" />
                </div>
                {/* Remove button */}
                <button
                  onClick={handleLogoRemove}
                  className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-[hsl(var(--destructive))] text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                >
                  <X className="h-3 w-3" />
                </button>
              </>
            ) : (
              <>
                <ImagePlus className="h-4 w-4 text-[hsl(var(--muted-foreground))] group-hover:text-[hsl(var(--primary))] transition-colors" />
                <span className="text-xs text-[hsl(var(--muted-foreground))] group-hover:text-[hsl(var(--primary))] transition-colors hidden sm:inline">
                  Logo
                </span>
              </>
            )}
          </button>

          <CommandPalette user={user} />

          {/* Quick Create Button */}
          <Button
            size="sm"
            className="hidden sm:flex gap-2"
            onClick={() => router.push("/forms")}
          >
            <Plus className="h-4 w-4" />
            <span className="hidden lg:inline">Nouveau</span>
          </Button>
        </div>

        {/* Right side: Notifications & User dropdown */}
        <div className="ml-auto flex items-center gap-2">
          {/* Notifications */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                {notificationCount > 0 && (
                  <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-[hsl(var(--destructive))] text-[10px] font-medium text-white">
                    {notificationCount}
                  </span>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <DropdownMenuLabel className="flex items-center justify-between">
                <span>Notifications</span>
                {notificationCount > 0 && (
                  <span className="text-xs text-[hsl(var(--muted-foreground))]">
                    {notificationCount} nouvelles
                  </span>
                )}
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <div className="max-h-64 overflow-y-auto">
                <DropdownMenuItem className="flex flex-col items-start gap-1 p-3 cursor-pointer">
                  <div className="flex items-center gap-2 w-full">
                    <div className="h-2 w-2 rounded-full bg-[hsl(var(--primary))]" />
                    <span className="text-sm font-medium">New response</span>
                    <span className="ml-auto text-xs text-[hsl(var(--muted-foreground))]">2 min</span>
                  </div>
                  <p className="text-xs text-[hsl(var(--muted-foreground))] pl-4">
                    Une réponse reçue sur &quot;Formulaire contact&quot;
                  </p>
                </DropdownMenuItem>
                <DropdownMenuItem className="flex flex-col items-start gap-1 p-3 cursor-pointer">
                  <div className="flex items-center gap-2 w-full">
                    <div className="h-2 w-2 rounded-full bg-[hsl(var(--primary))]" />
                    <span className="text-sm font-medium">Formulaire publié</span>
                    <span className="ml-auto text-xs text-[hsl(var(--muted-foreground))]">1 h</span>
                  </div>
                  <p className="text-xs text-[hsl(var(--muted-foreground))] pl-4">
                    &quot;Inscription événement&quot; est en ligne
                  </p>
                </DropdownMenuItem>
                <DropdownMenuItem className="flex flex-col items-start gap-1 p-3 cursor-pointer">
                  <div className="flex items-center gap-2 w-full">
                    <div className="h-2 w-2 rounded-full bg-[hsl(var(--muted-foreground))]" />
                    <span className="text-sm font-medium">Bienvenue</span>
                    <span className="ml-auto text-xs text-[hsl(var(--muted-foreground))]">1 j</span>
                  </div>
                  <p className="text-xs text-[hsl(var(--muted-foreground))] pl-4">
                    Thanks for joining ATGForm
                  </p>
                </DropdownMenuItem>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="cursor-pointer justify-center text-[hsl(var(--primary))]">
                Voir toutes les notifications
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* User Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="relative h-9 w-9 rounded-full"
              >
                <Avatar className="h-9 w-9 ring-2 ring-transparent transition-all hover:ring-[hsl(var(--primary))]/20">
                  <AvatarImage src={user.avatarUrl} alt={user.fullName} />
                  <AvatarFallback className="text-xs bg-[hsl(var(--primary))]/10 text-[hsl(var(--primary))]">{initials}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium">{user.fullName}</p>
                  <p className="text-xs text-[hsl(var(--muted-foreground))]">
                    {user.email}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="cursor-pointer"
                onClick={() => router.push("/profile")}
              >
                <User className="mr-2 h-4 w-4" />
                Profil
              </DropdownMenuItem>
              <DropdownMenuItem
                className="cursor-pointer"
                onClick={() => router.push("/profile")}
              >
                <Settings className="mr-2 h-4 w-4" />
                Paramètres
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer">
                <HelpCircle className="mr-2 h-4 w-4" />
                Aide
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="cursor-pointer text-[hsl(var(--destructive))]"
                onClick={handleSignOut}
              >
                <LogOut className="mr-2 h-4 w-4" />
                Déconnexion
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* Mobile Navigation */}
      <MobileNav open={mobileNavOpen} onOpenChange={setMobileNavOpen} />
    </>
  );
}
