import { Link } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  UploadCloud,
  MessagesSquare,
  GitCompareArrows,
  RadioTower,
  History,
  ArrowRight,
  Satellite,
  Waypoints,
  Map as MapIcon,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { DATA_SOURCES, SAMPLE_IMAGES } from "@/lib/eo-data";

const DASHBOARD_CARDS = [
  {
    to: "/analysis",
    icon: UploadCloud,
    title: "Upload EO Image",
    description: "Drag and drop optical, multispectral or SAR imagery for instant analysis.",
  },
  {
    to: "/chat",
    icon: MessagesSquare,
    title: "Ask AI",
    description: "Ask natural-language questions about any satellite scene.",
  },
  {
    to: "/change-detection",
    icon: GitCompareArrows,
    title: "Change Detection",
    description: "Compare before/after imagery and quantify surface change.",
  },
  {
    to: "/analysis",
    icon: RadioTower,
    title: "SAR Analysis",
    description: "All-weather radar analysis for flood, structural and landslide signals.",
  },
  {
    to: "/memory-graph",
    icon: Waypoints,
    title: "Geo-Trigger Memory Graph",
    description: "Trace how events evolve at a location over time.",
  },
  {
    to: "/history",
    icon: History,
    title: "Analysis History",
    description: "Review every past AI analysis and change-detection run.",
  },
];

const WORKFLOW_STEPS = [
  "Upload Satellite Image",
  "AI Vision Analysis",
  "Ask Natural-Language Question",
  "Detect Features",
  "Visual Overlay",
  "Compare Historical Image",
  "Detect Change",
  "Store in Memory Graph",
  "Generate Explainable Insight",
];

const STATS = [
  { label: "EO scenes indexed", value: "1,248" },
  { label: "Avg. analysis time", value: "2.1s" },
  { label: "Detection accuracy*", value: "94.2%" },
  { label: "Data sources ready", value: "6" },
];

