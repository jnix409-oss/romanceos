// Per-task model routing. Pure data.

export const MODEL_CONFIG = {
  // All regular tasks — Sonnet 4.6
  // You review each scene individually anyway
  blueprint:    "claude-sonnet-4-6",
  outline:      "claude-sonnet-4-6",
  prose:        "claude-sonnet-4-6",
  sceneProse:   "claude-sonnet-4-6",
  analysis:     "claude-sonnet-4-6",
  bible:        "claude-sonnet-4-6",
  continuity:   "claude-sonnet-4-6",
  sceneCards:   "claude-sonnet-4-6",
  publishing:   "claude-sonnet-4-6",
  universe:     "claude-sonnet-4-6",
  alternatives: "claude-sonnet-4-6",
  importProse:  "claude-sonnet-4-6",
  importOutline:"claude-sonnet-4-6",
  continuation: "claude-sonnet-4-6",

  // Fast tasks — Haiku 4.5
  summarize:    "claude-haiku-4-5-20251001",

  // Fast Draft — Opus 4.8
  // Bulk production: 2 chapters at once, want best output
  fastDraft:    "claude-opus-4-8",
};
