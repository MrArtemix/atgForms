"use client";

import { useState, useMemo } from "react";
import { FormResponse } from "@/types/response";
import { FormField } from "@/types/field-types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { ConfirmDialog } from "@/components/common/confirm-dialog";
import { ExportMenu } from "@/components/responses/export-menu";
import {
  Search,
  Eye,
  Trash2,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  CheckSquare,
  Inbox,
  Loader2,
} from "lucide-react";
import { formatRelative } from "@/lib/utils/date";
import { cn } from "@/lib/utils/cn";

interface ResponseTableProps {
  responses: FormResponse[];
  totalCount: number;
  fields: FormField[];
  page: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onViewResponse: (responseId: string) => void;
  onDeleteResponse: (responseId: string) => void;
  onExport: (format: "csv" | "excel" | "pdf") => void;
  loading?: boolean;
}

type SortField = "created_at" | "respondent" | "status";
type SortDir = "asc" | "desc";

export function ResponseTable({
  responses,
  totalCount,
  fields: _fields,
  page,
  pageSize,
  onPageChange,
  onViewResponse,
  onDeleteResponse,
  onExport,
  loading,
}: ResponseTableProps) {
  const [search, setSearch] = useState("");
  const [sortField, setSortField] = useState<SortField>("created_at");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const totalPages = Math.ceil(totalCount / pageSize);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDir("desc");
    }
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <ArrowUpDown className="h-3 w-3 ml-1 opacity-40" />;
    return sortDir === "asc" ? <ArrowUp className="h-3 w-3 ml-1" /> : <ArrowDown className="h-3 w-3 ml-1" />;
  };

  const filteredAndSorted = useMemo(() => {
    let result = search
      ? responses.filter(
          (r) =>
            r.respondent_email?.toLowerCase().includes(search.toLowerCase()) ||
            r.respondent_name?.toLowerCase().includes(search.toLowerCase())
        )
      : [...responses];

    result.sort((a, b) => {
      const dir = sortDir === "asc" ? 1 : -1;
      switch (sortField) {
        case "created_at":
          return (new Date(a.created_at).getTime() - new Date(b.created_at).getTime()) * dir;
        case "respondent": {
          const nameA = a.respondent_email || a.respondent_name || "";
          const nameB = b.respondent_email || b.respondent_name || "";
          return nameA.localeCompare(nameB) * dir;
        }
        case "status":
          return ((a.is_complete ? 1 : 0) - (b.is_complete ? 1 : 0)) * dir;
        default:
          return 0;
      }
    });

    return result;
  }, [responses, search, sortField, sortDir]);

  const toggleSelect = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === filteredAndSorted.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredAndSorted.map((r) => r.id)));
    }
  };

  const handleDeleteRequest = (id: string) => {
    setDeletingId(id);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (deletingId) {
      onDeleteResponse(deletingId);
    }
    setDeleteDialogOpen(false);
    setDeletingId(null);
  };

  const handleBulkDelete = () => {
    selectedIds.forEach((id) => onDeleteResponse(id));
    setSelectedIds(new Set());
  };

  return (
    <>
      <Card className="animate-fade-in">
        <CardHeader>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle className="text-lg">
              Réponses ({totalCount})
            </CardTitle>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-[hsl(var(--muted-foreground))]" />
                <Input
                  placeholder="Rechercher..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-8 w-[200px] transition-shadow duration-200 focus:shadow-md focus:shadow-[hsl(var(--primary))]/10"
                />
              </div>
              <ExportMenu onExport={onExport} disabled={loading} />
            </div>
          </div>

          {/* Bulk actions bar */}
          {selectedIds.size > 0 && (
            <div className="flex items-center gap-3 rounded-lg bg-[hsl(var(--primary))]/5 border border-[hsl(var(--primary))]/20 p-3 animate-slide-down">
              <CheckSquare className="h-4 w-4 text-[hsl(var(--primary))]" />
              <span className="text-sm font-medium">
                {selectedIds.size} sélectionné{selectedIds.size > 1 ? "s" : ""}
              </span>
              <div className="flex-1" />
              <ExportMenu onExport={onExport} />
              <Button
                variant="outline"
                size="sm"
                className="text-[hsl(var(--destructive))] border-[hsl(var(--destructive))]/30 hover:bg-[hsl(var(--destructive))]/10"
                onClick={handleBulkDelete}
              >
                <Trash2 className="h-4 w-4 mr-1" />
                Supprimer
              </Button>
            </div>
          )}
        </CardHeader>
        <CardContent>
          {/* Desktop table view */}
          <div className={cn(
            "hidden md:block rounded-lg border border-[hsl(var(--border))] overflow-hidden",
            loading && "opacity-50 pointer-events-none"
          )}>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[hsl(var(--border))] bg-[hsl(var(--muted))]/50">
                  <th className="px-4 py-3 text-left w-10">
                    <Checkbox
                      checked={filteredAndSorted.length > 0 && selectedIds.size === filteredAndSorted.length}
                      onCheckedChange={toggleSelectAll}
                      aria-label="Tout sélectionner"
                    />
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-[hsl(var(--muted-foreground))]">#</th>
                  <th
                    className="px-4 py-3 text-left font-medium text-[hsl(var(--muted-foreground))] cursor-pointer select-none hover:text-[hsl(var(--foreground))] transition-colors"
                    onClick={() => handleSort("created_at")}
                  >
                    <span className="inline-flex items-center">Date <SortIcon field="created_at" /></span>
                  </th>
                  <th
                    className="px-4 py-3 text-left font-medium text-[hsl(var(--muted-foreground))] cursor-pointer select-none hover:text-[hsl(var(--foreground))] transition-colors"
                    onClick={() => handleSort("status")}
                  >
                    <span className="inline-flex items-center">Statut <SortIcon field="status" /></span>
                  </th>
                  <th
                    className="px-4 py-3 text-left font-medium text-[hsl(var(--muted-foreground))] cursor-pointer select-none hover:text-[hsl(var(--foreground))] transition-colors"
                    onClick={() => handleSort("respondent")}
                  >
                    <span className="inline-flex items-center">Répondant <SortIcon field="respondent" /></span>
                  </th>
                  <th className="px-4 py-3 text-right font-medium text-[hsl(var(--muted-foreground))]">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredAndSorted.map((response, index) => (
                  <tr
                    key={response.id}
                    className={cn(
                      "border-b border-[hsl(var(--border))] transition-colors duration-150 hover:bg-[hsl(var(--muted))]/30",
                      selectedIds.has(response.id) && "bg-[hsl(var(--primary))]/5"
                    )}
                  >
                    <td className="px-4 py-3">
                      <Checkbox
                        checked={selectedIds.has(response.id)}
                        onCheckedChange={() => toggleSelect(response.id)}
                        aria-label={`Sélectionner la réponse ${index + 1}`}
                      />
                    </td>
                    <td className="px-4 py-3 text-[hsl(var(--muted-foreground))]">
                      {page * pageSize + index + 1}
                    </td>
                    <td className="px-4 py-3">
                      {formatRelative(response.created_at)}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={response.is_complete ? "default" : "secondary"}>
                        {response.is_complete ? "Complète" : "Incomplète"}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-[hsl(var(--muted-foreground))]">
                      {response.respondent_email || response.respondent_name || "Anonyme"}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 hover:bg-[hsl(var(--primary))]/10 hover:text-[hsl(var(--primary))] transition-colors"
                          onClick={() => onViewResponse(response.id)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-[hsl(var(--destructive))] hover:bg-[hsl(var(--destructive))]/10 transition-colors"
                          onClick={() => handleDeleteRequest(response.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredAndSorted.length === 0 && (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-4 py-12 text-center text-[hsl(var(--muted-foreground))]"
                    >
                      {loading ? (
                        <div className="flex items-center justify-center gap-2">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span>Chargement...</span>
                        </div>
                      ) : search ? (
                        <div className="flex flex-col items-center gap-2">
                          <Search className="h-5 w-5 opacity-40" />
                          <span>Aucun résultat pour &laquo; {search} &raquo;</span>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center gap-2">
                          <Inbox className="h-5 w-5 opacity-40" />
                          <span>Aucune réponse pour le moment</span>
                        </div>
                      )}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile cards view */}
          <div className={cn("md:hidden space-y-3", loading && "opacity-50 pointer-events-none")}>
            {filteredAndSorted.length === 0 ? (
              <div className="py-12 text-center text-[hsl(var(--muted-foreground))]">
                {loading ? (
                  <div className="flex items-center justify-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Chargement...</span>
                  </div>
                ) : search ? (
                  <div className="flex flex-col items-center gap-2">
                    <Search className="h-5 w-5 opacity-40" />
                    <span>Aucun résultat pour &laquo; {search} &raquo;</span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2">
                    <Inbox className="h-5 w-5 opacity-40" />
                    <span>Aucune réponse pour le moment</span>
                  </div>
                )}
              </div>
            ) : (
              filteredAndSorted.map((response, index) => (
                <div
                  key={response.id}
                  className={cn(
                    "rounded-xl border border-[hsl(var(--border))] p-4 transition-all duration-200",
                    selectedIds.has(response.id) && "border-[hsl(var(--primary))]/40 bg-[hsl(var(--primary))]/5"
                  )}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Checkbox
                        checked={selectedIds.has(response.id)}
                        onCheckedChange={() => toggleSelect(response.id)}
                      />
                      <span className="text-sm font-medium">#{page * pageSize + index + 1}</span>
                    </div>
                    <Badge variant={response.is_complete ? "default" : "secondary"} className="text-xs">
                      {response.is_complete ? "Complète" : "Incomplète"}
                    </Badge>
                  </div>
                  <p className="text-sm text-[hsl(var(--muted-foreground))] mb-1">
                    {response.respondent_email || response.respondent_name || "Anonyme"}
                  </p>
                  <p className="text-xs text-[hsl(var(--muted-foreground))] mb-3">
                    {formatRelative(response.created_at)}
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => onViewResponse(response.id)}
                    >
                      <Eye className="h-3.5 w-3.5 mr-1" />
                      Voir
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-[hsl(var(--destructive))] border-[hsl(var(--destructive))]/30"
                      onClick={() => handleDeleteRequest(response.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <p className="text-sm text-[hsl(var(--muted-foreground))]">
                {page * pageSize + 1}-{Math.min((page + 1) * pageSize, totalCount)} sur {totalCount}
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 transition-all duration-200"
                  disabled={page === 0}
                  onClick={() => onPageChange(page - 1)}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm font-medium">
                  {page + 1} / {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 transition-all duration-200"
                  disabled={page >= totalPages - 1}
                  onClick={() => onPageChange(page + 1)}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Supprimer cette réponse ?"
        description="Cette action est irréversible. La réponse sera définitivement supprimée."
        confirmLabel="Supprimer"
        variant="destructive"
        onConfirm={handleDeleteConfirm}
      />
    </>
  );
}
