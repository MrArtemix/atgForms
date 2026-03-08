"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { createClient } from "@/lib/supabase/client";

const routeLabels: Record<string, string> = {
  dashboard: "Dashboard",
  forms: "Formulaires",
  templates: "Templates",
  filiales: "Filiales",
  workspaces: "Espaces de travail",
  projets: "Projets",
  profile: "Profil",
  edit: "Modifier",
  preview: "Aperçu",
  responses: "Réponses",
  analytics: "Analytiques",
  settings: "Paramètres",
  theme: "Thème",
};

// Segments that are structural (not displayed, but kept in href)
const hiddenSegments = new Set(["projets"]);

function useBreadcrumbNames(segments: string[]) {
  const [names, setNames] = useState<Record<string, string>>({});

  useEffect(() => {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}/;
    const uuidsToResolve: { index: number; id: string; type: string }[] = [];

    segments.forEach((segment, index) => {
      if (!uuidRegex.test(segment)) return;
      const prev = segments[index - 1];
      if (prev === "filiales") {
        uuidsToResolve.push({ index, id: segment, type: "filiale" });
      } else if (prev === "projets") {
        uuidsToResolve.push({ index, id: segment, type: "workspace" });
      } else if (prev === "forms") {
        uuidsToResolve.push({ index, id: segment, type: "form" });
      }
    });

    if (uuidsToResolve.length === 0) return;

    const supabase = createClient();
    const promises = uuidsToResolve.map(async ({ id, type }) => {
      let name = id;
      try {
        if (type === "filiale") {
          const { data } = await supabase.from("filiales").select("name").eq("id", id).single();
          if (data) name = data.name;
        } else if (type === "workspace") {
          const { data } = await supabase.from("workspaces").select("name").eq("id", id).single();
          if (data) name = data.name;
        } else if (type === "form") {
          const { data } = await supabase.from("forms").select("title").eq("id", id).single();
          if (data) name = data.title || "Sans titre";
        }
      } catch {
        // Keep UUID as fallback
      }
      return { id, name };
    });

    void Promise.all(promises).then((results) => {
      const resolved: Record<string, string> = {};
      for (const r of results) {
        resolved[r.id] = r.name;
      }
      setNames(resolved);
    });
  }, [segments]);

  return names;
}

export function Breadcrumbs({ className }: { className?: string }) {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);
  const resolvedNames = useBreadcrumbNames(segments);

  if (segments.length <= 1) return null;

  const isUuid = (s: string) => /^[0-9a-f]{8}-[0-9a-f]{4}/.test(s);

  // Build crumbs, skipping hidden structural segments
  const crumbs: { label: string; href: string; isLast: boolean }[] = [];

  segments.forEach((segment, index) => {
    const href = "/" + segments.slice(0, index + 1).join("/");
    const isLast = index === segments.length - 1;

    // Skip hidden structural segments like "projets"
    if (hiddenSegments.has(segment)) return;

    let label: string;
    if (isUuid(segment)) {
      label = resolvedNames[segment] || "...";
    } else {
      label = routeLabels[segment] || segment;
    }

    crumbs.push({ label, href, isLast });
  });

  return (
    <nav className={cn("flex items-center gap-1 text-sm", className)} aria-label="Fil d'Ariane">
      <Link
        href="/dashboard"
        className="text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition-colors"
      >
        <Home className="h-3.5 w-3.5" />
      </Link>
      {crumbs.map((crumb, i) => (
        <span key={i} className="flex items-center gap-1">
          <ChevronRight className="h-3 w-3 text-[hsl(var(--muted-foreground))]/50" />
          {crumb.isLast ? (
            <span className="font-medium text-[hsl(var(--foreground))] truncate max-w-[150px]">
              {crumb.label}
            </span>
          ) : (
            <Link
              href={crumb.href}
              className="text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition-colors truncate max-w-[120px]"
            >
              {crumb.label}
            </Link>
          )}
        </span>
      ))}
    </nav>
  );
}
