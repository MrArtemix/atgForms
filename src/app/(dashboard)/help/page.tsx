"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { PageHeader, PageShell } from "@/components/layout/page-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Search,
  Building2,
  FileText,
  BarChart3,
  Blocks,
  GitBranch,
  Palette,
  Share2,
  PieChart,
  Users,
  Keyboard,
  Mail,
  ArrowRight,
} from "lucide-react";

const quickStartCards = [
  {
    icon: Building2,
    title: "Créer une filiale",
    description:
      "Commencez par créer une filiale pour organiser vos projets et formulaires par entité.",
    href: "/filiales",
    color: "text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-950",
  },
  {
    icon: FileText,
    title: "Créer un formulaire",
    description:
      "Allez dans une filiale, créez un projet, puis ajoutez un formulaire avec le constructeur visuel.",
    href: "/filiales",
    color: "text-emerald-600 bg-emerald-100 dark:text-emerald-400 dark:bg-emerald-950",
  },
  {
    icon: BarChart3,
    title: "Analyser les réponses",
    description:
      "Consultez les graphiques, filtrez les données et exportez les réponses en Excel ou PDF.",
    href: "/dashboard",
    color: "text-purple-600 bg-purple-100 dark:text-purple-400 dark:bg-purple-950",
  },
];

const featureGuides = [
  {
    icon: Blocks,
    title: "Constructeur de formulaires",
    color: "text-indigo-600 bg-indigo-100 dark:text-indigo-400 dark:bg-indigo-950",
    points: [
      "18 types de champs disponibles",
      "Glisser-déposer pour réorganiser",
      "Support multi-pages",
      "Prévisualisation en temps réel",
    ],
  },
  {
    icon: GitBranch,
    title: "Logique conditionnelle",
    color: "text-amber-600 bg-amber-100 dark:text-amber-400 dark:bg-amber-950",
    points: [
      "Conditions AND / OR combinables",
      "12 opérateurs de comparaison",
      "Afficher / masquer des champs",
      "Sauts de page conditionnels",
    ],
  },
  {
    icon: Palette,
    title: "Thèmes et personnalisation",
    color: "text-pink-600 bg-pink-100 dark:text-pink-400 dark:bg-pink-950",
    points: [
      "Couleurs et polices personnalisables",
      "Thèmes prédéfinis",
      "CSS personnalisé avancé",
      "Logo et branding de marque",
    ],
  },
  {
    icon: Share2,
    title: "Partage et intégration",
    color: "text-cyan-600 bg-cyan-100 dark:text-cyan-400 dark:bg-cyan-950",
    points: [
      "Lien public partageable (/f/slug)",
      "Intégration iframe sur votre site",
      "QR code automatique",
      "Contrôle d'accès par lien",
    ],
  },
  {
    icon: PieChart,
    title: "Analytics et exports",
    color: "text-orange-600 bg-orange-100 dark:text-orange-400 dark:bg-orange-950",
    points: [
      "Graphiques de réponses en temps réel",
      "Export Excel (.xlsx)",
      "Export PDF avec mise en page",
      "Filtres et recherche avancée",
    ],
  },
  {
    icon: Users,
    title: "Gestion d'équipe",
    color: "text-teal-600 bg-teal-100 dark:text-teal-400 dark:bg-teal-950",
    points: [
      "Structure Holdings > Filiales > Projets",
      "Rôles : admin, éditeur, lecteur",
      "Invitations par email",
      "Gestion des permissions",
    ],
  },
];

