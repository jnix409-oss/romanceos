// Global registry (uniqueness guardrail) + similarity/fingerprint helpers.
// localStorage-backed; no React.

export const GLOBAL_REGISTRY_KEY = "romanceStoryOS:globalRegistry";

export function loadGlobalRegistry() {
  try {
    const raw = typeof localStorage !== "undefined" ? localStorage.getItem(GLOBAL_REGISTRY_KEY) : null;
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        characterNames: parsed.characterNames || [],
        familyNames: parsed.familyNames || [],
        businessNames: parsed.businessNames || [],
        organizationNames: parsed.organizationNames || [],
        locations: parsed.locations || [],
        plotFingerprints: parsed.plotFingerprints || []
      };
    }
  } catch(e) {}
  return {
    characterNames: [], familyNames: [], businessNames: [],
    organizationNames: [], locations: [], plotFingerprints: []
  };
}

export function saveGlobalRegistry(reg) {
  try {
    if (typeof localStorage !== "undefined") localStorage.setItem(GLOBAL_REGISTRY_KEY, JSON.stringify(reg));
  } catch(e) {}
}

export function similarityScore(a, b) {
  if (!a || !b) return 0;
  const norm = (s) => String(s).toLowerCase().replace(/[^a-z0-9 ]+/g, " ").replace(/\s+/g, " ").trim();
  const an = norm(a); const bn = norm(b);
  if (!an || !bn) return 0;
  if (an === bn) return 1;
  // Containment bonus for short strings (names)
  if (an.length < 30 && bn.length < 30 && (an.includes(bn) || bn.includes(an))) return 0.9;
  const aTokens = an.split(" ").filter(Boolean);
  const bTokens = bn.split(" ").filter(Boolean);
  if (aTokens.length === 0 || bTokens.length === 0) return 0;
  const aSet = new Set(aTokens);
  const bSet = new Set(bTokens);
  let intersect = 0;
  aSet.forEach(t => { if (bSet.has(t)) intersect++; });
  const union = aSet.size + bSet.size - intersect;
  return union === 0 ? 0 : intersect / union;
}

export function similarityCheck(item, registryItems) {
  if (!item || !registryItems || registryItems.length === 0) {
    return { status: "PASS", score: 0, mostSimilar: null };
  }
  let max = 0; let best = null;
  for (const r of registryItems) {
    const s = similarityScore(item, r);
    if (s > max) { max = s; best = r; }
  }
  if (max >= 0.8) return { status: "FAIL", score: max, mostSimilar: best };
  if (max >= 0.45) return { status: "WARNING", score: max, mostSimilar: best };
  return { status: "PASS", score: max, mostSimilar: null };
}

export function buildPlotFingerprint(story) {
  if (!story) return "";
  const bits = [
    story.heroine && story.heroine.occupation,
    story.hero && story.hero.occupation,
    story.heroine && story.heroine.wound,
    story.hero && story.hero.wound,
    story.externalConflictSummary,
    story.relationshipObstacleSummary
  ].filter(Boolean);
  return bits.join(" · ").toLowerCase();
}

export function registerStoryEntities(reg, story) {
  if (!story) return reg;
  const next = {
    characterNames: [...(reg.characterNames||[])],
    familyNames: [...(reg.familyNames||[])],
    businessNames: [...(reg.businessNames||[])],
    organizationNames: [...(reg.organizationNames||[])],
    locations: [...(reg.locations||[])],
    plotFingerprints: [...(reg.plotFingerprints||[])]
  };
  const addUnique = (arr, val) => { if (val && !arr.some(x => similarityScore(x, val) > 0.9)) arr.push(val); };

  if (story.heroine && story.heroine.name) addUnique(next.characterNames, story.heroine.name);
  if (story.hero && story.hero.name) addUnique(next.characterNames, story.hero.name);
  (story.supporting||[]).forEach(s => s.name && addUnique(next.characterNames, s.name));

  if (story.title) addUnique(next.organizationNames, story.title); // titles tracked here too as a stand-in
  const fp = buildPlotFingerprint(story);
  if (fp) addUnique(next.plotFingerprints, fp);

  return next;
}
