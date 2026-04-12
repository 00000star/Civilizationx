#!/usr/bin/env python3
"""Apply batch-2 narrative patches from batch2_narrative_data (and optional _extra)."""
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent / "src/data/technologies"
ISO = "2026-04-10"
sys.path.insert(0, str(Path(__file__).resolve().parent))

from batch2_narrative_data import NARRATIVE  # noqa: E402

try:
    from batch2_narrative_data_extra import NARRATIVE as NARRATIVE_EXTRA  # noqa: E402
except ImportError:
    NARRATIVE_EXTRA = {}

MERGED = {**NARRATIVE, **NARRATIVE_EXTRA}


def apply_spec(data: dict, spec: dict) -> None:
    for key in ("problem", "overview"):
        if key in spec:
            data[key] = spec[key]
    if "buildSteps" in spec:
        data["buildSteps"] = spec["buildSteps"]
    if "rawMaterials" in spec:
        for idx_str, txt in spec["rawMaterials"].items():
            idx = int(idx_str) if isinstance(idx_str, str) else idx_str
            data["rawMaterials"][idx]["spaceAlternatives"] = txt


def main():
    for tid, spec in MERGED.items():
        path = ROOT / f"{tid}.json"
        data = json.loads(path.read_text(encoding="utf-8"))
        apply_spec(data, spec)
        data["lastUpdated"] = ISO
        data["verified"] = False
        path.write_text(json.dumps(data, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
        print("patched", tid)


if __name__ == "__main__":
    main()
