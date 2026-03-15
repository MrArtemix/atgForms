"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { PageShell, PageHeader } from "@/components/layout/page-shell";
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
  ChevronRight,
} from "lucide-react";

// --- Data ---

const quickStartCards = [
  {
    title: "Créer une filiale",
    description:
      "Commencez par créer votre première filiale pour organiser vos projets et formulaires.",
    href: "/filiales",
    icon: Building2,
  },
  {
    title: "Créer un formulaire",
    description:
      "Depuis une filiale, créez un projet puis ajoutez-y vos formulaires avec le builder drag-and-drop.",
    href: "/filiales",
    icon: FileText,
  },
  {
    title: "Analyser les réponses",
    description:
      "Consultez les graphiques, exportez en Excel ou PDF et filtrez les données collectées.",
    href: "/filiales",
    icon: BarChart3,
  },
];

const featureGuides = [
  {
    title: "Constructeur de formulaires",
    icon: Blocks,
    color: "text-blue-500 bg-blue-500/10",
    points: [
      "18 types de champs disponibles",
      "Drag-and-drop intuitif",
      "Support multi-pages",
      "Prévisualisation en temps réel",
    ],
  },
  {
    title: "Logique conditionnelle",
    icon: GitBranch,
    color: "text-purple-500 bg-purple-500/10",
    points: [
      "Conditions AND / OR",
      "12 opérateurs de comparaison",
      "Affichage / masquage de champs",
      "Chaînage de conditions",
    ],
  },
  {
    title: "Thèmes et personnalisation",
    icon: Palette,
    color: "text-pink-500 bg-pink-500/10",
    points: [
      "Couleurs personnalisables",
      "Choix de polices",
      "CSS custom avancé",
      "Prévisualisation instantanée",
    ],
  },
  {
    title: "Partage et intégration",
    icon: Share2,
    color: "text-green-500 bg-green-500/10",
    points: [
      "Lien public /f/slug",
      "Intégration iframe (embed)",
      "QR code généré automatiquement",
      "Contrôle d'accès",
    ],
  },
  {
    title: "Analytics et exports",
    icon: PieChart,
    color: "text-orange-500 bg-orange-500/10",
    points: [
      "Graphiques interactifs (Recharts)",
      "Export Excel (.xlsx)",
      "Export PDF",
      "Filtres avancés",
    ],
  },
  {
    title: "Gestion d'équipe",
    icon: Users,
    color: "text-teal-500 bg-teal-500/10",
    points: [
      "Holdings et filiales",
      "Projets par filiale",
      "Rôles et permissions",
      "Invitations par email",
    ],
  },
];

