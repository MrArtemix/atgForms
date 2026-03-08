"use client";

import { cn } from "@/lib/utils/cn";

interface PasswordStrengthProps {
  password: string;
}

function getStrength(password: string): { score: number; label: string } {
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  if (score <= 1) return { score: 1, label: "Faible" };
  if (score <= 2) return { score: 2, label: "Moyen" };
  if (score <= 3) return { score: 3, label: "Bon" };
  if (score <= 4) return { score: 4, label: "Fort" };
  return { score: 5, label: "Très fort" };
}

const barColors = [
  "",
  "bg-red-500",
  "bg-orange-500",
  "bg-yellow-500",
  "bg-green-500",
  "bg-emerald-500",
];

const labelColors = [
  "",
  "text-red-600",
  "text-orange-600",
  "text-yellow-600",
  "text-green-600",
  "text-emerald-600",
];

export function PasswordStrength({ password }: PasswordStrengthProps) {
  if (!password) return null;

  const { score, label } = getStrength(password);

  return (
    <div className="space-y-1.5 animate-fade-in">
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className={cn(
              "h-1 flex-1 rounded-full transition-all duration-300",
              i <= score ? barColors[score] : "bg-[hsl(var(--muted))]"
            )}
          />
        ))}
      </div>
      <p className={cn("text-xs font-medium transition-colors", labelColors[score])}>
        {label}
      </p>
    </div>
  );
}