const faqItems = [
  {
    question: "Comment créer un formulaire ?",
    answer:
      "Rendez-vous dans une filiale, sélectionnez ou créez un projet, puis cliquez sur « Nouveau formulaire ». Le constructeur visuel s'ouvre et vous pouvez glisser-déposer les champs depuis la palette à gauche.",
  },
  {
    question: "Comment ajouter de la logique conditionnelle ?",
    answer:
      "Dans le constructeur, sélectionnez un champ puis ouvrez l'onglet « Logique » dans le panneau de propriétés. Vous pouvez définir des conditions AND/OR avec 12 opérateurs pour afficher, masquer ou rendre obligatoire un champ selon les réponses.",
  },
  {
    question: "Comment partager un formulaire ?",
    answer:
      "Une fois votre formulaire publié, cliquez sur le bouton « Partager » dans la barre d'outils. Vous obtiendrez un lien public de type /f/votre-slug que vous pouvez envoyer par email ou partager sur les réseaux sociaux.",
  },
  {
    question: "Comment intégrer un formulaire sur mon site ?",
    answer:
      "Dans les options de partage, copiez le code d'intégration iframe. Collez-le dans le code HTML de votre site web. Le formulaire s'adaptera automatiquement à la largeur du conteneur.",
  },
  {
    question: "Comment exporter les réponses ?",
    answer:
      "Accédez à l'onglet « Réponses » de votre formulaire. Cliquez sur le bouton d'export pour télécharger les données en format Excel (.xlsx) ou PDF. Vous pouvez aussi appliquer des filtres avant l'export.",
  },
  {
    question: "Comment inviter des membres dans un projet ?",
    answer:
      "Dans les paramètres du projet ou de la filiale, accédez à la section « Membres ». Saisissez l'adresse email de la personne à inviter et choisissez son rôle (admin, éditeur ou lecteur). Une invitation lui sera envoyée par email.",
  },
  {
    question: "Quels types de champs sont disponibles ?",
    answer:
      "ATGForm propose 18 types de champs : texte court, texte long, email, nombre, téléphone, date, heure, sélection unique, sélection multiple, liste déroulante, case à cocher, échelle de notation, curseur, upload de fichier, signature, section, séparateur et champ caché.",
  },
  {
    question: "Comment personnaliser le thème d'un formulaire ?",
    answer:
      "Dans le constructeur, cliquez sur l'icône « Thème » dans la barre d'outils. Vous pouvez choisir un thème prédéfini ou personnaliser les couleurs, polices et styles. Des options CSS avancées sont aussi disponibles.",
  },
  {
    question: "Comment dupliquer un formulaire ?",
    answer:
      "Sur la page du projet, cliquez sur le menu « ··· » du formulaire que vous souhaitez dupliquer, puis sélectionnez « Dupliquer ». Une copie sera créée dans le même projet avec toute la configuration d'origine.",
  },
  {
    question: "Les données sont-elles sécurisées ?",
    answer:
      "Oui. Toutes les données sont stockées sur Supabase avec chiffrement en transit (HTTPS) et au repos. Les politiques RLS (Row Level Security) garantissent que seuls les membres autorisés d'un workspace peuvent accéder aux données.",
  },
  {
    question: "Comment supprimer un formulaire ou un projet ?",
    answer:
      "Accédez au formulaire ou projet concerné, ouvrez le menu d'actions « ··· » et sélectionnez « Supprimer ». Une confirmation vous sera demandée. Attention : la suppression est définitive et inclut toutes les réponses associées.",
  },
  {
    question: "Comment contacter le support ?",
    answer:
      "Envoyez un email à support@atgform.com en décrivant votre problème. Notre équipe vous répondra dans les plus brefs délais. Vous pouvez aussi utiliser le formulaire de contact en bas de cette page.",
  },
];

const keyboardShortcuts = [
  { keys: ["⌘", "K"], keysAlt: ["Ctrl", "K"], description: "Palette de commandes" },
  { keys: ["⌘", "N"], keysAlt: ["Ctrl", "N"], description: "Nouveau formulaire" },
  { keys: ["⌘", "Z"], keysAlt: ["Ctrl", "Z"], description: "Annuler (dans le builder)" },
  { keys: ["⌘", "⇧", "Z"], keysAlt: ["Ctrl", "⇧", "Z"], description: "Rétablir (dans le builder)" },
];

