"use client";

import { useParams } from "next/navigation";
import { useForm } from "@/lib/hooks/use-form";
import { FormRenderer } from "@/components/renderer/form-renderer";
import { LoadingPage } from "@/components/common/loading";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function FormPreviewPage() {
  const params = useParams();
  const formId = params.formId as string;
  const { form, loading } = useForm(formId);

  if (loading) return <LoadingPage />;
  if (!form) return <div className="p-6">Form not found</div>;

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="bg-background border-b px-4 py-2 flex items-center gap-4">
        <Link href={`/forms/${formId}/edit`}>
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Editor
          </Button>
        </Link>
        <span className="text-sm text-muted-foreground">Preview Mode</span>
      </div>
      <div className="py-8 px-4">
        <FormRenderer form={form} />
      </div>
    </div>
  );
}
