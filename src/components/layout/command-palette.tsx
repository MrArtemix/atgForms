"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Search,
  FileText,
  LayoutDashboard,
  Building2,
  Layout,
  User,
  Plus,
  Settings,
  HelpCircle,
  LogOut,
  Moon,
  Sun,
  Command,
  ArrowRight,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils/cn";

interface CommandItem {
  id: string;
  label: string;
  labelEn: string;
  icon: React.ComponentType<{ className?: string }>;
  href?: string;
  action?: () => void;
  category: "navigation" | "actions" | "account" | "theme";
  shortcut?: string;
}

const commands: CommandItem[] = [
  {
    id: "dashboard",
    label: "Dashboard",
    labelEn: "Dashboard",
    icon: LayoutDashboard,
    href: "/dashboard",
    category: "navigation",
  },
  {
    id: "filiales",
    label: "Filiales",
    labelEn: "Filiales",
    icon: Building2,
    href: "/filiales",
    category: "navigation",
  },
  {
    id: "forms",
    label: "Formulaires",
    labelEn: "Forms",
    icon: FileText,
    href: "/forms",
    category: "navigation",
  },
  {
    id: "templates",
    label: "Templates",
    labelEn: "Templates",
    icon: Layout,
    href: "/templates",
    category: "navigation",
  },
  {
    id: "profile",
    label: "Profil",
    labelEn: "Profile",
    icon: User,
    href: "/profile",
    category: "navigation",
  },
  {
    id: "new-form",
    label: "Nouveau formulaire",
    labelEn: "New Form",
    icon: Plus,
    href: "/forms",
    category: "actions",
    shortcut: "⌘N",
  },
  {
    id: "settings",
    label: "Paramètres",
    labelEn: "Settings",
    icon: Settings,
    href: "/profile",
    category: "account",
  },
  {
    id: "help",
    label: "Aide",
    labelEn: "Help",
    icon: HelpCircle,
    href: "/profile",
    category: "account",
  },
];

interface CommandPaletteProps {
  user?: {
    full_name?: string;
    email?: string;
  } | null;
}

