"use client";

import { useParams, usePathname } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils/cn";
import {
  Pencil, Eye, MessageSquare, BarChart3, Settings, Palette
} from "lucide-react";

const tabs = [
  { label: "Edit", href: "edit", icon: Pencil },
  { label: "Preview", href: "preview", icon: Eye },
  { label: "Responses", href: "responses", icon: MessageSquare },
  { label: "Analytics", href: "analytics", icon: BarChart3 },
  { label: "Theme", href: "theme", icon: Palette },
  { label: "Settings", href: "settings", icon: Settings },
];

export default function FormLayout({ children }: { children: React.ReactNode }) {
  const params = useParams();
  const pathname = usePathname();
  const formId = params.formId as string;

  // For edit page, use full height without tab bar
  const currentTab = tabs.find(t => pathname.includes(`/${t.href}`));
  const isEditPage = pathname.endsWith("/edit");

  if (isEditPage) {
    return <div className="h-[calc(100vh-64px)] flex flex-col">{children}</div>;
  }

  return (
    <div className="flex flex-col h-full">
      <div className="border-b bg-background px-4">
        <nav className="flex gap-1 -mb-px overflow-x-auto">
          {tabs.map((tab) => {
            const isActive = pathname.includes(`/${tab.href}`);
            const Icon = tab.icon;
            return (
              <Link
                key={tab.href}
                href={`/forms/${formId}/${tab.href}`}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-2.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap",
                  isActive
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
                )}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </Link>
            );
          })}
        </nav>
      </div>
      <div className="flex-1 overflow-y-auto">{children}</div>
    </div>
  );
}
