// Mock EO (Earth Observation) data + simulated AI service layer for the VISION-OSS prototype.
// This module is the single seam where real ISRO/Bhuvan/Bhoonidhi/Cartosat/Resourcesat/RISAT
// APIs can be wired in later without touching UI components.

export type SensorType = "Optical" | "Multispectral" | "SAR" | "Multimodal";

export interface EOImage {
  id: string;
  name: string;
  url: string;
  thumbUrl: string;
  location: string;
  coords: { lat: number; lng: number };
  acquisitionDate: string;
  sensor: string;
  mission: string;
  resolution: string;
  dataType: SensorType;
}

export const SAMPLE_IMAGES: EOImage[] = [
  {
    id: "eo-001",
    name: "Godavari Delta – Optical",
    url: "https://images.unsplash.com/photo-1614730321146-b6fa6a46bcb4?w=1200&q=80",
    thumbUrl: "https://images.unsplash.com/photo-1614730321146-b6fa6a46bcb4?w=300&q=60",
    location: "Godavari Delta, Andhra Pradesh",
    coords: { lat: 16.9, lng: 81.78 },
    acquisitionDate: "2024-08-12",
    sensor: "Cartosat-3",
    mission: "Cartosat",
    resolution: "0.25 m/px",
    dataType: "Optical",
  },
  {
    id: "eo-002",
    name: "Kaziranga Flood Extent",
    url: "https://images.unsplash.com/photo-1610296669228-602fa827fc1f?w=1200&q=80",
    thumbUrl: "https://images.unsplash.com/photo-1610296669228-602fa827fc1f?w=300&q=60",
    location: "Kaziranga, Assam",
    coords: { lat: 26.58, lng: 93.17 },
    acquisitionDate: "2024-07-03",
    sensor: "RISAT-1A",
    mission: "RISAT",
    resolution: "3 m/px",
    dataType: "SAR",
  },
  {
    id: "eo-003",
    name: "Aravalli Vegetation Index",
    url: "https://images.unsplash.com/photo-1502472584811-0a2f2feb8968?w=1200&q=80",
    thumbUrl: "https://images.unsplash.com/photo-1502472584811-0a2f2feb8968?w=300&q=60",
    location: "Aravalli Range, Rajasthan",
    coords: { lat: 24.6, lng: 73.7 },
    acquisitionDate: "2024-05-21",
    sensor: "Resourcesat-2A",
    mission: "Resourcesat",
    resolution: "5.8 m/px",
    dataType: "Multispectral",
  },
  {
    id: "eo-004",
    name: "Mumbai Coastal Built-up",
    url: "https://images.unsplash.com/photo-1444723121867-7a241cacace9?w=1200&q=80",
    thumbUrl: "https://images.unsplash.com/photo-1444723121867-7a241cacace9?w=300&q=60",
    location: "Mumbai Coastline, Maharashtra",
    coords: { lat: 19.07, lng: 72.87 },
    acquisitionDate: "2024-09-02",
    sensor: "Cartosat-3",
    mission: "Cartosat",
    resolution: "0.25 m/px",
    dataType: "Optical",
  },
  {
    id: "eo-005",
    name: "Himalayan Slope – Landslide Watch",
    url: "https://images.unsplash.com/photo-1483729558449-99ef09a8c325?w=1200&q=80",
    thumbUrl: "https://images.unsplash.com/photo-1483729558449-99ef09a8c325?w=300&q=60",
    location: "Chamoli, Uttarakhand",
    coords: { lat: 30.4, lng: 79.55 },
    acquisitionDate: "2024-06-18",
    sensor: "RISAT-1A",
    mission: "EOS",
    resolution: "1 m/px",
    dataType: "SAR",
  },
  {
    id: "eo-006",
    name: "Sundarbans Mangrove Cover",
    url: "https://images.unsplash.com/photo-1500534623283-312aade485b7?w=1200&q=80",
    thumbUrl: "https://images.unsplash.com/photo-1500534623283-312aade485b7?w=300&q=60",
    location: "Sundarbans, West Bengal",
    coords: { lat: 21.95, lng: 88.9 },
    acquisitionDate: "2024-04-11",
    sensor: "Resourcesat-2A",
    mission: "Bhuvan",
    resolution: "5.8 m/px",
    dataType: "Multimodal",
  },
];

export type OverlayKey =
  | "buildings"
  | "water"
  | "vegetation"
  | "roads"
  | "changed"
  | "disaster"
  | "heatmap";

export interface OverlayDef {
  key: OverlayKey;
  label: string;
  color: string;
}

