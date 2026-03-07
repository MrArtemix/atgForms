"use client";

import { Filiale } from "@/types/filiale";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FolderKanban, Users } from "lucide-react";
import Link from "next/link";
import { formatRelative } from "@/lib/utils/date";

interface FilialeCardProps {
    filiale: Filiale;
    projetCount?: number;
    memberCount?: number;
}

export function FilialeCard({ filiale, projetCount = 0, memberCount = 0 }: FilialeCardProps) {
    return (
        <Link href={`/filiales/${filiale.id}`}>
            <Card className="hover:shadow-md transition-all duration-200 cursor-pointer hover:border-[hsl(var(--primary))]/30 hover-lift">
                <CardHeader className="pb-2">
                    <div className="flex items-center gap-3">
                        <div
                            className="w-11 h-11 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-sm"
                            style={{ backgroundColor: filiale.color || "#6366f1" }}
                        >
                            {filiale.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0 flex-1">
                            <CardTitle className="text-base truncate">{filiale.name}</CardTitle>
                            <p className="text-xs text-[hsl(var(--muted-foreground))]">
                                {formatRelative(filiale.created_at)}
                            </p>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    {filiale.description && (
                        <p className="text-sm text-[hsl(var(--muted-foreground))] mb-3 line-clamp-2">
                            {filiale.description}
                        </p>
                    )}
                    <div className="flex items-center gap-4 text-xs text-[hsl(var(--muted-foreground))]">
                        <span className="flex items-center gap-1">
                            <FolderKanban className="h-3.5 w-3.5" />
                            {projetCount} projets
                        </span>
                        <span className="flex items-center gap-1">
                            <Users className="h-3.5 w-3.5" />
                            {memberCount} membres
                        </span>
                    </div>
                </CardContent>
            </Card>
        </Link>
    );
}