const faqItems = [
  {
    question: "Comment créer un formulaire ?",
    answer:
      "Rendez-vous dans une filiale, puis ouvrez un projet. Cliquez sur \"Nouveau formulaire\" pour accéder au builder. Glissez-déposez les champs depuis la palette à gauche vers le canvas central, puis configurez chaque champ via le panneau de propriétés à droite.",
  },
  {
    question: "Comment ajouter de la logique conditionnelle ?",
    answer:
      "Dans le builder, sélectionnez un champ puis ouvrez l'onglet \"Logique\" dans le panneau de propriétés. Vous pouvez définir des conditions AND/OR avec 12 opérateurs différents pour afficher ou masquer des champs selon les réponses de l'utilisateur.",
  },
  {
    question: "Comment partager un formulaire ?",
    answer:
      "Une fois votre formulaire publié, vous obtenez un lien public de la forme /f/votre-slug. Partagez ce lien directement ou utilisez le QR code généré automatiquement. Vous pouvez aussi contrôler l'accès au formulaire depuis les paramètres.",
  },
  {
    question: "Comment intégrer un formulaire sur mon site ?",
    answer:
      "Utilisez l'URL d'embed /embed/votre-slug dans une balise iframe sur votre site web. Le formulaire s'adaptera automatiquement à la taille du conteneur. Exemple : <iframe src=\"https://votredomaine.com/embed/slug\" width=\"100%\" height=\"600\"></iframe>",
  },
  {
    question: "Comment exporter les réponses ?",
    answer:
      "Accédez à la page d'analytics de votre formulaire. Vous trouverez les boutons d'export en haut à droite : export Excel (.xlsx) pour les données tabulaires et export PDF pour un rapport visuel. Vous pouvez aussi filtrer les données avant l'export.",
  },
  {
    question: "Comment inviter des membres dans un projet ?",
    answer:
      "Ouvrez le projet concerné et accédez à la section membres. Cliquez sur \"Inviter\" et saisissez l'adresse email du collaborateur. Il recevra une invitation par email et pourra rejoindre le projet avec le rôle que vous aurez défini.",
  },
  {
    question: "Quels types de champs sont disponibles ?",
    answer:
      "ATGForm propose 18 types de champs : texte court, texte long, email, téléphone, nombre, date, heure, sélection unique, sélection multiple, liste déroulante, case à cocher, évaluation (étoiles), échelle linéaire, upload de fichier, signature, section, séparateur et champ caché.",
  },
  {
    question: "Comment personnaliser le thème d'un formulaire ?",
    answer:
      "Dans le builder, ouvrez les paramètres du formulaire et accédez à la section \"Thème\". Vous pouvez modifier les couleurs principales, choisir une police, ajuster les arrondis et même ajouter du CSS personnalisé pour un contrôle total sur l'apparence.",
  },
  {
    question: "Comment dupliquer un formulaire ?",
    answer:
      "Sur la carte du formulaire, cliquez sur le menu \"...\" et sélectionnez \"Dupliquer\". Une copie sera créée dans le même projet avec le suffixe \"(copie)\". Tous les champs, la logique conditionnelle et le thème seront dupliqués.",
  },
  {
    question: "Les données sont-elles sécurisées ?",
    answer:
      "Oui. ATGForm utilise Supabase avec des politiques RLS (Row Level Security) pour garantir que chaque utilisateur n'accède qu'à ses propres données. Les communications sont chiffrées via HTTPS et l'authentification supporte OAuth et les mots de passe sécurisés.",
  },
  {
    question: "Comment supprimer un formulaire ou un projet ?",
    answer:
      "Pour supprimer un formulaire, ouvrez son menu contextuel (\"...\") et sélectionnez \"Supprimer\". Pour un projet, rendez-vous dans ses paramètres. Attention : la suppression est définitive et inclut toutes les réponses associées.",
  },
  {
    question: "Comment contacter le support ?",
    answer:
      "Vous pouvez nous contacter par email à support@atgform.com. Nous répondons généralement sous 24 heures ouvrées. Pour les problèmes urgents, précisez \"URGENT\" dans l'objet de votre email.",
  },
];

const shortcuts = [
  { keys: ["⌘ K", "Ctrl K"], description: "Palette de commandes" },
  { keys: ["⌘ N"], description: "Nouveau formulaire" },
  { keys: ["⌘ Z"], description: "Annuler (dans le builder)" },
  { keys: ["⌘ ⇧ Z"], description: "Rétablir (dans le builder)" },
];