export const OVERLAY_DEFS: OverlayDef[] = [
  { key: "buildings", label: "Detected Buildings", color: "#38bdf8" },
  { key: "water", label: "Water Bodies", color: "#22d3ee" },
  { key: "vegetation", label: "Vegetation", color: "#34d399" },
  { key: "roads", label: "Roads", color: "#fbbf24" },
  { key: "changed", label: "Changed Regions", color: "#f472b6" },
  { key: "disaster", label: "Possible Disaster Zones", color: "#f87171" },
  { key: "heatmap", label: "Attention Heatmap", color: "#a78bfa" },
];

// Normalized [0-1] bounding boxes per overlay, per image, so they can be drawn
// as absolutely-positioned divs over the rendered image regardless of size.
export interface DetectionBox {
  x: number;
  y: number;
  w: number;
  h: number;
  label: string;
}

export function getDetectionsForImage(
  image: EOImage,
): Record<OverlayKey, DetectionBox[]> {
  const seed = hashSeed(image.id);
  return {
    buildings: mockBoxes(seed + 1, 3, "Structure"),
    water: mockBoxes(seed + 2, 2, "Water"),
    vegetation: mockBoxes(seed + 3, 3, "Vegetation"),
    roads: mockBoxes(seed + 4, 2, "Road segment"),
    changed: image.dataType === "SAR" ? mockBoxes(seed + 5, 2, "Change") : mockBoxes(seed + 5, 1, "Change"),
    disaster:
      image.dataType === "SAR"
        ? mockBoxes(seed + 6, 1, "Risk zone")
        : [],
    heatmap: mockBoxes(seed + 7, 4, "Attention"),
  };
}

function hashSeed(id: string) {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  return h;
}