export default function Index() {
  return (
    <Layout>
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-white/10">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-40 left-1/2 h-[36rem] w-[36rem] -translate-x-1/2 rounded-full bg-primary/10 blur-3xl" />
          <div className="absolute right-10 top-10 h-64 w-64 rounded-full border border-primary/20 animate-orbit" />
        </div>

        <div className="container relative py-20 md:py-28">
          <div className="mx-auto max-w-3xl text-center">
            <Badge
              variant="outline"
              className="mb-6 gap-1.5 border-primary/30 bg-primary/5 px-3 py-1 text-primary"
            >
              <Sparkles className="h-3 w-3" />
              Smart India Hackathon Prototype
            </Badge>
            <h1 className="font-display text-4xl font-bold tracking-tight text-foreground sm:text-6xl glow-text">
              VISION<span className="text-primary">-OSS</span>
            </h1>
            <p className="mt-4 text-lg font-medium text-primary/90 sm:text-xl">
              Multimodal AI for Earth Observation
            </p>
            <p className="mx-auto mt-5 max-w-2xl text-balance text-muted-foreground">
              Enhancing GPT-OSS with multimodal vision capabilities, extensible to ISRO Earth
              Observation data. Upload satellite imagery, ask questions in plain language, and get
              explainable, evidence-backed answers.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Button asChild size="lg" className="gap-2">
                <Link to="/analysis">
                  <UploadCloud className="h-4 w-4" />
                  Upload EO Image
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="gap-2 border-white/15">
                <Link to="/chat">
                  <MessagesSquare className="h-4 w-4" />
                  Ask AI
                </Link>
              </Button>
            </div>
          </div>

          {/* Satellite visual */}
          <div className="relative mx-auto mt-16 max-w-4xl">
            <div className="glass-panel scanline overflow-hidden">
              <div className="grid grid-cols-1 gap-px overflow-hidden rounded-2xl md:grid-cols-3">
                {SAMPLE_IMAGES.slice(0, 3).map((img) => (
                  <div key={img.id} className="group relative aspect-[4/3] overflow-hidden">
                    <img
                      src={img.thumbUrl}
                      alt={img.name}
                      className="h-full w-full object-cover opacity-80 transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/10 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-3">
                      <p className="font-mono-eo text-[10px] uppercase tracking-wider text-primary">
                        {img.dataType}
                      </p>
                      <p className="truncate text-xs text-foreground/90">{img.location}</p>
                    </div>
                    <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-primary shadow-[0_0_8px_2px] shadow-primary animate-pulse-slow" />
                  </div>
                ))}
              </div>
            </div>
            <Satellite className="absolute -right-4 -top-6 hidden h-10 w-10 text-primary/60 md:block" />
          </div>
        </div>
      </section>

      {/* Stats strip */}
      <section className="border-b border-white/10 bg-white/[0.02]">
        <div className="container grid grid-cols-2 gap-6 py-8 md:grid-cols-4">
          {STATS.map((s) => (
            <div key={s.label} className="text-center">
              <p className="font-display text-2xl font-bold text-primary sm:text-3xl">{s.value}</p>
              <p className="mt-1 text-xs text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </div>
        <p className="container pb-4 text-center text-[11px] text-muted-foreground/60">
          *Illustrative figures based on prototype demo data.
        </p>
      </section>

      {/* Dashboard cards */}
      <section className="container py-16">
        <div className="mb-10 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <h2 className="font-display text-2xl font-bold sm:text-3xl">Platform modules</h2>
            <p className="mt-2 max-w-xl text-muted-foreground">
              Everything needed to demo the full EO analysis workflow, end to end.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {DASHBOARD_CARDS.map((card) => (
            <Link key={card.title} to={card.to} className="glass-card group flex flex-col gap-4 p-6">
              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 text-primary ring-1 ring-primary/20">
                <card.icon className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-display text-lg font-semibold text-foreground">{card.title}</h3>
                <p className="mt-1.5 text-sm text-muted-foreground">{card.description}</p>
              </div>
              <span className="mt-auto flex items-center gap-1 text-sm font-medium text-primary opacity-80 transition-transform group-hover:translate-x-1">
                Open module <ArrowRight className="h-3.5 w-3.5" />
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Workflow */}
      <section className="border-y border-white/10 bg-white/[0.02] py-16">
        <div className="container">
          <div className="mb-10 text-center">
            <h2 className="font-display text-2xl font-bold sm:text-3xl">Main demo workflow</h2>
            <p className="mx-auto mt-2 max-w-2xl text-muted-foreground">
              A single connected pipeline from raw imagery to explainable insight.
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-2">
            {WORKFLOW_STEPS.map((step, i) => (
              <div key={step} className="flex items-center gap-2">
                <div className="flex items-center gap-2 rounded-full border border-white/10 bg-card px-4 py-2 text-xs font-medium text-foreground/90 sm:text-sm">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/15 text-[10px] font-bold text-primary">
                    {i + 1}
                  </span>
                  {step}
                </div>
                {i < WORKFLOW_STEPS.length - 1 && (
                  <ArrowRight className="hidden h-3.5 w-3.5 text-muted-foreground/50 sm:block" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* EO Data Integration Layer */}
      <section className="container py-16">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <Badge variant="outline" className="mb-4 gap-1.5 border-primary/30 bg-primary/5 text-primary">
              <ShieldCheck className="h-3 w-3" />
              Data Integration Layer
            </Badge>
            <h2 className="font-display text-2xl font-bold sm:text-3xl">Built for real ISRO EO data</h2>
            <p className="mt-3 text-muted-foreground">
              The prototype runs on realistic mock EO data through a modular API service layer.
              Every module is designed so production ISRO/NRSC data sources can be connected
              without changing the frontend.
            </p>
            <div className="mt-6 flex gap-3">
              <Button asChild variant="outline" className="gap-2 border-white/15">
                <Link to="/about">
                  <MapIcon className="h-4 w-4" />
                  View architecture
                </Link>
              </Button>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:col-span-3">
            {DATA_SOURCES.map((source) => (
              <div key={source.id} className="glass-card flex items-start gap-3 p-4">
                <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-warning shadow-[0_0_6px_1px] shadow-warning" />
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-foreground">{source.name}</p>
                    <Badge variant="outline" className="border-white/15 text-[10px] uppercase text-muted-foreground">
                      {source.status}
                    </Badge>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">{source.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
}
