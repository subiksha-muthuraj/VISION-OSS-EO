import { useMemo, useRef, useState, type ComponentType, type ReactNode } from "react";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import {
  EOImage,
  EXAMPLE_QUESTIONS,
  ExplainableAnswer,
  OVERLAY_DEFS,
  OverlayKey,
  SAMPLE_IMAGES,
  SensorType,
  askVisionOSS,
  getDetectionsForImage,
} from "@/lib/eo-data";
import {
  UploadCloud,
  ImageOff,
  SendHorizonal,
  Loader2,
  Sparkles,
  Radar,
  Satellite,
  Layers,
  MapPin,
  CalendarDays,
  Gauge,
  Database,
  AlertTriangle,
  Eye,
  ListChecks,
  Compass,
} from "lucide-react";

interface ChatMessage {
  role: "user" | "ai";
  text?: string;
  answer?: ExplainableAnswer;
}

const MODES: SensorType[] = ["Optical", "Multispectral", "SAR", "Multimodal"];

export default function Analysis() {
  const [image, setImage] = useState<EOImage | null>(SAMPLE_IMAGES[0]);
  const [mode, setMode] = useState<SensorType>("Optical");
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [overlays, setOverlays] = useState<Record<OverlayKey, boolean>>({
    buildings: true,
    water: true,
    vegetation: false,
    roads: false,
    changed: false,
    disaster: false,
    heatmap: false,
  });
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const detections = useMemo(() => (image ? getDetectionsForImage(image) : null), [image]);
  const lastAnswer = [...messages].reverse().find((m) => m.answer)?.answer;

  function handleFiles(files: FileList | null) {
    setUploadError(null);
    if (!files || files.length === 0) return;
    const file = files[0];
    const valid = ["image/jpeg", "image/png", "image/tiff", "image/webp"];
    if (!valid.includes(file.type) && !file.name.match(/\.(tif|tiff)$/i)) {
      setUploadError("Unsupported file type. Please upload a JPG, PNG, WEBP or TIFF satellite image.");
      return;
    }
    if (file.size > 25 * 1024 * 1024) {
      setUploadError("File too large. Maximum size is 25MB.");
      return;
    }
    const url = URL.createObjectURL(file);
    setImage({
      id: `upload-${Date.now()}`,
      name: file.name,
      url,
      thumbUrl: url,
      location: "Unknown (uploaded scene)",
      coords: { lat: 0, lng: 0 },
      acquisitionDate: new Date().toISOString().slice(0, 10),
      sensor: "User Upload",
      mission: "Custom",
      resolution: "Unknown",
      dataType: mode,
    });
    setMessages([]);
  }

  async function handleAsk(q?: string) {
    const text = (q ?? question).trim();
    if (!text || !image) return;
    setQuestion("");
    setMessages((m) => [...m, { role: "user", text }]);
    setLoading(true);
    try {
      const answer = await askVisionOSS(image, text);
      setMessages((m) => [...m, { role: "ai", answer }]);
      setOverlays((prev) => ({
        ...prev,
        changed: /change|compare|previous/i.test(text) ? true : prev.changed,
        water: /flood|water/i.test(text) ? true : prev.water,
        vegetation: /vegetation|crop/i.test(text) ? true : prev.vegetation,
        buildings: /built|urban|construction/i.test(text) ? true : prev.buildings,
        disaster: /landslide|disaster|risk/i.test(text) ? true : prev.disaster,
      }));
    } catch {
      setMessages((m) => [
        ...m,
        { role: "ai", text: "Sorry, the analysis service is unavailable right now. Please try again." },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Layout>
      <div className="container py-10">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <Badge variant="outline" className="mb-3 gap-1.5 border-primary/30 bg-primary/5 text-primary">
              <Sparkles className="h-3 w-3" />
              EO Vision Analysis
            </Badge>
            <h1 className="font-display text-3xl font-bold sm:text-4xl">EO Image Analysis</h1>
            <p className="mt-2 max-w-xl text-muted-foreground">
              Upload a satellite scene, choose a sensing mode, then ask questions in plain language.
            </p>
          </div>

          <div className="glass-card flex items-center gap-1 p-1">
            {MODES.map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={cn(
                  "rounded-lg px-3 py-2 text-xs font-medium transition-colors sm:text-sm",
                  mode === m ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground",
                )}
              >
                {m}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Left column: upload + samples + metadata */}
          <div className="flex flex-col gap-6 lg:col-span-1">
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragOver(false);
                handleFiles(e.dataTransfer.files);
              }}
              className={cn(
                "glass-panel flex flex-col items-center justify-center gap-3 border-dashed p-8 text-center transition-colors",
                dragOver ? "border-primary/60 bg-primary/5" : "border-white/15",
              )}
            >
              <UploadCloud className="h-8 w-8 text-primary" />
              <div>
                <p className="text-sm font-medium text-foreground">Drag & drop a satellite image</p>
                <p className="mt-1 text-xs text-muted-foreground">Optical, multispectral or SAR · JPG, PNG, TIFF up to 25MB</p>
              </div>
              <Button size="sm" variant="outline" className="border-white/15" onClick={() => fileInputRef.current?.click()}>
                Browse files
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,.tif,.tiff"
                className="hidden"
                onChange={(e) => handleFiles(e.target.files)}
              />
              {uploadError && (
                <p className="flex items-center gap-1.5 text-xs text-destructive">
                  <AlertTriangle className="h-3.5 w-3.5" /> {uploadError}
                </p>
              )}
            </div>

            <div className="glass-card p-4">
              <p className="mb-3 flex items-center gap-1.5 text-sm font-semibold text-foreground">
                <Database className="h-4 w-4 text-primary" /> Sample datasets
              </p>
              <div className="grid grid-cols-3 gap-2">
                {SAMPLE_IMAGES.map((img) => (
                  <button
                    key={img.id}
                    onClick={() => {
                      setImage(img);
                      setMode(img.dataType);
                      setMessages([]);
                      setUploadError(null);
                    }}
                    className={cn(
                      "group relative aspect-square overflow-hidden rounded-lg ring-1 ring-white/10 transition-all",
                      image?.id === img.id && "ring-2 ring-primary",
                    )}
                    title={img.name}
                  >
                    <img src={img.thumbUrl} alt={img.name} className="h-full w-full object-cover" />
                    <span className="absolute inset-0 bg-background/0 transition-colors group-hover:bg-background/20" />
                  </button>
                ))}
              </div>
            </div>

            {image ? (
              <div className="glass-card p-4">
                <p className="mb-3 flex items-center gap-1.5 text-sm font-semibold text-foreground">
                  <Layers className="h-4 w-4 text-primary" /> Scene metadata
                </p>
                <dl className="space-y-2.5 text-sm">
                  <MetaRow icon={MapPin} label="Location" value={image.location} />
                  <MetaRow icon={CalendarDays} label="Acquisition date" value={image.acquisitionDate} />
                  <MetaRow icon={Satellite} label="Sensor" value={`${image.sensor} (${image.mission})`} />
                  <MetaRow icon={Gauge} label="Resolution" value={image.resolution} />
                  <MetaRow icon={Radar} label="Data type" value={image.dataType} />
                </dl>
              </div>
            ) : (
              <div className="glass-card flex flex-col items-center gap-2 p-8 text-center text-muted-foreground">
                <ImageOff className="h-6 w-6" />
                <p className="text-sm">No image selected</p>
              </div>
            )}
          </div>

          {/* Middle column: image + overlays */}
          <div className="flex flex-col gap-6 lg:col-span-1">
            <div className="glass-panel scanline overflow-hidden">
              <div className="relative aspect-square w-full bg-black/40">
                {image ? (
                  <>
                    <img src={image.url} alt={image.name} className="h-full w-full object-cover" />
                    {detections &&
                      OVERLAY_DEFS.map(
                        (def) =>
                          overlays[def.key] &&
                          detections[def.key].map((box, i) => (
                            <div
                              key={`${def.key}-${i}`}
                              className="absolute rounded-sm border-2"
                              style={{
                                left: `${box.x * 100}%`,
                                top: `${box.y * 100}%`,
                                width: `${box.w * 100}%`,
                                height: `${box.h * 100}%`,
                                borderColor: def.color,
                                boxShadow: def.key === "heatmap" ? `0 0 20px 4px ${def.color}55` : undefined,
                                background: def.key === "heatmap" ? `${def.color}22` : "transparent",
                              }}
                            >
                              <span
                                className="absolute -top-5 left-0 whitespace-nowrap rounded px-1.5 py-0.5 text-[10px] font-mono-eo text-background"
                                style={{ backgroundColor: def.color }}
                              >
                                {box.label}
                              </span>
                            </div>
                          )),
                      )}
                  </>
                ) : (
                  <div className="flex h-full items-center justify-center text-muted-foreground">
                    <ImageOff className="h-8 w-8" />
                  </div>
                )}
              </div>
            </div>

            <div className="glass-card p-4">
              <p className="mb-3 flex items-center gap-1.5 text-sm font-semibold text-foreground">
                <Eye className="h-4 w-4 text-primary" /> Visual overlays
              </p>
              <div className="space-y-2.5">
                {OVERLAY_DEFS.map((def) => (
                  <div key={def.key} className="flex items-center justify-between">
                    <span className="flex items-center gap-2 text-sm text-foreground/90">
                      <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: def.color }} />
                      {def.label}
                    </span>
                    <Switch
                      checked={overlays[def.key]}
                      onCheckedChange={(v) => setOverlays((prev) => ({ ...prev, [def.key]: v }))}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right column: chat + explainability */}
          <div className="flex flex-col gap-6 lg:col-span-1">
            <div className="glass-panel flex h-[420px] flex-col">
              <div className="flex items-center gap-2 border-b border-white/10 px-4 py-3">
                <Sparkles className="h-4 w-4 text-primary" />
                <p className="text-sm font-semibold text-foreground">Ask anything about this satellite image…</p>
              </div>
              <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
                {messages.length === 0 && (
                  <div className="flex flex-wrap gap-2">
                    {EXAMPLE_QUESTIONS.map((q) => (
                      <button
                        key={q}
                        onClick={() => handleAsk(q)}
                        className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                )}
                {messages.map((m, i) => (
                  <div key={i} className={cn("flex", m.role === "user" ? "justify-end" : "justify-start")}>
                    {m.role === "user" ? (
                      <div className="max-w-[85%] rounded-2xl rounded-br-sm bg-primary/15 px-3.5 py-2 text-sm text-foreground">
                        {m.text}
                      </div>
                    ) : (
                      <div className="max-w-[90%] rounded-2xl rounded-bl-sm border border-white/10 bg-white/[0.04] px-3.5 py-2.5 text-sm text-foreground/90">
                        <p>{m.answer ? m.answer.observation : m.text}</p>
                        {m.answer && (
                          <div className="mt-2 flex items-center gap-2">
                            <Badge variant="outline" className="border-primary/30 text-primary">
                              {Math.round(m.answer.confidence * 100)}% confidence
                            </Badge>
                            <div className="flex flex-wrap gap-1">
                              {m.answer.detectedFeatures.slice(0, 3).map((f) => (
                                <Badge key={f} variant="secondary" className="text-[10px]">
                                  {f}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
                {loading && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" /> Analyzing scene…
                  </div>
                )}
              </div>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleAsk();
                }}
                className="flex items-center gap-2 border-t border-white/10 p-3"
              >
                <input
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="Ask anything about this satellite image…"
                  className="h-10 flex-1 rounded-lg border border-white/10 bg-white/5 px-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary/50 focus:outline-none"
                />
                <Button type="submit" size="icon" disabled={!question.trim() || loading}>
                  <SendHorizonal className="h-4 w-4" />
                </Button>
              </form>
            </div>

            {/* Explainable AI panel */}
            <div className="glass-card p-4">
              <p className="mb-3 flex items-center gap-1.5 text-sm font-semibold text-foreground">
                <ListChecks className="h-4 w-4 text-primary" /> Explainable AI panel
              </p>
              {lastAnswer ? (
                <div className="space-y-3 text-sm">
                  <ExplainRow label="Evidence from image">
                    <ul className="mt-1 list-disc space-y-1 pl-4 text-foreground/80">
                      {lastAnswer.evidence.map((e) => (
                        <li key={e}>{e}</li>
                      ))}
                    </ul>
                  </ExplainRow>
                  <ExplainRow label="Detected region">
                    <span className="flex items-center gap-1.5 text-foreground/80">
                      <Compass className="h-3.5 w-3.5 text-primary" /> {lastAnswer.detectedRegion}
                    </span>
                  </ExplainRow>
                  <ExplainRow label="Reasoning summary">
                    <p className="text-foreground/80">{lastAnswer.reasoningSummary}</p>
                  </ExplainRow>
                  <ExplainRow label="Recommended next analysis">
                    <p className="text-primary/90">{lastAnswer.recommendedNextAnalysis}</p>
                  </ExplainRow>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Ask a question above to see observation evidence, confidence and reasoning here.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

function MetaRow({
  icon: Icon,
  label,
  value,
}: {
  icon: ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="flex items-center gap-1.5 text-muted-foreground">
        <Icon className="h-3.5 w-3.5" /> {label}
      </span>
      <span className="text-right font-medium text-foreground">{value}</span>
    </div>
  );
}

function ExplainRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</p>
      <div className="mt-1">{children}</div>
    </div>
  );
}
