"use client";

import { useState } from "react";
import { FormResponse } from "@/types/response";
import { FormField } from "@/types/field-types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, Eye, Trash2, ChevronLeft, ChevronRight, Download } from "lucide-react";
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
  const totalPages = Math.ceil(totalCount / pageSize);

  const filteredResponses = search
    ? responses.filter(
        (r) =>
          r.respondent_email?.toLowerCase().includes(search.toLowerCase()) ||
          r.respondent_name?.toLowerCase().includes(search.toLowerCase())
      )
    : responses;

  return (
    <Card className="animate-fade-in">
      <CardHeader>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle className="text-lg">
            Responses ({totalCount})
          </CardTitle>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-[hsl(var(--muted-foreground))]" />
              <Input
                placeholder="Search responses..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8 w-[200px] transition-shadow duration-200 focus:shadow-md focus:shadow-[hsl(var(--primary))]/10"
              />
            </div>
            <Button variant="outline" size="sm" onClick={() => void onExport("csv")} className="hover-lift">
              <Download className="h-4 w-4 mr-1" />
              Export
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className={cn("rounded-lg border border-[hsl(var(--border))] overflow-hidden", loading && "opacity-50 pointer-events-none")}>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[hsl(var(--border))] bg-[hsl(var(--muted))]/50">
                <th className="px-4 py-3 text-left font-medium text-[hsl(var(--muted-foreground))]">#</th>
                <th className="px-4 py-3 text-left font-medium text-[hsl(var(--muted-foreground))]">Date</th>
                <th className="px-4 py-3 text-left font-medium text-[hsl(var(--muted-foreground))]">Status</th>
                <th className="px-4 py-3 text-left font-medium text-[hsl(var(--muted-foreground))]">Respondent</th>
                <th className="px-4 py-3 text-right font-medium text-[hsl(var(--muted-foreground))]">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredResponses.map((response, index) => (
                <tr
                  key={response.id}
                  className="border-b border-[hsl(var(--border))] transition-colors duration-150 hover:bg-[hsl(var(--muted))]/30"
                >
                  <td className="px-4 py-3 text-[hsl(var(--muted-foreground))]">
                    {page * pageSize + index + 1}
                  </td>
                  <td className="px-4 py-3">
                    {formatRelative(response.created_at)}
                  </td>
                  <td className="px-4 py-3">
                    <Badge
                      variant={response.is_complete ? "default" : "secondary"}
                    >
                      {response.is_complete ? "Complete" : "Incomplete"}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-[hsl(var(--muted-foreground))]">
                    {response.respondent_email ||
                      response.respondent_name ||
                      "Anonymous"}
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
                        onClick={() => void onDeleteResponse(response.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredResponses.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="px-4 py-12 text-center text-[hsl(var(--muted-foreground))]"
                  >
                    {loading ? "Loading responses..." : "No responses yet"}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-4">
            <p className="text-sm text-[hsl(var(--muted-foreground))]">
              Showing {page * pageSize + 1}-
              {Math.min((page + 1) * pageSize, totalCount)} of {totalCount}
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
  );
}
