"use client";

import { useState } from "react";
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
import { LogOut, CircleUser, Building2, SlidersHorizontal, LifeBuoy, X, Menu } from "lucide-react";
import { MobileNav } from "@/components/layout/mobile-nav";
import { CommandPalette } from "@/components/layout/command-palette";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { NotificationPopover } from "@/components/notifications/notification-popover";
import { useNotifications } from "@/lib/hooks/use-notifications";
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

  // Initialize realtime notifications
  useNotifications(user.id);

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
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
        {/* Left side: Hamburger, Logo, Breadcrumbs, Search & Quick Actions */}
        <div className="flex items-center gap-3">
          {/* Mobile hamburger */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden h-9 w-9"
            onClick={() => setMobileNavOpen(!mobileNavOpen)}
            aria-label={mobileNavOpen ? "Fermer le menu" : "Ouvrir le menu"}
          >
            <div className="relative h-5 w-5">
              <Menu
                className={cn(
                  "h-5 w-5 absolute transition-all duration-300",
                  mobileNavOpen ? "opacity-0 rotate-90" : "opacity-100 rotate-0"
                )}
              />
              <X
                className={cn(
                  "h-5 w-5 absolute transition-all duration-300",
                  mobileNavOpen ? "opacity-100 rotate-0" : "opacity-0 -rotate-90"
                )}
              />
            </div>
          </Button>

          <CommandPalette user={user} />

          {/* Breadcrumbs - desktop only */}
          <Breadcrumbs className="hidden lg:flex" />

          {/* Quick Create Button */}
          <Button
            size="sm"
            className="hidden sm:flex gap-2"
            onClick={() => router.push("/filiales")}
          >
            <Building2 className="h-4 w-4" />
            <span className="hidden lg:inline">Filiales</span>
          </Button>
        </div>

        {/* Right side: Notifications & User dropdown */}
        <div className="ml-auto flex items-center gap-2">
          {/* Notifications */}
          <NotificationPopover />

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
                <CircleUser className="mr-2 h-4 w-4" />
                Profil
              </DropdownMenuItem>
              <DropdownMenuItem
                className="cursor-pointer"
                onClick={() => router.push("/profile")}
              >
                <SlidersHorizontal className="mr-2 h-4 w-4" />
                Paramètres
              </DropdownMenuItem>
              <DropdownMenuItem
                className="cursor-pointer"
                onClick={() => router.push("/help")}
              >
                <LifeBuoy className="mr-2 h-4 w-4" />
                Aide
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="cursor-pointer text-[hsl(var(--destructive))]"
                onClick={() => void handleSignOut()}
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
