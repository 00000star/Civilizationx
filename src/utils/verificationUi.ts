import type { Technology, VerificationStatus } from "../types/technology";

export function verificationDotClass(
  status: VerificationStatus
): string {
  switch (status) {
    case "expert-verified":
      return "bg-emerald-500";
    case "community-reviewed":
      return "bg-amber-500";
    default:
      return "bg-red-500";
  }
}

export function formatReviewDate(iso: string | null): string {
  if (!iso) return "";
  try {
    return new Intl.DateTimeFormat(undefined, {
      dateStyle: "medium",
    }).format(new Date(iso + "T12:00:00Z"));
  } catch {
    return iso;
  }
}

export function requiresMedicalGate(tech: Technology): boolean {
  if (tech.category === "medicine") return true;
  const n = tech.name.toLowerCase();
  const keywords = [
    "surgery",
    "surgical",
    "pharmaceutical",
    "pharma",
    "anaesthesia",
    "anesthesia",
    "vaccine",
    "antibiotic",
  ];
  return keywords.some((k) => n.includes(k));
}

export const MEDICAL_GATE_STORAGE_PREFIX = "codex-medical-ack:";
