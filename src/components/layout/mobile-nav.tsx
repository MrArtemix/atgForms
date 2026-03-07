"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils/cn";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  FileText,
  LayoutDashboard,
  Layout,
  Building2,
  User,
  Plus,
  X,
} from "lucide-react";

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Filiales", href: "/filiales", icon: Building2 },
  { label: "Formulaires", href: "/forms", icon: FileText },
  { label: "Templates", href: "/templates", icon: Layout },
  { label: "Profil", href: "/profile", icon: User },
];

interface MobileNavProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MobileNav({ open, onOpenChange }: MobileNavProps) {
  const pathname = usePathname();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="left-0 top-0 h-full w-[280px] translate-x-0 translate-y-0 rounded-none border-r data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left sm:rounded-none">
        <DialogTitle className="sr-only">Navigation menu</DialogTitle>

        {/* Logo */}
        <div className="flex items-center justify-between">
          <Link
            href="/dashboard"
            className="flex items-center gap-2.5"
            onClick={() => onOpenChange(false)}
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[hsl(var(--primary))]">
              <FileText className="h-4 w-4 text-white" />
            </div>
            <span className="text-lg font-bold">ATGForm</span>
          </Link>
          <button
            onClick={() => onOpenChange(false)}
            className="rounded-md p-1.5 text-[hsl(var(--muted-foreground))] transition-colors hover:text-[hsl(var(--foreground))]"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="mt-4 flex flex-col space-y-1">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => onOpenChange(false)}
                className={cn(
                  "relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-[hsl(var(--primary))]/10 text-[hsl(var(--primary))]"
                    : "text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--accent))] hover:text-[hsl(var(--accent-foreground))]"
                )}
              >
                {isActive && (
                  <div className="absolute left-0 top-1/2 h-6 w-[3px] -translate-y-1/2 rounded-r-full bg-[hsl(var(--primary))]" />
                )}
                <item.icon className="h-5 w-5 shrink-0" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* New Form Button */}
        <div className="mt-auto border-t border-[hsl(var(--border))] pt-4">
          <Button asChild className="w-full" onClick={() => onOpenChange(false)}>
            <Link href="/forms">
              <Plus className="mr-2 h-4 w-4" />
              Nouveau formulaire
            </Link>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
