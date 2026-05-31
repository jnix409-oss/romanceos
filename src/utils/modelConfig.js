// Per-task model routing. Pure data.

export const MODEL_CONFIG = {
  // ── Opus 4.8: complex reasoning + prose quality ──
  blueprint:    "claude-opus-4-8",  // story concept + market architecture
  outline:      "claude-opus-4-8",  // chapter architecture shapes everything
  prose:        "claude-opus-4-8",  // chapter prose — quality is the product
  sceneProse:   "claude-opus-4-8",  // scene prose — same reason
  analysis:     "claude-opus-4-8",  // story health editorial reasoning

  // ── Sonnet 4.6: structured tasks + analytical work ──
  bible:        "claude-sonnet-4-6", // structured extraction from story data
  continuity:   "claude-sonnet-4-6", // analytical JSON check
  sceneCards:   "claude-sonnet-4-6", // structured JSON scene architecture
  publishing:   "claude-sonnet-4-6", // marketing copy + structured output
  universe:     "claude-sonnet-4-6", // lore extraction + structured JSON
  alternatives: "claude-sonnet-4-6", // creative alternatives list
  importProse:  "claude-sonnet-4-6", // extract bible from imported chapters
  importOutline:"claude-sonnet-4-6", // convert outline to chapter cards
  continuation: "claude-sonnet-4-6", // continuation outline generation

  // ── Haiku 4.5: simple extraction, speed priority ──
  summarize:    "claude-haiku-4-5-20251001", // chapter + scene summaries

  // ── Fast Draft default (user can override to Opus in UI) ──
  fastDraft:    "claude-sonnet-4-6",
};
