import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { Technology } from "../../types/technology";
import { MEDICAL_GATE_STORAGE_PREFIX, requiresMedicalGate } from "../../utils/verificationUi";

interface Props {
  tech: Technology;
  children: React.ReactNode;
}

export function DangerGate({ tech, children }: Props) {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const key = `${MEDICAL_GATE_STORAGE_PREFIX}${tech.id}`;

  useEffect(() => {
    if (!requiresMedicalGate(tech)) {
      setOpen(false);
      return;
    }
    try {
      if (sessionStorage.getItem(key) === "1") {
        setOpen(false);
        return;
      }
    } catch {
      setOpen(true);
      return;
    }
    setOpen(true);
  }, [tech, key]);

  const acknowledge = useCallback(() => {
    try {
      sessionStorage.setItem(key, "1");
    } catch {
      /* sessionStorage unavailable */
    }
    setOpen(false);
  }, [key]);

  const goBack = useCallback(() => {
    if (window.history.length > 1) navigate(-1);
    else navigate("/");
  }, [navigate]);

  if (!requiresMedicalGate(tech)) {
    return <>{children}</>;
  }

  if (!open) {
    return <>{children}</>;
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(10, 10, 15, 0.98)" }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="danger-gate-title"
      aria-describedby="danger-gate-desc"
    >
      <div className="relative w-full max-w-lg rounded-lg border-2 border-[#F59E0B] bg-codex-card p-6 shadow-2xl">
        <div className="absolute left-6 top-6 font-display text-sm font-semibold tracking-tight text-codex-text">
          The Codex
        </div>
        <div className="mt-10 flex flex-col items-center text-center">
          <div
            className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-red-500 bg-red-950/50 text-3xl"
            aria-hidden
          >
            ⚠
          </div>
          <h1
            id="danger-gate-title"
            className="mt-4 font-display text-xl font-bold tracking-tight text-red-400"
          >
            MEDICAL INFORMATION
          </h1>
        </div>
        <div
          id="danger-gate-desc"
          className="mt-6 space-y-4 text-sm leading-relaxed text-codex-secondary"
        >
          <p>
            The following entry describes medical procedures, substances, or techniques.
          </p>
          <p className="font-medium text-codex-text">
            Incorrect application of medical information can cause serious injury or death.
          </p>
          <p>
            This entry has not been verified by a qualified medical professional. It must not
            be used as a substitute for professional medical advice, diagnosis, or treatment.
          </p>
          <p className="font-semibold text-codex-text">Before acting on any medical information found here:</p>
          <ul className="list-disc space-y-2 pl-5 text-left">
            <li>Cross-reference with qualified medical professionals</li>
            <li>Verify dosages against authoritative medical references</li>
            <li>Consider that your specific situation may differ</li>
            <li>When in doubt, do nothing and seek help</li>
          </ul>
        </div>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row-reverse sm:justify-center">
          <button
            type="button"
            onClick={acknowledge}
            className="rounded-md border border-[#F59E0B] bg-[#F59E0B]/15 px-4 py-3 text-sm font-semibold text-codex-text hover:bg-[#F59E0B]/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-codex-blue"
          >
            I understand the risks — show me the entry
          </button>
          <button
            type="button"
            onClick={goBack}
            className="rounded-md border border-codex-border px-4 py-3 text-sm font-medium text-codex-secondary hover:border-codex-muted hover:text-codex-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-codex-blue"
          >
            Go back
          </button>
        </div>
      </div>
    </div>
  );
}
