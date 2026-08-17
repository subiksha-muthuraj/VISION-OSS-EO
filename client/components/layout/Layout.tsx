import { Link, useLocation } from "react-router-dom";
import { PropsWithChildren, useState } from "react";
import {
  Satellite,
  Menu,
  X,
  LayoutDashboard,
  ScanSearch,
  MessagesSquare,
  GitCompareArrows,
  Waypoints,
  Map as MapIcon,
  History,
  Info,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/analysis", label: "EO Analysis", icon: ScanSearch },
  { to: "/chat", label: "AI Chat", icon: MessagesSquare },
  { to: "/change-detection", label: "Change Detection", icon: GitCompareArrows },
  { to: "/memory-graph", label: "Memory Graph", icon: Waypoints },
  { to: "/map", label: "Geo Query Map", icon: MapIcon },
  { to: "/history", label: "History", icon: History },
  { to: "/about", label: "About", icon: Info },
];

export default function Layout({ children }: PropsWithChildren) {
  const location = useLocation();
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen grid-overlay">
      <header className="sticky top-0 z-50 border-b border-white/10 bg-background/80 backdrop-blur-xl">
        <div className="container flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5 shrink-0" onClick={() => setOpen(false)}>
            <span className="relative flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 ring-1 ring-primary/40">
              <Satellite className="h-4.5 w-4.5 text-primary" />
              <span className="absolute inset-0 rounded-lg bg-primary/20 blur-md animate-pulse-slow" />
            </span>
            <span className="font-display text-lg font-bold tracking-wide text-foreground">
              VISION<span className="text-primary">-OSS</span>
            </span>
          </Link>

          <nav className="hidden items-center gap-1 xl:flex">
            {NAV_LINKS.map((link) => {
              const active = location.pathname === link.to;
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className={cn(
                    "flex items-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                    active
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-white/5 hover:text-foreground",
                  )}
                >
                  <link.icon className="h-3.5 w-3.5" />
                  {link.label}
                </Link>
              );
            })}
          </nav>

          <button
            className="flex h-9 w-9 items-center justify-center rounded-md text-foreground xl:hidden"
            onClick={() => setOpen((o) => !o)}
            aria-label="Toggle menu"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {open && (
          <nav className="border-t border-white/10 px-4 py-3 xl:hidden">
            <div className="flex flex-col gap-1">
              {NAV_LINKS.map((link) => {
                const active = location.pathname === link.to;
                return (
                  <Link
                    key={link.to}
                    to={link.to}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium",
                      active
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:bg-white/5 hover:text-foreground",
                    )}
                  >
                    <link.icon className="h-4 w-4" />
                    {link.label}
                  </Link>
                );
              })}
            </div>
          </nav>
        )}
      </header>

      <main>{children}</main>

      <footer className="border-t border-white/10 py-8">
        <div className="container flex flex-col items-center justify-between gap-4 text-sm text-muted-foreground md:flex-row">
          <p>
            VISION-OSS — Multimodal AI for Earth Observation. Built for Smart India Hackathon.
          </p>
          <p className="font-mono-eo text-xs">
            Prototype data layer · ISRO / Bhuvan / Bhoonidhi ready
          </p>
        </div>
      </footer>
    </div>
  );
}
