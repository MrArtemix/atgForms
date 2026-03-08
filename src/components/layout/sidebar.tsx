"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils/cn";
import { useHolding } from "@/lib/hooks/use-holding";
import {
  Building2,
  Gauge,
  LayoutGrid,
  PanelLeftClose,
  PanelLeft,
  SlidersHorizontal,
  LifeBuoy,
  Plus,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const bottomNavItems = [
  {
    label: "Paramètres",
    href: "/profile",
    icon: SlidersHorizontal,
  },
  {
    label: "Aide",
    href: "/help",
    icon: LifeBuoy,
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { holding, filiales, loading: filialesLoading } = useHolding();

  const isDashboardActive = pathname === "/dashboard";
  const isTemplatesActive = pathname === "/templates" || pathname.startsWith("/templates/");

  return (
    <TooltipProvider delayDuration={200}>
      <aside
        className={cn(
          "hidden h-full flex-col border-r border-[hsl(var(--border))] bg-[hsl(var(--sidebar-background))] md:flex custom-scrollbar",
          "transition-[width] duration-300 ease-in-out",
          isCollapsed ? "w-[68px]" : "w-[260px]"
        )}
      >
        {/* Header - Holding Name */}
        <div className="flex h-16 items-center justify-between border-b border-[hsl(var(--border))] px-4">
          <Link href="/dashboard" className="flex items-center min-w-0">
            {isCollapsed ? (
              <div className="flex h-8 w-8 shrink-0 items-center justify-center">
                <img src="/logo_atg.jpeg" alt="ATG" className="h-8 w-8 object-contain" />
              </div>
            ) : (
              <img src="/logo_atg.jpeg" alt="ATG" className="h-10 max-w-[160px] object-contain" />
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
          {/* Dashboard */}
          {(() => {
            const dashboardLink = (
              <Link
                href="/dashboard"
                className={cn(
                  "relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                  isDashboardActive
                    ? "bg-[hsl(var(--primary))]/10 text-[hsl(var(--primary))]"
                    : "text-[hsl(var(--sidebar-foreground))] hover:bg-[hsl(var(--sidebar-accent))] hover:text-[hsl(var(--sidebar-accent-foreground))]",
                  isCollapsed && "justify-center px-2"
                )}
              >
                {isDashboardActive && (
                  <div
                    className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r-full bg-[hsl(var(--primary))]"
                    style={{ animation: "slide-indicator 0.2s ease-out both" }}
                  />
                )}
                <Gauge className="h-5 w-5 shrink-0" />
                {!isCollapsed && <span className="flex-1">Dashboard</span>}
              </Link>
            );

            if (isCollapsed) {
              return (
                <Tooltip>
                  <TooltipTrigger asChild>{dashboardLink}</TooltipTrigger>
                  <TooltipContent side="right">Dashboard</TooltipContent>
                </Tooltip>
              );
            }
            return dashboardLink;
          })()}

          {/* Filiales Section */}
          <div className="mt-4 pt-4 border-t border-[hsl(var(--border))]">
            {!isCollapsed && (
              <p className="px-3 mb-2 text-xs font-medium uppercase tracking-wider text-[hsl(var(--muted-foreground))]">
                Filiales
              </p>
            )}

            {filialesLoading ? (
              <div className="space-y-2">
                {[...Array(3)].map((_, i) => (
                  <div
                    key={i}
                    className={cn(
                      "h-9 skeleton rounded-lg",
                      isCollapsed ? "w-9 mx-auto" : "mx-3"
                    )}
                  />
                ))}
              </div>
            ) : (
              <>
                {filiales.map((filiale) => {
                  const isActive = pathname.startsWith(`/filiales/${filiale.id}`);
                  const filialeLink = (
                    <Link
                      key={filiale.id}
                      href={`/filiales/${filiale.id}`}
                      className={cn(
                        "relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200",
                        isActive
                          ? "bg-[hsl(var(--primary))]/10 text-[hsl(var(--primary))]"
                          : "text-[hsl(var(--sidebar-foreground))] hover:bg-[hsl(var(--sidebar-accent))] hover:text-[hsl(var(--sidebar-accent-foreground))]",
                        isCollapsed && "justify-center px-2"
                      )}
                    >
                      {isActive && (
                        <div
                          className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r-full bg-[hsl(var(--primary))]"
                          style={{ animation: "slide-indicator 0.2s ease-out both" }}
                        />
                      )}
                      <div
                        className="h-2.5 w-2.5 shrink-0 rounded-full"
                        style={{ backgroundColor: filiale.dot_color || filiale.color || "#6366f1" }}
                      />
                      {!isCollapsed && (
                        <span className="flex-1 truncate">{filiale.name}</span>
                      )}
                    </Link>
                  );

                  if (isCollapsed) {
                    return (
                      <Tooltip key={filiale.id}>
                        <TooltipTrigger asChild>{filialeLink}</TooltipTrigger>
                        <TooltipContent side="right">
                          {filiale.name}
                        </TooltipContent>
                      </Tooltip>
                    );
                  }
                  return filialeLink;
                })}

                {/* Add filiale link */}
                {!isCollapsed && (
                  <Link
                    href="/filiales"
                    className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-[hsl(var(--muted-foreground))] transition-all duration-200 hover:bg-[hsl(var(--sidebar-accent))] hover:text-[hsl(var(--sidebar-accent-foreground))]"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>Nouvelle filiale</span>
                  </Link>
                )}
              </>
            )}
          </div>

          {/* Templates */}
          <div className="mt-4 pt-4 border-t border-[hsl(var(--border))]">
            {(() => {
              const templatesLink = (
                <Link
                  href="/templates"
                  className={cn(
                    "relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                    isTemplatesActive
                      ? "bg-[hsl(var(--primary))]/10 text-[hsl(var(--primary))]"
                      : "text-[hsl(var(--sidebar-foreground))] hover:bg-[hsl(var(--sidebar-accent))] hover:text-[hsl(var(--sidebar-accent-foreground))]",
                    isCollapsed && "justify-center px-2"
                  )}
                >
                  {isTemplatesActive && (
                    <div
                      className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r-full bg-[hsl(var(--primary))]"
                      style={{ animation: "slide-indicator 0.2s ease-out both" }}
                    />
                  )}
                  <LayoutGrid className="h-5 w-5 shrink-0" />
                  {!isCollapsed && <span className="flex-1">Templates</span>}
                </Link>
              );

              if (isCollapsed) {
                return (
                  <Tooltip>
                    <TooltipTrigger asChild>{templatesLink}</TooltipTrigger>
                    <TooltipContent side="right">Templates</TooltipContent>
                  </Tooltip>
                );
              }
              return templatesLink;
            })()}
          </div>
        </nav>

        {/* Bottom Navigation */}
        <div className="border-t border-[hsl(var(--border))] p-3">
          <nav className="space-y-1">
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
                    <div
                      className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r-full bg-[hsl(var(--primary))]"
                      style={{ animation: "slide-indicator 0.2s ease-out both" }}
                    />
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
        </div>
      </aside>
    </TooltipProvider>
  );
}