export function CommandPalette({ user }: CommandPaletteProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const router = useRouter();

  const filteredCommands = commands.filter((cmd) => {
    const searchLower = search.toLowerCase();
    return (
      cmd.label.toLowerCase().includes(searchLower) ||
      cmd.labelEn.toLowerCase().includes(searchLower) ||
      cmd.id.includes(searchLower)
    );
  });

  const groupedCommands = {
    navigation: filteredCommands.filter((cmd) => cmd.category === "navigation"),
    actions: filteredCommands.filter((cmd) => cmd.category === "actions"),
    account: filteredCommands.filter((cmd) => cmd.category === "account"),
  };

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
      if (e.key === "n" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        router.push("/forms");
        setOpen(false);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [router]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [search]);

  const handleSelect = useCallback(
    (command: CommandItem) => {
      if (command.href) {
        router.push(command.href);
      } else if (command.action) {
        command.action();
      }
      setOpen(false);
      setSearch("");
    },
    [router]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev < filteredCommands.length - 1 ? prev + 1 : 0
        );
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev > 0 ? prev - 1 : filteredCommands.length - 1
        );
      } else if (e.key === "Enter") {
        e.preventDefault();
        if (filteredCommands[selectedIndex]) {
          handleSelect(filteredCommands[selectedIndex]);
        }
      }
    },
    [filteredCommands, selectedIndex, handleSelect]
  );

  let globalIndex = -1;

  return (
    <>
      {/* Trigger Button - Hint */}
      <Button
        variant="outline"
        className="relative h-9 w-9 sm:w-56 sm:justify-start sm:px-3 text-[hsl(var(--muted-foreground))]"
        onClick={() => setOpen(true)}
      >
        <Search className="h-4 w-4 sm:mr-2" />
        <span className="hidden sm:inline-flex">Rechercher…</span>
        <kbd className="pointer-events-none absolute right-2 top-2 hidden h-5 select-none items-center gap-1 rounded border border-[hsl(var(--border))] bg-[hsl(var(--muted))] px-1.5 font-mono text-[10px] font-medium sm:flex">
          <span className="text-xs">⌘</span>K
        </kbd>
      </Button>

      {/* Command Palette Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-xl p-0 overflow-hidden">
          <DialogHeader className="px-4 pt-4 pb-2">
            <DialogTitle className="sr-only">Command Palette</DialogTitle>
          </DialogHeader>

          {/* Search Input */}
          <div className="flex items-center border-b px-3">
            <Search className="h-4 w-4 shrink-0 text-[hsl(var(--muted-foreground))]" />
            <input
              type="text"
              placeholder="Rechercher une action…"
              className="flex h-11 w-full bg-transparent px-3 py-2 text-sm outline-none placeholder:text-[hsl(var(--muted-foreground))]"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={handleKeyDown}
              autoFocus
            />
            <button
              onClick={() => setOpen(false)}
              className="rounded-sm opacity-70 hover:opacity-100"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Commands List */}
          <div className="max-h-[300px] overflow-y-auto p-2">
            {filteredCommands.length === 0 ? (
              <div className="py-6 text-center text-sm text-[hsl(var(--muted-foreground))]">
                Aucun résultat.
              </div>
            ) : (
              <>
                {/* Navigation */}
                {groupedCommands.navigation.length > 0 && (
                  <div className="mb-2">
                    <div className="px-2 py-1.5 text-xs font-medium text-[hsl(var(--muted-foreground))]">
                      Navigation
                    </div>
                    {groupedCommands.navigation.map((cmd) => {
                      globalIndex++;
                      const idx = globalIndex;
                      return (
                        <button
                          key={cmd.id}
                          onClick={() => handleSelect(cmd)}
                          className={cn(
                            "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                            selectedIndex === idx
                              ? "bg-[hsl(var(--primary))]/10 text-[hsl(var(--primary))]"
                              : "text-[hsl(var(--foreground))] hover:bg-[hsl(var(--muted))]"
                          )}
                        >
                          <cmd.icon className="h-4 w-4" />
                          <span>{cmd.label}</span>
                          {cmd.shortcut && (
                            <span className="ml-auto text-xs text-[hsl(var(--muted-foreground))]">
                              {cmd.shortcut}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* Actions */}
                {groupedCommands.actions.length > 0 && (
                  <div className="mb-2">
                    <div className="px-2 py-1.5 text-xs font-medium text-[hsl(var(--muted-foreground))]">
                      Actions
                    </div>
                    {groupedCommands.actions.map((cmd) => {
                      globalIndex++;
                      const idx = globalIndex;
                      return (
                        <button
                          key={cmd.id}
                          onClick={() => handleSelect(cmd)}
                          className={cn(
                            "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                            selectedIndex === idx
                              ? "bg-[hsl(var(--primary))]/10 text-[hsl(var(--primary))]"
                              : "text-[hsl(var(--foreground))] hover:bg-[hsl(var(--muted))]"
                          )}
                        >
                          <cmd.icon className="h-4 w-4" />
                          <span>{cmd.label}</span>
                          {cmd.shortcut && (
                            <span className="ml-auto text-xs text-[hsl(var(--muted-foreground))]">
                              {cmd.shortcut}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* Account */}
                {groupedCommands.account.length > 0 && (
                  <div>
                    <div className="px-2 py-1.5 text-xs font-medium text-[hsl(var(--muted-foreground))]">
                      Compte
                    </div>
                    {groupedCommands.account.map((cmd) => {
                      globalIndex++;
                      const idx = globalIndex;
                      return (
                        <button
                          key={cmd.id}
                          onClick={() => handleSelect(cmd)}
                          className={cn(
                            "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                            selectedIndex === idx
                              ? "bg-[hsl(var(--primary))]/10 text-[hsl(var(--primary))]"
                              : "text-[hsl(var(--foreground))] hover:bg-[hsl(var(--muted))]"
                          )}
                        >
                          <cmd.icon className="h-4 w-4" />
                          <span>{cmd.label}</span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between border-t border-[hsl(var(--border))] px-4 py-2 text-xs text-[hsl(var(--muted-foreground))]">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <kbd className="rounded border border-[hsl(var(--border))] bg-[hsl(var(--muted))] px-1">↑↓</kbd>
                <span>Naviguer</span>
              </span>
              <span className="flex items-center gap-1">
                <kbd className="rounded border border-[hsl(var(--border))] bg-[hsl(var(--muted))] px-1">↵</kbd>
                <span>Ouvrir</span>
              </span>
              <span className="flex items-center gap-1">
                <kbd className="rounded border border-[hsl(var(--border))] bg-[hsl(var(--muted))] px-1">esc</kbd>
                <span>Fermer</span>
              </span>
            </div>
            <span className="flex items-center gap-1">
              <Command className="h-3 w-3" />
              <span>ATGForm</span>
            </span>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