export default function HelpPage() {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredFaq = useMemo(() => {
    if (!searchQuery.trim()) return faqItems;
    const query = searchQuery.toLowerCase();
    return faqItems.filter(
      (item) =>
        item.question.toLowerCase().includes(query) ||
        item.answer.toLowerCase().includes(query)
    );
  }, [searchQuery]);

  return (
    <PageShell>
      <PageHeader
        eyebrow="Support"
        title="Centre d'aide"
        description="Trouvez des réponses à vos questions et découvrez toutes les fonctionnalités d'ATGForm."
      />

      {/* Search */}
      <div className="relative max-w-xl animate-fade-in-up animate-stagger-1">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[hsl(var(--muted-foreground))]" />
        <Input
          placeholder="Rechercher dans l'aide..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 transition-shadow duration-200 focus:shadow-md focus:shadow-[hsl(var(--primary))]/10"
        />
      </div>

      {/* Quick Start */}
      {!searchQuery && (
        <section className="space-y-4">
          <h2 className="text-lg font-semibold tracking-tight">Démarrage rapide</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {quickStartCards.map((card, i) => (
              <Link key={card.title} href={card.href}>
                <Card className={`hover-lift cursor-pointer transition-all duration-200 h-full animate-fade-in-up animate-stagger-${i + 1}`}>
                  <CardContent className="flex flex-col gap-3 p-5">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${card.color}`}>
                      <card.icon className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{card.title}</h3>
                      <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">
                        {card.description}
                      </p>
                    </div>
                    <div className="mt-auto flex items-center gap-1 text-sm font-medium text-[hsl(var(--primary))]">
                      Commencer
                      <ArrowRight className="h-3.5 w-3.5" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Feature Guides */}
      {!searchQuery && (
        <section className="space-y-4">
          <h2 className="text-lg font-semibold tracking-tight">Guides des fonctionnalités</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {featureGuides.map((guide, i) => (
              <Card key={guide.title} className={`animate-fade-in-up animate-stagger-${(i % 6) + 1}`}>
                <CardContent className="p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${guide.color}`}>
                      <guide.icon className="h-4.5 w-4.5" />
                    </div>
                    <h3 className="font-semibold">{guide.title}</h3>
                  </div>
                  <ul className="space-y-2">
                    {guide.points.map((point) => (
                      <li
                        key={point}
                        className="flex items-start gap-2 text-sm text-[hsl(var(--muted-foreground))]"
                      >
                        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[hsl(var(--primary))]/60" />
                        {point}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}

      {/* FAQ */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold tracking-tight">
          Questions fréquentes
          {searchQuery && (
            <span className="ml-2 text-sm font-normal text-[hsl(var(--muted-foreground))]">
              ({filteredFaq.length} résultat{filteredFaq.length !== 1 ? "s" : ""})
            </span>
          )}
        </h2>
        <Card>
          <CardContent className="p-2">
            {filteredFaq.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Search className="h-10 w-10 text-[hsl(var(--muted-foreground))]/40 mb-3" />
                <p className="text-sm text-[hsl(var(--muted-foreground))]">
                  Aucun résultat pour &quot;{searchQuery}&quot;
                </p>
                <p className="mt-1 text-xs text-[hsl(var(--muted-foreground))]/70">
                  Essayez avec d&apos;autres termes ou contactez le support.
                </p>
              </div>
            ) : (
              <Accordion type="single" collapsible className="w-full">
                {filteredFaq.map((item, i) => (
                  <AccordionItem key={i} value={`faq-${i}`}>
                    <AccordionTrigger className="text-left text-sm">
                      {item.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-[hsl(var(--muted-foreground))]">
                      {item.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            )}
          </CardContent>
        </Card>
      </section>

      {/* Keyboard Shortcuts */}
      {!searchQuery && (
        <section className="space-y-4">
          <h2 className="text-lg font-semibold tracking-tight flex items-center gap-2">
            <Keyboard className="h-5 w-5 text-[hsl(var(--muted-foreground))]" />
            Raccourcis clavier
          </h2>
          <Card>
            <CardContent className="p-0">
              <div className="divide-y divide-[hsl(var(--border))]/50">
                {keyboardShortcuts.map((shortcut) => (
                  <div
                    key={shortcut.description}
                    className="flex items-center justify-between px-5 py-3"
                  >
                    <span className="text-sm">{shortcut.description}</span>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1">
                        {shortcut.keys.map((key) => (
                          <kbd
                            key={key}
                            className="inline-flex h-6 min-w-[24px] items-center justify-center rounded border border-[hsl(var(--border))] bg-[hsl(var(--muted))] px-1.5 text-xs font-medium text-[hsl(var(--muted-foreground))]"
                          >
                            {key}
                          </kbd>
                        ))}
                      </div>
                      <span className="text-xs text-[hsl(var(--muted-foreground))]">/</span>
                      <div className="flex items-center gap-1">
                        {shortcut.keysAlt.map((key) => (
                          <kbd
                            key={key}
                            className="inline-flex h-6 min-w-[24px] items-center justify-center rounded border border-[hsl(var(--border))] bg-[hsl(var(--muted))] px-1.5 text-xs font-medium text-[hsl(var(--muted-foreground))]"
                          >
                            {key}
                          </kbd>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>
      )}

      {/* Contact Support */}
      {!searchQuery && (
        <section className="space-y-4 pb-8">
          <h2 className="text-lg font-semibold tracking-tight">Besoin d&apos;aide supplémentaire ?</h2>
          <Card className="border-[hsl(var(--primary))]/20 bg-[hsl(var(--primary))]/5">
            <CardContent className="flex flex-col items-center gap-4 p-8 text-center sm:flex-row sm:text-left">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[hsl(var(--primary))]/10">
                <Mail className="h-6 w-6 text-[hsl(var(--primary))]" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold">Contacter le support</h3>
                <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">
                  Notre équipe est disponible pour répondre à toutes vos questions.
                </p>
              </div>
              <a
                href="mailto:support@atgform.com"
                className="inline-flex items-center gap-2 rounded-lg bg-[hsl(var(--primary))] px-5 py-2.5 text-sm font-medium text-[hsl(var(--primary-foreground))] transition-colors hover:bg-[hsl(var(--primary))]/90 active-press"
              >
                <Mail className="h-4 w-4" />
                support@atgform.com
              </a>
            </CardContent>
          </Card>
        </section>
      )}
    </PageShell>
  );
}
