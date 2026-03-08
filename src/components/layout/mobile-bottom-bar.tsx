"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Gauge, Building2, FilePlus2, TrendingUp, CircleUser } from "lucide-react";
import { cn } from "@/lib/utils/cn";

const navItems = [
  { label: "Accueil", href: "/dashboard", icon: Gauge },
  { label: "Filiales", href: "/filiales", icon: Building2 },
  { label: "Créer", href: "/filiales", icon: FilePlus2, isCenter: true },
  { label: "Réponses", href: "/dashboard", icon: TrendingUp },
  { label: "Profil", href: "/profile", icon: CircleUser },
];

export function MobileBottomBar() {
  const pathname = usePathname();
  const router = useRouter();
  const [visible, setVisible] = useState(true);
  const lastScrollY = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentY = window.scrollY;
      if (currentY > lastScrollY.current && currentY > 100) {
        setVisible(false);
      } else {
        setVisible(true);
      }
      lastScrollY.current = currentY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Don't show on builder pages
  if (pathname.includes("/edit") || pathname.includes("/preview")) {
    return null;
  }

  return (
    <nav
      className={cn(
        "md:hidden fixed bottom-0 left-0 right-0 z-50 border-t border-[hsl(var(--border))] bg-[hsl(var(--background))]/95 backdrop-blur-lg transition-transform duration-300 ease-in-out pb-[env(safe-area-inset-bottom)]",
        visible ? "translate-y-0" : "translate-y-full"
      )}
    >
      <div className="flex items-center justify-around px-2 py-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href.split("?")[0] + "/");

          if (item.isCenter) {
            return (
              <button
                key={item.label}
                onClick={() => router.push(item.href)}
                className="flex flex-col items-center justify-center -mt-4"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[hsl(var(--primary))] text-white shadow-lg shadow-[hsl(var(--primary))]/30 active-press transition-transform">
                  <FilePlus2 className="h-6 w-6" />
                </div>
                <span className="mt-1 text-[10px] font-medium text-[hsl(var(--primary))]">
                  {item.label}
                </span>
              </button>
            );
          }

          return (
            <Link
              key={item.label}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center gap-0.5 px-3 py-2 transition-colors",
                isActive
                  ? "text-[hsl(var(--primary))]"
                  : "text-[hsl(var(--muted-foreground))]"
              )}
            >
              <div className="relative">
                <item.icon className={cn("h-5 w-5", isActive && "drop-shadow-sm")} />
                {isActive && (
                  <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 h-1 w-1 rounded-full bg-[hsl(var(--primary))]" />
                )}
              </div>
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