// --- Component ---

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
        description="Tout ce dont vous avez besoin pour tirer le meilleur parti d'ATGForm."
      />

      {/* Search */}
      <div className="relative max-w-xl animate-fade-in-up animate-stagger-1">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[hsl(var(--muted-foreground))]" />
        <Input
          placeholder="Rechercher dans l'aide..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Quick Start */}
      {!searchQuery && (
        <section className="space-y-4 animate-fade-in-up animate-stagger-2">
          <h2 className="text-lg font-semibold tracking-tight">
            Démarrage rapide
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {quickStartCards.map((card) => (
              <Link key={card.title} href={card.href} className="group">
                <Card className="h-full transition-all duration-200 hover-lift hover:border-[hsl(var(--primary))]/30">
                  <CardHeader className="flex flex-row items-start gap-3 pb-2">
                    <div className="rounded-lg bg-[hsl(var(--primary))]/10 p-2">
                      <card.icon className="h-5 w-5 text-[hsl(var(--primary))]" />
                    </div>
                    <CardTitle className="text-base">{card.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-[hsl(var(--muted-foreground))]">
                      {card.description}
                    </p>
                    <span className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-[hsl(var(--primary))] opacity-0 transition-opacity group-hover:opacity-100">
                      En savoir plus
                      <ArrowRight className="h-3.5 w-3.5" />
                    </span>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Feature Guides */}
      {!searchQuery && (
        <section className="space-y-4 animate-fade-in-up animate-stagger-3">
          <h2 className="text-lg font-semibold tracking-tight">
            Guides des fonctionnalités
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {featureGuides.map((guide) => (
              <Card key={guide.title} className="hover-lift transition-all duration-200">
                <CardHeader className="flex flex-row items-start gap-3 pb-2">
                  <div className={`rounded-lg p-2 ${guide.color}`}>
                    <guide.icon className="h-5 w-5" />
                  </div>
                  <CardTitle className="text-base">{guide.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-1.5">
                    {guide.points.map((point) => (
                      <li
                        key={point}
                        className="flex items-center gap-2 text-sm text-[hsl(var(--muted-foreground))]"
                      >
                        <ChevronRight className="h-3 w-3 shrink-0 text-[hsl(var(--primary))]" />
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
      <section className="space-y-4 animate-fade-in-up animate-stagger-4">
        <h2 className="text-lg font-semibold tracking-tight">
          Questions fréquentes
        </h2>
        {filteredFaq.length > 0 ? (
          <Card>
            <CardContent className="p-2">
              <Accordion type="single" collapsible className="w-full">
                {filteredFaq.map((item, index) => (
                  <AccordionItem key={index} value={`faq-${index}`}>
                    <AccordionTrigger className="text-left text-sm">
                      {item.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-[hsl(var(--muted-foreground))]">
                      {item.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="py-8 text-center">
              <p className="text-sm text-[hsl(var(--muted-foreground))]">
                Aucun résultat pour &quot;{searchQuery}&quot;
              </p>
            </CardContent>
          </Card>
        )}
      </section>

      {/* Keyboard Shortcuts */}
      {!searchQuery && (
        <section className="space-y-4 animate-fade-in-up animate-stagger-5">
          <h2 className="text-lg font-semibold tracking-tight">
            Raccourcis clavier
          </h2>
          <Card>
            <CardContent className="p-0">
              <div className="divide-y divide-[hsl(var(--border))]/50">
                {shortcuts.map((shortcut) => (
                  <div
                    key={shortcut.description}
                    className="flex items-center justify-between px-4 py-3"
                  >
                    <span className="text-sm">
                      {shortcut.description}
                    </span>
                    <div className="flex items-center gap-2">
                      {shortcut.keys.map((key) => (
                        <kbd
                          key={key}
                          className="rounded-md border border-[hsl(var(--border))] bg-[hsl(var(--muted))] px-2 py-1 text-xs font-mono text-[hsl(var(--muted-foreground))]"
                        >
                          {key}
                        </kbd>
                      ))}
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
        <section className="animate-fade-in-up animate-stagger-6">
          <Card className="border-[hsl(var(--primary))]/20 bg-[hsl(var(--primary))]/5">
            <CardContent className="flex flex-col items-center gap-4 py-8 text-center sm:flex-row sm:text-left">
              <div className="rounded-full bg-[hsl(var(--primary))]/10 p-3">
                <Mail className="h-6 w-6 text-[hsl(var(--primary))]" />
              </div>
              <div className="flex-1 space-y-1">
                <h3 className="font-semibold">Besoin d'aide supplémentaire ?</h3>
                <p className="text-sm text-[hsl(var(--muted-foreground))]">
                  Notre équipe support est disponible pour répondre à toutes vos
                  questions.
                </p>
              </div>
              <a
                href="mailto:support@atgform.com"
                className="inline-flex items-center gap-2 rounded-lg bg-[hsl(var(--primary))] px-4 py-2.5 text-sm font-medium text-[hsl(var(--primary-foreground))] transition-colors hover:bg-[hsl(var(--primary))]/90"
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
