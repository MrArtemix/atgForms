import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText } from "lucide-react";
import Link from "next/link";

export default function SuccessPage() {
  return (
    <div className="form-page-wrap flex items-center justify-center p-6">
      <div className="mx-auto w-full max-w-md">
        <Card className="form-page-card overflow-hidden border-emerald-200 dark:border-emerald-800/50">
          <CardContent className="pt-12 pb-12 px-8 text-center bg-gradient-to-b from-emerald-50/50 to-transparent dark:from-emerald-950/20 dark:to-transparent">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/50 ring-4 ring-emerald-200/60 dark:ring-emerald-800/30">
              <svg
                className="h-10 w-10 text-emerald-600 dark:text-emerald-400"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-2xl font-semibold text-[hsl(var(--foreground))] mb-3">
              Réponse enregistrée
            </h1>
            <p className="text-[hsl(var(--muted-foreground))] mb-8 leading-relaxed">
              Merci pour votre réponse. Elle a bien été enregistrée.
            </p>
            <Link href="/" className="inline-block">
              <Button variant="outline" className="min-w-[160px]">
                <FileText className="h-4 w-4 mr-2" />
                Retour à l&apos;accueil
              </Button>
            </Link>
          </CardContent>
        </Card>
        <p className="text-center text-xs text-[hsl(var(--muted-foreground))] mt-6">
          Propulsé par ATGForm
        </p>
      </div>
    </div>
  );
}
