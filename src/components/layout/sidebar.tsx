"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils/cn";
import { Button } from "@/components/ui/button";
import {
  FileText,
  LayoutDashboard,
  Layout,
  Building2,
  Plus,
  PanelLeftClose,
  PanelLeft,
  Settings,
  HelpCircle,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const navItems = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Filiales",
    href: "/filiales",
    icon: Building2,
  },
  {
    label: "Formulaires",
    href: "/forms",
    icon: FileText,
  },
  {
    label: "Templates",
    href: "/templates",
    icon: Layout,
  },
];

const bottomNavItems = [
  {
    label: "Paramètres",
    href: "/profile",
    icon: Settings,
  },
  {
    label: "Aide",
    href: "/profile",
    icon: HelpCircle,
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <TooltipProvider delayDuration={200}>
      <aside
        className={cn(
          "hidden h-full flex-col border-r border-[hsl(var(--border))] bg-[hsl(var(--sidebar-background))] md:flex custom-scrollbar",
          "transition-[width] duration-300 ease-in-out",
          isCollapsed ? "w-[68px]" : "w-[260px]"
        )}
      >
        {/* Logo */}
        <div className="flex h-16 items-center justify-between border-b border-[hsl(var(--border))] px-4">
          <Link href="/dashboard" className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[hsl(var(--primary))]">
              <FileText className="h-4 w-4 text-white" />
            </div>
            {!isCollapsed && (
              <span className="text-lg font-semibold text-[hsl(var(--sidebar-foreground))]">
                ATGForm
              </span>
            )}
          </Link>
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="rounded-md p-1.5 text-[hsl(var(--muted-foreground))] transition-colors hover:bg-[hsl(var(--sidebar-accent))] hover:text-[hsl(var(--sidebar-accent-foreground))]"
          >
            {isCollapsed ? (
              <PanelLeft className="h-4 w-4" />
            ) : (
              <PanelLeftClose className="h-4 w-4" />
            )}
          </button>
        </div>

        {/* Main Navigation */}
        <nav className="flex-1 space-y-1 p-3 overflow-y-auto">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href || pathname.startsWith(item.href + "/");
            const linkContent = (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-[hsl(var(--primary))]/10 text-[hsl(var(--primary))]"
                    : "text-[hsl(var(--sidebar-foreground))] hover:bg-[hsl(var(--sidebar-accent))] hover:text-[hsl(var(--sidebar-accent-foreground))]",
                  isCollapsed && "justify-center px-2"
                )}
              >
                {isActive && (
                  <div className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r-full bg-[hsl(var(--primary))]" />
                )}
                <item.icon className="h-5 w-5 shrink-0" />
                {!isCollapsed && <span>{item.label}</span>}
              </Link>
            );

            if (isCollapsed) {
              return (
                <Tooltip key={item.href}>
                  <TooltipTrigger asChild>{linkContent}</TooltipTrigger>
                  <TooltipContent side="right" className="flex items-center gap-2">
                    {item.label}
                  </TooltipContent>
                </Tooltip>
              );
            }

            return linkContent;
          })}
        </nav>

        {/* Bottom Navigation */}
        <div className="border-t border-[hsl(var(--border))] p-3">
          <nav className="space-y-1 mb-3">
            {bottomNavItems.map((item) => {
              const isActive = pathname === item.href;
              const linkContent = (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200",
                    isActive
                      ? "bg-[hsl(var(--primary))]/10 text-[hsl(var(--primary))]"
                      : "text-[hsl(var(--sidebar-foreground))] hover:bg-[hsl(var(--sidebar-accent))] hover:text-[hsl(var(--sidebar-accent-foreground))]",
                    isCollapsed && "justify-center px-2"
                  )}
                >
                  {isActive && (
                    <div className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r-full bg-[hsl(var(--primary))]" />
                  )}
                  <item.icon className="h-4 w-4 shrink-0" />
                  {!isCollapsed && <span>{item.label}</span>}
                </Link>
              );

              if (isCollapsed) {
                return (
                  <Tooltip key={item.href}>
                    <TooltipTrigger asChild>{linkContent}</TooltipTrigger>
                    <TooltipContent side="right">
                      {item.label}
                    </TooltipContent>
                  </Tooltip>
                );
              }

              return linkContent;
            })}
          </nav>

          {/* New Form Button */}
          <Button
            asChild
            className={cn("w-full active-press", isCollapsed && "px-0")}
            size={isCollapsed ? "icon" : "default"}
          >
            <Link href="/forms">
              <Plus className={cn("h-4 w-4", !isCollapsed && "mr-2")} />
              {!isCollapsed && "Nouveau formulaire"}
            </Link>
          </Button>
        </div>
      </aside>
    </TooltipProvider>
  );
}
