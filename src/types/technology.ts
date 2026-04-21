export type TechCategory =
  | "survival"
  | "food"
  | "materials"
  | "energy"
  | "tools"
  | "transport"
  | "construction"
  | "medicine"
  | "communication"
  | "computing"
  | "agriculture"
  | "warfare"
  | "science";

export type TechEra =
  | "prehistoric"
  | "ancient"
  | "medieval"
  | "early-modern"
  | "industrial"
  | "early-20th"
  | "mid-20th"
  | "late-20th"
  | "21st-century";

export type VerificationStatus =
  | "unverified"
  | "community-reviewed"
  | "expert-verified";

export type EntryMaturity =
  | "stub"
  | "draft"
  | "researched"
  | "review-needed"
  | "field-guide-ready";

export type SourceType =
  | "book"
  | "paper"
  | "standard"
  | "institution"
  | "wikipedia";

export type HazardCategory =
  | "medical"
  | "chemical"
  | "electrical"
  | "fire"
  | "pressure"
  | "structural"
  | "biological"
  | "radiation"
  | "sharp-tools"
  | "high-temperature"
  | "confined-space";

export interface Source {
  id: string;
  title: string;
  url?: string;
  type: SourceType;
  note?: string;
}

export interface Verification {
  status: VerificationStatus;
  reviewedBy: string | null;
  reviewDate: string | null;
  warnings: string[];
  sources: Source[];
}

export interface Component {
  id: string;
  name: string;
  function: string;
  position: string;
  madeFrom: string;
  criticalNote?: string;
  imageId?: string;
}

export interface RawMaterial {
  name: string;
  purpose: string;
  earthLocations: string[];
  spaceAlternatives?: string;
  processingRequired: string;
}

export interface BuildStep {
  order: number;
  title: string;
  description: string;
  prerequisiteTools: string[];
  warningNote?: string;
  imageId?: string;
}

export interface Principle {
  name: string;
  explanation: string;
}

export interface HistoryEntry {
  year: number | string;
  event: string;
  location: string;
  person?: string;
}

export interface Person {
  name: string;
  contribution: string;
  years: string;
  nationality: string;
}

export interface Image {
  id: string;
  filename: string;
  caption: string;
  type: "photograph" | "diagram" | "schematic" | "illustration";
  credit: string;
  license: string;
}

export interface Video {
  id: string;
  title: string;
  youtubeId?: string;
  description: string;
  durationSeconds: number;
}

export interface ExternalLink {
  id: string;
  title: string;
  url: string;
  note?: string;
}

export type Difficulty = 1 | 2 | 3 | 4 | 5;

export interface Technology {
  id: string;
  name: string;
  tagline: string;
  category: TechCategory;
  era: TechEra;
  difficulty: Difficulty;
  prerequisites: string[];
  unlocks: string[];
  problem: string;
  overview: string;
  principles: Principle[];
  components: Component[];
  rawMaterials: RawMaterial[];
  buildSteps: BuildStep[];
  history: HistoryEntry[];
  inventors: Person[];
  impact: string;
  images: Image[];
  videos: Video[];
  externalLinks: ExternalLink[];
  lastUpdated: string;
  maturity: EntryMaturity;
  verification: Verification;
}

export type TechnologySummary = Pick<
  Technology,
  | "id"
  | "name"
  | "tagline"
  | "category"
  | "era"
  | "difficulty"
  | "prerequisites"
  | "unlocks"
  | "rawMaterials"
  | "verification"
  | "maturity"
  | "lastUpdated"
>;

export interface IndexNode {
  id: string;
}

export interface TechIndex {
  version: string;
  nodes: IndexNode[];
}