function mulberry32(seed: number) {
  let a = seed;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function mockBoxes(seed: number, count: number, label: string): DetectionBox[] {
  const rand = mulberry32(seed);
  return Array.from({ length: count }).map((_, i) => {
    const w = 0.1 + rand() * 0.22;
    const h = 0.08 + rand() * 0.18;
    return {
      x: rand() * (1 - w),
      y: rand() * (1 - h),
      w,
      h,
      label: `${label} ${i + 1}`,
    };
  });
}

export interface ExplainableAnswer {
  question: string;
  observation: string;
  evidence: string[];
  confidence: number;
  detectedRegion: string;
  reasoningSummary: string;
  recommendedNextAnalysis: string;
  detectedFeatures: string[];
}

const RESPONSE_LIBRARY: { match: RegExp; build: (img: EOImage) => Omit<ExplainableAnswer, "question"> }[] = [
  {
    match: /flood/i,
    build: (img) => ({
      observation:
        "Elevated surface water extent is visible along low-lying areas, consistent with flood inundation.",
      evidence: [
        "Increased backscatter/reflectance in river-adjacent pixels",
        "Smooth, dark texture typical of standing water",
        "Water boundary extends beyond the mapped riverbank",
      ],
      confidence: 0.86,
      detectedRegion: `Northern floodplain near ${img.location}`,
      reasoningSummary:
        "Water bodies show a distinct spectral/backscatter signature compared to surrounding land, and the detected extent exceeds the historical water mask for this location.",
      recommendedNextAnalysis: "Run multi-temporal change detection against the pre-monsoon baseline image.",
      detectedFeatures: ["Water bodies", "Flooded cropland", "Changed regions"],
    }),
  },
  {
    match: /vegetation|crop|forest/i,
    build: (img) => ({
      observation: "A reduction in healthy vegetation cover is detected compared to the expected seasonal norm.",
      evidence: [
        "Lower NDVI-like greenness response in the central sector",
        "Fragmented canopy texture versus dense continuous cover",
        "Bare-soil signature appearing in previously vegetated patches",
      ],
      confidence: 0.79,
      detectedRegion: `Central agricultural belt, ${img.location}`,
      reasoningSummary:
        "Vegetation vigor indicators are below the expected range for this season, suggesting stress, clearing, or crop-cycle transition.",
      recommendedNextAnalysis: "Cross-check with multispectral time series to rule out seasonal crop rotation.",
      detectedFeatures: ["Vegetation", "Bare soil", "Changed regions"],
    }),
  },
  {
    match: /built|urban|construction|expansion/i,
    build: (img) => ({
      observation: "New built-up structures are visible at the urban fringe, indicating settlement expansion.",
      evidence: [
        "Rectilinear high-reflectance shapes typical of rooftops",
        "New road connectivity linking to existing built-up clusters",
        "Loss of open/vegetated land adjacent to built-up growth",
      ],
      confidence: 0.83,
      detectedRegion: `Peri-urban fringe, ${img.location}`,
      reasoningSummary:
        "The geometric regularity and reflectance of the new structures match built-up signatures, and their spatial pattern follows outward growth from the existing urban core.",
      recommendedNextAnalysis: "Compare against a Cartosat image from 12 months prior to quantify growth rate.",
      detectedFeatures: ["Buildings", "Roads", "Changed regions"],
    }),
  },
  {
    match: /landslide|slope|surface change/i,
    build: (img) => ({
      observation: "Surface disturbance consistent with slope failure or debris movement is visible on the hillside.",
      evidence: [
        "Irregular texture disruption along the slope gradient",
        "SAR backscatter drop suggesting surface roughness change",
        "Debris fan pattern at the base of the slope",
      ],
      confidence: 0.74,
      detectedRegion: `Upper slope sector, ${img.location}`,
      reasoningSummary:
        "The combination of coherence loss and texture disruption is characteristic of mass movement rather than vegetation or seasonal change.",
      recommendedNextAnalysis: "Correlate with recent rainfall and soil moisture data for landslide risk scoring.",
      detectedFeatures: ["Possible disaster zones", "Changed regions"],
    }),
  },
  {
    match: /compare|previous|change|difference/i,
    build: (img) => ({
      observation: "Moderate change is detected between the current and reference observation of this location.",
      evidence: [
        "Localized reflectance/backscatter differences above the noise threshold",
        "Change clusters concentrated in two sub-regions",
        "Boundary shift detected along the water-land interface",
      ],
      confidence: 0.81,
      detectedRegion: `Full scene, ${img.location}`,
      reasoningSummary:
        "Pixel-wise differencing between temporal acquisitions highlights regions exceeding the change threshold, isolated from sensor noise using morphological filtering.",
      recommendedNextAnalysis: "Open the Change Detection workspace for a side-by-side and difference-map view.",
      detectedFeatures: ["Changed regions", "Water bodies", "Vegetation"],
    }),
  },
];

const DEFAULT_RESPONSE = (img: EOImage): Omit<ExplainableAnswer, "question"> => ({
  observation: `This ${img.dataType.toLowerCase()} scene over ${img.location} shows a mix of built-up, vegetated, and water surfaces typical of the region.`,
  evidence: [
    "Distinct spectral clusters corresponding to built-up, vegetation and water classes",
    "Regular geometric patterns indicating human settlement",
    "Contiguous green patches indicating vegetated land cover",
  ],
  confidence: 0.72,
  detectedRegion: `Full scene, ${img.location}`,
  reasoningSummary:
    "General land-cover classification was applied using reflectance/backscatter signatures to separate built-up, vegetation and water classes.",
  recommendedNextAnalysis: "Ask a more specific question, e.g. about flooding, vegetation loss, or built-up change.",
  detectedFeatures: ["Buildings", "Vegetation", "Water bodies", "Roads"],
});

export function askVisionOSS(image: EOImage, question: string): Promise<ExplainableAnswer> {
  const entry = RESPONSE_LIBRARY.find((r) => r.match.test(question));
  const built = (entry ? entry.build(image) : DEFAULT_RESPONSE(image));
  return new Promise((resolve) => {
    setTimeout(() => resolve({ question, ...built }), 900 + Math.random() * 700);
  });
}

export const EXAMPLE_QUESTIONS = [
  "What is visible in this image?",
  "Identify areas affected by flooding.",
  "Is there any vegetation loss?",
  "Compare this area with the previous image.",
  "Identify possible built-up expansion.",
];

export interface ChangeResult {
  changePercent: number;
  narrative: string;
  regions: DetectionBox[];
}

export function computeChangeMock(before: EOImage, after: EOImage): ChangeResult {
  const seed = hashSeed(before.id + after.id);
  const rand = mulberry32(seed);
  const changePercent = Math.round((8 + rand() * 27) * 10) / 10;
  return {
    changePercent,
    narrative: `The analysis indicates ${changePercent}% surface change in the observed area, with the most significant shift concentrated in the northern region compared with the previous image. This is consistent with ${
      before.dataType === "SAR" || after.dataType === "SAR" ? "surface and moisture" : "land-cover"
    } change patterns typical of ${after.location}.`,
    regions: mockBoxes(seed + 9, 3, "Change"),
  };
}

export interface GeoEvent {
  id: string;
  location: string;
  coords: { lat: number; lng: number };
  date: string;
  image: string;
  event: string;
  explanation: string;
  chain: string[];
}

export const GEO_EVENTS: GeoEvent[] = [
  {
    id: "ge-1",
    location: "Chamoli, Uttarakhand",
    coords: { lat: 30.4, lng: 79.55 },
    date: "2024-06-18",
    image: SAMPLE_IMAGES[4].thumbUrl,
    event: "Landslide Risk Detected",
    explanation:
      "Heavy rainfall increased soil moisture, leading to a surface texture change on the slope that matches known pre-landslide signatures.",
    chain: ["Heavy Rain", "Soil Moisture Change", "Surface Change", "Landslide Risk"],
  },
  {
    id: "ge-2",
    location: "Kaziranga, Assam",
    coords: { lat: 26.58, lng: 93.17 },
    date: "2024-07-03",
    image: SAMPLE_IMAGES[1].thumbUrl,
    event: "Flood Extent Expansion",
    explanation:
      "Monsoon rainfall drove river overflow, expanding standing water extent by an estimated 21% over the prior observation.",
    chain: ["Monsoon Rainfall", "River Overflow", "Water Extent Increase", "Flood Alert"],
  },
  {
    id: "ge-3",
    location: "Mumbai Coastline, Maharashtra",
    coords: { lat: 19.07, lng: 72.87 },
    date: "2024-09-02",
    event: "Built-up Expansion",
    image: SAMPLE_IMAGES[3].thumbUrl,
    explanation:
      "Continued peri-urban development added new built-up clusters along the coastal fringe, consistent with prior growth trajectory.",
    chain: ["Urban Growth Trend", "New Construction", "Built-up Expansion"],
  },
  {
    id: "ge-4",
    location: "Aravalli Range, Rajasthan",
    coords: { lat: 24.6, lng: 73.7 },
    date: "2024-05-21",
    image: SAMPLE_IMAGES[2].thumbUrl,
    event: "Vegetation Decline",
    explanation:
      "Below-average rainfall over two seasons correlates with a measurable decline in vegetation vigor across the observed belt.",
    chain: ["Rainfall Deficit", "Soil Dryness", "Vegetation Stress", "Vegetation Decline"],
  },
];

export interface HistoryEntry {
  id: string;
  imageId: string;
  imageName: string;
  thumbUrl: string;
  date: string;
  type: "AI Analysis" | "Change Detection" | "SAR Analysis";
  summary: string;
  confidence: number;
}

export const ANALYSIS_HISTORY: HistoryEntry[] = [
  {
    id: "h-1",
    imageId: "eo-001",
    imageName: "Godavari Delta – Optical",
    thumbUrl: SAMPLE_IMAGES[0].thumbUrl,
    date: "2024-08-13",
    type: "AI Analysis",
    summary: "Identified built-up clusters and irrigation channels near the delta mouth.",
    confidence: 0.81,
  },
  {
    id: "h-2",
    imageId: "eo-002",
    imageName: "Kaziranga Flood Extent",
    thumbUrl: SAMPLE_IMAGES[1].thumbUrl,
    date: "2024-07-04",
    type: "SAR Analysis",
    summary: "Detected flood inundation across 21% of the observed floodplain.",
    confidence: 0.86,
  },
  {
    id: "h-3",
    imageId: "eo-004",
    imageName: "Mumbai Coastal Built-up",
    thumbUrl: SAMPLE_IMAGES[3].thumbUrl,
    date: "2024-09-03",
    type: "Change Detection",
    summary: "17.4% new built-up area detected versus the 2023 baseline image.",
    confidence: 0.83,
  },
  {
    id: "h-4",
    imageId: "eo-005",
    imageName: "Himalayan Slope – Landslide Watch",
    thumbUrl: SAMPLE_IMAGES[4].thumbUrl,
    date: "2024-06-19",
    type: "SAR Analysis",
    summary: "Flagged a moderate landslide-risk signature following heavy rainfall.",
    confidence: 0.74,
  },
];

// Data source registry for the ISRO EO Data Integration Layer.
// Prototype uses mock data; production would swap `status` to "connected"
// and route through real fetchers implementing the same interface.
export interface DataSource {
  id: string;
  name: string;
  description: string;
  status: "mock" | "connected";
}

export const DATA_SOURCES: DataSource[] = [
  { id: "bhuvan", name: "ISRO Bhuvan", description: "National geoportal for Indian EO data", status: "mock" },
  { id: "bhoonidhi", name: "NRSC Bhoonidhi", description: "Satellite data ordering & distribution", status: "mock" },
  { id: "cartosat", name: "Cartosat", description: "High-resolution optical imagery", status: "mock" },
  { id: "resourcesat", name: "Resourcesat", description: "Multispectral land resource monitoring", status: "mock" },
  { id: "risat", name: "RISAT", description: "All-weather SAR imaging", status: "mock" },
  { id: "eos", name: "EOS Series", description: "Next-gen Earth observation satellites", status: "mock" },
];
