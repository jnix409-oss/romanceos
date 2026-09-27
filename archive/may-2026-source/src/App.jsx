import { useState, useCallback, useEffect, useRef, lazy, Suspense } from "react";
import { C, FONT_CSS } from "./constants/theme";
import { SYS_STORY, SYS_CHAPTER, SYS_BIBLE, SYS_ALTERNATIVES, SYS_SCENE, SYS_PUBLISHING } from "./prompts/systemPrompts";
import { MODEL_CONFIG } from "./utils/modelConfig";
import { apiCall, apiCallJSON } from "./utils/api";
import { GLOBAL_REGISTRY_KEY, loadGlobalRegistry, saveGlobalRegistry, similarityScore, similarityCheck, buildPlotFingerprint, registerStoryEntities } from "./utils/registry";
import {
  generateBlueprint, generateChapterOutline, generateAlternatives, analyzeStoryHealth, generateStoryBible, generateContinuityReport, mergeBibleUpdates, bibleContextForChapter, fastBibleContext, writeScenesInBatch, generateSceneCards, writeScene, continueScene, summarizeScene, completeChapterWrap, generatePackagePart1, generatePackagePart2, generatePackagePart3, generateBookLaunchPackage, generateOutlineFromImport, generateBibleFromProse, generateContinuationOutline, writeChapterProse, continueChapter, summarizeChapter, generateUniverseLore
} from "./utils/storyGeneration";
import {
  LANES, GENRE_PRESETS, READER_ARCHETYPES, detectReaderArchetypes, TROPES_DATABASE, TROPE_CATEGORY_ORDER, TROPE_CATEGORY_COLORS, PRESET_TROPE_CATEGORIES, getTropesForPreset, getTropeByName, HEAT, SPICE_LEVELS, INTENSITY_DIMENSIONS, DEFAULT_INTENSITY, EROTIC_DIMENSIONS, DEFAULT_EROTIC, EROTIC_CATEGORIES, EROTIC_LANE_IDS, STREETLIT_DIMENSIONS, DEFAULT_STREETLIT, SUSPENSE_DIMENSIONS, DEFAULT_SUSPENSE, URBAN_CATEGORIES, LANE_TO_URBAN_CATEGORY, dominantUrbanEngine, dominantUrbanCategory, streetLitShare, streetLitLine, suspenseLine, dominantEroticCategory, eroticLine, INTENSITY_CALIBRATION, calibrationForActivatedPatterns, INTENSITY, GENRE_PATTERNS, LANE_TO_PATTERNS, PRIMARY_LANE_IDS, EXTENDED_LANE_IDS, getActivatedPatterns, HEROES, CONFLICTS, BESTSELLER_CONFLICTS, CONFLICT_STACKS, OBSTACLES, BESTSELLER_OBSTACLES, OBSTACLE_PAIRINGS, HEROINES, WOUNDS, BESTSELLER_WOUNDS, WOUND_PAIRINGS, SETTINGS, CITIES, FAMILIES, normalize, scoreForBlend, topArchetypes, UNIVERSE_GENRES, UNIVERSE_THEMES, DEFAULT_LANE_VALS, DEFAULT_TROPES
} from "./data/storyData";
import Chip from "./components/Chip";
import PlotThreadTracker from "./components/PlotThreadTracker";

// ── Lazy-loaded workspace sections (code-split into separate chunks) ──
const EditorModeDashboardLazy = lazy(() => import("./components/EditorModeDashboard"));
const ImportStoryLazy         = lazy(() => import("./components/ImportStory"));
const SceneStudioLazy         = lazy(() => import("./components/SceneStudio"));

// ── Suspense fallback shown while a lazy workspace chunk loads ──
function GlassLoadingFallback({ label }) {
  return (
    <div style={{
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      minHeight: 320, padding: "60px 40px",
    }}>
      <div style={{
        background: "rgba(255,255,255,0.05)",
        backdropFilter: "blur(24px)",
        WebkitBackdropFilter: "blur(24px)",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: 24,
        boxShadow: "0 10px 40px rgba(0,0,0,0.25)",
        padding: "40px 48px",
        textAlign: "center",
        minWidth: 280,
      }}>
        <div style={{
          width: 48, height: 48,
          border: "3px solid rgba(184,132,28,0.15)",
          borderTop: "3px solid " + C.gold,
          borderRadius: "50%",
          margin: "0 auto 20px",
          animation: "obsidianSpin 0.9s linear infinite",
        }}/>
        <div style={{
          color: C.gold,
          fontFamily: "Cormorant Garamond, serif",
          fontSize: 18, fontWeight: 600,
          marginBottom: 6,
        }}>
          {label || "Loading..."}
        </div>
        <div style={{ color: C.muted, fontSize: 12 }}>
          Obsidian Story OS
        </div>
      </div>
      <style>{`
        @keyframes obsidianSpin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

const FAST_DRAFT_MODELS = [
  {
    id: "claude-sonnet-4-6",
    label: "Sonnet 4.6",
    badge: "Faster · Cheaper",
    note: "~35s per batch"
  },
  {
    id: "claude-opus-4-8",
    label: "Opus 4.8",
    badge: "Recommended",
    note: "~60-90s · Best quality"
  },
];







// ── Story Bible System ───────────────────────────────────────
// Persistent state that prevents the most common AI fiction failures:
// characters changing, timelines breaking, plot threads disappearing.


// ── Uniqueness Guardrail ─────────────────────────────────────
// Global Registry stored in localStorage; checks new items against history.
// Does not block — flags + suggests alternatives.




// Token-based Jaccard similarity (0..1). Simple, robust, fast.

// Returns { status: 'PASS'|'WARNING'|'FAIL', score, mostSimilar }

// Build a plot fingerprint from a story blueprint — used for premise dedup

// Auto-register entities from a generated story into the global registry

// AI function: generate 10 distinct alternatives for an item


// ── Uniqueness UI ────────────────────────────────────────────

function SimilarityBadge({ status, score, mostSimilar, compact }) {
  if (!status || status === "PASS") {
    if (compact) return null;
    return (
      <span style={{ padding:"2px 8px", background:"rgba(45,139,122,0.10)", border:"1px solid #2D8B7A",
                     borderRadius:10, fontSize:10, color:"#2D8B7A", fontWeight:700, letterSpacing:1 }}>
        ✓ UNIQUE
      </span>
    );
  }
  const c = status === "WARNING" ? "#B07A1F" : "#B8342D";
  const icon = status === "WARNING" ? "⚠" : "✗";
  const pct = Math.round((score||0) * 100);
  return (
    <span title={mostSimilar ? "Similar to: "+mostSimilar+" ("+pct+"%)" : ""}
      style={{ padding:"2px 8px", background:c+"22", border:"1px solid "+c,
               borderRadius:10, fontSize:10, color:c, fontWeight:700, letterSpacing:1 }}>
      {icon} {status} · {pct}%
    </span>
  );
}

// ── Story Health Analysis (Editor Mode) ───────────────────────

function AlternativesPanel({ itemType, currentItem, alternatives, loading, onGenerate, onSelect, onClose }) {
  return (
    <div style={{ marginTop:14, padding:"18px 20px", background:C.card, border:"1px solid "+C.gold, borderRadius:10 }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"baseline", marginBottom:12, flexWrap:"wrap", gap:8 }}>
        <div>
          <div style={{ color:C.gold, fontSize:11, letterSpacing:1.5, textTransform:"uppercase", fontWeight:700 }}>
            🎲 Generate Alternatives · {itemType}
          </div>
          {currentItem && <div style={{ color:C.muted, fontSize:11, marginTop:2 }}>Replacing: <em style={{ color:C.text }}>{currentItem}</em></div>}
        </div>
        <div style={{ display:"flex", gap:6 }}>
          <button onClick={onGenerate} disabled={loading}
            style={{ padding:"6px 14px", background:loading?C.faint:C.gold, color:loading?C.muted:C.bg,
                     border:"none", borderRadius:6, fontSize:12, fontWeight:700,
                     cursor:loading?"wait":"pointer", fontFamily:"Nunito, sans-serif" }}>
            {loading ? "Generating..." : (alternatives && alternatives.length ? "🔄 Generate New 10" : "✨ Generate 10")}
          </button>
          {onClose && (
            <button onClick={onClose}
              style={{ padding:"6px 12px", background:"transparent", color:C.muted, border:"1px solid "+C.borderLight, borderRadius:6, fontSize:11, cursor:"pointer", fontFamily:"Nunito, sans-serif" }}>
              Close
            </button>
          )}
        </div>
      </div>
      {alternatives && alternatives.length > 0 && (
        <div style={{ display:"grid", gap:8 }}>
          {alternatives.map((alt, i) => (
            <div key={i} style={{ padding:"10px 14px", background:C.bg, border:"1px solid "+C.borderLight, borderRadius:6 }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"baseline", marginBottom:5, flexWrap:"wrap", gap:6 }}>
                <div style={{ color:C.text, fontFamily:"Cormorant Garamond, serif", fontSize:16, fontWeight:600 }}>
                  {alt.option}
                </div>
                <div style={{ display:"flex", gap:6, alignItems:"center" }}>
                  {typeof alt.uniquenessScore === "number" && (
                    <span style={{ padding:"1px 7px", background:C.surface, border:"1px solid "+C.borderLight, borderRadius:8, fontSize:10, color:C.amber, fontWeight:600 }}>
                      ⚡ {alt.uniquenessScore}/10
                    </span>
                  )}
                  {onSelect && (
                    <button onClick={()=>onSelect(alt)}
                      style={{ padding:"3px 10px", background:C.gold, color:C.bg, border:"none", borderRadius:4, fontSize:10, fontWeight:700, cursor:"pointer", fontFamily:"Nunito, sans-serif" }}>
                      Use this
                    </button>
                  )}
                </div>
              </div>
              {alt.reason && <div style={{ color:C.muted, fontSize:11, lineHeight:1.5, marginBottom:3 }}>{alt.reason}</div>}
              {alt.genreFit && <div style={{ color:C.muted, fontSize:10, fontStyle:"italic" }}>Fit: {alt.genreFit}</div>}
            </div>
          ))}
        </div>
      )}
      {(!alternatives || alternatives.length === 0) && !loading && (
        <div style={{ color:C.muted, fontSize:12, fontStyle:"italic" }}>
          Click Generate to produce 10 distinct alternatives that avoid duplicates in your library.
        </div>
      )}
    </div>
  );
}



// Build the initial Story Bible from the blueprint + 12-chapter outline.
// Uses one AI call to fill in details the blueprint doesn't have:
// character appearance + speech patterns, relationship beginning/current/end states,
// subplots, mysteries, secrets, clues, reveals.

// Generate a continuity report for a chapter that was just written.
// Returns both diagnostics AND structured bible updates to merge.

// Apply a continuity report to the bible, returning a new bible object

// Build a compact, chapter-relevant bible slice for the prose prompt

// ── Scene Engine AI Functions ────────────────────────────────
// Replaces single-chapter generation with scene-card-driven writing.
// Story → Part → Chapter → Scene. Scene is the smallest drafting unit.


// Generate 3-5 scene cards for a single chapter
// ── Fast Draft Mode (Phase 1.5) ────────────────────────────────
// Compact bible context for batch scene drafting (snapshots, not full profiles)

// Write a batch of 2-3 scenes in a single call, split on a delimiter


// Write the prose for a single scene

// Continue a partially-written scene (same no-recap discipline as continueChapter)

// Auto-summarize a completed scene for the continuity tracker

// Wrap-up after all scenes in a chapter are complete — chapter-level continuity + arc updates

// ── Publishing Studio — Book Launch Engine ──────────────────
// Three split calls to avoid JSON truncation on the comprehensive package.


function publishingStoryContext(story, outline, bible) {
  const heroineWound = story.heroine ? (story.heroine.wound || "") : "";
  const heroWound = story.hero ? (story.hero.wound || "") : "";
  const arc = (story.relationshipArc||[]).join(" → ");
  const spiceLabel = story.spiceLevel ? (SPICE_LEVELS[story.spiceLevel-1] && SPICE_LEVELS[story.spiceLevel-1].label) : "";
  const ri = story.romanceIntensity || {};
  return [
    "BOOK: "+(story.title||""),
    "HOOK: "+(story.hook||""),
    "READER PROMISE: "+(story.readerPromise||""),
    "HEROINE: "+(story.heroine ? story.heroine.name+" — "+story.heroine.occupation+". Wound: "+heroineWound+". Wants: "+(story.heroine.externalGoal||"") : ""),
    "HERO: "+(story.hero ? story.hero.name+" — "+story.hero.occupation+". Wound: "+heroWound+". Wants: "+(story.hero.externalGoal||"") : ""),
    "RELATIONSHIP ARC: "+arc,
    story.externalConflictSummary ? "EXTERNAL CONFLICT: "+story.externalConflictSummary : "",
    story.relationshipObstacleSummary ? "RELATIONSHIP OBSTACLE: "+story.relationshipObstacleSummary : "",
    spiceLabel ? "Spice level: "+story.spiceLevel+"/5 ("+spiceLabel+")" : "",
    ri.attractionIntensity ? "Romance intensity dims: attraction "+ri.attractionIntensity+"/5 · emotional "+ri.emotionalIntimacy+"/5 · physical "+ri.physicalAffection+"/5 · focus "+ri.relationshipFocus+"/5" : "",
    eroticLine(story.eroticRomance),
    streetLitLine(story.streetLitEng),
    suspenseLine(story.suspenseEng),
    bible && bible.world ? "World/Tone: "+bible.world.tone+" · Setting: "+bible.world.setting : ""
  ].filter(Boolean).join("\n");
}

// CALL 1: Positioning + Titles + Reader Promise + Descriptions

// CALL 2: Cover Strategy + Series Branding + Author Brand

// CALL 3: Marketing Assets + Adaptation + Commercial Readiness

// Convenience function — generates ALL three parts in sequence

// ── Import & Continue: convert an author's existing outline to chapter cards ──

// ── Import & Continue: extract a Story Bible from an author's existing prose ──

// ── Import & Continue: outline the remaining chapters from the bible snapshot ──


// Continue a partially-written chapter from the exact point it stopped.
// Spec: do NOT recap, do NOT restart, do NOT contradict prior text.

// Generate a structured summary of a completed chapter for the continuity tracker.

// ── Save Blueprint helpers ────────────────────────────────────
function blueprintToMarkdown(story) {
  const lines = [];
  lines.push("# " + story.title);
  lines.push("");
  lines.push("> *" + story.tagline + "*");
  lines.push("");
  lines.push("## Hook");
  lines.push(story.hook);
  lines.push("");
  lines.push("**Reader Promise:** " + story.readerPromise);
  lines.push("");
  lines.push("---");
  lines.push("");
  lines.push("## Heroine: " + story.heroine.name);
  lines.push("- **Age:** " + story.heroine.age);
  lines.push("- **Occupation:** " + story.heroine.occupation);
  lines.push("- **Archetype:** " + (story.heroineArchetype||""));
  lines.push("- **Wound:** " + story.heroine.wound);
  lines.push("- **Core Fear:** " + (story.heroineCoreFear||""));
  lines.push("- **External Goal:** " + story.heroine.externalGoal);
  lines.push("- **Growth Arc:** " + (story.heroineGrowthArc||""));
  lines.push("");
  lines.push("## Hero: " + story.hero.name);
  lines.push("- **Age:** " + story.hero.age);
  lines.push("- **Occupation:** " + story.hero.occupation);
  lines.push("- **Archetype:** " + (story.heroArchetype||""));
  lines.push("- **Wound:** " + story.hero.wound);
  lines.push("- **Core Fear:** " + (story.heroCoreFear||""));
  lines.push("- **External Goal:** " + story.hero.externalGoal);
  lines.push("- **Growth Arc:** " + (story.heroGrowthArc||""));
  lines.push("");
  if (story.supporting && story.supporting.length) {
    lines.push("## Supporting Cast");
    story.supporting.forEach(s=>{
      lines.push("- **" + s.name + "** (" + s.role + "): " + s.purpose);
    });
    lines.push("");
  }
  if (story.relationshipArc && story.relationshipArc.length) {
    lines.push("## Relationship Arc");
    story.relationshipArc.forEach((stage,i)=>lines.push((i+1)+". " + stage));
    lines.push("");
  }
  if (story.externalConflictSummary) {
    lines.push("## External Conflict");
    lines.push(story.externalConflictSummary);
    lines.push("");
  }
  if (story.relationshipObstacleSummary) {
    lines.push("## Relationship Obstacle");
    lines.push(story.relationshipObstacleSummary);
    lines.push("");
  }
  lines.push("## Trope Synergy");
  lines.push(story.tropeSynergy);
  lines.push("");
  lines.push("## Marketing Angle");
  lines.push(story.marketingAngle);
  lines.push("");
  if (story.amazonCategories && story.amazonCategories.length) {
    lines.push("## Amazon Categories");
    story.amazonCategories.forEach(c=>lines.push("- " + c));
    lines.push("");
  }
  lines.push("## Ideal Reader");
  lines.push(story.readerProfile);
  lines.push("");
  lines.push("## Series Potential");
  lines.push(story.seriesPotential);
  lines.push("");
  lines.push("**Word Count Target:** " + story.wordCountTarget);
  lines.push("");

  if (story.scores) {
    lines.push("## Commercial Intelligence Scores");
    const s = story.scores;
    lines.push("- **Emotional Depth:** " + (s.emotionalDepth||"-") + "/10");
    lines.push("- **Commercial Familiarity:** " + (s.commercialFamiliarity||"-") + "/10");
    lines.push("- **Originality:** " + (s.originality||"-") + "/10");
    lines.push("- **Series Potential:** " + (s.seriesPotential||"-") + "/10");
    lines.push("- **Romance Satisfaction:** " + (s.romanceSatisfaction||"-") + "/10");
    lines.push("- **Mystery / Suspense:** " + (s.mysteryStrength||"-") + "/10");
    lines.push("- **Power & Purpose Alignment:** " + (s.powerPurposeAlignment||"-") + "/10");
    lines.push("");
  }
  if (story.familiarElements && story.familiarElements.length) {
    lines.push("## Familiar Market Elements");
    story.familiarElements.forEach(e=>lines.push("- " + e));
    lines.push("");
  }
  if (story.uniqueDifferentiator) {
    lines.push("## Unique Differentiator");
    lines.push(story.uniqueDifferentiator);
    lines.push("");
  }
  if (story.emotionalPayoff) {
    lines.push("## Emotional Payoff");
    lines.push("> " + story.emotionalPayoff);
    lines.push("");
  }
  if (story.adaptationPotential) {
    lines.push("## Adaptation Potential");
    lines.push(story.adaptationPotential);
    lines.push("");
  }

  lines.push("## Chapter 1 Opening Line");
  lines.push("> *\"" + story.openingLine + "\"*");
  return lines.join("\n");
}

function downloadFile(filename, content, mime) {
  const blob = new Blob([content], {type:mime});
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename;
  document.body.appendChild(a); a.click(); document.body.removeChild(a);
  setTimeout(()=>URL.revokeObjectURL(url), 1000);
}

function slugify(s) {
  return (s||"blueprint").toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"").slice(0,40);
}

// ── Universe Builder: Constants, Storage, AI ──────────────────


// ── Persistence (localStorage with safe fallback) ─────────────
const STORAGE_KEY = "romanceStoryOS:universes";

function loadUniverses() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch(e) { return []; }
}

function saveUniverses(arr) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(arr)); return true; }
  catch(e) { return false; }
}

function newUniverseId()  { return "uni_" + Date.now().toString(36) + Math.random().toString(36).slice(2,7); }
function newBookId()      { return "bk_"  + Date.now().toString(36) + Math.random().toString(36).slice(2,7); }

// ── Multi-story persistence (W2) ──────────────────────────────
const STORIES_KEY = "romanceStoryOS:stories";
const ACTIVE_STORY_KEY = "romanceStoryOS:activeStoryId";

function loadStories() {
  try { const raw = localStorage.getItem(STORIES_KEY); return raw ? JSON.parse(raw) : []; }
  catch(e) { return []; }
}
function saveStories(arr) {
  try { localStorage.setItem(STORIES_KEY, JSON.stringify(arr)); return true; }
  catch(e) { return false; }
}
function loadActiveStoryId() {
  try { return localStorage.getItem(ACTIVE_STORY_KEY) || null; }
  catch(e) { return null; }
}
function saveActiveStoryId(id) {
  try { if (id) localStorage.setItem(ACTIVE_STORY_KEY, id); else localStorage.removeItem(ACTIVE_STORY_KEY); return true; }
  catch(e) { return false; }
}
function newStoryId() { return "story_" + Date.now().toString(36) + Math.random().toString(36).slice(2,7); }

// Builder defaults — single source of truth for fresh stories + reset + progress detection

function freshStoryRecord(id) {
  const now = Date.now();
  return {
    id, title:"Untitled Story", createdAt:now, updatedAt:now,
    laneVals:{...DEFAULT_LANE_VALS}, tropes:[...DEFAULT_TROPES], heat:3,
    heroineArch:null, heroArch:null, heroineWound:null, heroWound:null,
    setting:null, city:null, family:null, intensity:3, externalConflict:null,
    relationshipObstacle:null, familyInfluence:7, spiceLevel:2, romanceIntensity:DEFAULT_INTENSITY,
    eroticRomance:{...DEFAULT_EROTIC}, streetLitEng:{...DEFAULT_STREETLIT}, suspenseEng:{...DEFAULT_SUSPENSE},
    blueprint:null, outline:null, bible:null, bibleLocked:false, storyDNALocked:false, chapterProse:{}, chapterReports:{},
    chapterSummaries:{}, chapterVersions:{}, chapterSceneCards:{}, sceneProse:{}, sceneSummaries:{}, sceneLocked:{}, bookPackage:null
  };
}

// Relative-time helper for My Stories cards
function relativeTime(ts) {
  if (!ts) return "";
  const diff = Date.now() - ts;
  const s = Math.floor(diff/1000), m = Math.floor(s/60), h = Math.floor(m/60), d = Math.floor(h/24);
  if (s < 45) return "just now";
  if (m < 60) return "Updated " + m + (m===1?" minute":" minutes") + " ago";
  if (h < 24) return "Updated " + h + (h===1?" hour":" hours") + " ago";
  if (d < 30) return "Updated " + d + (d===1?" day":" days") + " ago";
  const mo = Math.floor(d/30); return "Updated " + mo + (mo===1?" month":" months") + " ago";
}

// Top-2 lane blend summary for a story record
function laneSummary(laneVals) {
  if (!laneVals) return "No blend set";
  const norm = normalize(laneVals);
  const top = LANES.map(l => ({ label:l.label, pct:norm[l.id]||0 }))
    .filter(x => x.pct > 0).sort((a,b)=>b.pct-a.pct).slice(0,2);
  if (!top.length) return "No blend set";
  return top.map(x => x.label + " " + x.pct + "%").join(" • ");
}

// Status line for a story record
function storyStatus(rec) {
  if (rec.outline && Array.isArray(rec.outline.chapters) && rec.outline.chapters.length) {
    const n = rec.outline.chapters.length;
    const drafted = Object.keys(rec.chapterProse||{}).length;
    return drafted ? (n + " chapters · " + drafted + " drafted") : (n + " chapters outlined");
  }
  if (rec.blueprint) return "Blueprint only";
  return "Inputs only";
}

// ── Universe Lore Generation ──────────────────────────────────

// ── UI Components ─────────────────────────────────────────────

function BlendBar({ vals }) {
  const norm = normalize(vals);
  const active = LANES.filter(l => norm[l.id] > 0);
  if (!active.length) return null;
  return (
    <div style={{ display:"flex", height:8, borderRadius:4, overflow:"hidden", background:C.faint, marginTop:12 }}>
      {active.map(l => (
        <div key={l.id} title={l.label+": "+norm[l.id]+"%"}
             style={{ flex:norm[l.id], background:l.color, transition:"flex 0.3s" }}/>
      ))}
    </div>
  );
}

function LaneSlider({ lane, value, normValue, onChange }) {
  return (
    <div style={{ marginBottom:14 }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"baseline", marginBottom:4 }}>
        <div>
          <span style={{ color:lane.color, fontWeight:600, fontSize:14 }}>{lane.label}</span>
          <span style={{ color:C.muted, fontSize:11, marginLeft:8 }}>{lane.desc}</span>
        </div>
        <span style={{ color:lane.color, fontFamily:"Cormorant Garamond, serif", fontSize:18, fontWeight:600, fontVariantNumeric:"tabular-nums", minWidth:42, textAlign:"right" }}>
          {normValue}%
        </span>
      </div>
      <input type="range" min={0} max={10} value={value} onChange={e=>onChange(+e.target.value)}
        style={{ width:"100%", accentColor:lane.color, height:6 }}/>
    </div>
  );
}

function TropeChip({ trope, active, onClick }) {
  const color = TROPE_CATEGORY_COLORS[trope.category] || C.gold;
  const dots = "●".repeat(trope.heatLevel) + "○".repeat(Math.max(0, 5 - trope.heatLevel));
  return (
    <button onClick={onClick}
      style={{
        position:"relative", padding:"6px 12px 6px 13px", borderRadius:8, textAlign:"left", lineHeight:1.15,
        background: active ? color : "transparent",
        color: active ? "#fff" : C.muted,
        border: "1px solid " + (active ? color : C.borderLight),
        borderLeft: "3px solid " + color,
        fontSize:12, fontWeight:500, cursor:"pointer", fontFamily:"Nunito, sans-serif"
      }}>
      <span style={{ display:"flex", alignItems:"center", gap:5 }}>
        <span>{trope.name}</span>
        {trope.seriesFriendly && <span style={{ fontSize:10, opacity:0.85 }}>⊕</span>}
      </span>
      <span style={{ display:"block", fontSize:9, opacity:0.65, marginTop:1, letterSpacing:1 }}>{dots}</span>
    </button>
  );
}

function HeatBtn({ heat, active, onClick }) {
  return (
    <button onClick={onClick}
      style={{
        flex:1, padding:"10px 8px", borderRadius:8,
        background: active ? heat.color+"22" : "transparent",
        border: "1px solid " + (active ? heat.color : C.borderLight),
        cursor:"pointer", textAlign:"left", transition:"all 0.15s"
      }}>
      <div style={{ fontSize:20 }}>{heat.emoji}</div>
      <div style={{ color:active?heat.color:C.text, fontWeight:600, fontSize:13, marginTop:2 }}>
        {heat.level}. {heat.label}
      </div>
      <div style={{ color:C.muted, fontSize:11, marginTop:2, lineHeight:1.3 }}>{heat.desc}</div>
    </button>
  );
}

function AttrBar({ label, value }) {
  return (
    <div style={{ display:"flex", alignItems:"center", gap:8, fontSize:11, color:C.muted, marginBottom:3 }}>
      <span style={{ minWidth:78, textAlign:"right" }}>{label}</span>
      <div style={{ flex:1, height:5, background:C.faint, borderRadius:3, overflow:"hidden" }}>
        <div style={{ width:(value*10)+"%", height:"100%", background:C.gold, borderRadius:3 }}/>
      </div>
      <span style={{ minWidth:18, color:C.text, fontVariantNumeric:"tabular-nums" }}>{value}</span>
    </div>
  );
}

function ArchetypeRow({ arch, selected, onClick }) {
  const isTop = arch.tags.includes("top");
  const isGrow = arch.tags.includes("grow");
  const isFresh = arch.tags.includes("fresh");
  return (
    <button onClick={onClick}
      style={{
        textAlign:"left", width:"100%", padding:"10px 12px",
        background: selected ? C.glow : "transparent",
        border: "1px solid " + (selected ? C.gold : C.borderLight),
        borderRadius:8, cursor:"pointer", marginBottom:6, transition:"all 0.15s"
      }}>
      <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:4 }}>
        <div style={{ color:selected?C.gold:C.text, fontWeight:600, fontSize:14 }}>{arch.n}</div>
        {isTop && <span style={{ fontSize:9, color:C.gold, border:"1px solid "+C.gold, padding:"1px 5px", borderRadius:3 }}>TOP</span>}
        {isGrow && <span style={{ fontSize:9, color:"#2D8B7A", border:"1px solid #2D8B7A", padding:"1px 5px", borderRadius:3 }}>GROWING</span>}
        {isFresh && <span style={{ fontSize:9, color:"#A070C8", border:"1px solid #A070C8", padding:"1px 5px", borderRadius:3 }}>FRESH</span>}
      </div>
      <div style={{ color:C.muted, fontSize:11, marginBottom:6 }}>{arch.cat} · {arch.wound}</div>
      <AttrBar label="Power" value={arch.P}/>
      <AttrBar label="Wealth" value={arch.W}/>
      <AttrBar label="Emotional" value={arch.E}/>
      <AttrBar label="Protective" value={arch.R}/>
      <AttrBar label="Community" value={arch.Ch}/>
    </button>
  );
}

function ArchetypePicker({ label, archetypes, selected, onSelect, recommendations, accent }) {
  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState("All");
  const cats = ["All", ...new Set(archetypes.map(a=>a.cat))];
  const filtered = filter==="All" ? archetypes : archetypes.filter(a=>a.cat===filter);
  const accentC = accent || C.gold;
  return (
    <div style={{ marginBottom:18 }}>
      <div style={{ color:accentC, fontFamily:"Cormorant Garamond, serif", fontSize:18, fontWeight:600, marginBottom:8 }}>{label}</div>

      {/* Collapsed pill */}
      {!selected ? (
        <button onClick={()=>setOpen(o=>!o)}
          style={{ padding:"8px 16px", background:"transparent", border:"1px solid "+C.borderLight, color:C.muted,
                   borderRadius:20, fontSize:13, cursor:"pointer", fontFamily:"Nunito, sans-serif" }}>
          AI will choose  ↓
        </button>
      ) : (
        <div>
          <div style={{ display:"inline-flex", alignItems:"center", gap:6, padding:"7px 8px 7px 16px",
                        background:C.glow, border:"1px solid "+C.gold, borderRadius:20 }}>
            <button onClick={()=>setOpen(o=>!o)}
              style={{ background:"transparent", border:"none", color:C.gold, fontSize:13, fontWeight:600,
                       cursor:"pointer", fontFamily:"Nunito, sans-serif", padding:0 }}>
              {selected.n}
            </button>
            <button onClick={()=>onSelect(null)}
              style={{ background:"transparent", border:"none", color:C.gold, fontSize:15, cursor:"pointer", lineHeight:1, padding:"0 4px" }}>×</button>
          </div>
          <div style={{ color:C.muted, fontSize:11, marginTop:4 }}>
            {(selected.cat + " · " + selected.wound).slice(0,55)}
          </div>
        </div>
      )}

      {/* Open: recommendations + category tabs + browse-all list */}
      {open && (
        <div style={{ marginTop:12 }}>
          {recommendations && recommendations.length > 0 && (
            <div style={{ marginBottom:12 }}>
              <div style={{ color:C.muted, fontSize:11, marginBottom:6, letterSpacing:0.5, textTransform:"uppercase" }}>Recommended for your blend</div>
              <div style={{ display:"grid", gap:6 }}>
                {recommendations.map(a=>(
                  <ArchetypeRow key={a.id} arch={a} selected={selected && selected.id===a.id} onClick={()=>{onSelect(a); setOpen(false);}}/>
                ))}
              </div>
            </div>
          )}
          <div style={{ display:"flex", flexWrap:"wrap", gap:6, marginBottom:10 }}>
            {cats.map(c=>(
              <Chip key={c} active={filter===c} onClick={()=>setFilter(c)} color={accentC}>{c}</Chip>
            ))}
          </div>
          <div style={{ maxHeight:360, overflowY:"auto", paddingRight:4 }}>
            {filtered.map(a=>(
              <ArchetypeRow key={a.id} arch={a} selected={selected && selected.id===a.id} onClick={()=>{onSelect(a); setOpen(false);}}/>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── New Pickers: Wounds, Settings, Family, Intensity ──────────

function WoundRow({ wound, selected, onClick }) {
  const isBest = wound.tags && wound.tags.includes("bestseller");
  return (
    <button onClick={onClick}
      style={{
        textAlign:"left", width:"100%", padding:"9px 12px",
        background: selected ? C.glow : "transparent",
        border: "1px solid " + (selected ? C.gold : C.borderLight),
        borderRadius:8, cursor:"pointer", marginBottom:6, transition:"all 0.15s"
      }}>
      <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:3 }}>
        <div style={{ color:selected?C.gold:C.text, fontWeight:600, fontSize:13 }}>{wound.n}</div>
        {isBest && <span style={{ fontSize:9, color:C.gold, border:"1px solid "+C.gold, padding:"1px 5px", borderRadius:3 }}>BESTSELLER</span>}
      </div>
      <div style={{ color:C.muted, fontSize:11, lineHeight:1.4 }}>
        <span style={{ color:"#B07A1F" }}>Fear:</span> {wound.fear} · <span style={{ color:"#2D8B7A" }}>Heals via:</span> {wound.heal}
      </div>
    </button>
  );
}

function WoundPicker({ label, selected, onSelect, accent }) {
  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState("Bestsellers");
  const cats = ["Bestsellers", "All", ...new Set(WOUNDS.map(w=>w.cat))];
  let filtered;
  if (filter === "Bestsellers") filtered = WOUNDS.filter(w => w.tags && w.tags.includes("bestseller"));
  else if (filter === "All") filtered = WOUNDS;
  else filtered = WOUNDS.filter(w => w.cat === filter);

  return (
    <div style={{ marginBottom:14 }}>
      <div style={{ display:"flex", alignItems:"baseline", justifyContent:"space-between", marginBottom:6 }}>
        <div style={{ color:accent||C.gold, fontSize:13, fontWeight:600 }}>{label}</div>
        <button onClick={()=>setOpen(!open)}
          style={{ background:"transparent", border:"none", color:C.muted, fontSize:11, cursor:"pointer", textDecoration:"underline" }}>
          {open ? "Close" : "Browse wounds"}
        </button>
      </div>
      <div style={{ padding:"8px 11px", background:C.card, border:"1px solid "+(selected?C.gold:C.border), borderRadius:8 }}>
        <div style={{ color:selected?C.text:C.muted, fontSize:13, fontWeight:600 }}>
          {selected ? selected.n : "AI will choose"}
        </div>
        {selected && (
          <div style={{ color:C.muted, fontSize:11, marginTop:3, lineHeight:1.4 }}>
            <span style={{ color:"#B07A1F" }}>Fear:</span> {selected.fear}
          </div>
        )}
        {selected && (
          <button onClick={()=>onSelect(null)}
            style={{ marginTop:5, background:"transparent", border:"none", color:C.muted, fontSize:10, cursor:"pointer", textDecoration:"underline" }}>
            Clear
          </button>
        )}
      </div>
      {open && (
        <div style={{ marginTop:10 }}>
          <div style={{ display:"flex", flexWrap:"wrap", gap:5, marginBottom:8 }}>
            {cats.map(c=>(
              <Chip key={c} active={filter===c} onClick={()=>setFilter(c)} color={accent}>{c}</Chip>
            ))}
          </div>
          <div style={{ maxHeight:280, overflowY:"auto", paddingRight:4 }}>
            {filtered.map(w=>(
              <WoundRow key={w.id} wound={w} selected={selected && selected.id===w.id} onClick={()=>{onSelect(w); setOpen(false);}}/>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function BestPairingsBar({ onApply }) {
  return (
    <div style={{ marginBottom:14, padding:"12px 14px", background:C.surface, border:"1px solid "+C.border, borderRadius:8 }}>
      <div style={{ color:C.gold, fontSize:12, fontWeight:600, marginBottom:8, letterSpacing:0.5, textTransform:"uppercase" }}>
        Bestseller Wound Pairings
      </div>
      <div style={{ color:C.muted, fontSize:11, marginBottom:10 }}>
        Click to apply both hero + heroine wounds at once
      </div>
      <div style={{ display:"grid", gap:6 }}>
        {WOUND_PAIRINGS.map((p,i)=>(
          <button key={i} onClick={()=>onApply(p)}
            style={{ textAlign:"left", padding:"8px 10px", background:"transparent", border:"1px solid "+C.borderLight,
                     borderRadius:6, cursor:"pointer", color:C.text, fontSize:12, transition:"all 0.15s" }}>
            <div style={{ fontWeight:600, color:C.text, marginBottom:2 }}>{p.name}</div>
            <div style={{ fontSize:10, color:C.muted }}>{p.note}</div>
          </button>
        ))}
      </div>
    </div>
  );
}

function SettingPicker({ selected, onSelect, city, onCityChange, accent }) {
  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState("All");
  const cats = ["All", ...new Set(SETTINGS.map(s=>s.cat))];
  const filtered = filter==="All" ? SETTINGS : SETTINGS.filter(s=>s.cat===filter);
  const allCities = ["", ...CITIES.tier1, ...CITIES.tier2, ...CITIES.tier3];

  return (
    <div style={{ marginBottom:14 }}>
      <div style={{ display:"flex", alignItems:"baseline", justifyContent:"space-between", marginBottom:6 }}>
        <div style={{ color:accent||C.gold, fontSize:13, fontWeight:600 }}>Setting</div>
        <button onClick={()=>setOpen(!open)}
          style={{ background:"transparent", border:"none", color:C.muted, fontSize:11, cursor:"pointer", textDecoration:"underline" }}>
          {open ? "Close" : "Browse settings"}
        </button>
      </div>
      <div style={{ padding:"8px 11px", background:C.card, border:"1px solid "+(selected?C.gold:C.border), borderRadius:8 }}>
        <div style={{ color:selected?C.text:C.muted, fontSize:13, fontWeight:600 }}>
          {selected ? selected.n : "AI will choose"}
        </div>
        {selected && <div style={{ color:C.muted, fontSize:11, marginTop:3 }}>{selected.cat} · {selected.themes}</div>}
        {selected && (
          <button onClick={()=>onSelect(null)}
            style={{ marginTop:5, background:"transparent", border:"none", color:C.muted, fontSize:10, cursor:"pointer", textDecoration:"underline" }}>
            Clear
          </button>
        )}
      </div>
      <div style={{ marginTop:8, display:"flex", alignItems:"center", gap:8 }}>
        <label style={{ color:C.muted, fontSize:11, minWidth:60 }}>City:</label>
        <select value={city||""} onChange={e=>onCityChange(e.target.value||null)}
          style={{ flex:1, padding:"6px 8px", background:C.card, color:C.text, border:"1px solid "+C.border,
                   borderRadius:6, fontSize:12, fontFamily:"Nunito, sans-serif" }}>
          <option value="">— Any / AI choose —</option>
          <optgroup label="Tier 1 (Highest demand)">
            {CITIES.tier1.map(c=><option key={c} value={c}>{c}</option>)}
          </optgroup>
          <optgroup label="Tier 2">
            {CITIES.tier2.map(c=><option key={c} value={c}>{c}</option>)}
          </optgroup>
          <optgroup label="Tier 3">
            {CITIES.tier3.map(c=><option key={c} value={c}>{c}</option>)}
          </optgroup>
        </select>
      </div>
      {open && (
        <div style={{ marginTop:10 }}>
          <div style={{ display:"flex", flexWrap:"wrap", gap:5, marginBottom:8 }}>
            {cats.map(c=>(
              <Chip key={c} active={filter===c} onClick={()=>setFilter(c)} color={accent}>{c}</Chip>
            ))}
          </div>
          <div style={{ maxHeight:300, overflowY:"auto", paddingRight:4 }}>
            {filtered.map(s=>(
              <button key={s.id} onClick={()=>{onSelect(s); setOpen(false);}}
                style={{ textAlign:"left", width:"100%", padding:"9px 11px", marginBottom:5,
                         background: selected && selected.id===s.id ? C.glow : "transparent",
                         border: "1px solid " + (selected && selected.id===s.id ? C.gold : C.borderLight),
                         borderRadius:7, cursor:"pointer" }}>
                <div style={{ color:selected && selected.id===s.id?C.gold:C.text, fontWeight:600, fontSize:13 }}>{s.n}</div>
                <div style={{ color:C.muted, fontSize:11, marginTop:2 }}>{s.cat} · {s.themes}</div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function FamilyPicker({ selected, onSelect, accent }) {
  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState("All");
  const cats = ["All", ...new Set(FAMILIES.map(f=>f.cat))];
  const filtered = filter==="All" ? FAMILIES : FAMILIES.filter(f=>f.cat===filter);

  return (
    <div style={{ marginBottom:14 }}>
      <div style={{ display:"flex", alignItems:"baseline", justifyContent:"space-between", marginBottom:6 }}>
        <div style={{ color:accent||C.gold, fontSize:13, fontWeight:600 }}>Family Structure</div>
        <button onClick={()=>setOpen(!open)}
          style={{ background:"transparent", border:"none", color:C.muted, fontSize:11, cursor:"pointer", textDecoration:"underline" }}>
          {open ? "Close" : "Browse families"}
        </button>
      </div>
      <div style={{ padding:"8px 11px", background:C.card, border:"1px solid "+(selected?C.gold:C.border), borderRadius:8 }}>
        <div style={{ color:selected?C.text:C.muted, fontSize:13, fontWeight:600 }}>
          {selected ? selected.n : "AI will choose"}
        </div>
        {selected && <div style={{ color:C.muted, fontSize:11, marginTop:3 }}>{selected.cat} · {selected.themes}</div>}
        {selected && (
          <button onClick={()=>onSelect(null)}
            style={{ marginTop:5, background:"transparent", border:"none", color:C.muted, fontSize:10, cursor:"pointer", textDecoration:"underline" }}>
            Clear
          </button>
        )}
      </div>
      {open && (
        <div style={{ marginTop:10 }}>
          <div style={{ display:"flex", flexWrap:"wrap", gap:5, marginBottom:8 }}>
            {cats.map(c=>(
              <Chip key={c} active={filter===c} onClick={()=>setFilter(c)} color={accent}>{c}</Chip>
            ))}
          </div>
          <div style={{ maxHeight:300, overflowY:"auto", paddingRight:4 }}>
            {filtered.map(f=>{
              const isBest = f.tags && f.tags.includes("bestseller");
              return (
                <button key={f.id} onClick={()=>{onSelect(f); setOpen(false);}}
                  style={{ textAlign:"left", width:"100%", padding:"9px 11px", marginBottom:5,
                           background: selected && selected.id===f.id ? C.glow : "transparent",
                           border: "1px solid " + (selected && selected.id===f.id ? C.gold : C.borderLight),
                           borderRadius:7, cursor:"pointer" }}>
                  <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                    <div style={{ color:selected && selected.id===f.id?C.gold:C.text, fontWeight:600, fontSize:13 }}>{f.n}</div>
                    {isBest && <span style={{ fontSize:9, color:C.gold, border:"1px solid "+C.gold, padding:"1px 5px", borderRadius:3 }}>BESTSELLER</span>}
                  </div>
                  <div style={{ color:C.muted, fontSize:11, marginTop:2 }}>{f.cat} · {f.themes}</div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function IntensitySlider({ value, onChange }) {
  const current = INTENSITY[value-1];
  return (
    <div style={{ marginBottom:14 }}>
      <div style={{ display:"flex", alignItems:"baseline", justifyContent:"space-between", marginBottom:6 }}>
        <div style={{ color:C.gold, fontSize:13, fontWeight:600 }}>Conflict Intensity</div>
        <div style={{ color:C.gold, fontFamily:"Cormorant Garamond, serif", fontSize:18, fontWeight:600 }}>
          {value}/5
        </div>
      </div>
      <div style={{ padding:"10px 12px", background:C.card, border:"1px solid "+C.border, borderRadius:8, marginBottom:8 }}>
        <div style={{ color:C.text, fontWeight:600, fontSize:13 }}>{current.name}</div>
        <div style={{ color:C.muted, fontSize:11, marginTop:3 }}>{current.desc}</div>
      </div>
      <input type="range" min={1} max={5} value={value} onChange={e=>onChange(+e.target.value)}
        style={{ width:"100%", accentColor:C.gold, height:6 }}/>
      <div style={{ display:"flex", justifyContent:"space-between", color:C.muted, fontSize:10, marginTop:4 }}>
        <span>Low</span><span>Moderate</span><span>High</span><span>Major</span><span>Life-Changing</span>
      </div>
    </div>
  );
}

// ── ConflictPicker (External Conflicts) ──────────────────────
function ConflictPicker({ selected, onSelect, accent }) {
  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState("Bestsellers");
  const cats = ["Bestsellers","All", ...new Set(CONFLICTS.map(c=>c.cat))];
  let filtered;
  if (filter === "Bestsellers") filtered = CONFLICTS.filter(c=>c.tags && c.tags.includes("bestseller"));
  else if (filter === "All") filtered = CONFLICTS;
  else filtered = CONFLICTS.filter(c=>c.cat===filter);

  return (
    <div style={{ marginBottom:14 }}>
      <div style={{ display:"flex", alignItems:"baseline", justifyContent:"space-between", marginBottom:6 }}>
        <div style={{ color:accent||C.gold, fontSize:13, fontWeight:600 }}>External Conflict <span style={{ color:C.muted, fontWeight:400, fontSize:10 }}>· the real-world pressure</span></div>
        <button onClick={()=>setOpen(!open)}
          style={{ background:"transparent", border:"none", color:C.muted, fontSize:11, cursor:"pointer", textDecoration:"underline" }}>
          {open ? "Close" : "Browse conflicts"}
        </button>
      </div>
      <div style={{ padding:"8px 11px", background:C.card, border:"1px solid "+(selected?C.gold:C.border), borderRadius:8 }}>
        <div style={{ color:selected?C.text:C.muted, fontSize:13, fontWeight:600 }}>
          {selected ? selected.n : "AI will choose from bestsellers"}
        </div>
        {selected && <div style={{ color:C.muted, fontSize:11, marginTop:3 }}>{selected.cat} · {selected.pressure}</div>}
        {selected && (
          <button onClick={()=>onSelect(null)}
            style={{ marginTop:5, background:"transparent", border:"none", color:C.muted, fontSize:10, cursor:"pointer", textDecoration:"underline" }}>
            Clear
          </button>
        )}
      </div>
      {open && (
        <div style={{ marginTop:10 }}>
          <div style={{ display:"flex", flexWrap:"wrap", gap:5, marginBottom:8 }}>
            {cats.map(c=>(
              <Chip key={c} active={filter===c} onClick={()=>setFilter(c)} color={accent}>{c}</Chip>
            ))}
          </div>
          <div style={{ maxHeight:280, overflowY:"auto", paddingRight:4 }}>
            {filtered.map(c=>{
              const isBest = c.tags && c.tags.includes("bestseller");
              return (
                <button key={c.id} onClick={()=>{onSelect(c); setOpen(false);}}
                  style={{ textAlign:"left", width:"100%", padding:"9px 11px", marginBottom:5,
                           background: selected && selected.id===c.id ? C.glow : "transparent",
                           border: "1px solid " + (selected && selected.id===c.id ? C.gold : C.borderLight),
                           borderRadius:7, cursor:"pointer" }}>
                  <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                    <div style={{ color:selected && selected.id===c.id?C.gold:C.text, fontWeight:600, fontSize:13 }}>{c.n}</div>
                    {isBest && <span style={{ fontSize:9, color:C.gold, border:"1px solid "+C.gold, padding:"1px 5px", borderRadius:3 }}>BESTSELLER</span>}
                  </div>
                  <div style={{ color:C.muted, fontSize:11, marginTop:2 }}>{c.cat} · {c.pressure}</div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// ── ObstaclePicker (Relationship Obstacles) ──────────────────
function ObstaclePicker({ selected, onSelect, accent }) {
  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState("Bestsellers");
  const cats = ["Bestsellers","All", ...new Set(OBSTACLES.map(o=>o.cat))];
  let filtered;
  if (filter === "Bestsellers") filtered = OBSTACLES.filter(o=>o.tags && o.tags.includes("bestseller"));
  else if (filter === "All") filtered = OBSTACLES;
  else filtered = OBSTACLES.filter(o=>o.cat===filter);

  return (
    <div style={{ marginBottom:14 }}>
      <div style={{ display:"flex", alignItems:"baseline", justifyContent:"space-between", marginBottom:6 }}>
        <div style={{ color:accent||C.gold, fontSize:13, fontWeight:600 }}>Relationship Obstacle <span style={{ color:C.muted, fontWeight:400, fontSize:10 }}>· what keeps them apart</span></div>
        <button onClick={()=>setOpen(!open)}
          style={{ background:"transparent", border:"none", color:C.muted, fontSize:11, cursor:"pointer", textDecoration:"underline" }}>
          {open ? "Close" : "Browse obstacles"}
        </button>
      </div>
      <div style={{ padding:"8px 11px", background:C.card, border:"1px solid "+(selected?C.gold:C.border), borderRadius:8 }}>
        <div style={{ color:selected?C.text:C.muted, fontSize:13, fontWeight:600 }}>
          {selected ? selected.n : "AI will choose from bestsellers"}
        </div>
        {selected && <div style={{ color:C.muted, fontSize:11, marginTop:3, fontStyle:"italic" }}>{selected.question}</div>}
        {selected && (
          <button onClick={()=>onSelect(null)}
            style={{ marginTop:5, background:"transparent", border:"none", color:C.muted, fontSize:10, cursor:"pointer", textDecoration:"underline" }}>
            Clear
          </button>
        )}
      </div>
      {open && (
        <div style={{ marginTop:10 }}>
          <div style={{ display:"flex", flexWrap:"wrap", gap:5, marginBottom:8 }}>
            {cats.map(c=>(
              <Chip key={c} active={filter===c} onClick={()=>setFilter(c)} color={accent}>{c}</Chip>
            ))}
          </div>
          <div style={{ maxHeight:280, overflowY:"auto", paddingRight:4 }}>
            {filtered.map(o=>{
              const isBest = o.tags && o.tags.includes("bestseller");
              return (
                <button key={o.id} onClick={()=>{onSelect(o); setOpen(false);}}
                  style={{ textAlign:"left", width:"100%", padding:"9px 11px", marginBottom:5,
                           background: selected && selected.id===o.id ? C.glow : "transparent",
                           border: "1px solid " + (selected && selected.id===o.id ? C.gold : C.borderLight),
                           borderRadius:7, cursor:"pointer" }}>
                  <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                    <div style={{ color:selected && selected.id===o.id?C.gold:C.text, fontWeight:600, fontSize:13 }}>{o.n}</div>
                    {isBest && <span style={{ fontSize:9, color:C.gold, border:"1px solid "+C.gold, padding:"1px 5px", borderRadius:3 }}>BESTSELLER</span>}
                  </div>
                  <div style={{ color:C.muted, fontSize:11, marginTop:2, fontStyle:"italic" }}>{o.cat} · {o.question}</div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// ── ConflictStacksBar — pre-built wound + conflict combos ────
function ConflictStacksBar({ onApply }) {
  return (
    <div style={{ marginBottom:14, padding:"12px 14px", background:C.surface, border:"1px solid "+C.border, borderRadius:8 }}>
      <div style={{ color:C.gold, fontSize:12, fontWeight:600, marginBottom:8, letterSpacing:0.5, textTransform:"uppercase" }}>
        Marketable Conflict Stacks
      </div>
      <div style={{ color:C.muted, fontSize:11, marginBottom:10 }}>
        Click to apply the wound + external conflict at once
      </div>
      <div style={{ display:"grid", gap:6 }}>
        {CONFLICT_STACKS.map((p,i)=>(
          <button key={i} onClick={()=>onApply(p)}
            style={{ textAlign:"left", padding:"8px 10px", background:"transparent", border:"1px solid "+C.borderLight,
                     borderRadius:6, cursor:"pointer", color:C.text, fontSize:12, transition:"all 0.15s" }}>
            <div style={{ fontWeight:600, color:C.text, marginBottom:2 }}>{p.name || p.n} <span style={{ color:C.amber, fontWeight:400, fontStyle:"italic" }}>· {p.theme}</span></div>
            <div style={{ fontSize:10, color:C.muted }}>{p.desc}</div>
          </button>
        ))}
      </div>
    </div>
  );
}

// ── FamilyInfluenceSlider — hidden score that drives cast size ──
function FamilyInfluenceSlider({ value, onChange }) {
  let castNote;
  if (value <= 3) castNote = "Family barely impacts the story · ~2 supporting characters";
  else if (value <= 6) castNote = "Family is present, not dominant · ~3 supporting characters";
  else if (value <= 8) castNote = "Family is a co-star · 4+ named supporting characters (aunties, cousins, grandparents)";
  else castNote = "Family is a co-protagonist · 5+ named supporting characters. Bestselling Black romance lives here.";

  return (
    <div style={{ marginBottom:14 }}>
      <div style={{ display:"flex", alignItems:"baseline", justifyContent:"space-between", marginBottom:6 }}>
        <div style={{ color:C.gold, fontSize:13, fontWeight:600 }}>Family Influence Score</div>
        <div style={{ color:C.gold, fontFamily:"Cormorant Garamond, serif", fontSize:18, fontWeight:600 }}>
          {value}/10
        </div>
      </div>
      <div style={{ padding:"10px 12px", background:C.card, border:"1px solid "+C.border, borderRadius:8, marginBottom:8 }}>
        <div style={{ color:C.text, fontSize:12, lineHeight:1.5 }}>{castNote}</div>
      </div>
      <input type="range" min={1} max={10} value={value} onChange={e=>onChange(+e.target.value)}
        style={{ width:"100%", accentColor:C.gold, height:6 }}/>
      <div style={{ display:"flex", justifyContent:"space-between", color:C.muted, fontSize:10, marginTop:4 }}>
        <span>Solo</span><span>Background</span><span>Present</span><span>Co-star</span><span>Co-protagonist</span>
      </div>
    </div>
  );
}

// ── Output Components ─────────────────────────────────────────

// ── Spice + Intensity UI ───────────────────────────────────────

function SpiceLevelSelector({ value, onChange }) {
  const current = SPICE_LEVELS[value-1] || SPICE_LEVELS[2];
  return (
    <div style={{ padding:"16px 18px", background:C.card, border:"1px solid "+C.borderLight, borderRadius:10, marginBottom:14 }}>
      <div style={{ display:"flex", alignItems:"baseline", justifyContent:"space-between", marginBottom:10, flexWrap:"wrap", gap:8 }}>
        <div>
          <div style={{ color:C.amber, fontSize:11, letterSpacing:1.5, textTransform:"uppercase", fontWeight:700 }}>
            🌶 Spice Level
          </div>
          <div style={{ color:C.muted, fontSize:11, marginTop:2 }}>
            How much romantic and physical chemistry the story emphasizes
          </div>
        </div>
        <div style={{ color:C.gold, fontFamily:"Cormorant Garamond, serif", fontSize:22, fontWeight:700 }}>
          {value} · {current.label}
        </div>
      </div>
      <div style={{ display:"flex", gap:6, flexWrap:"wrap", marginBottom:12 }}>
        {SPICE_LEVELS.map(lvl => (
          <button key={lvl.level} onClick={()=>onChange(lvl.level)}
            style={{ flex:1, minWidth:80, padding:"8px 6px",
                     background: value===lvl.level ? C.gold : "transparent",
                     color: value===lvl.level ? C.bg : C.text,
                     border:"1px solid " + (value===lvl.level ? C.gold : C.borderLight),
                     borderRadius:6, cursor:"pointer", fontSize:11, fontWeight:600,
                     fontFamily:"Nunito, sans-serif" }}>
            <div style={{ fontSize:14, fontWeight:700 }}>{lvl.level}</div>
            <div style={{ fontSize:10, marginTop:2 }}>{lvl.label}</div>
          </button>
        ))}
      </div>
      <div style={{ padding:"10px 14px", background:C.manuscript, borderLeft:"3px solid "+C.gold, borderRadius:4, fontSize:12, color:C.text, lineHeight:1.6 }}>
        <div style={{ color:C.amber, fontSize:10, fontWeight:700, textTransform:"uppercase", letterSpacing:1, marginBottom:4 }}>
          Focus: {current.focus}
        </div>
        <div style={{ fontStyle:"italic", marginBottom:6 }}>{current.summary}</div>
        <div style={{ color:C.muted, fontSize:11 }}>
          {current.chars.map((c,i)=>(
            <span key={i}>
              {i>0 && <span style={{ color:C.faint, margin:"0 4px" }}>·</span>}
              {c}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

function IntensityProfile({ value, onChange }) {
  return (
    <div style={{ padding:"16px 18px", background:C.card, border:"1px solid "+C.borderLight, borderRadius:10, marginBottom:14 }}>
      <div style={{ marginBottom:12 }}>
        <div style={{ color:C.amber, fontSize:11, letterSpacing:1.5, textTransform:"uppercase", fontWeight:700 }}>
          💗 Romance Intensity Profile
        </div>
        <div style={{ color:C.muted, fontSize:11, marginTop:2, lineHeight:1.4 }}>
          Four dimensions of relationship-centered storytelling. Higher values do NOT mean more sex — they mean more relationship-driven prose.
        </div>
      </div>
      <div style={{ display:"grid", gap:14 }}>
        {INTENSITY_DIMENSIONS.map(dim => {
          const v = value[dim.key] || 3;
          return (
            <div key={dim.key}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"baseline", marginBottom:4 }}>
                <div>
                  <div style={{ color:C.text, fontSize:12, fontWeight:600 }}>{dim.label}</div>
                  <div style={{ color:C.muted, fontSize:10, lineHeight:1.4 }}>{dim.desc}</div>
                </div>
                <div style={{ color:C.gold, fontFamily:"Cormorant Garamond, serif", fontSize:18, fontWeight:700, minWidth:30, textAlign:"right" }}>
                  {v}
                </div>
              </div>
              <input type="range" min={1} max={5} value={v}
                onChange={e=>onChange({...value, [dim.key]: +e.target.value})}
                style={{ width:"100%", accentColor:C.gold, height:6 }}/>
              <div style={{ color:C.muted, fontSize:10, fontStyle:"italic", marginTop:2, textAlign:"center" }}>
                {dim.scale[v-1]}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Erotic Romance Engine UI (W3) ──────────────────────────────
function EroticEngine({ value, onChange, categoryName, onApplyCategory }) {
  return (
    <div style={{ padding:"16px 18px", background:C.card, border:"1px solid "+C.borderLight, borderRadius:10, marginBottom:14 }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", gap:10, marginBottom:12 }}>
        <div>
          <div style={{ color:C.amber, fontSize:11, letterSpacing:1.5, textTransform:"uppercase", fontWeight:700 }}>
            🔥 Erotic Romance Engine
          </div>
          <div style={{ color:C.muted, fontSize:11, marginTop:2, lineHeight:1.4 }}>
            Relationship, desire, chemistry & intimacy dynamics — independent of Spice Level (which controls heat/content). High Erotic Romance can pair with any spice level.
          </div>
        </div>
        {categoryName && onApplyCategory && (
          <button onClick={onApplyCategory}
            style={{ padding:"6px 11px", background:"transparent", color:C.gold, border:"1px solid "+C.gold,
                     borderRadius:7, fontSize:10, fontWeight:600, cursor:"pointer", whiteSpace:"nowrap", fontFamily:"Nunito, sans-serif" }}>
            ↻ {categoryName} baseline
          </button>
        )}
      </div>
      <div style={{ display:"grid", gap:14 }}>
        {EROTIC_DIMENSIONS.map(dim => {
          const v = value[dim.key] || 3;
          return (
            <div key={dim.key}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"baseline", marginBottom:4 }}>
                <div>
                  <div style={{ color:C.text, fontSize:12, fontWeight:600 }}>{dim.label}</div>
                  <div style={{ color:C.muted, fontSize:10, lineHeight:1.4 }}>{dim.desc}</div>
                </div>
                <div style={{ color:C.gold, fontFamily:"Cormorant Garamond, serif", fontSize:18, fontWeight:700, minWidth:30, textAlign:"right" }}>{v}</div>
              </div>
              <input type="range" min={1} max={5} value={v}
                onChange={e=>onChange({...value, [dim.key]: +e.target.value})}
                style={{ width:"100%", accentColor:C.gold, height:6 }}/>
              <div style={{ color:C.muted, fontSize:10, fontStyle:"italic", marginTop:2, textAlign:"center" }}>{dim.scale[v-1]}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Generic engine slider panel (W4: Street Lit, Suspense) ─────
function EngineSliders({ icon, title, note, dims, value, onChange, categoryName, onApplyCategory }) {
  return (
    <div style={{ padding:"16px 18px", background:C.card, border:"1px solid "+C.borderLight, borderRadius:10, marginBottom:14 }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", gap:10, marginBottom:12 }}>
        <div>
          <div style={{ color:C.amber, fontSize:11, letterSpacing:1.5, textTransform:"uppercase", fontWeight:700 }}>{icon} {title}</div>
          {note && <div style={{ color:C.muted, fontSize:11, marginTop:2, lineHeight:1.4 }}>{note}</div>}
        </div>
        {categoryName && onApplyCategory && (
          <button onClick={onApplyCategory}
            style={{ padding:"6px 11px", background:"transparent", color:C.gold, border:"1px solid "+C.gold,
                     borderRadius:7, fontSize:10, fontWeight:600, cursor:"pointer", whiteSpace:"nowrap", fontFamily:"Nunito, sans-serif" }}>
            ↻ {categoryName} baseline
          </button>
        )}
      </div>
      <div style={{ display:"grid", gap:14 }}>
        {dims.map(dim => {
          const v = value[dim.key] || 2;
          return (
            <div key={dim.key}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"baseline", marginBottom:4 }}>
                <div>
                  <div style={{ color:C.text, fontSize:12, fontWeight:600 }}>{dim.label}</div>
                  <div style={{ color:C.muted, fontSize:10, lineHeight:1.4 }}>{dim.desc}</div>
                </div>
                <div style={{ color:C.gold, fontFamily:"Cormorant Garamond, serif", fontSize:18, fontWeight:700, minWidth:30, textAlign:"right" }}>{v}</div>
              </div>
              <input type="range" min={1} max={5} value={v}
                onChange={e=>onChange({...value, [dim.key]: +e.target.value})}
                style={{ width:"100%", accentColor:C.gold, height:6 }}/>
              <div style={{ color:C.muted, fontSize:10, fontStyle:"italic", marginTop:2, textAlign:"center" }}>{dim.scale[v-1]}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Genre Preset quick-start bar (Phase 1.5) ───────────────────
function GenrePresetBar({ selected, onSelect }) {
  return (
    <div style={{ marginBottom: 18 }}>
      <div style={{ color: C.gold, fontSize: 11, letterSpacing: 1.5,
                    textTransform: "uppercase", fontWeight: 700, marginBottom: 8 }}>
        Quick Start · Genre Preset
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
        {GENRE_PRESETS.map(p => (
          <button key={p.id} onClick={() => onSelect(p)}
            style={{
              padding: "7px 14px", borderRadius: 18,
              background: selected === p.id ? C.gold : "transparent",
              color: selected === p.id ? C.bg : C.text,
              border: "1px solid " + (selected === p.id ? C.gold : C.borderLight),
              fontSize: 13, fontWeight: 500, cursor: "pointer",
              fontFamily: "Nunito, sans-serif",
            }}>
            {p.icon} {p.label}
          </button>
        ))}
      </div>
      {selected && selected !== "custom" && (
        <div style={{ marginTop: 6, color: C.muted, fontSize: 11 }}>
          Auto-calibrated · Override anything in Advanced Calibration below
        </div>
      )}
    </div>
  );
}

// ── Premium Left Navigation (Notion / Linear / Arc aesthetic) ─

const NAV_SECTIONS = [
  { group: "primary", items: [
    { id: "dashboard", label: "Dashboard", icon: "🏠" },
    { id: "myStories", label: "My Stories", icon: "📚" },
    { id: "newStory", label: "New Story", icon: "✨" }
  ]},
  { group: "creative", label: "Creative Suite", items: [
    { id: "storyBible", label: "Story Bible", icon: "🧬", requiresStory: true },
    { id: "characterStudio", label: "Character Studio", icon: "❤️", requiresStory: true },
    { id: "worldBuilder", label: "World Builder", icon: "🌎" },
    { id: "sceneStudio", label: "Scene Studio", icon: "🎭", requiresStory: true },
    { id: "draftManuscript", label: "Draft Manuscript", icon: "📝", requiresStory: true },
    { id: "editorMode", label: "Editor Mode", icon: "🔍", requiresStory: true }
  ]},
  { group: "intelligence", label: "Intelligence", items: [
    { id: "readerIntelligence", label: "Reader Intelligence", icon: "📈", requiresStory: true },
  ]},
  { group: "system", items: [
    { id: "settings", label: "Settings", icon: "⚙️" }
  ]}
];

function Sidebar({ active, onChange, onNewStory, hasStory, storyTitle, universeCount, saveStatus }) {
  return (
    <aside style={{ width:240, minHeight:"100vh", background:"#F8F7F2", borderRight:"1px solid "+C.faint,
                    padding:"22px 0", display:"flex", flexDirection:"column", flexShrink:0,
                    position:"sticky", top:0, alignSelf:"flex-start" }}>
      {/* Brand */}
      <div style={{ padding:"0 20px 20px 20px", borderBottom:"1px solid "+C.faint }}>
        <div style={{ color:C.gold, fontSize:9, letterSpacing:2.5, textTransform:"uppercase", fontWeight:700, marginBottom:4 }}>
          Story OS
        </div>
        <div style={{ color:C.text, fontFamily:"Cormorant Garamond, serif", fontSize:18, fontWeight:600, lineHeight:1.2 }}>
          Private Studio
        </div>
        {storyTitle && (
          <div style={{ marginTop:10, padding:"7px 10px", background:C.surface, borderRadius:5, border:"1px solid "+C.borderLight }}>
            <div style={{ color:C.muted, fontSize:9, textTransform:"uppercase", letterSpacing:1, marginBottom:2 }}>Active Story</div>
            <div style={{ color:C.gold, fontSize:11, fontWeight:600, fontFamily:"Cormorant Garamond, serif", lineHeight:1.3,
                          whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>
              {storyTitle}
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav style={{ flex:1, padding:"14px 12px", overflowY:"auto" }}>
        {NAV_SECTIONS.map(group => (
          <div key={group.group} style={{ marginBottom:14 }}>
            {group.label && (
              <div style={{ padding:"4px 8px 6px 8px", color:C.muted, fontSize:9, letterSpacing:1.5, textTransform:"uppercase", fontWeight:600 }}>
                {group.label}
              </div>
            )}
            {group.items.map(item => {
              const isActive = active === item.id;
              const isDisabled = item.requiresStory && !hasStory;
              const showBadge = item.id === "worldBuilder" && universeCount > 0;
              return (
                <button key={item.id}
                  onClick={()=>{ if (isDisabled) return; if (item.id === "newStory" && onNewStory) onNewStory(); else onChange(item.id); }}
                  disabled={isDisabled}
                  style={{
                    width:"100%", padding:"7px 10px", marginBottom:1,
                    background: isActive ? "rgba(184,132,28,0.10)" : "transparent",
                    border:"none", borderLeft: isActive ? "2px solid "+C.gold : "2px solid transparent",
                    borderRadius:5, color: isActive ? C.gold : (isDisabled ? C.faint : C.muted),
                    textAlign:"left", cursor: isDisabled ? "not-allowed" : "pointer",
                    fontFamily:"Nunito, sans-serif", fontSize:12, fontWeight: isActive ? 600 : 400,
                    display:"flex", alignItems:"center", gap:9, transition:"all 0.12s",
                    opacity: isDisabled ? 0.5 : 1
                  }}>
                  <span style={{ fontSize:13, opacity: isActive ? 1 : 0.7 }}>{item.icon}</span>
                  <span style={{ flex:1 }}>{item.label}</span>
                  {showBadge && (
                    <span style={{ padding:"1px 6px", background:isActive?C.gold:C.borderLight,
                                    color:isActive?C.bg:C.muted, borderRadius:8, fontSize:9, fontWeight:700 }}>
                      {universeCount}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div style={{ padding:"14px 20px", borderTop:"1px solid "+C.faint, color:C.muted, fontSize:10, lineHeight:1.5 }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", gap:8, marginBottom:6 }}>
          <div style={{ fontWeight:600, color:C.amber }}>Private fiction OS</div>
          <SaveStatusIndicator status={saveStatus}/>
        </div>
        <div style={{ fontStyle:"italic" }}>Story → Universe → Launch</div>
      </div>
    </aside>
  );
}

// Empty-state for sections that need a story
function NeedsStoryEmpty({ section, onGoToBuilder }) {
  return (
    <div style={{ padding:"60px 40px", textAlign:"center", background:C.card, border:"1px dashed "+C.borderLight, borderRadius:12, maxWidth:560, margin:"40px auto" }}>
      <div style={{ fontSize:48, marginBottom:14 }}>📭</div>
      <div style={{ color:C.text, fontFamily:"Cormorant Garamond, serif", fontSize:22, fontWeight:600, marginBottom:8 }}>
        No story loaded
      </div>
      <div style={{ color:C.muted, fontSize:13, lineHeight:1.6, marginBottom:20 }}>
        {section} requires an active story. Generate a blueprint first — once you have a story, this section will activate with the relevant tooling.
      </div>
      <button onClick={onGoToBuilder}
        style={{ padding:"10px 22px", background:C.gold, color:C.bg, border:"none", borderRadius:8, fontWeight:700, fontSize:13, cursor:"pointer", fontFamily:"Nunito, sans-serif" }}>
        ✨ Go to New Story
      </button>
    </div>
  );
}

// Generic placeholder for sections not fully built yet
function ComingSoonSection({ title, icon, description, features }) {
  return (
    <div style={{ padding:"40px 30px", background:C.card, border:"1px solid "+C.borderLight, borderRadius:14, maxWidth:780, margin:"20px auto" }}>
      <div style={{ display:"flex", alignItems:"center", gap:14, marginBottom:16 }}>
        <div style={{ fontSize:36 }}>{icon}</div>
        <div>
          <div style={{ color:C.gold, fontSize:11, letterSpacing:2, textTransform:"uppercase", fontWeight:700, marginBottom:3 }}>Coming Soon</div>
          <div style={{ color:C.text, fontFamily:"Cormorant Garamond, serif", fontSize:28, fontWeight:600 }}>{title}</div>
        </div>
      </div>
      <div style={{ color:C.muted, fontSize:13, lineHeight:1.7, marginBottom:18 }}>{description}</div>
      {features && features.length > 0 && (
        <div style={{ padding:"14px 18px", background:C.bg, border:"1px solid "+C.borderLight, borderRadius:8 }}>
          <div style={{ color:C.amber, fontSize:10, fontWeight:700, textTransform:"uppercase", letterSpacing:1, marginBottom:8 }}>Planned features</div>
          <ul style={{ margin:0, paddingLeft:20, color:C.text, fontSize:12, lineHeight:1.7 }}>
            {features.map((f,i)=><li key={i}>{f}</li>)}
          </ul>
        </div>
      )}
    </div>
  );
}

function InfoBlock({ label, children, accent }) {
  return (
    <div style={{ marginBottom:18 }}>
      <div style={{ color:accent||C.gold, fontSize:11, letterSpacing:1.5, textTransform:"uppercase", marginBottom:6, fontWeight:600 }}>
        {label}
      </div>
      <div style={{ color:C.text, fontSize:14, lineHeight:1.7 }}>{children}</div>
    </div>
  );
}

function CharCard({ data, role, archetype, fear, growth, color }) {
  return (
    <div style={{ padding:20, background:C.card, border:"1px solid "+C.border, borderRadius:12 }}>
      <div style={{ color:color, fontSize:11, letterSpacing:2, textTransform:"uppercase", marginBottom:8, fontWeight:700 }}>
        {role}
      </div>
      <div style={{ fontFamily:"Cormorant Garamond, serif", color:C.text, fontSize:26, fontWeight:700, marginBottom:4 }}>
        {data.name}
      </div>
      <div style={{ color:C.muted, fontSize:13, fontStyle:"italic", marginBottom:14 }}>
        {data.age}, {data.occupation}
      </div>
      {archetype && (
        <div style={{ display:"inline-block", padding:"3px 10px", background:color+"22", border:"1px solid "+color, borderRadius:14, color:color, fontSize:11, fontWeight:600, marginBottom:12 }}>
          {archetype}
        </div>
      )}
      <div style={{ display:"grid", gap:10, marginTop:6 }}>
        <div>
          <div style={{ color:C.muted, fontSize:10, textTransform:"uppercase", letterSpacing:1 }}>Wound</div>
          <div style={{ color:C.text, fontSize:13, marginTop:2 }}>{data.wound}</div>
        </div>
        {fear && (
          <div>
            <div style={{ color:C.muted, fontSize:10, textTransform:"uppercase", letterSpacing:1 }}>Core Fear</div>
            <div style={{ color:C.text, fontSize:13, marginTop:2 }}>{fear}</div>
          </div>
        )}
        <div>
          <div style={{ color:C.muted, fontSize:10, textTransform:"uppercase", letterSpacing:1 }}>External Goal</div>
          <div style={{ color:C.text, fontSize:13, marginTop:2 }}>{data.externalGoal}</div>
        </div>
        {growth && (
          <div>
            <div style={{ color:C.muted, fontSize:10, textTransform:"uppercase", letterSpacing:1 }}>Growth Arc</div>
            <div style={{ color:C.text, fontSize:13, marginTop:2, fontStyle:"italic" }}>{growth}</div>
          </div>
        )}
      </div>
    </div>
  );
}

function SaveBlueprint({ story, universes, activeUniverseId, onSaveToUniverse }) {
  const [copied, setCopied] = useState(false);
  const [savePickerOpen, setSavePickerOpen] = useState(false);
  const [savedTo, setSavedTo] = useState(null);
  const slug = slugify(story.title);

  const handleMarkdown = () => {
    const md = blueprintToMarkdown(story);
    downloadFile(slug+"-blueprint.md", md, "text/markdown");
  };
  const handleJSON = () => {
    downloadFile(slug+"-blueprint.json", JSON.stringify(story, null, 2), "application/json");
  };
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(blueprintToMarkdown(story));
      setCopied(true);
      setTimeout(()=>setCopied(false), 2000);
    } catch(e) {
      // Fallback for browsers that block clipboard
      const ta = document.createElement("textarea");
      ta.value = blueprintToMarkdown(story);
      document.body.appendChild(ta); ta.select();
      try { document.execCommand("copy"); setCopied(true); setTimeout(()=>setCopied(false), 2000); } catch(e2) {}
      document.body.removeChild(ta);
    }
  };

  const activeUniverse = (universes||[]).find(u=>u.id===activeUniverseId);

  return (
    <div style={{ marginTop:30, padding:"22px 24px", background:"linear-gradient(135deg, "+C.surface+", "+C.card+")",
                  border:"1px solid "+C.gold, borderRadius:12 }}>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:14 }}>
        <div>
          <div style={{ color:C.gold, fontSize:11, letterSpacing:2, textTransform:"uppercase", fontWeight:700, marginBottom:4 }}>
            💾 Save Your Blueprint
          </div>
          <div style={{ color:C.muted, fontSize:13 }}>
            {activeUniverse ? "Active universe: "+activeUniverse.name : "Lock this in before generating chapters"}
          </div>
        </div>
        <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
          <button onClick={handleMarkdown}
            style={{ padding:"10px 16px", background:C.gold, color:C.bg, border:"none", borderRadius:8,
                     fontWeight:700, fontSize:13, cursor:"pointer", fontFamily:"Nunito, sans-serif" }}>
            ↓ Markdown
          </button>
          <button onClick={handleJSON}
            style={{ padding:"10px 16px", background:"transparent", color:C.gold, border:"1px solid "+C.gold,
                     borderRadius:8, fontWeight:600, fontSize:13, cursor:"pointer", fontFamily:"Nunito, sans-serif" }}>
            ↓ JSON
          </button>
          <button onClick={handleCopy}
            style={{ padding:"10px 16px", background:"transparent", color:C.text, border:"1px solid "+C.borderLight,
                     borderRadius:8, fontWeight:600, fontSize:13, cursor:"pointer", fontFamily:"Nunito, sans-serif" }}>
            {copied ? "✓ Copied!" : "⧉ Copy"}
          </button>
        </div>
      </div>

      {onSaveToUniverse && (
        <div style={{ marginTop:18, paddingTop:18, borderTop:"1px solid "+C.borderLight }}>
          {!savePickerOpen && !savedTo && (
            <button onClick={()=>setSavePickerOpen(true)}
              style={{ width:"100%", padding:"12px 16px", background:"transparent", color:C.amber,
                       border:"1px dashed "+C.amber, borderRadius:8, fontWeight:600, fontSize:13,
                       cursor:"pointer", fontFamily:"Nunito, sans-serif" }}>
              ✦ Save this book to a Universe
            </button>
          )}
          {savedTo && (
            <div style={{ padding:"10px 14px", background:C.glow, border:"1px solid "+C.gold, borderRadius:8,
                          color:C.gold, fontSize:13, textAlign:"center", fontWeight:600 }}>
              ✓ Saved to universe: {savedTo}
            </div>
          )}
          {savePickerOpen && (
            <div>
              <div style={{ color:C.amber, fontSize:11, letterSpacing:1.5, textTransform:"uppercase", fontWeight:600, marginBottom:10 }}>
                Save to which universe?
              </div>
              {(universes||[]).length === 0 ? (
                <div style={{ color:C.muted, fontSize:12, padding:"10px 0" }}>
                  No universes yet. Switch to Universe Builder tab to create one, then come back.
                </div>
              ) : (
                <div style={{ display:"grid", gap:6, marginBottom:8 }}>
                  {(universes||[]).map(u=>(
                    <button key={u.id} onClick={()=>{ onSaveToUniverse(u.id); setSavedTo(u.name); setSavePickerOpen(false); }}
                      style={{ textAlign:"left", padding:"10px 12px", background:C.card, border:"1px solid "+C.borderLight,
                               borderRadius:6, cursor:"pointer", color:C.text, fontSize:13, transition:"all 0.15s" }}>
                      <div style={{ fontWeight:600 }}>{u.name}</div>
                      <div style={{ color:C.muted, fontSize:11, marginTop:2 }}>
                        {(u.genres||[]).join(" · ")} · {(u.books||[]).length} book{(u.books||[]).length===1?"":"s"}
                      </div>
                    </button>
                  ))}
                </div>
              )}
              <button onClick={()=>setSavePickerOpen(false)}
                style={{ background:"transparent", border:"none", color:C.muted, fontSize:11, cursor:"pointer", textDecoration:"underline" }}>
                Cancel
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Story Bible Viewer ───────────────────────────────────────

function BibleSection({ title, icon, children, defaultOpen=false }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div style={{ marginBottom:12, background:C.card, border:"1px solid "+C.borderLight, borderRadius:8, overflow:"hidden" }}>
      <button onClick={()=>setOpen(!open)}
        style={{ width:"100%", padding:"12px 14px", background:"transparent", border:"none", textAlign:"left",
                 cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        <span style={{ color:C.gold, fontSize:11, letterSpacing:1.5, textTransform:"uppercase", fontWeight:700 }}>
          {icon} {title}
        </span>
        <span style={{ color:C.muted, fontSize:18 }}>{open?"−":"+"}</span>
      </button>
      {open && <div style={{ padding:"4px 14px 16px 14px", borderTop:"1px solid "+C.faint }}>{children}</div>}
    </div>
  );
}

function StoryBibleViewer({ bible, currentChapterCount, onAddManualThread }) {
  if (!bible) return null;
  const w = bible.world || {};
  const chars = bible.characters || [];
  const rel = bible.relationship || {};
  const plot = bible.plot || {};
  const trackedChapters = bible.chapters || [];

  return (
    <div style={{ marginTop:18, padding:"20px 22px", background:"linear-gradient(135deg, "+C.surface+", "+C.card+")",
                  border:"1px solid "+C.gold, borderRadius:12 }}>
      <div style={{ display:"flex", alignItems:"baseline", justifyContent:"space-between", marginBottom:14 }}>
        <div>
          <div style={{ color:C.gold, fontSize:11, letterSpacing:2, textTransform:"uppercase", fontWeight:700, marginBottom:4 }}>
            📖 Story Bible
          </div>
          <div style={{ color:C.muted, fontSize:12 }}>
            The source-of-truth for continuity across all chapters
          </div>
        </div>
        <div style={{ color:C.muted, fontSize:11 }}>
          {chars.length} characters · {trackedChapters.length} chapters tracked
        </div>
      </div>

      <BibleSection title="World" icon="🌍" defaultOpen={true}>
        <div style={{ display:"grid", gap:8, fontSize:12, color:C.text, lineHeight:1.6 }}>
          {w.genre && <div><span style={{ color:C.amber, fontWeight:600 }}>Genre: </span>{w.genre}</div>}
          {w.tone && <div><span style={{ color:C.amber, fontWeight:600 }}>Tone: </span>{w.tone}</div>}
          {w.setting && <div><span style={{ color:C.amber, fontWeight:600 }}>Setting: </span>{w.setting}</div>}
          {w.timeline && <div><span style={{ color:C.amber, fontWeight:600 }}>Timeline: </span>{w.timeline}</div>}
          {w.themes && w.themes.length > 0 && (
            <div style={{ marginTop:4 }}>
              <span style={{ color:C.amber, fontWeight:600, fontSize:11 }}>Themes: </span>
              {w.themes.map((t,i)=>(
                <span key={i} style={{ display:"inline-block", marginRight:6, marginTop:4, padding:"2px 8px",
                                        background:C.surface, border:"1px solid "+C.borderLight, borderRadius:10, fontSize:11 }}>
                  {t}
                </span>
              ))}
            </div>
          )}
        </div>
      </BibleSection>

      <BibleSection title="Characters" icon="👤">
        <div style={{ display:"grid", gap:10 }}>
          {chars.map((c,i)=>(
            <div key={i} style={{ padding:"12px 14px", background:C.surface, border:"1px solid "+C.borderLight, borderRadius:8 }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"baseline", marginBottom:6 }}>
                <div style={{ color:C.text, fontFamily:"Cormorant Garamond, serif", fontSize:18, fontWeight:700 }}>
                  {c.name}
                </div>
                <div style={{ color:C.muted, fontSize:11, fontStyle:"italic" }}>{c.role} · {c.age}</div>
              </div>
              <div style={{ display:"grid", gap:5, fontSize:11, color:C.text, lineHeight:1.5 }}>
                <div><span style={{ color:C.amber }}>Occupation: </span>{c.occupation}</div>
                <div><span style={{ color:C.amber }}>Appearance: </span>{c.appearance}</div>
                <div><span style={{ color:C.amber }}>Wound: </span>{c.wound}</div>
                <div><span style={{ color:C.amber }}>Fears: </span>{c.fears}</div>
                <div><span style={{ color:C.amber }}>Goals: </span>{c.goals}</div>
                <div><span style={{ color:C.amber }}>Family: </span>{c.family}</div>
                <div><span style={{ color:C.amber }}>Relationships: </span>{c.relationships}</div>
                <div style={{ marginTop:4, padding:"6px 10px", background:C.manuscript, borderLeft:"2px solid "+C.gold, borderRadius:3 }}>
                  <span style={{ color:C.gold, fontSize:10, fontWeight:700, textTransform:"uppercase", letterSpacing:1 }}>Speech Pattern: </span>
                  <span style={{ fontStyle:"italic" }}>{c.speechPatterns}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </BibleSection>

      <BibleSection title="Relationship Arc" icon="❤️">
        <div style={{ display:"grid", gap:8, fontSize:12, color:C.text, lineHeight:1.6 }}>
          <div><span style={{ color:C.amber, fontWeight:600 }}>Began as: </span>{rel.beginningState}</div>
          <div style={{ padding:"8px 10px", background:C.glow, border:"1px solid "+C.gold, borderRadius:6 }}>
            <span style={{ color:C.gold, fontSize:10, fontWeight:700, textTransform:"uppercase", letterSpacing:1 }}>Currently: </span>
            <span style={{ fontWeight:600 }}>{rel.currentState}</span>
          </div>
          <div><span style={{ color:C.amber, fontWeight:600 }}>Heading toward: </span>{rel.desiredEndState}</div>
          <div><span style={{ color:C.amber, fontWeight:600 }}>Obstacle: </span>{rel.obstacle}</div>
          {rel.milestones && rel.milestones.length > 0 && (
            <div style={{ marginTop:6 }}>
              <div style={{ color:C.amber, fontWeight:600, fontSize:11, textTransform:"uppercase", letterSpacing:1, marginBottom:6 }}>Milestones Reached:</div>
              {rel.milestones.map((m,i)=>(
                <div key={i} style={{ display:"flex", gap:10, alignItems:"flex-start", padding:"4px 0", borderTop:i?"1px solid "+C.faint:"none" }}>
                  <div style={{ minWidth:50, padding:"2px 6px", background:C.surface, border:"1px solid "+C.borderLight, borderRadius:4, fontSize:10, color:C.muted, textAlign:"center" }}>Ch {m.chapter}</div>
                  <div style={{ fontSize:12 }}>{m.event}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </BibleSection>

      <BibleSection title="Plot Architecture" icon="🧩">
        <div style={{ display:"grid", gap:12, fontSize:12, color:C.text, lineHeight:1.6 }}>
          {plot.mainConflict && (
            <div>
              <div style={{ color:C.amber, fontWeight:600, fontSize:11, textTransform:"uppercase", letterSpacing:1, marginBottom:4 }}>Main Conflict</div>
              <div>{plot.mainConflict}</div>
            </div>
          )}
          {plot.subplots && plot.subplots.length > 0 && (
            <div>
              <div style={{ color:C.amber, fontWeight:600, fontSize:11, textTransform:"uppercase", letterSpacing:1, marginBottom:4 }}>Subplots</div>
              <ul style={{ margin:0, paddingLeft:18 }}>
                {plot.subplots.map((s,i)=><li key={i} style={{ marginBottom:3 }}>{s}</li>)}
              </ul>
            </div>
          )}
          {plot.mysteries && plot.mysteries.length > 0 && (
            <div>
              <div style={{ color:C.amber, fontWeight:600, fontSize:11, textTransform:"uppercase", letterSpacing:1, marginBottom:4 }}>Mysteries</div>
              <div style={{ display:"grid", gap:5 }}>
                {plot.mysteries.map((m,i)=>{
                  const statusColor = m.status==="resolved" ? "#2D8B7A" : m.status==="closing" ? "#B07A1F" : "#D88830";
                  return (
                    <div key={i} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"5px 10px", background:C.surface, border:"1px solid "+C.borderLight, borderRadius:5 }}>
                      <span>{m.name}</span>
                      <span style={{ padding:"1px 7px", background:statusColor+"22", border:"1px solid "+statusColor, color:statusColor, borderRadius:8, fontSize:10, fontWeight:600, textTransform:"uppercase" }}>{m.status}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
          {plot.secrets && plot.secrets.length > 0 && (
            <div>
              <div style={{ color:C.amber, fontWeight:600, fontSize:11, textTransform:"uppercase", letterSpacing:1, marginBottom:4 }}>Secrets</div>
              <div style={{ display:"grid", gap:5 }}>
                {plot.secrets.map((s,i)=>(
                  <div key={i} style={{ padding:"6px 10px", background:C.surface, border:"1px solid "+C.borderLight, borderRadius:5 }}>
                    <span style={{ color:C.text, fontWeight:600 }}>{s.owner}: </span>
                    <span>{s.secret}</span>
                    {s.revealedIn && <span style={{ color:"#2D8B7A", marginLeft:8, fontSize:10 }}>revealed Ch{s.revealedIn}</span>}
                    {!s.revealedIn && <span style={{ color:C.muted, marginLeft:8, fontSize:10 }}>hidden</span>}
                  </div>
                ))}
              </div>
            </div>
          )}
          {plot.clues && plot.clues.length > 0 && (
            <div>
              <div style={{ color:C.amber, fontWeight:600, fontSize:11, textTransform:"uppercase", letterSpacing:1, marginBottom:4 }}>Clues & Setups</div>
              <div style={{ display:"grid", gap:5 }}>
                {plot.clues.map((c,i)=>(
                  <div key={i} style={{ padding:"5px 10px", background:C.surface, border:"1px solid "+C.borderLight, borderRadius:5, fontSize:11 }}>
                    <span style={{ color:C.amber, fontSize:10, fontWeight:700 }}>Ch{c.chapter} → </span>
                    <span>{c.clue}</span>
                    {c.payoff && <span style={{ color:C.muted, marginLeft:6 }}>· pays off {c.payoff}</span>}
                  </div>
                ))}
              </div>
            </div>
          )}
          {plot.reveals && plot.reveals.length > 0 && (
            <div>
              <div style={{ color:C.amber, fontWeight:600, fontSize:11, textTransform:"uppercase", letterSpacing:1, marginBottom:4 }}>Planned Reveals</div>
              <div style={{ display:"grid", gap:5 }}>
                {plot.reveals.map((r,i)=>(
                  <div key={i} style={{ padding:"5px 10px", background:C.surface, border:"1px solid "+C.borderLight, borderRadius:5, fontSize:11 }}>
                    <span style={{ color:C.amber, fontSize:10, fontWeight:700 }}>Ch{r.chapter}: </span>
                    {r.reveal}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </BibleSection>

      {trackedChapters.length > 0 && (
        <BibleSection title="Chapter Tracker" icon="📚">
          <div style={{ display:"grid", gap:8 }}>
            {trackedChapters.map((c,i)=>(
              <div key={i} style={{ padding:"10px 12px", background:C.surface, border:"1px solid "+C.borderLight, borderRadius:6 }}>
                <div style={{ display:"flex", justifyContent:"space-between", marginBottom:5 }}>
                  <span style={{ color:C.gold, fontWeight:600, fontSize:13 }}>Chapter {c.number}</span>
                  <span style={{ color:C.muted, fontSize:11 }}>{c.pov} POV</span>
                </div>
                <div style={{ color:C.text, fontSize:12, marginBottom:5, fontStyle:"italic" }}>{c.purpose}</div>
                {c.majorEvents && c.majorEvents.length > 0 && (
                  <div style={{ color:C.muted, fontSize:11, marginBottom:3 }}>
                    <span style={{ color:C.amber }}>Events: </span>{c.majorEvents.join("; ")}
                  </div>
                )}
                {c.characterChanges && c.characterChanges.length > 0 && (
                  <div style={{ color:C.muted, fontSize:11, marginBottom:3 }}>
                    <span style={{ color:C.amber }}>Internal shifts: </span>{c.characterChanges.join("; ")}
                  </div>
                )}
                {c.unresolvedThreads && c.unresolvedThreads.length > 0 && (
                  <div style={{ color:C.muted, fontSize:11 }}>
                    <span style={{ color:"#D06030" }}>Carrying forward: </span>{c.unresolvedThreads.join("; ")}
                  </div>
                )}
              </div>
            ))}
          </div>
        </BibleSection>
      )}
      <BibleSection title="Plot Thread Tracker" icon="🧵" defaultOpen={true}>
        <PlotThreadTracker bible={bible} currentChapterCount={currentChapterCount} onAddManualThread={onAddManualThread}/>
      </BibleSection>
    </div>
  );
}

// ── Continuity Report Card ───────────────────────────────────

function ContinuityRow({ label, status, notes }) {
  const statusColor = status==="pass" ? "#2D8B7A" : status==="warning" ? "#B07A1F" : "#B8342D";
  const statusIcon = status==="pass" ? "✓" : status==="warning" ? "⚠" : "✗";
  return (
    <div style={{ marginBottom:notes&&notes.length?10:8 }}>
      <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:notes&&notes.length?5:0 }}>
        <span style={{ color:statusColor, fontWeight:700, fontSize:14 }}>{statusIcon}</span>
        <span style={{ color:C.text, fontSize:13, fontWeight:600, flex:1 }}>{label}</span>
        <span style={{ padding:"1px 8px", background:statusColor+"22", border:"1px solid "+statusColor,
                       borderRadius:10, fontSize:10, color:statusColor, fontWeight:700, textTransform:"uppercase" }}>
          {status}
        </span>
      </div>
      {notes && notes.length > 0 && (
        <ul style={{ margin:"4px 0 0 28px", paddingLeft:0, listStyle:"none" }}>
          {notes.map((n,i)=>(
            <li key={i} style={{ color:C.muted, fontSize:11, lineHeight:1.5, marginBottom:3, paddingLeft:10, borderLeft:"2px solid "+statusColor }}>
              <span style={{ paddingLeft:8 }}>{n}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function RevisionPatch({ patch, onApply, onAcknowledge }) {
  if (!patch) return null;
  return (
    <div style={{ marginTop:12, padding:"14px 16px", background:"#FAF5E8", border:"1px solid #B07A1F", borderRadius:8 }}>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:10, flexWrap:"wrap", gap:8 }}>
        <div style={{ color:"#B07A1F", fontSize:11, letterSpacing:1.5, textTransform:"uppercase", fontWeight:700 }}>
          ⚠ Revision Patch · Warning
        </div>
        <span style={{ padding:"2px 8px", background:"#B07A1F22", border:"1px solid #B07A1F", borderRadius:10, fontSize:10, color:"#B07A1F", fontWeight:700 }}>
          REVIEW BEFORE CONTINUING
        </span>
      </div>
      <div style={{ display:"grid", gap:8, fontSize:12, color:C.text, lineHeight:1.6 }}>
        <div><span style={{ color:"#B07A1F", fontWeight:600 }}>Issue:</span> {patch.issue}</div>
        <div><span style={{ color:"#B07A1F", fontWeight:600 }}>Location:</span> {patch.location}</div>
        <div><span style={{ color:"#B07A1F", fontWeight:600 }}>Recommended change:</span> {patch.recommendedChange}</div>
        {patch.revisedText && (
          <div style={{ padding:"10px 12px", background:C.manuscript, borderLeft:"3px solid #B07A1F", borderRadius:4, fontStyle:"italic", color:C.text, fontFamily:"Cormorant Garamond, serif", fontSize:13, lineHeight:1.7 }}>
            "{patch.revisedText}"
          </div>
        )}
        <div style={{ color:C.muted, fontSize:11 }}><span style={{ color:"#B07A1F", fontWeight:600 }}>Why:</span> {patch.reason}</div>
      </div>
      <div style={{ display:"flex", gap:8, marginTop:14, flexWrap:"wrap" }}>
        {patch.revisedText && (
          <button onClick={onApply}
            style={{ padding:"7px 14px", background:"#B07A1F", color:C.bg, border:"none", borderRadius:6, fontSize:12, fontWeight:700, cursor:"pointer", fontFamily:"Nunito, sans-serif" }}>
            ✓ Apply suggested text
          </button>
        )}
        <button onClick={onAcknowledge}
          style={{ padding:"7px 14px", background:"transparent", color:C.muted, border:"1px solid "+C.borderLight, borderRadius:6, fontSize:12, fontWeight:600, cursor:"pointer", fontFamily:"Nunito, sans-serif" }}>
          Acknowledge & continue
        </button>
      </div>
    </div>
  );
}

function RepairReport({ report, onMarkResolved, onRegenerate }) {
  if (!report) return null;
  const sevColor = report.severity === "critical" ? "#B8342D" : "#D88830";
  return (
    <div style={{ marginTop:12, padding:"16px 18px", background:"#FBE9E7", border:"2px solid #B8342D", borderRadius:10 }}>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:12, flexWrap:"wrap", gap:8 }}>
        <div style={{ color:"#B8342D", fontSize:12, letterSpacing:1.5, textTransform:"uppercase", fontWeight:700 }}>
          🛑 Continuity Repair Report · FAIL
        </div>
        <span style={{ padding:"3px 10px", background:sevColor+"22", border:"1px solid "+sevColor, borderRadius:10, fontSize:10, color:sevColor, fontWeight:700, textTransform:"uppercase" }}>
          {report.severity} · {report.issueType}
        </span>
      </div>
      <div style={{ padding:"10px 14px", background:"rgba(255,255,255,0.6)", borderLeft:"3px solid #B8342D", borderRadius:4, marginBottom:14, color:C.text, fontSize:13, lineHeight:1.7, fontStyle:"italic" }}>
        "{report.contradiction}"
      </div>
      <div style={{ display:"grid", gap:8, fontSize:12, color:C.text, lineHeight:1.6, marginBottom:14 }}>
        {report.affectedChapters && report.affectedChapters.length > 0 && (
          <div><span style={{ color:"#B8342D", fontWeight:600 }}>Affected chapters:</span> {report.affectedChapters.map(c=>"Ch "+c).join(", ")}</div>
        )}
        {report.affectedCharacters && report.affectedCharacters.length > 0 && (
          <div><span style={{ color:"#B8342D", fontWeight:600 }}>Affected characters:</span> {report.affectedCharacters.join(", ")}</div>
        )}
      </div>
      <div style={{ marginBottom:14 }}>
        <div style={{ color:"#B8342D", fontSize:11, fontWeight:700, textTransform:"uppercase", letterSpacing:1, marginBottom:6 }}>Repair options:</div>
        <div style={{ display:"grid", gap:6 }}>
          {(report.repairOptions||[]).map((opt, i)=>(
            <div key={i} style={{ padding:"8px 12px", background:"rgba(255,255,255,0.5)", border:"1px solid "+C.borderLight, borderRadius:5, fontSize:12, color:C.text }}>
              <span style={{ color:"#B8342D", fontWeight:700, marginRight:6 }}>{i+1}.</span> {opt}
            </div>
          ))}
        </div>
      </div>
      {report.recommendedFix && (
        <div style={{ padding:"10px 14px", background:"rgba(45,139,122,0.10)", border:"1px solid #2D8B7A", borderRadius:6, marginBottom:14 }}>
          <span style={{ color:"#2D8B7A", fontSize:10, fontWeight:700, textTransform:"uppercase", letterSpacing:1, marginRight:6 }}>Editor recommends:</span>
          <span style={{ color:C.text, fontSize:12 }}>{report.recommendedFix}</span>
        </div>
      )}
      <div style={{ padding:"8px 12px", background:"rgba(255,255,255,0.5)", borderRadius:4, color:C.muted, fontSize:11, fontStyle:"italic", marginBottom:14 }}>
        💡 Subsequent chapters are blocked until this is resolved. Options: regenerate this chapter, edit the chapter manually, update the Story Bible to match the new direction, or mark as resolved (override).
      </div>
      <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
        <button onClick={onRegenerate}
          style={{ padding:"8px 14px", background:"#B8342D", color:"#FFF", border:"none", borderRadius:6, fontSize:12, fontWeight:700, cursor:"pointer", fontFamily:"Nunito, sans-serif" }}>
          🔄 Regenerate chapter
        </button>
        <button onClick={onMarkResolved}
          style={{ padding:"8px 14px", background:"transparent", color:C.text, border:"1px solid "+C.borderLight, borderRadius:6, fontSize:12, fontWeight:600, cursor:"pointer", fontFamily:"Nunito, sans-serif" }}>
          ✓ Mark as resolved (override)
        </button>
      </div>
    </div>
  );
}

function ContinuityReportCard({ report, onApplyPatch, onAcknowledgePatch, onMarkResolved, onRegenerate }) {
  if (!report) return null;
  const status = report.status || (
    [report.characterConsistency, report.timelineConsistency, report.relationshipConsistency, report.plotConsistency]
      .some(c=>c && c.status==="issue") ? "FAIL" :
    [report.characterConsistency, report.timelineConsistency, report.relationshipConsistency, report.plotConsistency]
      .some(c=>c && c.status==="warning") ? "WARNING" : "PASS"
  );
  const statusColor = status==="PASS" ? "#2D8B7A" : status==="WARNING" ? "#B07A1F" : "#B8342D";
  const statusIcon = status==="PASS" ? "✓" : status==="WARNING" ? "⚠" : "✗";
  return (
    <>
      <div style={{ marginTop:12, padding:"14px 16px", background:C.bg, border:"1px solid "+statusColor, borderRadius:8 }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:10, flexWrap:"wrap", gap:8 }}>
          <div style={{ color:statusColor, fontSize:10, letterSpacing:1.5, textTransform:"uppercase", fontWeight:700 }}>
            📋 Continuity Report
          </div>
          <span style={{ padding:"3px 12px", background:statusColor+"22", border:"1px solid "+statusColor, borderRadius:12, fontSize:11, color:statusColor, fontWeight:700, letterSpacing:1 }}>
            {statusIcon} {status}
          </span>
        </div>
        <ContinuityRow label="Character Consistency" status={(report.characterConsistency||{}).status} notes={(report.characterConsistency||{}).notes}/>
        <ContinuityRow label="Timeline Consistency" status={(report.timelineConsistency||{}).status} notes={(report.timelineConsistency||{}).notes}/>
        <ContinuityRow label="Relationship Consistency" status={(report.relationshipConsistency||{}).status} notes={(report.relationshipConsistency||{}).notes}/>
        <ContinuityRow label="Plot Consistency" status={(report.plotConsistency||{}).status} notes={(report.plotConsistency||{}).notes}/>
        <ContinuityRow label="Reader Promise Fulfillment" status={(report.readerPromiseFulfillment||{}).status} notes={(report.readerPromiseFulfillment||{}).notes}/>
        {report.relationshipUpdate && report.relationshipUpdate.newCurrentState && (
          <div style={{ marginTop:10, paddingTop:10, borderTop:"1px solid "+C.faint, color:C.muted, fontSize:11, lineHeight:1.5 }}>
            <span style={{ color:C.amber, fontWeight:600 }}>Bible updated: </span>
            Relationship now at <em>"{report.relationshipUpdate.newCurrentState}"</em>
            {report.relationshipUpdate.newMilestone && <span> · milestone added</span>}
          </div>
        )}
        {status === "PASS" && (
          <div style={{ marginTop:10, padding:"8px 12px", background:"rgba(45,139,122,0.10)", borderLeft:"3px solid #2D8B7A", borderRadius:4, color:"#2D8B7A", fontSize:11, fontWeight:600 }}>
            ✓ Continuity verified · Next chapter may be drafted
          </div>
        )}
        {report.resolved && status !== "PASS" && (
          <div style={{ marginTop:10, padding:"8px 12px", background:"rgba(45,139,122,0.10)", borderLeft:"3px solid #2D8B7A", borderRadius:4, color:"#2D8B7A", fontSize:11, fontWeight:600 }}>
            ✓ Marked resolved by author · Next chapter unblocked
          </div>
        )}
      </div>
      {status === "WARNING" && report.revisionPatch && !report.resolved && (
        <RevisionPatch patch={report.revisionPatch} onApply={onApplyPatch} onAcknowledge={onAcknowledgePatch}/>
      )}
      {status === "FAIL" && report.repairReport && !report.resolved && (
        <RepairReport report={report.repairReport} onMarkResolved={onMarkResolved} onRegenerate={onRegenerate}/>
      )}
    </>
  );
}

// ── Manuscript Spec Controls ─────────────────────────────────

function ManuscriptSpec({ targetWordCount, onTargetChange, chapterCount, onChapterChange, maxWordsPerGen, onMaxChange, avgWordsPerChapter }) {
  const presets = [40000, 60000, 80000, 90000, 100000];
  const maxGenPresets = [1500, 2000, 2500, 3500];
  return (
    <div style={{ padding:"18px 22px", background:C.card, border:"1px solid "+C.amber, borderRadius:10, marginBottom:18 }}>
      <div style={{ color:C.amber, fontSize:11, letterSpacing:1.5, textTransform:"uppercase", fontWeight:700, marginBottom:4 }}>
        📐 Manuscript Spec
      </div>
      <div style={{ color:C.muted, fontSize:12, marginBottom:16 }}>
        Set the target before generating the outline. The outline scales to fit.
      </div>

      {/* Target word count */}
      <div style={{ marginBottom:16 }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"baseline", marginBottom:6 }}>
          <label style={{ color:C.amber, fontSize:11, letterSpacing:1, textTransform:"uppercase", fontWeight:600 }}>
            Target Word Count
          </label>
          <span style={{ color:C.gold, fontFamily:"Cormorant Garamond, serif", fontSize:18, fontWeight:700 }}>
            {targetWordCount.toLocaleString()}
          </span>
        </div>
        <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
          {presets.map(p=>(
            <button key={p} onClick={()=>onTargetChange(p)}
              style={{ padding:"6px 12px", borderRadius:16,
                       background: targetWordCount===p ? C.gold : "transparent",
                       color: targetWordCount===p ? C.bg : C.text,
                       border: "1px solid " + (targetWordCount===p ? C.gold : C.borderLight),
                       fontSize:12, fontWeight:500, cursor:"pointer", fontFamily:"Nunito, sans-serif" }}>
              {(p/1000)+"K"}
            </button>
          ))}
        </div>
      </div>

      {/* Chapter count */}
      <div style={{ marginBottom:16 }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"baseline", marginBottom:6 }}>
          <label style={{ color:C.amber, fontSize:11, letterSpacing:1, textTransform:"uppercase", fontWeight:600 }}>
            Chapter Count
          </label>
          <span style={{ color:C.gold, fontFamily:"Cormorant Garamond, serif", fontSize:18, fontWeight:700 }}>
            {chapterCount}
          </span>
        </div>
        <input type="range" min={15} max={45} value={chapterCount} onChange={e=>onChapterChange(+e.target.value)}
          style={{ width:"100%", accentColor:C.gold, height:6 }}/>
        <div style={{ display:"flex", justifyContent:"space-between", color:C.muted, fontSize:10, marginTop:4 }}>
          <span>15</span><span>25</span><span>35</span><span>45</span>
        </div>
      </div>

      {/* Avg words per chapter (auto) */}
      <div style={{ padding:"10px 14px", background:C.bg, border:"1px solid "+C.borderLight, borderRadius:6, marginBottom:16 }}>
        <div style={{ color:C.muted, fontSize:11, marginBottom:3 }}>Average words per chapter (auto)</div>
        <div style={{ color:C.gold, fontFamily:"Cormorant Garamond, serif", fontSize:22, fontWeight:700 }}>
          {avgWordsPerChapter.toLocaleString()} <span style={{ color:C.muted, fontSize:13, fontWeight:400, fontStyle:"italic" }}>words/chapter</span>
        </div>
      </div>

      {/* Max words per generation */}
      <div>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"baseline", marginBottom:6 }}>
          <label style={{ color:C.amber, fontSize:11, letterSpacing:1, textTransform:"uppercase", fontWeight:600 }}>
            Max Words Per Generation
          </label>
          <span style={{ color:C.gold, fontFamily:"Cormorant Garamond, serif", fontSize:16, fontWeight:700 }}>
            {maxWordsPerGen.toLocaleString()}
          </span>
        </div>
        <div style={{ display:"flex", flexWrap:"wrap", gap:6, marginBottom:4 }}>
          {maxGenPresets.map(p=>(
            <button key={p} onClick={()=>onMaxChange(p)}
              style={{ padding:"5px 10px", borderRadius:14,
                       background: maxWordsPerGen===p ? C.amber : "transparent",
                       color: maxWordsPerGen===p ? C.bg : C.text,
                       border: "1px solid " + (maxWordsPerGen===p ? C.amber : C.borderLight),
                       fontSize:11, fontWeight:500, cursor:"pointer", fontFamily:"Nunito, sans-serif" }}>
              {p.toLocaleString()}
            </button>
          ))}
        </div>
        <div style={{ color:C.muted, fontSize:10, marginTop:6, lineHeight:1.4 }}>
          AI generates this many words at a time. If chapter target exceeds this, use "Continue Chapter" to extend.
        </div>
      </div>
    </div>
  );
}

// ── Scene Card UI ─────────────────────────────────────────────
// Status: notStarted | drafting | complete | locked

function SceneCard({ scene, chapterNum, prose, summary, locked, editing, status,
                     onWrite, onContinue, onEdit, onSaveEdit, onCancelEdit, onRegen, onLock, onSummarize,
                     writing, continuing, summarizing, hasBible, hideWrite }) {
  const wordCount = prose ? prose.trim().split(/\s+/).filter(Boolean).length : 0;
  const target = scene.targetWordCount || 900;
  const pct = Math.min(100, Math.round(wordCount / target * 100));
  const atTarget = wordCount >= target * 0.9;

  const [editBuffer, setEditBuffer] = useState(prose||"");
  useEffect(()=>{ if (editing) setEditBuffer(prose||""); }, [editing, prose]);

  const statusColors = {
    notStarted: { c:C.muted, bg:"transparent", label:"NOT STARTED" },
    drafting:   { c:"#B07A1F", bg:"rgba(200,160,48,0.15)", label:"DRAFTING" },
    complete:   { c:"#2D8B7A", bg:"rgba(45,139,122,0.10)", label:"COMPLETE" },
    locked:     { c:C.gold, bg:C.glow, label:"LOCKED" }
  };
  const st = statusColors[status] || statusColors.notStarted;

  return (
    <div style={{ padding:"14px 16px", background:C.bg, border:"1px solid "+(locked?C.gold:C.borderLight), borderRadius:8, marginBottom:10 }}>
      {/* Header */}
      <div style={{ display:"flex", alignItems:"baseline", justifyContent:"space-between", marginBottom:8, flexWrap:"wrap", gap:6 }}>
        <div>
          <span style={{ color:C.amber, fontFamily:"Cormorant Garamond, serif", fontSize:14, fontWeight:700, marginRight:6 }}>
            Scene {scene.sceneNumber}
          </span>
          <span style={{ color:C.text, fontFamily:"Cormorant Garamond, serif", fontSize:15, fontWeight:600, fontStyle:"italic" }}>
            {scene.sceneTitle}
          </span>
        </div>
        <div style={{ display:"flex", gap:5, alignItems:"center", flexWrap:"wrap" }}>
          <span style={{ padding:"1px 7px", background:st.bg, border:"1px solid "+st.c, borderRadius:8, fontSize:9, color:st.c, fontWeight:700, letterSpacing:1 }}>
            {st.label}
          </span>
          {scene.povCharacter && (
            <span style={{ padding:"1px 7px", background:C.surface, border:"1px solid "+C.borderLight, borderRadius:8, fontSize:9, color:C.muted, textTransform:"uppercase", letterSpacing:0.5 }}>
              {scene.povCharacter} POV
            </span>
          )}
          <span style={{ padding:"1px 7px", background:C.surface, border:"1px solid "+C.borderLight, borderRadius:8, fontSize:9, color:C.muted }}>
            {target.toLocaleString()}w
          </span>
        </div>
      </div>

      {/* Scene metadata grid */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(180px, 1fr))", gap:6, marginBottom:10, fontSize:11, color:C.muted, lineHeight:1.5 }}>
        {scene.scenePurpose && <div><span style={{ color:C.amber, fontWeight:600 }}>Purpose: </span>{scene.scenePurpose}</div>}
        {scene.location && <div><span style={{ color:C.amber, fontWeight:600 }}>Where: </span>{scene.location}{scene.timeOfDay?" · "+scene.timeOfDay:""}</div>}
        {scene.characterGoal && <div><span style={{ color:C.amber, fontWeight:600 }}>Goal: </span>{scene.characterGoal}</div>}
        {scene.conflictType && <div><span style={{ color:C.amber, fontWeight:600 }}>Conflict: </span>{scene.conflictType}</div>}
        {scene.emotionalBeat && <div><span style={{ color:C.amber, fontWeight:600 }}>Emotional: </span>{scene.emotionalBeat}</div>}
        {scene.romanceBeat && <div><span style={{ color:C.amber, fontWeight:600 }}>Romance: </span>{scene.romanceBeat}</div>}
      </div>

      {/* Action buttons (no prose yet) — hidden in Fast Draft mode (batch buttons handle it) */}
      {!prose && !hideWrite && (
        <button onClick={onWrite} disabled={writing || locked}
          style={{ padding:"6px 14px", background:writing?C.faint:(locked?C.faint:"transparent"), color:writing?C.muted:(locked?C.muted:C.gold),
                   border:"1px solid "+(locked?C.faint:C.gold), borderRadius:5, fontSize:11, fontWeight:600,
                   cursor:writing?"wait":(locked?"not-allowed":"pointer"), fontFamily:"Nunito, sans-serif" }}>
          {writing ? "Writing scene..." : "✦ Write Scene"}
        </button>
      )}

      {/* Prose display + word count */}
      {prose && !editing && (
        <>
          <div style={{ marginBottom:6 }}>
            <div style={{ display:"flex", justifyContent:"space-between", marginBottom:3 }}>
              <span style={{ color:C.muted, fontSize:10 }}>
                <span style={{ color: atTarget?"#2D8B7A":C.amber, fontWeight:700 }}>{wordCount.toLocaleString()}</span> / {target.toLocaleString()} words
              </span>
              <span style={{ color:C.muted, fontSize:10 }}>{pct}%</span>
            </div>
            <div style={{ height:3, background:C.surface, borderRadius:2, overflow:"hidden" }}>
              <div style={{ height:"100%", width:pct+"%", background: atTarget ? "linear-gradient(90deg, #2D8B7A, "+C.gold+")" : C.amber, transition:"width 0.4s" }}/>
            </div>
          </div>
          <div style={{ padding:12, background:C.surface, border:"1px solid "+C.borderLight, borderRadius:6,
                        color:C.text, fontSize:13, lineHeight:1.75, fontFamily:"Cormorant Garamond, serif",
                        whiteSpace:"pre-wrap", maxHeight:380, overflowY:"auto" }}>
            {prose}
          </div>

          {/* Primary action */}
          <div style={{ marginTop:8, display:"flex", gap:6, flexWrap:"wrap" }}>
            {!atTarget && !locked && (
              <button onClick={onContinue} disabled={continuing}
                style={{ padding:"5px 12px", background:continuing?C.faint:C.gold, color:continuing?C.muted:C.bg,
                         border:"none", borderRadius:5, fontSize:11, fontWeight:700, cursor:continuing?"wait":"pointer", fontFamily:"Nunito, sans-serif" }}>
                {continuing ? "Continuing..." : "✏️ Continue Scene"}
              </button>
            )}
            {atTarget && hasBible && !summary && !locked && (
              <button onClick={onSummarize} disabled={summarizing}
                style={{ padding:"5px 12px", background:summarizing?C.faint:"transparent", color:summarizing?C.muted:C.amber,
                         border:"1px solid "+C.amber, borderRadius:5, fontSize:11, fontWeight:600, cursor:summarizing?"wait":"pointer", fontFamily:"Nunito, sans-serif" }}>
                {summarizing ? "Summarizing..." : "📝 Summarize for Continuity"}
              </button>
            )}
          </div>

          {/* Utility row */}
          {!locked && (
            <div style={{ marginTop:6, display:"flex", gap:5, flexWrap:"wrap" }}>
              <button onClick={onEdit}
                style={{ padding:"3px 8px", background:"transparent", color:C.muted, border:"1px solid "+C.borderLight, borderRadius:4, fontSize:9, cursor:"pointer", fontFamily:"Nunito, sans-serif" }}>
                ✎ Edit
              </button>
              <button onClick={onRegen}
                style={{ padding:"3px 8px", background:"transparent", color:C.muted, border:"1px solid "+C.borderLight, borderRadius:4, fontSize:9, cursor:"pointer", fontFamily:"Nunito, sans-serif" }}>
                🔄 Regenerate
              </button>
              <button onClick={onLock}
                style={{ padding:"3px 8px", background:"transparent", color:C.gold, border:"1px solid "+C.gold, borderRadius:4, fontSize:9, cursor:"pointer", fontFamily:"Nunito, sans-serif" }}>
                🔒 Lock Scene
              </button>
            </div>
          )}
          {locked && (
            <div style={{ marginTop:6, display:"flex", gap:5, alignItems:"center", flexWrap:"wrap" }}>
              <span style={{ color:C.gold, fontSize:10, fontWeight:600 }}>🔒 Locked — protected from regeneration</span>
              <button onClick={onLock}
                style={{ padding:"3px 8px", background:"transparent", color:C.muted, border:"1px solid "+C.borderLight, borderRadius:4, fontSize:9, cursor:"pointer", fontFamily:"Nunito, sans-serif" }}>
                Unlock
              </button>
            </div>
          )}

          {/* Scene summary card */}
          {summary && (
            <div style={{ marginTop:8, padding:"8px 12px", background:"rgba(45,139,122,0.12)", border:"1px solid rgba(45,139,122,0.12)", borderRadius:5 }}>
              <div style={{ color:"#2D8B7A", fontSize:9, letterSpacing:1, textTransform:"uppercase", fontWeight:700, marginBottom:4 }}>
                Scene Summary
              </div>
              {summary.majorEvents && summary.majorEvents.length > 0 && (
                <div style={{ color:C.muted, fontSize:10, marginBottom:2 }}>
                  <span style={{ color:"#2D8B7A" }}>Events:</span> {summary.majorEvents.join("; ")}
                </div>
              )}
              {summary.relationshipChanges && summary.relationshipChanges.length > 0 && (
                <div style={{ color:C.muted, fontSize:10, marginBottom:2 }}>
                  <span style={{ color:"#2D8B7A" }}>Relationship:</span> {summary.relationshipChanges.join("; ")}
                </div>
              )}
              {summary.unresolvedThreads && summary.unresolvedThreads.length > 0 && (
                <div style={{ color:C.muted, fontSize:10 }}>
                  <span style={{ color:"#D06030" }}>Open:</span> {summary.unresolvedThreads.join("; ")}
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* Edit mode */}
      {editing && (
        <div>
          <textarea value={editBuffer} onChange={e=>setEditBuffer(e.target.value)}
            style={{ width:"100%", minHeight:280, padding:12, background:C.surface, border:"1px solid "+C.amber, borderRadius:6,
                     color:C.text, fontSize:12, lineHeight:1.7, fontFamily:"Cormorant Garamond, serif",
                     resize:"vertical", boxSizing:"border-box" }}/>
          <div style={{ display:"flex", gap:6, marginTop:6 }}>
            <button onClick={()=>onSaveEdit(editBuffer)}
              style={{ padding:"5px 12px", background:C.amber, color:C.bg, border:"none", borderRadius:5, fontSize:11, fontWeight:700, cursor:"pointer", fontFamily:"Nunito, sans-serif" }}>
              💾 Save edits
            </button>
            <button onClick={onCancelEdit}
              style={{ padding:"5px 12px", background:"transparent", color:C.muted, border:"1px solid "+C.borderLight, borderRadius:5, fontSize:11, fontWeight:600, cursor:"pointer", fontFamily:"Nunito, sans-serif" }}>
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Chapter Version History (auto-captured before destructive edits) ──
function ChapterVersionHistory({ chapterNum, versions, onRestore, onClose }) {
  const sorted = [...(versions || [])].reverse(); // newest first

  if (!sorted.length) return (
    <div style={{ padding:"16px 18px", background:C.card,
                  border:"1px solid "+C.borderLight, borderRadius:8,
                  marginTop:8 }}>
      <div style={{ color:C.muted, fontSize:12, fontStyle:"italic" }}>
        No versions saved yet. Versions are captured automatically
        before any regeneration or edit.
      </div>
      <button onClick={onClose} style={{ marginTop:10, background:"transparent",
        border:"none", color:C.muted, fontSize:11, cursor:"pointer",
        textDecoration:"underline" }}>Close</button>
    </div>
  );

  return (
    <div style={{ padding:"16px 18px", background:C.card,
                  border:"1px solid "+C.border, borderRadius:8, marginTop:8 }}>
      <div style={{ display:"flex", justifyContent:"space-between",
                    alignItems:"baseline", marginBottom:12 }}>
        <div style={{ color:C.amber, fontSize:11, letterSpacing:1.5,
                      textTransform:"uppercase", fontWeight:700 }}>
          🕐 Chapter {chapterNum} · Version History
        </div>
        <button onClick={onClose}
          style={{ background:"transparent", border:"none",
                   color:C.muted, fontSize:11, cursor:"pointer",
                   textDecoration:"underline" }}>
          Close
        </button>
      </div>
      <div style={{ display:"grid", gap:8 }}>
        {sorted.map((v, i) => (
          <div key={v.id} style={{ padding:"10px 14px", background:C.bg,
                                    border:"1px solid "+C.borderLight,
                                    borderRadius:6 }}>
            <div style={{ display:"flex", justifyContent:"space-between",
                          alignItems:"baseline", marginBottom:4,
                          flexWrap:"wrap", gap:6 }}>
              <div>
                <span style={{ color:C.gold, fontWeight:700,
                               fontSize:13 }}>{v.label}</span>
                {i === 0 && (
                  <span style={{ marginLeft:8, padding:"1px 7px",
                                 background:"rgba(45,139,122,0.12)",
                                 border:"1px solid #2D8B7A",
                                 borderRadius:8, fontSize:9,
                                 color:"#2D8B7A", fontWeight:700 }}>
                    LATEST
                  </span>
                )}
              </div>
              <span style={{ color:C.muted, fontSize:10 }}>
                {new Date(v.savedAt).toLocaleString()}
              </span>
            </div>
            <div style={{ color:C.muted, fontSize:11, marginBottom:8,
                          fontFamily:"Cormorant Garamond, serif",
                          fontStyle:"italic", lineHeight:1.5 }}>
              "{v.prose.trim().slice(0, 120)}..."
            </div>
            <button onClick={() => onRestore(v)}
              style={{ padding:"4px 12px", background:"transparent",
                       color:C.gold, border:"1px solid "+C.gold,
                       borderRadius:5, fontSize:11, fontWeight:600,
                       cursor:"pointer", fontFamily:"Nunito, sans-serif" }}>
              Restore this version
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function SaveStatusIndicator({ status }) {
  const configs = {
    saved:   { icon:"✓", label:"Saved",   color:"#2D8B7A" },
    saving:  { icon:"↻", label:"Saving…", color:C.amber   },
    unsaved: { icon:"●", label:"Unsaved", color:C.muted   },
  };
  const cfg = configs[status] || configs.saved;
  return (
    <div style={{
      display:"flex", alignItems:"center", gap:5,
      padding:"3px 10px",
      background: status==="saved"
        ? "rgba(45,139,122,0.10)" : "transparent",
      border:"1px solid " + (status==="saved"
        ? "rgba(45,139,122,0.25)" : C.borderLight),
      borderRadius:12,
      fontSize:10, color:cfg.color, fontWeight:600,
      letterSpacing:0.5, transition:"all 0.3s",
    }}>
      <span style={{
        fontSize:9,
        display:"inline-block",
        animation: status==="saving"
          ? "obsidianSpin 0.9s linear infinite" : "none"
      }}>
        {cfg.icon}
      </span>
      {cfg.label}
    </div>
  );
}

// ── Full manuscript export (.md) ─────────────────────────────
function exportFullManuscript(story, outline, chapterProse, chapterSummaries) {
  if (!story || !outline) return;
  const chapters = (outline.chapters || [])
    .filter(ch => chapterProse[ch.number])
    .sort((a, b) => a.number - b.number);

  if (chapters.length === 0) {
    alert("No chapters written yet."); return;
  }

  const totalWords = chapters.reduce((sum, ch) => {
    const prose = chapterProse[ch.number] || "";
    return sum + prose.trim().split(/\s+/).filter(Boolean).length;
  }, 0);

  const lines = [];

  // Title page
  lines.push("# " + story.title);
  lines.push("");
  if (story.tagline) {
    lines.push("*" + story.tagline + "*");
    lines.push("");
  }
  lines.push("---");
  lines.push("");
  lines.push(`${chapters.length} chapters · ${totalWords.toLocaleString()} words`);
  lines.push("");
  lines.push("---");
  lines.push("");

  // Chapters
  chapters.forEach(ch => {
    lines.push("## Chapter " + ch.number + ": " + (ch.title || ""));
    lines.push("");
    if (ch.pov) {
      lines.push(`*${ch.pov} POV · ${ch.arcStage || ""}*`);
      lines.push("");
    }
    lines.push(chapterProse[ch.number].trim());
    lines.push("");
    lines.push("---");
    lines.push("");
  });

  // Continuity summaries appendix (if any exist)
  const summaries = chapters.filter(ch => chapterSummaries[ch.number]);
  if (summaries.length > 0) {
    lines.push("## Appendix: Chapter Summaries");
    lines.push("");
    summaries.forEach(ch => {
      const s = chapterSummaries[ch.number];
      lines.push("### Chapter " + ch.number);
      if (s.summary) lines.push(s.summary);
      if (s.openThreads && s.openThreads.length) {
        lines.push("*Open threads: " + s.openThreads.join("; ") + "*");
      }
      lines.push("");
    });
  }

  const slug = (story.title || "manuscript")
    .toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 40);
  const filename = slug + "-manuscript.md";
  const blob = new Blob([lines.join("\n")], { type:"text/markdown" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
  URL.revokeObjectURL(a.href);
}

// ── Full story-record backup (.json) ─────────────────────────
function exportStoryPackage(storyRecord) {
  if (!storyRecord) return;
  const slug = ((storyRecord.blueprint && storyRecord.blueprint.title)
    || storyRecord.title || "story")
    .toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 40);
  const filename = slug + "-story-package.json";
  const blob = new Blob(
    [JSON.stringify(storyRecord, null, 2)],
    { type:"application/json" }
  );
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
  URL.revokeObjectURL(a.href);
}

// ── Publishing Studio Component ──────────────────────────────

function ChapterBuilder({ story, universe, chapterState, saveStatus, forceSave, activeStoryId,
                          pendingSceneDirectorIssue, setPendingSceneDirectorIssue, onGoToEditorMode }) {
  // Manuscript spec
  const [targetWordCount, setTargetWordCount] = useState(80000);
  const [chapterCount, setChapterCount] = useState(32);
  const [maxWordsPerGen, setMaxWordsPerGen] = useState(2500);
  const avgWordsPerChapter = Math.round(targetWordCount / chapterCount);

  // Persistent chapter/scene data is lifted to App so the active story owns it
  // (enables multi-story persistence). UI/loading flags stay local below.
  const {
    outline, setOutline, bible, setBible, bibleLocked, setBibleLocked,
    chapterProse, setChapterProse, chapterReports, setChapterReports,
    chapterSummaries, setChapterSummaries,
    chapterVersions, setChapterVersions,
    chapterSceneCards, setChapterSceneCards, sceneProse, setSceneProse,
    sceneSummaries, setSceneSummaries, sceneLocked, setSceneLocked
  } = chapterState;

  const [bibleViewerOpen, setBibleViewerOpen] = useState(false);  // Phase 1.5: View toggle
  const [fastDraftMode, setFastDraftMode] = useState(false);      // Phase 1.5: Fast Draft
  const [fastDraftBatchSize, setFastDraftBatchSize] = useState(2);
  const [fastDraftModel, setFastDraftModel] = useState("claude-opus-4-8");
  const [writingBatch, setWritingBatch] = useState(null);          // { ch, scenes:[nums] }
  const [loadingOutline, setLoadingOutline] = useState(false);
  const [buildingBible, setBuildingBible] = useState(false);
  const [writingCh, setWritingCh] = useState(null);
  const [continuingCh, setContinuingCh] = useState(null);
  const [checkingCh, setCheckingCh] = useState(null);
  const [summarizingCh, setSummarizingCh] = useState(null);
  const [editingCh, setEditingCh] = useState(null);
  const [viewingVersionsCh, setViewingVersionsCh] = useState(null); // version history panel toggle

  // ── Scene Engine UI state (persistent scene data lives in App via chapterState) ──
  const [generatingScenesCh, setGeneratingScenesCh] = useState(null);
  const [writingScene, setWritingScene] = useState(null);     // {ch, sc}
  const [continuingScene, setContinuingScene] = useState(null);
  const [summarizingScene, setSummarizingScene] = useState(null);
  const [editingScene, setEditingScene] = useState(null);     // {ch, sc}
  const [expandedChapter, setExpandedChapter] = useState(null);

  // ── Scene Director state ──
  const [directorOpen, setDirectorOpen] = useState(null);          // { chapterNum, sceneNum } | null
  const [sandboxInstruction, setSandboxInstruction] = useState(""); // pre-filled from Editor Mode issue
  const [fromEditorMode, setFromEditorMode] = useState(false);     // true when opened via fixIssueInSceneStudio

  const [err, setErr] = useState("");

  // ── Consume a pending issue from Editor Mode ──
  // When the user clicks "Fix in Scene Studio →", App sets pendingSceneDirectorIssue
  // and navigates here. This effect picks it up, opens the right chapter/scene,
  // pre-fills the sandbox, and clears the pending issue.
  useEffect(() => {
    if (!pendingSceneDirectorIssue) return;
    const { chapterNum } = pendingSceneDirectorIssue;

    // Expand the chapter so scene cards are visible
    setExpandedChapter(chapterNum);

    // Scroll to the chapter card
    requestAnimationFrame(() => {
      const el = document.getElementById(`chapter-${chapterNum}`);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    });

    // Find the last scene with prose in this chapter (fall back to scene 1)
    const writtenNums = Object.keys(sceneProse?.[chapterNum] || {})
      .map(Number)
      .filter(n => sceneProse[chapterNum][n]);
    const targetScene = writtenNums.length > 0 ? Math.max(...writtenNums) : 1;

    // Open the Scene Director on the Sandbox tab for that scene
    setDirectorOpen({ chapterNum, sceneNum: targetScene });
    setSandboxInstruction(pendingSceneDirectorIssue.instruction);
    setFromEditorMode(true);

    // Clear the pending issue so re-renders don't re-trigger
    setPendingSceneDirectorIssue(null);
  }, [pendingSceneDirectorIssue]); // eslint-disable-line react-hooks/exhaustive-deps

  const buildOutline = useCallback(async () => {
    setLoadingOutline(true); setErr("");
    try {
      const o = await generateChapterOutline(story, { chapterCount, targetWordCount });
      setOutline(o);
    } catch(e) { setErr(e.message); }
    finally { setLoadingOutline(false); }
  }, [story, chapterCount, targetWordCount]);

  const buildBible = useCallback(async () => {
    if (!outline) return;
    setBuildingBible(true); setErr("");
    try {
      const b = await generateStoryBible(story, outline);
      setBible(b);
      setBibleLocked(true);   // Phase 1.5: lock on successful build
      setBibleViewerOpen(false);
    } catch(e) { setErr(e.message); }
    finally { setBuildingBible(false); }
  }, [story, outline, setBible, setBibleLocked]);

  // Phase 1.5: reset the bible (clears continuity tracking + chapter history)
  const resetBible = useCallback(() => {
    if (!window.confirm("Reset the Story Bible? This clears all continuity tracking and chapter history. This cannot be undone. Are you sure?")) return;
    setBible(null);
    setBibleLocked(false);
    setChapterReports({});
    setChapterSummaries({});
    setBibleViewerOpen(false);
  }, [setBible, setBibleLocked, setChapterReports, setChapterSummaries]);

  // Phase 1.5: draft a batch of scenes in one call
  const draftBatch = useCallback(async (chapterNum, batchScenes) => {
    if (!batchScenes.length || writingBatch) return;
    setWritingBatch({ ch: chapterNum, scenes: batchScenes.map(s => s.sceneNumber) });
    setErr("");
    try {
      const result = await writeScenesInBatch(story, outline, chapterNum, batchScenes, bible, {
        spiceLevel: story.spiceLevel || 2,
        romanceIntensity: story.romanceIntensity || DEFAULT_INTENSITY,
        eroticRomance: story.eroticRomance || DEFAULT_EROTIC,
        streetLitEng: story.streetLitEng || DEFAULT_STREETLIT,
        suspenseEng: story.suspenseEng || DEFAULT_SUSPENSE,
        model: fastDraftModel
      });
      setSceneProse(prev => {
        const chMap = { ...(prev[chapterNum] || {}) };
        Object.entries(result).forEach(([sn, prose]) => { if (prose) chMap[sn] = prose; });
        return { ...prev, [chapterNum]: chMap };
      });
    } catch(e) { setErr(e.message); }
    finally { setWritingBatch(null); }
  }, [story, outline, bible, setSceneProse, writingBatch, fastDraftModel]);

  // Story Intelligence: add a manual plot thread to the bible
  const addManualThread = useCallback((name) => {
    setBible(prev => {
      if (!prev) return prev;
      const plot = { ...(prev.plot||{}) };
      plot.manualThreads = [...(plot.manualThreads||[]), { name, status:"open" }];
      return { ...prev, plot };
    });
  }, [setBible]);
  const writtenChapterCount = Object.keys(chapterProse).filter(k=>chapterProse[k]).length;

  const writeChapter = useCallback(async (n) => {
    setWritingCh(n); setErr("");
    try {
      const ch = outline.chapters[n-1];
      const text = await writeChapterProse(story, outline, n, universe, bible, {
        desiredWordCount: ch.targetWordCount || avgWordsPerChapter,
        maxWordsPerGen
      });
      setChapterProse(prev => ({...prev, [n]:text}));
      // Clear stale downstream state for this chapter
      setChapterReports(prev => { const c={...prev}; delete c[n]; return c; });
      setChapterSummaries(prev => { const c={...prev}; delete c[n]; return c; });
    } catch(e) { setErr(e.message); }
    finally { setWritingCh(null); }
  }, [story, outline, universe, bible, maxWordsPerGen, avgWordsPerChapter]);

  // ── Version History: capture current prose before a destructive change ──
  const saveChapterVersion = useCallback((n) => {
    const current = chapterProse[n];
    if (!current || !current.trim()) return;
    const wc = current.trim().split(/\s+/).filter(Boolean).length;
    setChapterVersions(prev => {
      const existing = prev[n] || [];
      // Don't save duplicate of most recent version
      if (existing.length > 0 && existing[existing.length-1].prose === current)
        return prev;
      const version = {
        id: Date.now().toString(36) + Math.random().toString(36).slice(2,5),
        prose: current,
        wordCount: wc,
        savedAt: Date.now(),
        label: "v" + (existing.length + 1) + " · " + wc.toLocaleString() + " words",
      };
      return { ...prev, [n]: [...existing.slice(-4), version] };
    });
  }, [chapterProse, setChapterVersions]);

  const restoreChapterVersion = useCallback((n, version) => {
    if (!window.confirm(
      "Restore this version? Your current prose will be saved as a new version first."
    )) return;
    saveChapterVersion(n);  // save current state before restoring
    setChapterProse(prev => ({...prev, [n]: version.prose}));
    setChapterReports(prev => { const c={...prev}; delete c[n]; return c; });
    setChapterSummaries(prev => { const c={...prev}; delete c[n]; return c; });
    setViewingVersionsCh(null);
  }, [saveChapterVersion, setChapterProse, setChapterReports, setChapterSummaries]);




  const runContinuityCheck = useCallback(async (n) => {
    if (!bible || !chapterProse[n]) return;
    setCheckingCh(n); setErr("");
    try {
      const report = await generateContinuityReport(story, bible, n, chapterProse[n], outline);
      setChapterReports(prev => ({...prev, [n]:report}));
      const updated = mergeBibleUpdates(bible, report, n);
      setBible(updated);
    } catch(e) { setErr(e.message); }
    finally { setCheckingCh(null); }
  }, [story, bible, chapterProse, outline]);

  const summarizeChapterHandler = useCallback(async (n) => {
    if (!chapterProse[n]) return;
    setSummarizingCh(n); setErr("");
    try {
      const summary = await summarizeChapter(story, bible, n, chapterProse[n], outline);
      setChapterSummaries(prev => ({...prev, [n]:summary}));
    } catch(e) { setErr(e.message); }
    finally { setSummarizingCh(null); }
  }, [story, bible, chapterProse, outline]);

  // Three-state consistency resolution handlers

  // Apply the editor patch, then AUTO RE-CHECK continuity to verify the fix.
  const applyPatchAndCheck = useCallback(async (n) => {
    const r = chapterReports[n];
    if (!r || !r.revisionPatch || !r.revisionPatch.revisedText) return;

    // Save version before modifying
    saveChapterVersion(n);

    const note = "\n\n[EDITOR PATCH APPLIED]: " + r.revisionPatch.revisedText;
    const updatedProse = (chapterProse[n] || "") + note;
    setChapterProse(prev => ({...prev, [n]: updatedProse}));
    setChapterReports(prev => ({...prev, [n]: {...prev[n], resolved:true, _patchApplied:true }}));
  }, [chapterReports, chapterProse, saveChapterVersion]);

  const acknowledgePatch = useCallback((n) => {
    setChapterReports(prev => ({...prev, [n]: {...prev[n], resolved:true}}));
  }, []);

  const markResolved = useCallback((n) => {
    if (!window.confirm("Mark Chapter "+n+" as resolved? This unblocks subsequent chapters even though continuity check failed.")) return;
    setChapterReports(prev => ({...prev, [n]: {...prev[n], resolved:true}}));
  }, []);

  // ── Scene engine handlers ──
  const buildSceneCards = useCallback(async (chapterNum) => {
    if (!outline || !bible) return;
    setGeneratingScenesCh(chapterNum); setErr("");
    try {
      const result = await generateSceneCards(story, outline, chapterNum, bible, {
        spiceLevel: story.spiceLevel || 2,
        romanceIntensity: story.romanceIntensity || DEFAULT_INTENSITY,
        eroticRomance: story.eroticRomance || DEFAULT_EROTIC,
        streetLitEng: story.streetLitEng || DEFAULT_STREETLIT,
        suspenseEng: story.suspenseEng || DEFAULT_SUSPENSE
      });
      setChapterSceneCards(prev => ({...prev, [chapterNum]: result.scenes || []}));
      setExpandedChapter(chapterNum);
    } catch(e) { setErr(e.message); }
    finally { setGeneratingScenesCh(null); }
  }, [story, outline, bible]);

  const writeSceneHandler = useCallback(async (chapterNum, sceneNumber) => {
    const scenes = chapterSceneCards[chapterNum] || [];
    const scene = scenes.find(s => s.sceneNumber === sceneNumber);
    if (!scene) return;
    setWritingScene({ch:chapterNum, sc:sceneNumber}); setErr("");
    try {
      const prevSceneNum = sceneNumber - 1;
      const prevSummary = prevSceneNum > 0 ? (sceneSummaries[chapterNum] && sceneSummaries[chapterNum][prevSceneNum]) : null;
      const prevSummaryText = prevSummary ? (prevSummary.summary || (prevSummary.majorEvents||[]).join("; ")) : null;
      const text = await writeScene(story, outline, chapterNum, sceneNumber, bible, scene, {
        spiceLevel: story.spiceLevel || 2,
        romanceIntensity: story.romanceIntensity || DEFAULT_INTENSITY,
        eroticRomance: story.eroticRomance || DEFAULT_EROTIC,
        streetLitEng: story.streetLitEng || DEFAULT_STREETLIT,
        suspenseEng: story.suspenseEng || DEFAULT_SUSPENSE,
        maxWordsPerGen,
        scenesInChapter: scenes,
        previousSceneSummary: prevSummaryText
      });
      setSceneProse(prev => ({...prev, [chapterNum]: {...(prev[chapterNum]||{}), [sceneNumber]: text}}));
    } catch(e) { setErr(e.message); }
    finally { setWritingScene(null); }
  }, [story, outline, bible, chapterSceneCards, sceneSummaries, maxWordsPerGen]);

  const continueSceneHandler = useCallback(async (chapterNum, sceneNumber) => {
    const scenes = chapterSceneCards[chapterNum] || [];
    const scene = scenes.find(s => s.sceneNumber === sceneNumber);
    const existing = (sceneProse[chapterNum]||{})[sceneNumber];
    if (!scene || !existing) return;
    setContinuingScene({ch:chapterNum, sc:sceneNumber}); setErr("");
    try {
      const currentWordCount = existing.trim().split(/\s+/).filter(Boolean).length;
      const extra = await continueScene(story, outline, chapterNum, sceneNumber, bible, scene, existing, {
        currentWordCount, maxWordsPerGen
      });
      setSceneProse(prev => ({
        ...prev,
        [chapterNum]: {...(prev[chapterNum]||{}), [sceneNumber]: existing + "\n\n" + extra}
      }));
    } catch(e) { setErr(e.message); }
    finally { setContinuingScene(null); }
  }, [story, outline, bible, chapterSceneCards, sceneProse, maxWordsPerGen]);

  const summarizeSceneHandler = useCallback(async (chapterNum, sceneNumber) => {
    const scenes = chapterSceneCards[chapterNum] || [];
    const scene = scenes.find(s => s.sceneNumber === sceneNumber);
    const prose = (sceneProse[chapterNum]||{})[sceneNumber];
    if (!scene || !prose) return;
    setSummarizingScene({ch:chapterNum, sc:sceneNumber}); setErr("");
    try {
      const summary = await summarizeScene(story, bible, chapterNum, sceneNumber, scene, prose);
      setSceneSummaries(prev => ({
        ...prev,
        [chapterNum]: {...(prev[chapterNum]||{}), [sceneNumber]: summary}
      }));
    } catch(e) { setErr(e.message); }
    finally { setSummarizingScene(null); }
  }, [story, bible, chapterSceneCards, sceneProse]);

  const regenerateSceneHandler = useCallback((chapterNum, sceneNumber) => {
    if (!window.confirm("Regenerate Scene "+sceneNumber+" of Chapter "+chapterNum+"? Current prose will be replaced.")) return;
    setSceneProse(prev => { const c={...prev}; if (c[chapterNum]) { const cc={...c[chapterNum]}; delete cc[sceneNumber]; c[chapterNum]=cc; } return c; });
    setSceneSummaries(prev => { const c={...prev}; if (c[chapterNum]) { const cc={...c[chapterNum]}; delete cc[sceneNumber]; c[chapterNum]=cc; } return c; });
    setTimeout(()=>writeSceneHandler(chapterNum, sceneNumber), 50);
  }, [writeSceneHandler]);

  const saveSceneEdit = useCallback((chapterNum, sceneNumber, newText) => {
    setSceneProse(prev => ({...prev, [chapterNum]: {...(prev[chapterNum]||{}), [sceneNumber]: newText}}));
    setSceneSummaries(prev => { const c={...prev}; if (c[chapterNum]) { const cc={...c[chapterNum]}; delete cc[sceneNumber]; c[chapterNum]=cc; } return c; });
    setEditingScene(null);
  }, []);

  const toggleSceneLock = useCallback((chapterNum, sceneNumber) => {
    const key = chapterNum+"-"+sceneNumber;
    setSceneLocked(prev => ({...prev, [key]: !prev[key]}));
  }, []);

  const completeChapterHandler = useCallback(async (chapterNum) => {
    const scenes = chapterSceneCards[chapterNum] || [];
    const proseMap = sceneProse[chapterNum] || {};
    const allComplete = scenes.length > 0 && scenes.every(s => proseMap[s.sceneNumber]);
    if (!allComplete) {
      setErr("Cannot complete chapter — some scenes are not written yet.");
      return;
    }
    // If re-completing (prose already exists), capture the prior assembly to History first
    const isRecomplete = !!(chapterProse[chapterNum] && chapterProse[chapterNum].trim());
    if (isRecomplete) saveChapterVersion(chapterNum);
    // Assemble and store as chapter prose
    const assembled = scenes.map(s => proseMap[s.sceneNumber]).join("\n\n");
    setChapterProse(prev => ({...prev, [chapterNum]: assembled}));
    // Run continuity check on assembled prose
    setCheckingCh(chapterNum); setErr("");
    try {
      const report = await generateContinuityReport(story, bible, chapterNum, assembled, outline);
      setChapterReports(prev => ({...prev, [chapterNum]: report}));
      const updated = mergeBibleUpdates(bible, report, chapterNum);
      setBible(updated);
    } catch(e) { setErr(e.message); }
    finally { setCheckingCh(null); }
  }, [story, outline, bible, chapterSceneCards, sceneProse, chapterProse, saveChapterVersion]);

    const exportChapter = useCallback((n) => {
    const ch = outline.chapters[n-1];
    const prose = chapterProse[n] || "";
    const summary = chapterSummaries[n];
    const md = [
      "# Chapter "+n+": "+(ch.title||""),
      "",
      "**POV:** "+(ch.pov||""),
      "**Arc stage:** "+(ch.arcStage||""),
      "**Scene:** "+(ch.scene||""),
      "**Target word count:** "+(ch.targetWordCount||"-"),
      "**Actual word count:** "+(prose.trim().split(/\s+/).filter(Boolean).length),
      "",
      "---",
      "",
      prose,
      "",
      summary ? "\n---\n\n## Continuity Summary\n\n"+summary.summary+"\n\n**Key events:** "+(summary.keyEvents||[]).join("; ")+"\n\n**Open threads:** "+(summary.openThreads||[]).join("; ") : ""
    ].filter(Boolean).join("\n");
    const blob = new Blob([md], {type:"text/markdown"});
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = (story.title||"chapter").replace(/[^a-z0-9]+/gi,"_").toLowerCase()+"_ch"+n+".md";
    a.click();
    URL.revokeObjectURL(a.href);
  }, [outline, chapterProse, chapterSummaries, story]);

  const exportClaudeHandoff = useCallback((n) => {
    const ch = outline.chapters[n-1];
    const prose = chapterProse[n] || "";
    const md = [
      "# CLAUDE HANDOFF — "+story.title+" — Chapter "+n,
      "",
      "_Use this as a Claude.ai message to continue working on this chapter elsewhere._",
      "",
      "## Story Premise",
      story.hook || "",
      "",
      bible ? "## Story Bible\n\n### World\n"+JSON.stringify(bible.world,null,2)+"\n\n### Characters\n"+JSON.stringify(bible.characters,null,2)+"\n\n### Relationship\n"+JSON.stringify(bible.relationship,null,2)+"\n\n### Plot\n"+JSON.stringify(bible.plot,null,2) : "",
      "",
      "## Chapter "+n+" Card",
      "- **Title:** "+(ch.title||""),
      "- **POV:** "+(ch.pov||""),
      "- **Scene:** "+(ch.scene||""),
      "- **Beat:** "+(ch.beat||""),
      "- **Arc stage:** "+(ch.arcStage||""),
      "- **Target word count:** "+(ch.targetWordCount||"-"),
      "- **Cliffhanger/turn:** "+(ch.cliffhangerOrTurn||""),
      "- **Continuity notes:** "+(ch.continuityNotes||""),
      "",
      "## Current Prose",
      "",
      prose || "_(not yet written)_",
      "",
      "## Instructions for Claude",
      "Continue writing this chapter to its target word count. Maintain the POV, character voices, relationship state, and open plot threads as defined in the Story Bible. Do not recap. Do not restart."
    ].filter(Boolean).join("\n");
    const blob = new Blob([md], {type:"text/markdown"});
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = (story.title||"handoff").replace(/[^a-z0-9]+/gi,"_").toLowerCase()+"_ch"+n+"_handoff.md";
    a.click();
    URL.revokeObjectURL(a.href);
  }, [outline, chapterProse, story, bible]);

  return (
    <div style={{ marginTop:36, padding:"24px 26px", background:C.surface, border:"1px solid "+C.border, borderRadius:14 }}>
      <div style={{ display:"flex", alignItems:"baseline", justifyContent:"space-between", flexWrap:"wrap", gap:12, marginBottom:16 }}>
        <div>
          <div style={{ color:C.gold, fontSize:11, letterSpacing:2, textTransform:"uppercase", fontWeight:700, marginBottom:4 }}>
            ✦ Chapter Builder · Editor Loop
          </div>
          <div style={{ color:C.text, fontFamily:"Cormorant Garamond, serif", fontSize:22, fontWeight:600 }}>
            Chapter Architecture
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:8, marginTop:8 }}>
            <SaveStatusIndicator status={saveStatus}/>
            <button onClick={forceSave}
              title="Save all progress · Cmd+S"
              style={{ padding:"5px 12px", background:"transparent", color:C.gold,
                       border:"1px solid "+C.gold, borderRadius:6, fontSize:11, fontWeight:600,
                       cursor:"pointer", fontFamily:"Nunito, sans-serif" }}>
              ↓ Save Now
            </button>
          </div>
        </div>
        {!outline && (
          <button onClick={buildOutline} disabled={loadingOutline}
            style={{ padding:"10px 18px", background:loadingOutline?C.faint:C.gold, color:loadingOutline?C.muted:C.bg,
                     border:"none", borderRadius:8, fontWeight:700, fontSize:13, cursor:loadingOutline?"wait":"pointer",
                     fontFamily:"Nunito, sans-serif" }}>
            {loadingOutline ? "Architecting..." : "Step 1 · Generate Chapter Outline"}
          </button>
        )}
        {outline && !bible && (
          <button onClick={buildBible} disabled={buildingBible}
            style={{ padding:"10px 18px", background:buildingBible?C.faint:C.amber, color:buildingBible?C.muted:C.bg,
                     border:"none", borderRadius:8, fontWeight:700, fontSize:13, cursor:buildingBible?"wait":"pointer",
                     fontFamily:"Nunito, sans-serif" }}>
            {buildingBible ? "Building Bible..." : "Step 2 · Initialize Story Bible"}
          </button>
        )}
        {bible && bibleLocked && (
          <div style={{ display:"flex", flexDirection:"column", alignItems:"flex-end", gap:4 }}>
            <div style={{ display:"flex", alignItems:"center", gap:8 }}>
              <div style={{ padding:"6px 12px", background:"#2D8B7A22", border:"1px solid #2D8B7A", borderRadius:6,
                            color:"#2D8B7A", fontSize:11, fontWeight:700 }}>
                ✓ Story Bible Active · {(bible.chapters||[]).length}/{outline?outline.chapters.length:0} tracked
              </div>
              <button onClick={()=>setBibleViewerOpen(o=>!o)}
                style={{ padding:"5px 11px", background:"transparent", color:C.gold, border:"1px solid "+C.borderLight,
                         borderRadius:6, fontSize:11, fontWeight:600, cursor:"pointer", fontFamily:"Nunito, sans-serif" }}>
                {bibleViewerOpen ? "Hide" : "View"}
              </button>
            </div>
            <button onClick={resetBible}
              style={{ background:"none", border:"none", color:C.muted, fontSize:10, cursor:"pointer",
                       textDecoration:"underline", fontFamily:"Nunito, sans-serif", padding:0 }}>
              Reset Bible
            </button>
          </div>
        )}
      </div>
      {!outline && (
        <ManuscriptSpec
          targetWordCount={targetWordCount} onTargetChange={setTargetWordCount}
          chapterCount={chapterCount} onChapterChange={setChapterCount}
          maxWordsPerGen={maxWordsPerGen} onMaxChange={setMaxWordsPerGen}
          avgWordsPerChapter={avgWordsPerChapter}/>
      )}

      {/* Export / save actions — once an outline exists and ≥1 chapter is written */}
      {outline && Object.values(chapterProse).some(Boolean) && (() => {
        const writtenCount = Object.values(chapterProse).filter(Boolean).length;
        const totalManuscriptWords = Object.values(chapterProse).filter(Boolean)
          .reduce((sum, p) => sum + p.trim().split(/\s+/).filter(Boolean).length, 0);
        return (
          <div style={{ display:"flex", gap:8, flexWrap:"wrap", alignItems:"center",
                        padding:"10px 0", borderBottom:"1px solid "+C.faint, marginBottom:14 }}>
            <div style={{ color:C.muted, fontSize:11, marginRight:4 }}>
              {writtenCount} of {outline.chapters.length} chapters · {totalManuscriptWords.toLocaleString()} words
            </div>
            <div style={{ flex:1 }}/>
            <button onClick={forceSave}
              title="Save all progress · Cmd+S"
              style={{ padding:"5px 12px", background:"transparent", color:C.gold,
                       border:"1px solid "+C.gold, borderRadius:6, fontSize:11, fontWeight:600,
                       cursor:"pointer", fontFamily:"Nunito, sans-serif" }}>
              ↓ Save
            </button>
            <button onClick={() => exportFullManuscript(story, outline, chapterProse, chapterSummaries)}
              style={{ padding:"5px 12px", background:"transparent", color:C.amber,
                       border:"1px solid "+C.amber, borderRadius:6, fontSize:11, fontWeight:600,
                       cursor:"pointer", fontFamily:"Nunito, sans-serif" }}>
              ↓ Export Manuscript
            </button>
            <button onClick={() => {
                const stories = loadStories();
                const record = stories.find(s => s.id === activeStoryId);
                exportStoryPackage(record);
              }}
              style={{ padding:"5px 12px", background:"transparent", color:C.muted,
                       border:"1px solid "+C.borderLight, borderRadius:6, fontSize:11, fontWeight:600,
                       cursor:"pointer", fontFamily:"Nunito, sans-serif" }}>
              ↓ Backup JSON
            </button>
          </div>
        );
      })()}

      {outline && (
        <div style={{ marginBottom:16, padding:"10px 14px", background:C.card, border:"1px solid "+C.borderLight, borderRadius:8,
                      display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:10 }}>
          <div style={{ color:C.muted, fontSize:11 }}>
            <span style={{ color:C.amber, fontWeight:600 }}>Manuscript:</span> {targetWordCount.toLocaleString()} words ·
            <span style={{ color:C.amber, fontWeight:600 }}> {(outline.chapters||[]).length}</span> chapters ·
            avg <span style={{ color:C.amber, fontWeight:600 }}>{avgWordsPerChapter.toLocaleString()}</span> per chapter ·
            max <span style={{ color:C.amber, fontWeight:600 }}>{maxWordsPerGen.toLocaleString()}</span> per generation
          </div>
        </div>
      )}

      {err && <div style={{ color:"#B8342D", fontSize:12, marginBottom:12, padding:"8px 12px", background:"#FBE9E7", border:"1px solid #B8342D", borderRadius:6 }}>⚠ {err}</div>}

      {bible && bibleViewerOpen && <StoryBibleViewer bible={bible} currentChapterCount={writtenChapterCount} onAddManualThread={addManualThread}/>}

      {outline && outline.chapters && (
        <div style={{ marginTop:bible?22:0 }}>
          {!bible && (
            <div style={{ padding:"12px 14px", background:C.bg, border:"1px dashed "+C.amber, borderRadius:8, marginBottom:14, color:C.amber, fontSize:12, lineHeight:1.5 }}>
              💡 Initialize the Story Bible above before writing chapters. The bible enforces character consistency, timeline integrity, and plot thread tracking across every chapter.
            </div>
          )}
          {outline.chapters.map((ch, idx) => {
            // Block this chapter if a PRIOR chapter has FAIL status without resolution
            const priorFail = idx > 0 && outline.chapters.slice(0, idx).some(pc => {
              const r = chapterReports[pc.number];
              return r && r.status === "FAIL" && !r.resolved;
            });
            const scenes = chapterSceneCards[ch.number] || [];
            const proseMap = sceneProse[ch.number] || {};
            const summaryMap = sceneSummaries[ch.number] || {};
            const hasScenes = scenes.length > 0;
            const sceneStatuses = scenes.map(s => {
              const key = ch.number+"-"+s.sceneNumber;
              if (sceneLocked[key]) return "locked";
              const prose = proseMap[s.sceneNumber];
              if (!prose) return "notStarted";
              const wc = prose.trim().split(/\s+/).filter(Boolean).length;
              return wc >= (s.targetWordCount||900) * 0.9 ? "complete" : "drafting";
            });
            const allScenesComplete = hasScenes && sceneStatuses.every(s => s==="complete" || s==="locked");

            return (
              <div key={ch.number} id={`chapter-${ch.number}`}
                style={{ padding:18, background:C.card,
                         border:"1px solid "+(priorFail && !chapterProse[ch.number] ? "#B8342D" :
                           (chapterReports[ch.number] ?
                             (chapterReports[ch.number].status==="PASS"?"#2D8B7A":chapterReports[ch.number].status==="WARNING"?"#B07A1F":"#B8342D") :
                             C.border)),
                         borderRadius:10, marginBottom:14,
                         opacity: priorFail && !chapterProse[ch.number] ? 0.7 : 1 }}>

                {/* Chapter header */}
                <div style={{ display:"flex", alignItems:"baseline", justifyContent:"space-between", marginBottom:8, flexWrap:"wrap", gap:8 }}>
                  <div>
                    <span style={{ color:C.gold, fontFamily:"Cormorant Garamond, serif", fontSize:22, fontWeight:700 }}>
                      Ch. {ch.number}
                    </span>
                    <span style={{ color:C.text, fontFamily:"Cormorant Garamond, serif", fontSize:22, fontWeight:600, marginLeft:10 }}>
                      {ch.title}
                    </span>
                  </div>
                  <div style={{ display:"flex", gap:6, alignItems:"center", flexWrap:"wrap" }}>
                    <span style={{ padding:"2px 8px", background:C.surface, border:"1px solid "+C.borderLight, borderRadius:10, fontSize:10, color:C.muted, textTransform:"uppercase", letterSpacing:0.5 }}>{ch.pov} POV</span>
                    <span style={{ padding:"2px 8px", background:C.glow, border:"1px solid "+C.gold, borderRadius:10, fontSize:10, color:C.gold }}>{ch.arcStage}</span>
                    {hasScenes && (
                      <span style={{ padding:"2px 8px", background:C.surface, border:"1px solid "+C.borderLight, borderRadius:10, fontSize:10, color:C.muted }}>
                        {sceneStatuses.filter(s=>s==="complete"||s==="locked").length}/{scenes.length} scenes
                      </span>
                    )}
                    {chapterReports[ch.number] && (
                      <span style={{ padding:"2px 8px",
                                     background: (chapterReports[ch.number].status==="PASS"?"#2D8B7A":chapterReports[ch.number].status==="WARNING"?"#B07A1F":"#B8342D")+"22",
                                     border:"1px solid "+(chapterReports[ch.number].status==="PASS"?"#2D8B7A":chapterReports[ch.number].status==="WARNING"?"#B07A1F":"#B8342D"),
                                     borderRadius:10, fontSize:10,
                                     color: chapterReports[ch.number].status==="PASS"?"#2D8B7A":chapterReports[ch.number].status==="WARNING"?"#B07A1F":"#B8342D",
                                     fontWeight:700 }}>
                        {chapterReports[ch.number].status}
                      </span>
                    )}
                  </div>
                </div>

                <div style={{ color:C.muted, fontSize:12, marginBottom:5 }}>
                  <span style={{ color:C.amber }}>Scene:</span> {ch.scene}
                </div>
                <div style={{ color:C.text, fontSize:13, marginBottom:8, fontStyle:"italic" }}>{ch.beat}</div>
                {ch.cliffhangerOrTurn && <div style={{ color:C.muted, fontSize:11, marginBottom:4 }}><span style={{ color:C.amber, fontWeight:600 }}>End turn:</span> {ch.cliffhangerOrTurn}</div>}
                {ch.continuityNotes && <div style={{ color:C.muted, fontSize:11, marginBottom:10 }}><span style={{ color:C.amber, fontWeight:600 }}>Continuity:</span> {ch.continuityNotes}</div>}

                {priorFail && !chapterProse[ch.number] && (
                  <div style={{ marginBottom:12, padding:"10px 14px", background:"#FBE9E7", border:"1px solid #B8342D", borderRadius:6, color:"#B8342D", fontSize:12 }}>
                    🛑 Cannot draft until prior chapter is resolved
                  </div>
                )}

                {/* If no scenes yet — Generate Scene Cards button */}
                {!hasScenes && !priorFail && (
                  <div style={{ display:"flex", gap:8, flexWrap:"wrap", alignItems:"center" }}>
                    <button onClick={()=>buildSceneCards(ch.number)} disabled={generatingScenesCh===ch.number || !bible}
                      style={{ padding:"10px 18px", background: !bible ? C.faint : (generatingScenesCh===ch.number?C.faint:C.gold),
                               color: !bible ? C.muted : (generatingScenesCh===ch.number?C.muted:C.bg),
                               border:"none", borderRadius:8, fontWeight:700, fontSize:13,
                               cursor: !bible ? "not-allowed" : (generatingScenesCh===ch.number?"wait":"pointer"),
                               fontFamily:"Nunito, sans-serif" }}>
                      {generatingScenesCh===ch.number ? "Architecting scenes..." : "🎬 Generate Scene Cards"}
                    </button>
                    {!bible && <span style={{ color:C.muted, fontSize:11, fontStyle:"italic" }}>Initialize the Story Bible first ↑</span>}
                  </div>
                )}

                {/* Scene cards rendered when generated */}
                {hasScenes && (
                  <div style={{ marginTop:12 }}>
                    <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:10, flexWrap:"wrap" }}>
                      <div style={{ color:C.amber, fontSize:10, letterSpacing:1.5, textTransform:"uppercase", fontWeight:700 }}>
                        🎬 {scenes.length} Scene Cards
                      </div>
                      <div style={{ display:"flex", alignItems:"center", gap:8, marginLeft:"auto" }}>
                        <span style={{ color:C.muted, fontSize:11 }}>Fast Draft</span>
                        <button onClick={() => setFastDraftMode(!fastDraftMode)}
                          style={{ width:36, height:20, borderRadius:10, border:"none", cursor:"pointer",
                                   background: fastDraftMode ? C.gold : C.borderLight, position:"relative", transition:"background 0.2s" }}>
                          <span style={{ position:"absolute", top:2, width:16, height:16, borderRadius:8, background:"#fff",
                                         transition:"left 0.2s", left: fastDraftMode ? 18 : 2 }}/>
                        </button>
                        {fastDraftMode && (
                          <select value={fastDraftBatchSize} onChange={e => setFastDraftBatchSize(Number(e.target.value))}
                            style={{ padding:"2px 6px", background:C.card, color:C.text, border:"1px solid "+C.borderLight,
                                     borderRadius:4, fontSize:11, fontFamily:"Nunito, sans-serif" }}>
                            <option value={2}>2 scenes/batch</option>
                            <option value={3}>3 scenes/batch</option>
                          </select>
                        )}
                        {fastDraftMode && (
                          <select value={fastDraftModel} onChange={e => setFastDraftModel(e.target.value)}
                            title="Fast Draft model"
                            style={{ padding:"2px 6px", background:C.card, color:C.text, border:"1px solid "+C.borderLight,
                                     borderRadius:4, fontSize:11, fontFamily:"Nunito, sans-serif" }}>
                            {FAST_DRAFT_MODELS.map(m => (
                              <option key={m.id} value={m.id}>{m.label} · {m.badge}</option>
                            ))}
                          </select>
                        )}
                        <button onClick={()=>setExpandedChapter(expandedChapter===ch.number ? null : ch.number)}
                          style={{ padding:"3px 8px", background:"transparent", color:C.muted, border:"1px solid "+C.borderLight, borderRadius:4, fontSize:10, cursor:"pointer", fontFamily:"Nunito, sans-serif" }}>
                          {expandedChapter===ch.number ? "Collapse" : "Expand"}
                        </button>
                      </div>
                    </div>
                    {expandedChapter===ch.number && (
                      <div>
                        {fastDraftMode && (
                          <div style={{ display:"flex", flexWrap:"wrap", gap:8, marginBottom:12 }}>
                            {(() => {
                              const batches = [];
                              for (let i=0; i<scenes.length; i+=fastDraftBatchSize) batches.push(scenes.slice(i, i+fastDraftBatchSize));
                              return batches.map((batch, bi) => {
                                const first = batch[0].sceneNumber, last = batch[batch.length-1].sceneNumber;
                                const isWriting = writingBatch && writingBatch.ch===ch.number && writingBatch.scenes.includes(first);
                                return (
                                  <button key={bi} onClick={()=>draftBatch(ch.number, batch)} disabled={!!writingBatch || !bible}
                                    style={{ padding:"8px 14px", background: (isWriting||!bible)?C.faint:C.gold, color:(isWriting||!bible)?C.muted:C.bg,
                                             border:"none", borderRadius:8, fontWeight:700, fontSize:12,
                                             cursor: (writingBatch||!bible)?"wait":"pointer", fontFamily:"Nunito, sans-serif" }}>
                                    {isWriting ? `Drafting ${batch.length} scenes...` : (first===last ? `⚡ Draft Scene ${first}` : `⚡ Draft Scenes ${first}–${last}`)}
                                  </button>
                                );
                              });
                            })()}
                          </div>
                        )}
                        {scenes.map((scene) => {
                          const key = ch.number+"-"+scene.sceneNumber;
                          const status = sceneStatuses[scene.sceneNumber-1];
                          return (
                            <SceneCard key={scene.sceneNumber}
                              scene={scene}
                              chapterNum={ch.number}
                              hideWrite={fastDraftMode}
                              prose={proseMap[scene.sceneNumber]}
                              summary={summaryMap[scene.sceneNumber]}
                              locked={!!sceneLocked[key]}
                              editing={editingScene && editingScene.ch===ch.number && editingScene.sc===scene.sceneNumber}
                              status={status}
                              hasBible={!!bible}
                              writing={writingScene && writingScene.ch===ch.number && writingScene.sc===scene.sceneNumber}
                              continuing={continuingScene && continuingScene.ch===ch.number && continuingScene.sc===scene.sceneNumber}
                              summarizing={summarizingScene && summarizingScene.ch===ch.number && summarizingScene.sc===scene.sceneNumber}
                              onWrite={()=>writeSceneHandler(ch.number, scene.sceneNumber)}
                              onContinue={()=>continueSceneHandler(ch.number, scene.sceneNumber)}
                              onEdit={()=>setEditingScene({ch:ch.number, sc:scene.sceneNumber})}
                              onSaveEdit={(text)=>saveSceneEdit(ch.number, scene.sceneNumber, text)}
                              onCancelEdit={()=>setEditingScene(null)}
                              onRegen={()=>regenerateSceneHandler(ch.number, scene.sceneNumber)}
                              onLock={()=>toggleSceneLock(ch.number, scene.sceneNumber)}
                              onSummarize={()=>summarizeSceneHandler(ch.number, scene.sceneNumber)}/>
                          );
                        })}

                        {/* Complete Chapter button */}
                        {allScenesComplete && !chapterReports[ch.number] && (
                          <div style={{ marginTop:14, padding:"12px 16px", background:"linear-gradient(135deg, "+C.surface+", "+C.card+")", border:"1px solid "+C.gold, borderRadius:8 }}>
                            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:10 }}>
                              <div>
                                <div style={{ color:C.gold, fontSize:11, letterSpacing:1.5, textTransform:"uppercase", fontWeight:700, marginBottom:3 }}>
                                  All scenes complete
                                </div>
                                <div style={{ color:C.muted, fontSize:11 }}>
                                  Assemble the chapter and run a continuity check
                                </div>
                              </div>
                              <button onClick={()=>completeChapterHandler(ch.number)} disabled={checkingCh===ch.number}
                                style={{ padding:"8px 16px", background:checkingCh===ch.number?C.faint:C.gold, color:checkingCh===ch.number?C.muted:C.bg,
                                         border:"none", borderRadius:6, fontWeight:700, fontSize:12,
                                         cursor:checkingCh===ch.number?"wait":"pointer", fontFamily:"Nunito, sans-serif" }}>
                                {checkingCh===ch.number ? "Checking continuity..." : "✓ Complete Chapter"}
                              </button>
                            </div>
                          </div>
                        )}

                        {/* Continuity report when complete */}
                        {chapterReports[ch.number] && (
                          <div style={{ marginTop:12 }}>
                            <ContinuityReportCard report={chapterReports[ch.number]}
                              onApplyPatch={()=>applyPatchAndCheck(ch.number)}
                              onAcknowledgePatch={()=>acknowledgePatch(ch.number)}
                              onMarkResolved={()=>markResolved(ch.number)}
                              onRegenerate={()=>{
                                // Save the current assembled prose to History before rebuilding
                                saveChapterVersion(ch.number);
                                // Clear and rebuild scenes
                                setChapterSceneCards(prev => { const c={...prev}; delete c[ch.number]; return c; });
                                setSceneProse(prev => { const c={...prev}; delete c[ch.number]; return c; });
                                setSceneSummaries(prev => { const c={...prev}; delete c[ch.number]; return c; });
                                setChapterReports(prev => { const c={...prev}; delete c[ch.number]; return c; });
                              }}/>
                          </div>
                        )}

                        {/* ── SCENE DIRECTOR PANEL ── */}
                        {directorOpen && directorOpen.chapterNum === ch.number && (
                          <div style={{ marginTop:14, padding:"18px 20px", background:C.surface, border:"1px solid "+C.gold, borderRadius:10 }}>

                            {/* Header */}
                            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12 }}>
                              <div>
                                <div style={{ color:C.gold, fontSize:10, letterSpacing:2, textTransform:"uppercase", fontWeight:700 }}>
                                  Scene Director
                                </div>
                                <div style={{ color:C.text, fontSize:13, fontWeight:600, marginTop:2 }}>
                                  Ch. {directorOpen.chapterNum} · Scene {directorOpen.sceneNum} · Sandbox
                                </div>
                              </div>
                              <button onClick={() => { setDirectorOpen(null); setFromEditorMode(false); setSandboxInstruction(""); }}
                                style={{ background:"transparent", border:"1px solid "+C.borderLight, borderRadius:5, color:C.muted,
                                         fontSize:11, cursor:"pointer", padding:"3px 8px", fontFamily:"Nunito, sans-serif" }}>
                                × Close
                              </button>
                            </div>

                            {/* Context banner — shown when opened from Editor Mode */}
                            {fromEditorMode && pendingSceneDirectorIssue === null && (
                              <div style={{ padding:"8px 12px", background:"rgba(212,134,58,0.1)", border:"1px solid "+C.amber,
                                            borderRadius:8, marginBottom:12, fontSize:11, color:C.amber,
                                            display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                                <span>
                                  ⚠ Editing from Editor Mode feedback · Ch {directorOpen.chapterNum}
                                </span>
                                <button onClick={() => setFromEditorMode(false)}
                                  style={{ background:"transparent", border:"none", color:C.amber, cursor:"pointer", fontSize:14, padding:"0 2px" }}>
                                  ×
                                </button>
                              </div>
                            )}

                            {/* Sandbox instruction textarea */}
                            <div style={{ color:C.muted, fontSize:10, textTransform:"uppercase", letterSpacing:1, fontWeight:700, marginBottom:6 }}>
                              Sandbox · Revision Instruction
                            </div>
                            <textarea
                              value={sandboxInstruction}
                              onChange={e => setSandboxInstruction(e.target.value)}
                              placeholder="Describe what needs to change in this scene — the Scene Director will use this as your revision brief..."
                              rows={5}
                              style={{ width:"100%", background:C.bg, border:"1px solid "+C.borderLight, borderRadius:6,
                                       color:C.text, fontSize:12, padding:"10px 12px", fontFamily:"Nunito, sans-serif",
                                       resize:"vertical", lineHeight:1.6, boxSizing:"border-box" }}/>

                            {/* Actions */}
                            <div style={{ display:"flex", gap:8, marginTop:10, flexWrap:"wrap", alignItems:"center" }}>
                              <button
                                onClick={() => {
                                  // Copy instruction to clipboard for reference while editing
                                  navigator.clipboard?.writeText(sandboxInstruction).catch(()=>{});
                                  setEditingScene({ ch: directorOpen.chapterNum, sc: directorOpen.sceneNum });
                                }}
                                disabled={!sandboxInstruction.trim()}
                                style={{ padding:"7px 14px", background: sandboxInstruction.trim() ? C.gold : C.faint,
                                         color: sandboxInstruction.trim() ? C.bg : C.muted,
                                         border:"none", borderRadius:6, fontWeight:700, fontSize:11,
                                         cursor: sandboxInstruction.trim() ? "pointer" : "not-allowed", fontFamily:"Nunito, sans-serif" }}>
                                ✎ Open Scene Editor
                              </button>
                              {fromEditorMode && onGoToEditorMode && (
                                <button onClick={onGoToEditorMode}
                                  style={{ padding:"7px 14px", background:"transparent", border:"1px solid "+C.amber,
                                           borderRadius:6, color:C.amber, fontSize:11, fontWeight:600,
                                           cursor:"pointer", fontFamily:"Nunito, sans-serif" }}>
                                  ← Back to Editor Mode
                                </button>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Export when all scenes complete */}
                        {allScenesComplete && (
                          <div style={{ marginTop:10, display:"flex", gap:6, flexWrap:"wrap" }}>
                            <button onClick={()=>{
                                const proseMap = sceneProse[ch.number] || {};
                                const assembled = scenes.map(s => proseMap[s.sceneNumber] || "").join("\n\n");
                                setChapterProse(prev => ({...prev, [ch.number]: assembled}));
                                setTimeout(()=>exportChapter(ch.number), 50);
                              }}
                              style={{ padding:"5px 10px", background:"transparent", color:C.muted, border:"1px solid "+C.borderLight, borderRadius:5, fontSize:10, cursor:"pointer", fontFamily:"Nunito, sans-serif" }}>
                              ⬇ Export Chapter .md
                            </button>
                            <button onClick={()=>{
                                const proseMap = sceneProse[ch.number] || {};
                                const assembled = scenes.map(s => proseMap[s.sceneNumber] || "").join("\n\n");
                                setChapterProse(prev => ({...prev, [ch.number]: assembled}));
                                setTimeout(()=>exportClaudeHandoff(ch.number), 50);
                              }}
                              style={{ padding:"5px 10px", background:"transparent", color:C.muted, border:"1px solid "+C.borderLight, borderRadius:5, fontSize:10, cursor:"pointer", fontFamily:"Nunito, sans-serif" }}>
                              📦 Claude Handoff
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* ── Version History ── */}
                {(chapterProse[ch.number] || (chapterVersions[ch.number]||[]).length > 0) && (
                  <div style={{ marginTop:10 }}>
                    <div style={{ display:"flex", gap:8, flexWrap:"wrap", alignItems:"center" }}>
                      <button onClick={() => setViewingVersionsCh(viewingVersionsCh === ch.number ? null : ch.number)}
                        style={{ padding:"5px 10px", background:"transparent",
                                 color:(chapterVersions[ch.number]||[]).length > 0 ? C.amber : C.muted,
                                 border:"1px solid "+((chapterVersions[ch.number]||[]).length > 0 ? C.amber : C.borderLight),
                                 borderRadius:5, fontSize:10, cursor:"pointer", fontFamily:"Nunito, sans-serif" }}>
                        🕐 History{(chapterVersions[ch.number]||[]).length > 0 ? " (" + (chapterVersions[ch.number]||[]).length + ")" : ""}
                      </button>
                    </div>
                    {viewingVersionsCh === ch.number && (
                      <ChapterVersionHistory
                        chapterNum={ch.number}
                        versions={chapterVersions[ch.number]}
                        onRestore={(v) => restoreChapterVersion(ch.number, v)}
                        onClose={() => setViewingVersionsCh(null)}/>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── NewStoryStickyNav ─────────────────────────────────────────
const NEW_STORY_SECTIONS = [
  { id: "blend",      label: "Blend" },
  { id: "characters", label: "Characters" },
  { id: "tropes",     label: "Tropes" },
  { id: "heat",       label: "Heat" },
  { id: "blueprint",  label: "Blueprint" },
];

function NewStoryStickyNav({ story, loading, canRun, onGenerate, onRegenerate, storyDNALocked }) {
  const [activeId, setActiveId] = useState("blend");

  useEffect(() => {
    const observers = NEW_STORY_SECTIONS.map(s => {
      const el = document.getElementById(s.id);
      if (!el) return null;
      const obs = new IntersectionObserver(
        ([entry]) => { if (entry.isIntersecting) setActiveId(s.id); },
        { threshold: 0.25 }
      );
      obs.observe(el);
      return obs;
    }).filter(Boolean);
    return () => observers.forEach(o => o.disconnect());
  }, []);

  return (
    <div style={{
      position: "sticky", top: 0, zIndex: 10,
      background: C.surface, borderBottom: "1px solid " + C.borderLight,
      padding: "8px 0 8px 0", marginBottom: 18,
      display: "flex", alignItems: "center", gap: 4, flexWrap: "wrap",
    }}>
      {NEW_STORY_SECTIONS.map(s => (
        <button key={s.id}
          onClick={() => document.getElementById(s.id)?.scrollIntoView({ behavior: "smooth" })}
          style={{
            padding: "5px 14px",
            background: activeId === s.id ? C.goldDim : "transparent",
            border: "1px solid " + (activeId === s.id ? C.gold : "transparent"),
            borderRadius: 16, color: activeId === s.id ? C.gold : C.muted,
            fontSize: 11, fontWeight: activeId === s.id ? 700 : 400,
            cursor: "pointer", transition: "all 0.15s", fontFamily: "Nunito, sans-serif",
          }}>
          {s.label}
        </button>
      ))}
      <div style={{ flex: 1 }}/>
      {story && storyDNALocked ? (
        <button onClick={onRegenerate}
          style={{ padding: "5px 14px", background: "transparent", border: "1px solid " + C.borderLight, borderRadius: 16, color: C.muted, fontSize: 11, cursor: "pointer", fontFamily: "Nunito, sans-serif" }}>
          ↺ Regenerate
        </button>
      ) : (
        <button onClick={onGenerate} disabled={!canRun}
          style={{ padding: "5px 14px", background: canRun ? C.gold : C.faint, color: canRun ? C.bg : C.muted, border: "none", borderRadius: 16, fontSize: 11, fontWeight: 700, cursor: canRun ? "pointer" : "not-allowed", fontFamily: "Nunito, sans-serif" }}>
          {loading ? "↻ Generating…" : "✦ Generate Blueprint"}
        </button>
      )}
    </div>
  );
}

// ── ScoreCard — animated count-up ────────────────────────────
function ScoreCard({ label, value, max = 10 }) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!value) return;
    const target = Number(value);
    let start = null;
    const animate = (ts) => {
      if (!start) start = ts;
      const progress = Math.min((ts - start) / 800, 1);
      setDisplay(Math.round(progress * target));
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [value]);

  const pct = (Number(value) / max) * 100;
  const color = pct >= 80 ? C.teal : pct >= 60 ? C.gold : C.amber;

  return (
    <div style={{
      padding: "16px 18px", background: C.card,
      border: "1px solid " + C.borderLight, borderRadius: 12, minWidth: 110,
    }}>
      <div style={{ fontFamily: "Cormorant Garamond, serif", fontSize: 32, fontWeight: 700, color, lineHeight: 1, marginBottom: 4 }}>
        {display}<span style={{ fontSize: 13, color: C.muted, fontFamily: "Nunito, sans-serif", fontWeight: 400 }}>/{max}</span>
      </div>
      <div style={{ color: C.muted, fontSize: 10, textTransform: "uppercase", letterSpacing: 1, fontFamily: "Nunito, sans-serif" }}>
        {label}
      </div>
      <div style={{ marginTop: 8, height: 3, background: C.borderLight, borderRadius: 2, overflow: "hidden" }}>
        <div style={{ height: "100%", width: pct + "%", background: color, borderRadius: 2, transition: "width 0.8s ease" }}/>
      </div>
    </div>
  );
}

function ScoreBar({ label, value, max=10, color }) {
  const pct = Math.max(0, Math.min(100, (value/max)*100));
  return (
    <div style={{ marginBottom:10 }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"baseline", marginBottom:4 }}>
        <span style={{ color:C.text, fontSize:12, fontWeight:500 }}>{label}</span>
        <span style={{ color:color||C.gold, fontFamily:"Cormorant Garamond, serif", fontSize:16, fontWeight:700, fontVariantNumeric:"tabular-nums" }}>
          {value}<span style={{ color:C.muted, fontSize:11, fontWeight:400 }}>/{max}</span>
        </span>
      </div>
      <div style={{ height:6, background:C.faint, borderRadius:3, overflow:"hidden" }}>
        <div style={{ width:pct+"%", height:"100%", background:color||C.gold, borderRadius:3, transition:"width 0.6s" }}/>
      </div>
    </div>
  );
}

function MarketDashboard({ story }) {
  const s = story.scores || {};
  return (
    <div style={{ marginTop:20, padding:"24px 26px", background:"linear-gradient(135deg, "+C.surface+", "+C.card+")",
                  border:"1px solid "+C.gold, borderRadius:12 }}>
      <div style={{ color:C.gold, fontSize:11, letterSpacing:2, textTransform:"uppercase", fontWeight:700, marginBottom:6 }}>
        📊 Commercial Intelligence Dashboard
      </div>
      <div style={{ color:C.muted, fontSize:12, marginBottom:18 }}>
        Market scoring across 7 dimensions
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"18px 28px" }}>
        <ScoreBar label="Emotional Depth"          value={s.emotionalDepth||0}        color="#D88830"/>
        <ScoreBar label="Commercial Familiarity"   value={s.commercialFamiliarity||0} color={C.gold}/>
        <ScoreBar label="Originality"              value={s.originality||0}           color="#A070C8"/>
        <ScoreBar label="Series Potential"         value={s.seriesPotential||0}       color="#2D8B7A"/>
        <ScoreBar label="Romance Satisfaction"     value={s.romanceSatisfaction||0}   color="#C05060"/>
        <ScoreBar label="Mystery / Suspense"       value={s.mysteryStrength||0}       color="#4888C8"/>
        <ScoreBar label="Power & Purpose Alignment" value={s.powerPurposeAlignment||0} color="#B07A1F"/>
      </div>

      {(story.familiarElements || story.uniqueDifferentiator || story.emotionalPayoff || story.adaptationPotential) && (
        <div style={{ marginTop:24, paddingTop:20, borderTop:"1px solid "+C.borderLight, display:"grid", gap:18 }}>
          {story.familiarElements && story.familiarElements.length > 0 && (
            <div>
              <div style={{ color:C.amber, fontSize:11, letterSpacing:1.5, textTransform:"uppercase", fontWeight:600, marginBottom:8 }}>
                ✓ Familiar Market Elements
              </div>
              <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
                {story.familiarElements.map((el,i)=>(
                  <span key={i} style={{ padding:"4px 10px", background:C.card, border:"1px solid "+C.borderLight,
                                          borderRadius:12, fontSize:12, color:C.text }}>
                    {el}
                  </span>
                ))}
              </div>
            </div>
          )}
          {story.uniqueDifferentiator && (
            <div>
              <div style={{ color:C.amber, fontSize:11, letterSpacing:1.5, textTransform:"uppercase", fontWeight:600, marginBottom:8 }}>
                ★ Unique Differentiator
              </div>
              <div style={{ color:C.text, fontSize:13, lineHeight:1.7 }}>{story.uniqueDifferentiator}</div>
            </div>
          )}
          {story.emotionalPayoff && (
            <div>
              <div style={{ color:C.amber, fontSize:11, letterSpacing:1.5, textTransform:"uppercase", fontWeight:600, marginBottom:8 }}>
                ♥ Emotional Payoff
              </div>
              <div style={{ color:C.text, fontSize:14, lineHeight:1.7, fontStyle:"italic", fontFamily:"Cormorant Garamond, serif" }}>
                {story.emotionalPayoff}
              </div>
            </div>
          )}
          {story.adaptationPotential && (
            <div>
              <div style={{ color:C.amber, fontSize:11, letterSpacing:1.5, textTransform:"uppercase", fontWeight:600, marginBottom:8 }}>
                🎬 Adaptation Potential
              </div>
              <div style={{ color:C.text, fontSize:13, lineHeight:1.7 }}>{story.adaptationPotential}</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function ActivatedPatternsCard({ patterns, calibration, currentSpice, currentIntensity, onApplyCalibration }) {
  if (!patterns || patterns.length === 0) return null;
  return (
    <div style={{ padding:"18px 22px", background:C.surface, border:"1px solid "+C.border, borderRadius:12, marginBottom:18 }}>
      <div style={{ color:C.amber, fontSize:11, letterSpacing:2, textTransform:"uppercase", fontWeight:700, marginBottom:10 }}>
        🎯 Activated Market Patterns
      </div>
      <div style={{ color:C.muted, fontSize:11, marginBottom:14, lineHeight:1.5 }}>
        Your blend activates these commercial fiction patterns. The AI uses them as market positioning, not as imitation targets.
      </div>
      <div style={{ display:"grid", gap:8 }}>
        {patterns.map((p,i)=>(
          <div key={p.id} style={{ padding:"10px 12px", background:C.card, border:"1px solid "+C.borderLight, borderRadius:8 }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"baseline", marginBottom:4 }}>
              <div style={{ color:C.gold, fontWeight:600, fontSize:14 }}>{p.name}</div>
              <div style={{ color:C.muted, fontSize:11 }}>{p.blendWeight}% weight</div>
            </div>
            <div style={{ color:C.muted, fontSize:11, fontStyle:"italic", marginBottom:4 }}>{p.promise}</div>
            <div style={{ color:C.muted, fontSize:10 }}>Market space: {p.authors.slice(0,4).join(" · ")}</div>
          </div>
        ))}
      </div>
    
      {calibration && (() => {
        const matches = calibration.spice === currentSpice &&
          calibration.intensity.attractionIntensity === currentIntensity.attractionIntensity &&
          calibration.intensity.emotionalIntimacy === currentIntensity.emotionalIntimacy &&
          calibration.intensity.physicalAffection === currentIntensity.physicalAffection &&
          calibration.intensity.relationshipFocus === currentIntensity.relationshipFocus;
        return (
          <div style={{ marginTop:14, padding:"12px 14px", background:C.bg, border:"1px dashed "+C.gold, borderRadius:8 }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:10, marginBottom:matches?0:8 }}>
              <div style={{ color:C.gold, fontSize:10, letterSpacing:1.5, textTransform:"uppercase", fontWeight:700 }}>
                💡 Suggested Calibration (from these patterns)
              </div>
              {matches && (
                <span style={{ padding:"2px 8px", background:"rgba(45,139,122,0.10)", border:"1px solid #2D8B7A", borderRadius:10, fontSize:10, color:"#2D8B7A", fontWeight:700 }}>
                  ✓ APPLIED
                </span>
              )}
            </div>
            {!matches && (
              <>
                <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(120px, 1fr))", gap:8, fontSize:11, color:C.text, lineHeight:1.5, marginBottom:10 }}>
                  <div><span style={{ color:C.amber, fontWeight:600 }}>Spice: </span>{calibration.spice}/5 · {SPICE_LEVELS[calibration.spice-1].label}</div>
                  <div><span style={{ color:C.amber, fontWeight:600 }}>Attraction: </span>{calibration.intensity.attractionIntensity}/5</div>
                  <div><span style={{ color:C.amber, fontWeight:600 }}>Emotional: </span>{calibration.intensity.emotionalIntimacy}/5</div>
                  <div><span style={{ color:C.amber, fontWeight:600 }}>Physical: </span>{calibration.intensity.physicalAffection}/5</div>
                  <div><span style={{ color:C.amber, fontWeight:600 }}>Focus: </span>{calibration.intensity.relationshipFocus}/5</div>
                </div>
                <button onClick={()=>onApplyCalibration(calibration)}
                  style={{ padding:"6px 14px", background:C.gold, color:C.bg, border:"none", borderRadius:6, fontSize:11, fontWeight:700, cursor:"pointer", fontFamily:"Nunito, sans-serif" }}>
                  ✓ Apply Pattern Calibration
                </button>
              </>
            )}

          </div>
        );
      })()}
      </div>
  );
}

function Blueprint({ story, universes, activeUniverseId, onSaveToUniverse, activeUniverse, activatedPatterns, chapterState, saveStatus, forceSave, activeStoryId, pendingSceneDirectorIssue, setPendingSceneDirectorIssue, onGoToEditorMode }) {
  return (
    <div style={{ marginTop:28 }}>

      {/* ── Blueprint Hero ── */}
      <div style={{ padding:"40px 0 28px", borderBottom:"1px solid "+C.borderLight, marginBottom:28 }}>
        <div style={{ color:C.gold, fontSize:11, letterSpacing:2.5, textTransform:"uppercase", fontWeight:700, marginBottom:12 }}>
          The Blueprint
        </div>
        <div style={{ display:"flex", alignItems:"flex-start", gap:12, flexWrap:"wrap", marginBottom:10 }}>
          <h1 style={{ fontFamily:"Playfair Display, Georgia, serif", fontSize:36, fontWeight:700, color:C.text, lineHeight:1.2, margin:0 }}>
            {story.title}
          </h1>
          {story.storyDNA && (
            <span style={{ padding:"3px 10px", background:C.glow, border:"1px solid "+C.gold, borderRadius:12, color:C.gold, fontSize:11, fontWeight:700, whiteSpace:"nowrap", marginTop:6 }}>🔒 Story DNA Locked</span>
          )}
        </div>
        {story.tagline && (
          <p style={{ fontFamily:"Cormorant Garamond, serif", fontSize:20, fontStyle:"italic", color:C.gold, lineHeight:1.5, marginBottom:14, marginTop:0 }}>
            {story.tagline}
          </p>
        )}
        {story.hook && (
          <p style={{ fontSize:14, color:C.muted, lineHeight:1.75, maxWidth:680, marginBottom:18, marginTop:0 }}>
            {story.hook}
          </p>
        )}
        <div style={{ display:"flex", gap:8, flexWrap:"wrap", marginBottom: story.scores ? 0 : 0 }}>
          {story.genreBlend && (
            <span style={{ padding:"3px 10px", background:C.glow, border:"1px solid "+C.gold, borderRadius:12, color:C.gold, fontSize:11, fontWeight:600 }}>{story.genreBlend}</span>
          )}
          {story.spiceLevel != null && (
            <span style={{ padding:"3px 10px", background:"rgba(184,52,45,0.08)", border:"1px solid "+C.err, borderRadius:12, color:C.err, fontSize:11 }}>
              {"🌶".repeat(Math.min(story.spiceLevel,5))} Spice {story.spiceLevel}
            </span>
          )}
          {story.wordCountTarget && (
            <span style={{ padding:"3px 10px", background:C.faint, border:"1px solid "+C.borderLight, borderRadius:12, color:C.muted, fontSize:11 }}>{story.wordCountTarget}</span>
          )}
        </div>
        {/* Score cards */}
        {story.scores && Object.keys(story.scores).length > 0 && (
          <div style={{ display:"flex", gap:12, flexWrap:"wrap", marginTop:24 }}>
            {Object.entries(story.scores).map(([key, val]) => (
              <ScoreCard key={key} label={key.replace(/([A-Z])/g," $1").trim()} value={val} max={10}/>
            ))}
          </div>
        )}
      </div>

      <div style={{ padding:"22px 26px", background:"linear-gradient(135deg, "+C.surface+", "+C.card+")", border:"1px solid "+C.gold, borderRadius:14, marginBottom:20 }}>
        {story.storyDNA && (
          <div style={{ background:C.manuscript, borderLeft:"3px solid "+C.gold, borderRadius:6, padding:"12px 16px", marginBottom:18 }}>
            <div style={{ color:C.gold, fontSize:10, letterSpacing:1.5, textTransform:"uppercase", fontWeight:700, marginBottom:8 }}>Story DNA</div>
            {[
              ["Genre Blend", story.storyDNA.genreBlend],
              ["Tone", story.storyDNA.tone],
              ["Heat", (story.storyDNA.heat!=null ? story.storyDNA.heat+"/5" : null)],
              ["Heroine", story.storyDNA.heroineWound],
              ["Hero", story.storyDNA.heroWound],
              ["Conflict", story.storyDNA.centralConflict],
              ["Obstacle", story.storyDNA.relationshipObstacle],
            ].filter(([,v])=>v).map(([label,val])=>(
              <div key={label} style={{ display:"flex", gap:10, fontSize:11, marginBottom:3, lineHeight:1.4 }}>
                <span style={{ color:C.muted, minWidth:86 }}>{label}</span>
                <span style={{ color:C.text }}>· {val}</span>
              </div>
            ))}
          </div>
        )}
        <InfoBlock label="Reader Promise">{story.readerPromise}</InfoBlock>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:18, marginTop:20 }}>
        <CharCard data={story.heroine} role="The Heroine" archetype={story.heroineArchetype}
          fear={story.heroineCoreFear} growth={story.heroineGrowthArc} color="#D88830"/>
        <CharCard data={story.hero} role="The Hero" archetype={story.heroArchetype}
          fear={story.heroCoreFear} growth={story.heroGrowthArc} color={C.gold}/>
      </div>

      {story.supporting && story.supporting.length > 0 && (
        <div style={{ marginTop:20, padding:"20px 22px", background:C.surface, border:"1px solid "+C.border, borderRadius:12 }}>
          <div style={{ color:C.gold, fontSize:11, letterSpacing:2, textTransform:"uppercase", fontWeight:700, marginBottom:12 }}>
            Supporting Cast
          </div>
          {story.supporting.map((s,i)=>(
            <div key={i} style={{ marginBottom:i===story.supporting.length-1?0:10, paddingBottom:i===story.supporting.length-1?0:10, borderBottom:i===story.supporting.length-1?"none":"1px solid "+C.faint }}>
              <div style={{ color:C.text, fontWeight:600, fontSize:14 }}>{s.name} <span style={{ color:C.muted, fontWeight:400, fontStyle:"italic" }}>· {s.role}</span></div>
              <div style={{ color:C.muted, fontSize:12, marginTop:3 }}>{s.purpose}</div>
            </div>
          ))}
        </div>
      )}


      {story.relationshipArc && story.relationshipArc.length > 0 && (
        <div style={{ marginTop:20, padding:"22px 24px", background:C.surface, border:"1px solid "+C.border, borderRadius:12 }}>
          <div style={{ color:C.gold, fontSize:11, letterSpacing:2, textTransform:"uppercase", fontWeight:700, marginBottom:14 }}>
            Relationship Arc — 7 Stages
          </div>
          <div style={{ display:"grid", gap:10 }}>
            {story.relationshipArc.map((stage,i)=>(
              <div key={i} style={{ display:"flex", gap:12, alignItems:"flex-start" }}>
                <div style={{ minWidth:24, height:24, borderRadius:12, background:C.gold, color:C.bg, fontWeight:700, fontSize:12, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                  {i+1}
                </div>
                <div style={{ color:C.text, fontSize:13, lineHeight:1.6, paddingTop:3 }}>{stage}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {(story.externalConflictSummary || story.relationshipObstacleSummary) && (
        <div style={{ marginTop:20, padding:"22px 24px", background:C.card, border:"1px solid "+C.border, borderRadius:12 }}>
          {story.externalConflictSummary && <InfoBlock label="External Conflict">{story.externalConflictSummary}</InfoBlock>}
          {story.relationshipObstacleSummary && <InfoBlock label="Relationship Obstacle">{story.relationshipObstacleSummary}</InfoBlock>}
        </div>
      )}

      <div style={{ marginTop:20, padding:"22px 24px", background:C.card, border:"1px solid "+C.border, borderRadius:12 }}>
        <InfoBlock label="Trope Synergy">{story.tropeSynergy}</InfoBlock>
        <InfoBlock label="Marketing Angle">{story.marketingAngle}</InfoBlock>
        {story.amazonCategories && (
          <InfoBlock label="Amazon Categories">
            <ul style={{ margin:0, paddingLeft:18 }}>
              {story.amazonCategories.map((c,i)=><li key={i} style={{ marginBottom:4 }}>{c}</li>)}
            </ul>
          </InfoBlock>
        )}
        <InfoBlock label="Ideal Reader">{story.readerProfile}</InfoBlock>
        <InfoBlock label="Series Potential">{story.seriesPotential}</InfoBlock>
        <InfoBlock label="Word Count Target">{story.wordCountTarget}</InfoBlock>
      </div>

      <div style={{ marginTop:20, padding:"22px 26px", background:C.bg, border:"1px solid "+C.gold, borderRadius:12 }}>
        <div style={{ color:C.gold, fontSize:11, letterSpacing:2, textTransform:"uppercase", fontWeight:700, marginBottom:10 }}>
          ✦ Chapter One Opening Line
        </div>
        <div style={{ color:C.text, fontFamily:"Cormorant Garamond, serif", fontSize:22, fontStyle:"italic", lineHeight:1.5 }}>
          "{story.openingLine}"
        </div>
      </div>

      {/* Phase 1.5: MarketDashboard + ActivatedPatternsCard moved to Market Intelligence */}
      <SaveBlueprint story={story} universes={universes} activeUniverseId={activeUniverseId} onSaveToUniverse={onSaveToUniverse}/>
      <ChapterBuilder story={story} universe={activeUniverse} chapterState={chapterState}
        saveStatus={saveStatus} forceSave={forceSave} activeStoryId={activeStoryId}
        pendingSceneDirectorIssue={pendingSceneDirectorIssue}
        setPendingSceneDirectorIssue={setPendingSceneDirectorIssue}
        onGoToEditorMode={onGoToEditorMode}/>
    </div>
  );
}

// ── Universe Builder UI ──────────────────────────────────────

function UniverseCard({ universe, onOpen, onDelete }) {
  return (
    <div onClick={onOpen}
      style={{ padding:"20px 22px", background:C.card, border:"1px solid "+C.border, borderRadius:12,
               cursor:"pointer", transition:"all 0.15s", marginBottom:14 }}
      onMouseEnter={e=>{ e.currentTarget.style.borderColor=C.gold; }}
      onMouseLeave={e=>{ e.currentTarget.style.borderColor=C.border; }}>
      <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", gap:14 }}>
        <div style={{ flex:1 }}>
          <div style={{ fontFamily:"Cormorant Garamond, serif", color:C.text, fontSize:24, fontWeight:700, marginBottom:4 }}>
            {universe.name}
          </div>
          <div style={{ color:C.amber, fontSize:11, marginBottom:8, fontStyle:"italic" }}>
            {(universe.genres||[]).join(" · ")}
          </div>
          {universe.themes && universe.themes.length > 0 && (
            <div style={{ display:"flex", flexWrap:"wrap", gap:5, marginBottom:8 }}>
              {universe.themes.slice(0,6).map(t=>(
                <span key={t} style={{ padding:"2px 8px", background:C.surface, border:"1px solid "+C.borderLight,
                                       borderRadius:10, fontSize:10, color:C.muted }}>{t}</span>
              ))}
            </div>
          )}
          <div style={{ color:C.muted, fontSize:12, marginTop:6 }}>
            {(universe.books||[]).length} book{(universe.books||[]).length===1?"":"s"} ·
            Lore: {universe.lore ? "generated" : "not generated yet"}
          </div>
        </div>
        <button onClick={(e)=>{ e.stopPropagation(); if(window.confirm("Delete universe \""+universe.name+"\"? This cannot be undone.")) onDelete(); }}
          style={{ background:"transparent", border:"none", color:C.muted, cursor:"pointer", fontSize:16, padding:4 }}
          title="Delete universe">×</button>
      </div>
    </div>
  );
}

function CreateUniverseForm({ onCreate, onCancel }) {
  const [name, setName] = useState("");
  const [genres, setGenres] = useState([]);
  const [themes, setThemes] = useState([]);
  const [vision, setVision] = useState("");

  const toggle = (arr, setArr, v) => setArr(arr.includes(v) ? arr.filter(x=>x!==v) : [...arr, v]);

  const canCreate = name.trim().length > 0 && genres.length > 0;

  return (
    <div style={{ padding:"24px 28px", background:C.surface, border:"1px solid "+C.gold, borderRadius:14, marginBottom:22 }}>
      <div style={{ color:C.gold, fontSize:11, letterSpacing:2, textTransform:"uppercase", fontWeight:700, marginBottom:4 }}>
        ✦ Create New Universe
      </div>
      <div style={{ color:C.text, fontFamily:"Cormorant Garamond, serif", fontSize:24, fontWeight:600, marginBottom:18 }}>
        Define the world
      </div>

      <div style={{ marginBottom:18 }}>
        <label style={{ display:"block", color:C.amber, fontSize:11, letterSpacing:1, textTransform:"uppercase", marginBottom:6, fontWeight:600 }}>
          Universe Name
        </label>
        <input value={name} onChange={e=>setName(e.target.value)}
          placeholder="e.g. Cocaine Money, Power & Purpose, Carter Family Saga"
          style={{ width:"100%", padding:"10px 12px", background:C.card, color:C.text, border:"1px solid "+C.border,
                   borderRadius:8, fontSize:14, fontFamily:"Nunito, sans-serif", boxSizing:"border-box" }}/>
      </div>

      <div style={{ marginBottom:18 }}>
        <label style={{ display:"block", color:C.amber, fontSize:11, letterSpacing:1, textTransform:"uppercase", marginBottom:6, fontWeight:600 }}>
          Genres <span style={{ color:C.muted, fontWeight:400, textTransform:"none", letterSpacing:0 }}>· {genres.length} selected</span>
        </label>
        <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
          {UNIVERSE_GENRES.map(g=>(
            <Chip key={g} active={genres.includes(g)} onClick={()=>toggle(genres, setGenres, g)}>{g}</Chip>
          ))}
        </div>
      </div>

      <div style={{ marginBottom:18 }}>
        <label style={{ display:"block", color:C.amber, fontSize:11, letterSpacing:1, textTransform:"uppercase", marginBottom:6, fontWeight:600 }}>
          Themes <span style={{ color:C.muted, fontWeight:400, textTransform:"none", letterSpacing:0 }}>· {themes.length} selected</span>
        </label>
        <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
          {UNIVERSE_THEMES.map(t=>(
            <Chip key={t} active={themes.includes(t)} onClick={()=>toggle(themes, setThemes, t)}>{t}</Chip>
          ))}
        </div>
      </div>

      <div style={{ marginBottom:20 }}>
        <label style={{ display:"block", color:C.amber, fontSize:11, letterSpacing:1, textTransform:"uppercase", marginBottom:6, fontWeight:600 }}>
          Founding Vision <span style={{ color:C.muted, fontWeight:400, textTransform:"none", letterSpacing:0 }}>· optional</span>
        </label>
        <textarea value={vision} onChange={e=>setVision(e.target.value)}
          placeholder="The seed of the universe. A few sentences about the world, era, central tension, or what makes this universe distinct."
          rows={4}
          style={{ width:"100%", padding:"10px 12px", background:C.card, color:C.text, border:"1px solid "+C.border,
                   borderRadius:8, fontSize:13, fontFamily:"Nunito, sans-serif", boxSizing:"border-box",
                   resize:"vertical", lineHeight:1.5 }}/>
      </div>

      <div style={{ display:"flex", gap:10, justifyContent:"flex-end" }}>
        <button onClick={onCancel}
          style={{ padding:"10px 18px", background:"transparent", color:C.text, border:"1px solid "+C.borderLight,
                   borderRadius:8, fontWeight:600, fontSize:13, cursor:"pointer", fontFamily:"Nunito, sans-serif" }}>
          Cancel
        </button>
        <button onClick={()=>onCreate({ name:name.trim(), genres, themes, vision:vision.trim() })}
          disabled={!canCreate}
          style={{ padding:"10px 22px", background:canCreate?C.gold:C.faint, color:canCreate?C.bg:C.muted, border:"none",
                   borderRadius:8, fontWeight:700, fontSize:13, cursor:canCreate?"pointer":"not-allowed",
                   fontFamily:"Nunito, sans-serif" }}>
          ✦ Create Universe
        </button>
      </div>
    </div>
  );
}

function UniverseLoreDisplay({ lore }) {
  if (!lore) return null;
  return (
    <div style={{ marginTop:22 }}>
      {lore.familyTrees && lore.familyTrees.length > 0 && (
        <div style={{ padding:"22px 24px", background:C.surface, border:"1px solid "+C.border, borderRadius:12, marginBottom:18 }}>
          <div style={{ color:C.gold, fontSize:11, letterSpacing:2, textTransform:"uppercase", fontWeight:700, marginBottom:14 }}>
            🌳 Family Trees
          </div>
          {lore.familyTrees.map((fam,i)=>(
            <div key={i} style={{ marginBottom:i===lore.familyTrees.length-1?0:18 }}>
              <div style={{ color:C.text, fontFamily:"Cormorant Garamond, serif", fontSize:22, fontWeight:700, marginBottom:6 }}>
                The {fam.surname} Family
              </div>
              {fam.notes && <div style={{ color:C.muted, fontSize:12, marginBottom:10, fontStyle:"italic" }}>{fam.notes}</div>}
              <div style={{ display:"grid", gap:6 }}>
                {(fam.members||[]).map((m,j)=>(
                  <div key={j} style={{ padding:"8px 12px", background:C.card, border:"1px solid "+C.borderLight, borderRadius:6 }}>
                    <div style={{ color:C.text, fontWeight:600, fontSize:13 }}>{m.name} <span style={{ color:C.muted, fontWeight:400 }}>· {m.role}</span></div>
                    <div style={{ color:C.muted, fontSize:11, marginTop:2 }}>{m.age} · {m.status}</div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {lore.characterMap && lore.characterMap.length > 0 && (
        <div style={{ padding:"22px 24px", background:C.surface, border:"1px solid "+C.border, borderRadius:12, marginBottom:18 }}>
          <div style={{ color:C.gold, fontSize:11, letterSpacing:2, textTransform:"uppercase", fontWeight:700, marginBottom:14 }}>
            🗺️ Character Map
          </div>
          <div style={{ display:"grid", gap:8 }}>
            {lore.characterMap.map((c,i)=>(
              <div key={i} style={{ padding:"10px 12px", background:C.card, border:"1px solid "+C.borderLight, borderRadius:6 }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"baseline" }}>
                  <div style={{ color:C.text, fontWeight:600, fontSize:14 }}>{c.name}</div>
                  <div style={{ color:C.amber, fontSize:11, fontStyle:"italic" }}>{c.book}</div>
                </div>
                <div style={{ color:C.muted, fontSize:12, marginTop:3 }}>{c.role} · {c.traits}</div>
                {c.connections && c.connections.length > 0 && (
                  <div style={{ color:C.muted, fontSize:11, marginTop:5 }}>↔ {c.connections.join(" · ")}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {lore.timeline && lore.timeline.length > 0 && (
        <div style={{ padding:"22px 24px", background:C.surface, border:"1px solid "+C.border, borderRadius:12, marginBottom:18 }}>
          <div style={{ color:C.gold, fontSize:11, letterSpacing:2, textTransform:"uppercase", fontWeight:700, marginBottom:14 }}>
            📜 Timeline
          </div>
          <div style={{ display:"grid", gap:10 }}>
            {lore.timeline.map((t,i)=>(
              <div key={i} style={{ display:"flex", gap:14, alignItems:"flex-start" }}>
                <div style={{ minWidth:80, padding:"4px 10px", background:C.glow, border:"1px solid "+C.gold,
                              borderRadius:12, color:C.gold, fontSize:11, fontWeight:700, textAlign:"center", flexShrink:0 }}>
                  {t.year}
                </div>
                <div style={{ flex:1, paddingTop:3 }}>
                  <div style={{ color:C.text, fontSize:13, lineHeight:1.5 }}>{t.event}</div>
                  {t.book && <div style={{ color:C.muted, fontSize:11, marginTop:2, fontStyle:"italic" }}>— {t.book}</div>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {lore.expansionOpportunities && lore.expansionOpportunities.length > 0 && (
        <div style={{ padding:"22px 24px", background:C.surface, border:"1px solid "+C.border, borderRadius:12, marginBottom:18 }}>
          <div style={{ color:C.gold, fontSize:11, letterSpacing:2, textTransform:"uppercase", fontWeight:700, marginBottom:14 }}>
            🌱 Series Expansion Opportunities
          </div>
          <ul style={{ margin:0, paddingLeft:20, color:C.text, fontSize:13, lineHeight:1.7 }}>
            {lore.expansionOpportunities.map((o,i)=><li key={i} style={{ marginBottom:6 }}>{o}</li>)}
          </ul>
        </div>
      )}

      {lore.spinoffOpportunities && lore.spinoffOpportunities.length > 0 && (
        <div style={{ padding:"22px 24px", background:C.surface, border:"1px solid "+C.border, borderRadius:12, marginBottom:18 }}>
          <div style={{ color:C.gold, fontSize:11, letterSpacing:2, textTransform:"uppercase", fontWeight:700, marginBottom:14 }}>
            ✨ Spin-Off Opportunities
          </div>
          <div style={{ display:"grid", gap:10 }}>
            {lore.spinoffOpportunities.map((s,i)=>(
              <div key={i} style={{ padding:"12px 14px", background:C.card, border:"1px solid "+C.borderLight, borderRadius:8 }}>
                <div style={{ color:C.gold, fontWeight:600, fontSize:14, marginBottom:3 }}>{s.character}</div>
                <div style={{ color:C.muted, fontSize:12, marginBottom:6, fontStyle:"italic" }}>{s.why}</div>
                <div style={{ color:C.text, fontSize:13, lineHeight:1.5 }}>{s.premise}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {lore.futureBookRecommendations && lore.futureBookRecommendations.length > 0 && (
        <div style={{ padding:"22px 24px", background:"linear-gradient(135deg, "+C.surface+", "+C.card+")", border:"1px solid "+C.gold, borderRadius:12 }}>
          <div style={{ color:C.gold, fontSize:11, letterSpacing:2, textTransform:"uppercase", fontWeight:700, marginBottom:14 }}>
            📚 Future Book Recommendations
          </div>
          <div style={{ display:"grid", gap:12 }}>
            {lore.futureBookRecommendations.map((b,i)=>(
              <div key={i} style={{ padding:"14px 16px", background:C.bg, border:"1px solid "+C.borderLight, borderRadius:8 }}>
                <div style={{ color:C.text, fontFamily:"Cormorant Garamond, serif", fontSize:19, fontWeight:700, marginBottom:5 }}>
                  {b.workingTitle}
                </div>
                <div style={{ color:C.amber, fontSize:11, marginBottom:8, fontStyle:"italic" }}>
                  Lead: {b.mainCharacter}
                </div>
                <div style={{ color:C.text, fontSize:13, lineHeight:1.6 }}>{b.premise}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function UniverseDetail({ universe, onBack, onUpdate, onBuildBook, onDelete }) {
  const [genLore, setGenLore] = useState(false);
  const [err, setErr] = useState("");

  const refreshLore = async () => {
    setGenLore(true); setErr("");
    try {
      const lore = await generateUniverseLore(universe);
      lore.generatedAt = Date.now();
      onUpdate({ ...universe, lore, updated:Date.now() });
    } catch(e) { setErr(e.message); }
    finally { setGenLore(false); }
  };

  return (
    <div>
      <button onClick={onBack}
        style={{ background:"transparent", border:"none", color:C.muted, fontSize:13, cursor:"pointer",
                 marginBottom:18, padding:"6px 0", fontFamily:"Nunito, sans-serif" }}>
        ← Back to all universes
      </button>

      <div style={{ padding:"28px 30px", background:"linear-gradient(135deg, "+C.surface+", "+C.card+")",
                    border:"1px solid "+C.gold, borderRadius:14, marginBottom:22 }}>
        <div style={{ color:C.gold, fontSize:11, letterSpacing:2.5, textTransform:"uppercase", fontWeight:700, marginBottom:8 }}>
          Universe
        </div>
        <div style={{ fontFamily:"Cormorant Garamond, serif", color:C.text, fontSize:42, fontWeight:700, lineHeight:1.1, marginBottom:10 }}>
          {universe.name}
        </div>
        <div style={{ color:C.amber, fontFamily:"Cormorant Garamond, serif", fontSize:17, fontStyle:"italic", marginBottom:14 }}>
          {(universe.genres||[]).join(" · ")}
        </div>
        {universe.themes && universe.themes.length > 0 && (
          <div style={{ display:"flex", flexWrap:"wrap", gap:6, marginBottom:14 }}>
            {universe.themes.map(t=>(
              <span key={t} style={{ padding:"3px 10px", background:C.glow, border:"1px solid "+C.gold,
                                     borderRadius:12, fontSize:11, color:C.gold, fontWeight:600 }}>{t}</span>
            ))}
          </div>
        )}
        {universe.vision && (
          <div style={{ marginTop:14, padding:"14px 18px", background:C.manuscript, borderLeft:"3px solid "+C.gold,
                        borderRadius:4, color:C.text, fontSize:14, lineHeight:1.6, fontStyle:"italic" }}>
            {universe.vision}
          </div>
        )}
        <div style={{ display:"flex", gap:10, flexWrap:"wrap", marginTop:18 }}>
          <button onClick={onBuildBook}
            style={{ padding:"10px 18px", background:C.gold, color:C.bg, border:"none", borderRadius:8,
                     fontWeight:700, fontSize:13, cursor:"pointer", fontFamily:"Nunito, sans-serif" }}>
            ✦ Build New Book In This Universe
          </button>
          <button onClick={refreshLore} disabled={genLore}
            style={{ padding:"10px 18px", background:"transparent", color:C.gold, border:"1px solid "+C.gold,
                     borderRadius:8, fontWeight:600, fontSize:13, cursor:genLore?"wait":"pointer", fontFamily:"Nunito, sans-serif" }}>
            {genLore ? "Architecting lore..." : (universe.lore ? "↻ Regenerate Universe Lore" : "✦ Generate Universe Lore")}
          </button>
          <button onClick={()=>{ if(window.confirm("Delete universe \""+universe.name+"\"? This cannot be undone.")) onDelete(); }}
            style={{ padding:"10px 14px", background:"transparent", color:C.muted, border:"1px solid "+C.borderLight,
                     borderRadius:8, fontWeight:600, fontSize:12, cursor:"pointer", marginLeft:"auto" }}>
            Delete Universe
          </button>
        </div>
        {err && <div style={{ marginTop:14, padding:"10px 14px", background:"#FBE9E7", border:"1px solid #B8342D", borderRadius:6, color:"#B8342D", fontSize:12 }}>⚠ {err}</div>}
      </div>

      {universe.books && universe.books.length > 0 && (
        <div style={{ padding:"22px 24px", background:C.surface, border:"1px solid "+C.border, borderRadius:12, marginBottom:18 }}>
          <div style={{ color:C.gold, fontSize:11, letterSpacing:2, textTransform:"uppercase", fontWeight:700, marginBottom:14 }}>
            Books in This Universe ({universe.books.length})
          </div>
          <div style={{ display:"grid", gap:10 }}>
            {universe.books.map((b,i)=>(
              <div key={b.id||i} style={{ padding:"14px 16px", background:C.card, border:"1px solid "+C.borderLight, borderRadius:8 }}>
                <div style={{ display:"flex", alignItems:"baseline", justifyContent:"space-between", gap:10 }}>
                  <div style={{ color:C.text, fontFamily:"Cormorant Garamond, serif", fontSize:20, fontWeight:700 }}>
                    {b.title}
                  </div>
                  <div style={{ color:C.muted, fontSize:11 }}>Book {i+1}</div>
                </div>
                <div style={{ color:C.amber, fontSize:12, fontStyle:"italic", marginTop:4 }}>{b.tagline}</div>
                <div style={{ color:C.muted, fontSize:12, marginTop:8, lineHeight:1.5 }}>
                  {b.heroine && <span><strong style={{ color:C.text }}>{b.heroine.name}</strong> ({b.heroine.occupation}) · </span>}
                  {b.hero && <span><strong style={{ color:C.text }}>{b.hero.name}</strong> ({b.hero.occupation})</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <UniverseLoreDisplay lore={universe.lore}/>
    </div>
  );
}

function UniverseBuilder({ universes, onCreate, onOpen, onDelete }) {
  const [creating, setCreating] = useState(false);

  return (
    <div>
      <div style={{ textAlign:"center", marginBottom:30 }}>
        <div style={{ color:C.gold, fontSize:11, letterSpacing:3, textTransform:"uppercase", fontWeight:700, marginBottom:6 }}>
          Universe Builder
        </div>
        <h2 style={{ fontFamily:"Cormorant Garamond, serif", fontSize:36, fontWeight:700, color:C.text, margin:0, lineHeight:1.1 }}>
          Build <span style={{ color:C.gold, fontStyle:"italic" }}>worlds</span>, not just books
        </h2>
        <p style={{ color:C.muted, fontSize:13, marginTop:10, maxWidth:520, marginLeft:"auto", marginRight:"auto", lineHeight:1.6 }}>
          A universe holds your books, characters, family trees, timelines, and future story possibilities. Every book added deepens the lore.
        </p>
      </div>

      {creating ? (
        <CreateUniverseForm
          onCreate={(meta)=>{ onCreate(meta); setCreating(false); }}
          onCancel={()=>setCreating(false)}/>
      ) : (
        <button onClick={()=>setCreating(true)}
          style={{ width:"100%", padding:"16px", background:"transparent", color:C.gold,
                   border:"2px dashed "+C.gold, borderRadius:12, fontWeight:700, fontSize:14, cursor:"pointer",
                   fontFamily:"Nunito, sans-serif", marginBottom:22, letterSpacing:0.5 }}>
          + Create New Universe
        </button>
      )}

      {universes.length === 0 && !creating && (
        <div style={{ padding:"36px 28px", background:C.surface, border:"1px dashed "+C.borderLight, borderRadius:12, textAlign:"center" }}>
          <div style={{ color:C.muted, fontSize:14, marginBottom:8 }}>No universes yet</div>
          <div style={{ color:C.muted, fontSize:12, lineHeight:1.6 }}>
            Create your first universe to start building a connected story world. Examples: "Cocaine Money", "Power &amp; Purpose", "The Carter Family Saga".
          </div>
        </div>
      )}

      {universes.length > 0 && (
        <div>
          <div style={{ color:C.amber, fontSize:11, letterSpacing:1.5, textTransform:"uppercase", fontWeight:600, marginBottom:12 }}>
            Your Universes ({universes.length})
          </div>
          {universes.map(u=>(
            <UniverseCard key={u.id} universe={u}
              onOpen={()=>onOpen(u.id)}
              onDelete={()=>onDelete(u.id)}/>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Main App ──────────────────────────────────────────────────

// ── Editor Mode Dashboard (Story Intelligence Layer) ──────────
function StoryConceptInput({ value, onChange }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div style={{ padding:"20px 24px", background:C.surface,
                  border:"1px solid "+C.border, borderRadius:12,
                  marginBottom:18 }}>
      <div style={{ display:"flex", justifyContent:"space-between",
                    alignItems:"baseline", marginBottom: expanded ? 12 : 0 }}>
        <div>
          <div style={{ color:C.gold, fontSize:11, letterSpacing:2,
                        textTransform:"uppercase", fontWeight:700,
                        marginBottom:3 }}>
            Story Concept <span style={{ color:C.muted, fontWeight:400,
                                         textTransform:"none", letterSpacing:0 }}>
              · optional
            </span>
          </div>
          <div style={{ color:C.muted, fontSize:12 }}>
            {value.trim()
              ? `${value.trim().slice(0,60)}${value.trim().length>60?"...":""}`
              : "Have an idea? Describe it and the AI builds from your vision."}
          </div>
        </div>
        <button onClick={() => setExpanded(!expanded)}
          style={{ background:"transparent", border:"none",
                   color:C.gold, fontSize:20, cursor:"pointer",
                   padding:"0 4px" }}>
          {expanded ? "−" : "+"}
        </button>
      </div>
      {expanded && (
        <div>
          <textarea
            value={value}
            onChange={e => onChange(e.target.value)}
            placeholder={`Describe your story idea in your own words. Can be a paragraph or several pages. Examples:\n\n"A burned-out CHRO at a healthcare company falls for the new head of security during a hostile takeover. She's spent 15 years climbing — he's spent 15 years protecting other people. Neither knows how to be vulnerable..."\n\nOr paste a full synopsis, character sketches, plot notes, anything you have.`}
            rows={8}
            style={{ width:"100%", padding:"12px 14px", background:C.card,
                     color:C.text, border:"1px solid "+C.border,
                     borderRadius:8, fontSize:13, lineHeight:1.7,
                     fontFamily:"Nunito, sans-serif", resize:"vertical",
                     boxSizing:"border-box" }}/>
          <div style={{ display:"flex", justifyContent:"space-between",
                        alignItems:"center", marginTop:8 }}>
            <div style={{ color:C.muted, fontSize:11 }}>
              {value.trim().length > 0
                ? `${value.trim().split(/\s+/).length} words · AI will build your blueprint from this`
                : "Leave empty for full AI creation"}
            </div>
            {value.trim() && (
              <button onClick={() => onChange("")}
                style={{ background:"transparent", border:"none",
                         color:C.muted, fontSize:11, cursor:"pointer",
                         textDecoration:"underline" }}>
                Clear
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Import Existing Work flow ─────────────────────────────────
function MyStories({ stories, activeStoryId, onOpen, onDuplicate, onDelete, onImport, onImportExisting }) {
  const fileRef = useRef(null);
  const sorted = [...stories].sort((a,b)=>(b.updatedAt||0)-(a.updatedAt||0));
  const btn = (bg, color, filled) => ({
    padding:"6px 12px", background:bg, color, border: filled ? "none" : "1px solid "+C.borderLight,
    borderRadius:7, fontSize:11, fontWeight:600, cursor:"pointer", fontFamily:"Nunito, sans-serif"
  });
  return (
    <div>
      <div style={{ display:"flex", alignItems:"flex-end", justifyContent:"space-between", gap:14, flexWrap:"wrap", marginBottom:20 }}>
        <div>
          <div style={{ color:C.gold, fontSize:11, letterSpacing:2, textTransform:"uppercase", fontWeight:700, marginBottom:4 }}>Library</div>
          <div style={{ color:C.text, fontFamily:"Cormorant Garamond, serif", fontSize:30, fontWeight:700 }}>My Stories</div>
          <div style={{ color:C.muted, fontSize:12, marginTop:2 }}>{sorted.length} {sorted.length===1?"story":"stories"} saved on this device</div>
        </div>
        <div style={{ display:"flex", gap:10, alignItems:"center" }}>
          <button onClick={()=>onImportExisting && onImportExisting()}
            style={{ padding:"8px 16px", background:"transparent",
                     color:C.gold, border:"1px solid "+C.gold,
                     borderRadius:8, fontSize:12, fontWeight:600,
                     cursor:"pointer", fontFamily:"Nunito, sans-serif" }}>
            📥 Import Existing Work
          </button>
          <input ref={fileRef} type="file" accept=".json" style={{ display:"none" }}
            onChange={(e)=>{ const f=e.target.files&&e.target.files[0]; if(f) onImport(f); e.target.value=""; }}/>
          <button onClick={()=>fileRef.current&&fileRef.current.click()}
            style={{ padding:"9px 16px", background:"transparent", color:C.gold, border:"1px solid "+C.gold,
                     borderRadius:8, fontSize:12, fontWeight:600, cursor:"pointer", fontFamily:"Nunito, sans-serif" }}>
            ⤓ Import from JSON
          </button>
        </div>
      </div>

      {sorted.length === 0 ? (
        <div style={{ padding:"48px 24px", textAlign:"center", color:C.muted, background:C.surface, border:"1px dashed "+C.border, borderRadius:14 }}>
          <div style={{ fontSize:30, marginBottom:10 }}>📚</div>
          <div style={{ fontFamily:"Cormorant Garamond, serif", fontSize:20, color:C.text, marginBottom:6 }}>No stories yet</div>
          <div style={{ fontSize:12 }}>Generate a blueprint in New Story, or import an exported blueprint JSON.</div>
        </div>
      ) : (
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(280px, 1fr))", gap:16 }}>
          {sorted.map(rec => {
            const isActive = rec.id === activeStoryId;
            return (
              <div key={rec.id} style={{ padding:"18px 20px", background:C.surface,
                border:"1px solid "+(isActive?C.gold:C.border), borderRadius:14, display:"flex", flexDirection:"column", gap:7 }}>
                <div style={{ display:"flex", alignItems:"flex-start", gap:8 }}>
                  <div style={{ flex:1, color:C.text, fontFamily:"Cormorant Garamond, serif", fontSize:21, fontWeight:700, lineHeight:1.2 }}>
                    {rec.title || "Untitled Story"}
                  </div>
                  {isActive && (
                    <span style={{ padding:"2px 8px", background:C.glow, color:C.gold, borderRadius:8, fontSize:9, fontWeight:700, letterSpacing:1, textTransform:"uppercase", whiteSpace:"nowrap" }}>Active</span>
                  )}
                </div>
                <div style={{ color:C.amber, fontSize:11, fontWeight:600 }}>{laneSummary(rec.laneVals)}</div>
                <div style={{ color:C.muted, fontSize:11 }}>{storyStatus(rec)}</div>
                <div style={{ color:C.muted, fontSize:10, opacity:0.8 }}>{relativeTime(rec.updatedAt)}</div>
                <div style={{ display:"flex", gap:7, marginTop:6 }}>
                  <button onClick={()=>onOpen(rec.id)} style={btn(C.gold, C.bg, true)}>Open</button>
                  <button onClick={()=>onDuplicate(rec.id)} style={btn("transparent", C.muted, false)}>Duplicate</button>
                  <button onClick={()=>onDelete(rec.id)} style={btn("transparent", "#B8342D", false)}>Delete</button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function App() {
  const [laneVals, setLaneVals] = useState({...DEFAULT_LANE_VALS});
  const [tropes, setTropes] = useState(["Enemies to Lovers","Family Empire"]);
  const [heat, setHeat] = useState(3);
  const [heroineArch, setHeroineArch] = useState(null);
  const [heroArch, setHeroArch] = useState(null);

  // NEW: optional advanced layers
  const [layersOpen, setLayersOpen] = useState(false);
  const [heroineWound, setHeroineWound] = useState(null);
  const [heroWound, setHeroWound] = useState(null);
  const [setting, setSetting] = useState(null);
  const [city, setCity] = useState(null);
  const [family, setFamily] = useState(null);
  const [intensity, setIntensity] = useState(3);
  // NEW: story engine triangle additions
  const [externalConflict, setExternalConflict] = useState(null);
  const [relationshipObstacle, setRelationshipObstacle] = useState(null);
  const [familyInfluence, setFamilyInfluence] = useState(7);

  // ── Spice + Romance Intensity ──
  const [spiceLevel, setSpiceLevel] = useState(2);
  const [romanceIntensity, setRomanceIntensity] = useState(DEFAULT_INTENSITY);

  // ── W3: Erotic Romance Engine (independent of Spice) ──
  const [eroticRomance, setEroticRomance] = useState({...DEFAULT_EROTIC});
  const eroticAppliedRef = useRef(null); // which erotic category baseline is currently reflected

  // ── W4: Street Lit + Suspense engines ──
  const [streetLitEng, setStreetLitEng] = useState({...DEFAULT_STREETLIT});
  const [suspenseEng, setSuspenseEng] = useState({...DEFAULT_SUSPENSE});
  const streetLitAppliedRef = useRef(null);
  const suspenseAppliedRef = useRef(null);

  // ── Phase 1.5: genre preset quick-start ──
  const [selectedPreset, setSelectedPreset] = useState(null);
  const [tropeFilter, setTropeFilter] = useState("All");  // trope category tab (custom mode)

  // ── Import & Continue ──
  const [userConcept, setUserConcept] = useState("");        // optional New Story concept
  const [showingImport, setShowingImport] = useState(false); // Import Existing Work flow
  const [saveStatus, setSaveStatus] = useState("saved");     // "saved" | "saving" | "unsaved"

  // ── Story Intelligence Layer ──
  const [storyDNALocked, setStoryDNALocked] = useState(false);
  const [storyHealthReport, setStoryHealthReport] = useState(null);
  const [analyzingHealth, setAnalyzingHealth] = useState(false);
  const [healthAnalysisErr, setHealthAnalysisErr] = useState("");
  const [healthAnalysisTimestamp, setHealthAnalysisTimestamp] = useState(null);
  const handlePresetSelect = useCallback((preset) => {
    setSelectedPreset(preset.id);
    if (preset.id === "custom" || !preset.lanes) return;
    setLaneVals({ ...DEFAULT_LANE_VALS, ...preset.lanes });
    if (preset.tropes) setTropes(preset.tropes);
    if (preset.heat) setHeat(preset.heat);
    if (preset.spiceLevel) setSpiceLevel(preset.spiceLevel);
    if (preset.romanceIntensity) setRomanceIntensity(preset.romanceIntensity);
  }, []);

  // ── Universe Builder state ──
  const [view, setView] = useState("story");              // "story" | "universes" | "universeDetail"
  const [universes, setUniverses] = useState(() => loadUniverses());
  const [globalRegistry, setGlobalRegistry] = useState(() => loadGlobalRegistry());

  // ── W2: multi-story persistence ──
  const [stories, setStories] = useState(() => loadStories());
  const [activeStoryId, setActiveStoryId] = useState(() => {
    const id = loadActiveStoryId();
    return loadStories().find(s => s.id === id) ? id : null;
  });
  const skipAutosaveRef = useRef(true);  // skip autosave on mount + programmatic hydration
  const [alternativesFor, setAlternativesFor] = useState(null);
  const [alternatives, setAlternatives] = useState(null);
  const [loadingAlts, setLoadingAlts] = useState(false);

  // Publishing Studio state
  const [bookPackage, setBookPackage] = useState(null);
  const [generatingPackage, setGeneratingPackage] = useState(false);
  const [packageProgress, setPackageProgress] = useState("");
  const [packageErr, setPackageErr] = useState("");

  // Active section in left navigation
  const [activeSection, setActiveSection] = useState("newStory");
  const [activeUniverseId, setActiveUniverseId] = useState(null);   // universe being authored INTO
  const [detailUniverseId, setDetailUniverseId] = useState(null);   // universe being viewed

  // ── Editor Mode → Scene Studio bridge ──
  // Holds an issue from the Editor Mode analysis that should pre-fill the Scene Director sandbox.
  const [pendingSceneDirectorIssue, setPendingSceneDirectorIssue] = useState(null);

  // Persist universes whenever they change
  const persistUniverses = useCallback((next) => {
    setUniverses(next);
    saveUniverses(next);
  }, []);

  const createUniverse = (meta) => {
    const u = {
      id: newUniverseId(),
      name: meta.name,
      genres: meta.genres,
      themes: meta.themes,
      vision: meta.vision,
      books: [],
      lore: null,
      created: Date.now(),
      updated: Date.now(),
    };
    persistUniverses([u, ...universes]);
    setDetailUniverseId(u.id);
    setView("universeDetail");
  };

  const updateUniverse = (updated) => {
    persistUniverses(universes.map(u => u.id===updated.id ? updated : u));
  };

  const deleteUniverse = (id) => {
    persistUniverses(universes.filter(u => u.id !== id));
    if (activeUniverseId === id) setActiveUniverseId(null);
    if (detailUniverseId === id) { setDetailUniverseId(null); setView("universes"); }
  };

  const openUniverse = (id) => { setDetailUniverseId(id); setView("universeDetail"); };

  const buildBookInUniverse = (universeId) => {
    setActiveUniverseId(universeId);
    setView("story");
    setStory(null);
  };

  const saveBookToUniverse = (universeId) => {
    if (!story) return;
    const target = universes.find(u => u.id === universeId);
    if (!target) return;
    const bookEntry = { id: newBookId(), addedAt: Date.now(), ...story };
    const updated = { ...target, books: [...(target.books||[]), bookEntry], updated: Date.now() };
    persistUniverses(universes.map(u => u.id===universeId ? updated : u));
  };

  const activeUniverse = universes.find(u => u.id === activeUniverseId) || null;

  // Generate Alternatives handler
  const runGenerateAlternatives = async (type, currentItem, context) => {
    setLoadingAlts(true);
    try {
      const avoid =
        type === "character name" ? globalRegistry.characterNames :
        type === "family name" ? globalRegistry.familyNames :
        type === "business name" ? globalRegistry.businessNames :
        type === "organization name" ? globalRegistry.organizationNames :
        type === "story title" ? globalRegistry.organizationNames :
        type === "plot premise" ? globalRegistry.plotFingerprints :
        type === "location" ? globalRegistry.locations :
        [];
      const result = await generateAlternatives(type, currentItem, context, avoid);
      setAlternatives(result.alternatives || []);
    } catch(e) { setErr(e.message); }
    finally { setLoadingAlts(false); }
  };

  const openAlternatives = (type, currentItem, context) => {
    setAlternativesFor({ type, current: currentItem, context });
    setAlternatives(null);
  };

  const closeAlternatives = () => {
    setAlternativesFor(null);
    setAlternatives(null);
  };

  // Publishing Studio handlers
  const generatePublishingPackage = async (outline, bible) => {
    if (!story) return;
    setGeneratingPackage(true); setPackageErr(""); setBookPackage(null);
    try {
      const result = await generateBookLaunchPackage(story, outline, bible, (msg)=>setPackageProgress(msg));
      setBookPackage(result);
    } catch(e) { setPackageErr(e.message); }
    finally { setGeneratingPackage(false); setPackageProgress(""); }
  };

  const exportPublishingPackage = () => {
    if (!bookPackage || !story) return;
    const pkg = bookPackage;
    const md = [];
    md.push("# BOOK LAUNCH PACKAGE — "+story.title);
    md.push("");
    if (pkg.commercialReadiness) {
      md.push("## Commercial Readiness Score: "+pkg.commercialReadiness.score+"/10");
      md.push("");
      if (pkg.commercialReadiness.strengths) md.push("**Strengths:** "+pkg.commercialReadiness.strengths.join("; "));
      if (pkg.commercialReadiness.concerns) md.push("**Concerns:** "+pkg.commercialReadiness.concerns.join("; "));
      if (pkg.commercialReadiness.publishingRecommendation) md.push("**Recommendation:** "+pkg.commercialReadiness.publishingRecommendation);
      md.push("");
    }
    if (pkg.positioning) {
      md.push("## Positioning");
      Object.entries(pkg.positioning).forEach(([k,v]) => md.push("- **"+k+":** "+v));
      md.push("");
    }
    if (pkg.titles) {
      md.push("## Title Options");
      pkg.titles.forEach(t => md.push("- **"+t.title+"** (Sales "+t.commercialStrength+" · Memorable "+t.memorability+" · Genre "+t.genreAlignment+" · Series "+t.seriesPotential+")"));
      md.push("");
    }
    if (pkg.readerPromiseDetail) {
      md.push("## Reader Promise");
      if (pkg.readerPromiseDetail.emotionalOutcomes) md.push("**Emotional outcomes:** "+pkg.readerPromiseDetail.emotionalOutcomes.join(", "));
      if (pkg.readerPromiseDetail.moodDescription) md.push("**Mood:** "+pkg.readerPromiseDetail.moodDescription);
      if (pkg.readerPromiseDetail.targetEmotionalState) md.push("**Target state:** "+pkg.readerPromiseDetail.targetEmotionalState);
      md.push("");
    }
    if (pkg.descriptions) {
      md.push("## Descriptions");
      if (pkg.descriptions.oneSentenceHook) md.push("### One-Sentence Hook\n\n> "+pkg.descriptions.oneSentenceHook+"\n");
      if (pkg.descriptions.amazonDescription) md.push("### Amazon Description\n\n"+pkg.descriptions.amazonDescription+"\n");
      if (pkg.descriptions.backCoverCopy) md.push("### Back Cover Copy\n\n"+pkg.descriptions.backCoverCopy+"\n");
      if (pkg.descriptions.extendedSalesDescription) md.push("### Extended Sales Description\n\n"+pkg.descriptions.extendedSalesDescription+"\n");
    }
    if (pkg.coverStrategy) {
      md.push("## Cover Strategy");
      md.push("**Direction:** "+pkg.coverStrategy.direction);
      if (pkg.coverStrategy.visualElements) {
        md.push("\n### Visual Elements");
        Object.entries(pkg.coverStrategy.visualElements).forEach(([k,v]) => md.push("- **"+k+":** "+(Array.isArray(v)?v.join(", "):v)));
      }
      if (pkg.coverStrategy.aiCoverPrompts) {
        md.push("\n### AI Cover Prompts");
        Object.entries(pkg.coverStrategy.aiCoverPrompts).forEach(([k,v]) => md.push("\n**"+k+":**\n\n```\n"+v+"\n```"));
      }
      md.push("");
    }
    if (pkg.seriesBranding) {
      md.push("## Series Branding");
      md.push("- **Series:** "+pkg.seriesBranding.seriesName);
      md.push("- **Tagline:** "+pkg.seriesBranding.tagline);
      md.push("- **Naming convention:** "+pkg.seriesBranding.namingConvention);
      md.push("- **Visual identity:** "+pkg.seriesBranding.visualIdentity);
      if (pkg.seriesBranding.futureBooks) {
        md.push("\n### Future Books");
        pkg.seriesBranding.futureBooks.forEach(b => md.push("- **Book "+b.bookNumber+": "+b.proposedTitle+"** — "+b.concept));
      }
      md.push("");
    }
    if (pkg.authorBrand) {
      md.push("## Author Brand");
      Object.entries(pkg.authorBrand).forEach(([k,v]) => md.push("- **"+k+":** "+v));
      md.push("");
    }
    if (pkg.marketingAssets) {
      md.push("## Marketing Assets");
      const m = pkg.marketingAssets;
      if (m.socialMediaPosts) { md.push("\n### Social Media Posts"); m.socialMediaPosts.forEach((p,i)=>md.push("\n**Post "+(i+1)+":**\n"+p)); }
      if (m.launchPosts) { md.push("\n### Launch Posts"); m.launchPosts.forEach((p,i)=>md.push("\n**Launch Post "+(i+1)+":**\n"+p)); }
      if (m.readerMagnet) md.push("\n### Reader Magnet\n\n"+m.readerMagnet);
      if (m.newsletterContent) md.push("\n### Newsletter\n\n"+m.newsletterContent);
      if (m.bookClubQuestions) { md.push("\n### Book Club Questions"); m.bookClubQuestions.forEach((q,i)=>md.push((i+1)+". "+q)); }
      if (m.characterProfiles) { md.push("\n### Character Profiles"); m.characterProfiles.forEach(c=>md.push("\n**"+c.name+":** "+c.profile)); }
      if (m.pressRelease) md.push("\n### Press Release\n\n"+m.pressRelease);
      if (m.mediaKit) md.push("\n### Media Kit\n\n"+m.mediaKit);
      md.push("");
    }
    if (pkg.adaptationReadiness) {
      md.push("## Adaptation Readiness");
      ["audiobook","podcastSeries","motionComic","youtubeSeries","aiVideoAdaptation","streamingAdaptation"].forEach(k=>{
        const it = pkg.adaptationReadiness[k];
        if (it) md.push("- **"+k+":** "+it.score+"/10 — "+it.reason);
      });
      if (pkg.adaptationReadiness.recommendation) md.push("\n**Recommendation:** "+pkg.adaptationReadiness.recommendation);
    }
    const blob = new Blob([md.join("\n")], {type:"text/markdown"});
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = (story.title||"book").replace(/[^a-z0-9]+/gi,"_").toLowerCase()+"_launch_package.md";
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const [story, setStory] = useState(null);

  // ── Chapter/scene state lifted from ChapterBuilder so the active story owns it ──
  const [outline, setOutline] = useState(null);
  const [bible, setBible] = useState(null);
  const [bibleLocked, setBibleLocked] = useState(false);  // Phase 1.5: bible lock
  const [chapterProse, setChapterProse] = useState({});
  const [chapterReports, setChapterReports] = useState({});
  const [chapterSummaries, setChapterSummaries] = useState({});
  const [chapterVersions, setChapterVersions] = useState({}); // version history per chapter
  const [chapterSceneCards, setChapterSceneCards] = useState({});
  const [sceneProse, setSceneProse] = useState({});
  const [sceneSummaries, setSceneSummaries] = useState({});
  const [sceneLocked, setSceneLocked] = useState({});
  const chapterState = {
    outline, setOutline, bible, setBible, bibleLocked, setBibleLocked,
    chapterProse, setChapterProse, chapterReports, setChapterReports,
    chapterSummaries, setChapterSummaries,
    chapterVersions, setChapterVersions,
    chapterSceneCards, setChapterSceneCards, sceneProse, setSceneProse,
    sceneSummaries, setSceneSummaries, sceneLocked, setSceneLocked
  };

  // Compute similarity check for current story title + premise
  const titleSim = story ? similarityCheck(story.title, globalRegistry.organizationNames.filter(n => n !== story.title)) : null;
  const premiseSim = story ? similarityCheck(buildPlotFingerprint(story), globalRegistry.plotFingerprints.filter(fp => fp !== buildPlotFingerprint(story))) : null;

  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const normalized = normalize(laneVals);
  const heroineRecs = topArchetypes(HEROINES, normalized, 5);
  const heroRecs = topArchetypes(HEROES, normalized, 5);
  const activatedPatterns = getActivatedPatterns(normalized);

  const toggleTrope = (t) => setTropes(prev => prev.includes(t) ? prev.filter(x=>x!==t) : [...prev, t]);

  const applyPairing = (p) => {
    const hw = WOUNDS.find(w=>w.id===p.heroId);
    const hew = WOUNDS.find(w=>w.id===p.heroineId);
    setHeroWound(hw); setHeroineWound(hew);
  };

  const applyStack = (stack) => {
    const w = WOUNDS.find(x=>x.id===stack.woundId);
    const c = CONFLICTS.find(x=>x.id===stack.conflictId);
    if (w) setHeroineWound(w);
    if (c) setExternalConflict(c);
  };

  const run = async () => {
    setLoading(true); setErr(""); setStory(null);
    try {
      const s = await generateBlueprint({
        laneVals, tropes, heat, heroineArch, heroArch,
        heroineWound, heroWound, setting, city, family, intensity,
        externalConflict, relationshipObstacle, familyInfluence,
        spiceLevel, romanceIntensity, eroticRomance, streetLitEng, suspenseEng,
        selectedPresetId: selectedPreset,
        userConcept,
        universe: activeUniverse
      });
      // Attach spice/intensity to the story object so the scene engine can use them
      s.spiceLevel = spiceLevel;
      s.romanceIntensity = romanceIntensity;
      s.eroticRomance = eroticRomance;
      s.streetLitEng = streetLitEng;
      s.suspenseEng = suspenseEng;
      setStory(s);
      setStoryDNALocked(true);   // Story Intelligence Layer: lock DNA after generation
      // W2: if no story is active yet (first load, or after deleting the active
      // story), auto-create story #1 from the current builder state.
      if (!activeStoryId) {
        const id = newStoryId();
        const rec = freshStoryRecord(id);
        rec.title = s.title || "Untitled Story";
        rec.blueprint = s;
        rec.storyDNALocked = true;
        Object.assign(rec, {
          laneVals, tropes, heat, heroineArch, heroArch, heroineWound, heroWound,
          setting, city, family, intensity, externalConflict, relationshipObstacle,
          familyInfluence, spiceLevel, romanceIntensity, eroticRomance, streetLitEng, suspenseEng
        });
        skipAutosaveRef.current = true;
        setStories(prev => { const next = [rec, ...prev]; saveStories(next); return next; });
        setActiveStoryId(id); saveActiveStoryId(id);
      }
      // Auto-register entities from this story into the global registry
      const newReg = registerStoryEntities(globalRegistry, s);
      setGlobalRegistry(newReg);
      saveGlobalRegistry(newReg);
    } catch(e) { setErr(e.message); }
    finally { setLoading(false); }
  };

  const blendActive = Object.values(laneVals).reduce((a,b)=>a+b,0) > 0;
  const canRun = blendActive && tropes.length > 0 && !loading;

  // Section → view routing helper
  const goToSection = (id) => {
    setActiveSection(id);
    if (id === "newStory" || id === "myStories" || id === "storyBible" || id === "characterStudio" || id === "sceneStudio" || id === "draftManuscript" || id === "editorMode" || id === "readerIntelligence") {
      setView("story");
    } else if (id === "worldBuilder") {
      setView("universes");
      setDetailUniverseId(null);
    }
  };

  // Navigate to Scene Studio with a pre-loaded issue from Editor Mode
  const fixIssueInSceneStudio = useCallback((issue) => {
    setPendingSceneDirectorIssue(issue);
    setActiveSection("sceneStudio");
    setView("story");
  }, []);

  // ── Import & Continue: finalize an imported story into a new record ──
  const handleImportComplete = useCallback(({ story: importedStory, outline: importedOutline,
                                               bible: importedBible, chapterProse: importedProse,
                                               bibleLocked: importedBibleLocked,
                                               storyDNALocked: importedDNALocked }) => {
    const newId = newStoryId();
    const record = freshStoryRecord(newId);
    record.title = importedStory.title || "Imported Story";
    record.spiceLevel = importedStory.spiceLevel || 3;
    record.romanceIntensity = importedStory.romanceIntensity || DEFAULT_INTENSITY;
    record.blueprint = importedStory;
    record.outline = importedOutline || null;
    record.bible = importedBible || null;
    record.chapterProse = importedProse || {};
    record.bibleLocked = importedBibleLocked || false;
    record.storyDNALocked = importedDNALocked || false;

    // Persist + register in React state (skip the autosave that would otherwise
    // clobber the record with the still-default builder state)
    skipAutosaveRef.current = true;
    setStories(prev => { const next = [record, ...prev]; saveStories(next); return next; });
    setActiveStoryId(newId); saveActiveStoryId(newId);

    // Hydrate App output state from the import
    setStory(importedStory);
    setOutline(importedOutline || null);
    setBible(importedBible || null);
    setBibleLocked(importedBibleLocked || false);
    setStoryDNALocked(importedDNALocked || false);
    setChapterProse(importedProse && Object.keys(importedProse).length ? importedProse : {});
    setChapterVersions({});

    setShowingImport(false);
    setActiveSection("newStory");
    setView("story");
  }, []);

  // ── W2: multi-story persistence helpers ─────────────────────
  const activeStoryRec = stories.find(s => s.id === activeStoryId) || null;

  // Snapshot the current builder state into a story record
  const buildRecord = (base) => ({
    ...base,
    title: (story && story.title) || base.title || "Untitled Story",
    updatedAt: Date.now(),
    laneVals, tropes, heat, heroineArch, heroArch, heroineWound, heroWound,
    setting, city, family, intensity, externalConflict, relationshipObstacle, familyInfluence,
    spiceLevel, romanceIntensity, eroticRomance, streetLitEng, suspenseEng,
    blueprint: story, outline, bible, bibleLocked, storyDNALocked, chapterProse, chapterReports, chapterSummaries,
    chapterVersions,
    chapterSceneCards, sceneProse, sceneSummaries, sceneLocked, bookPackage
  });

  // W3: apply an erotic category's calibration baseline to the engines
  const eroticCat = dominantEroticCategory(normalized);
  const applyEroticCategory = (catId) => {
    const cat = EROTIC_CATEGORIES[catId];
    if (!cat) return;
    eroticAppliedRef.current = catId;
    // Only the Erotic Romance engine auto-populates. Spice Level and Romance
    // Intensity stay independent/user-controlled (a story can be high Erotic
    // Romance + low Spice). The category's recommended heat is conveyed to the
    // model as guidance via the prompt, not forced onto the controls.
    setEroticRomance({...cat.erotic});
  };

  // W4: dominant lanes that drive the Street Lit / Suspense engines, + appliers
  const slCat = dominantUrbanEngine(normalized, "streetLitEng");
  const spCat = dominantUrbanEngine(normalized, "suspenseEng");
  const applyStreetLit = (catId, baseline) => { streetLitAppliedRef.current = catId; setStreetLitEng({...baseline}); };
  const applySuspense  = (catId, baseline) => { suspenseAppliedRef.current = catId; setSuspenseEng({...baseline}); };

  const resetBuilderState = () => {
    setLaneVals({...DEFAULT_LANE_VALS}); setTropes([...DEFAULT_TROPES]); setHeat(3);
    setHeroineArch(null); setHeroArch(null); setHeroineWound(null); setHeroWound(null);
    setSetting(null); setCity(null); setFamily(null); setIntensity(3);
    setExternalConflict(null); setRelationshipObstacle(null); setFamilyInfluence(7);
    setSpiceLevel(2); setRomanceIntensity(DEFAULT_INTENSITY);
    setEroticRomance({...DEFAULT_EROTIC}); eroticAppliedRef.current = null;
    setStreetLitEng({...DEFAULT_STREETLIT}); streetLitAppliedRef.current = null;
    setSuspenseEng({...DEFAULT_SUSPENSE}); suspenseAppliedRef.current = null;
    setStory(null); setOutline(null); setBible(null); setBibleLocked(false); setStoryDNALocked(false);
    setChapterProse({}); setChapterReports({}); setChapterSummaries({}); setChapterVersions({});
    setChapterSceneCards({}); setSceneProse({}); setSceneSummaries({}); setSceneLocked({});
    setBookPackage(null);
  };

  const hydrateFromRecord = (rec) => {
    skipAutosaveRef.current = true;
    setLaneVals(rec.laneVals || {...DEFAULT_LANE_VALS});
    setTropes(rec.tropes || [...DEFAULT_TROPES]);
    setHeat(rec.heat ?? 3);
    setHeroineArch(rec.heroineArch ?? null); setHeroArch(rec.heroArch ?? null);
    setHeroineWound(rec.heroineWound ?? null); setHeroWound(rec.heroWound ?? null);
    setSetting(rec.setting ?? null); setCity(rec.city ?? null); setFamily(rec.family ?? null);
    setIntensity(rec.intensity ?? 3);
    setExternalConflict(rec.externalConflict ?? null); setRelationshipObstacle(rec.relationshipObstacle ?? null);
    setFamilyInfluence(rec.familyInfluence ?? 7);
    setSpiceLevel(rec.spiceLevel ?? 2); setRomanceIntensity(rec.romanceIntensity ?? DEFAULT_INTENSITY);
    setEroticRomance(rec.eroticRomance ?? {...DEFAULT_EROTIC});
    eroticAppliedRef.current = (dominantEroticCategory(normalize(rec.laneVals || {})) || {}).id || null;
    setStreetLitEng(rec.streetLitEng ?? {...DEFAULT_STREETLIT});
    setSuspenseEng(rec.suspenseEng ?? {...DEFAULT_SUSPENSE});
    streetLitAppliedRef.current = (dominantUrbanEngine(normalize(rec.laneVals || {}), "streetLitEng") || {}).catId || null;
    suspenseAppliedRef.current = (dominantUrbanEngine(normalize(rec.laneVals || {}), "suspenseEng") || {}).catId || null;
    setStory(rec.blueprint ?? null); setOutline(rec.outline ?? null); setBible(rec.bible ?? null);
    setBibleLocked(rec.bibleLocked ?? !!rec.bible);  // legacy bibles count as locked
    setStoryDNALocked(rec.storyDNALocked ?? !!(rec.blueprint && rec.blueprint.storyDNA));
    setChapterProse(rec.chapterProse ?? {}); setChapterReports(rec.chapterReports ?? {}); setChapterSummaries(rec.chapterSummaries ?? {});
    setChapterVersions(rec.chapterVersions ?? {});
    setChapterSceneCards(rec.chapterSceneCards ?? {}); setSceneProse(rec.sceneProse ?? {});
    setSceneSummaries(rec.sceneSummaries ?? {}); setSceneLocked(rec.sceneLocked ?? {});
    setBookPackage(rec.bookPackage ?? null);
  };

  // Immediately persist current builder state into the active record
  const flushActive = () => {
    if (!activeStoryId) return;
    setStories(prev => {
      const idx = prev.findIndex(s => s.id === activeStoryId);
      if (idx === -1) return prev;
      const next = [...prev]; next[idx] = buildRecord(prev[idx]);
      saveStories(next); return next;
    });
  };

  const hasProgress = () => {
    if (story || outline || bible) return true;
    if (heroineArch || heroArch || heroineWound || heroWound || setting || city || family || externalConflict || relationshipObstacle) return true;
    if (heat !== 3 || intensity !== 3 || familyInfluence !== 7 || spiceLevel !== 2) return true;
    if (JSON.stringify(laneVals) !== JSON.stringify(DEFAULT_LANE_VALS)) return true;
    if (JSON.stringify(tropes) !== JSON.stringify(DEFAULT_TROPES)) return true;
    if (JSON.stringify(romanceIntensity) !== JSON.stringify(DEFAULT_INTENSITY)) return true;
    return false;
  };

  const createAndActivate = (rec) => {
    skipAutosaveRef.current = true;
    setStories(prev => { const next = [rec, ...prev]; saveStories(next); return next; });
    setActiveStoryId(rec.id); saveActiveStoryId(rec.id);
  };

  // Story Intelligence Layer: regenerate the blueprint (clears outputs, keeps inputs)
  const regenerateBlueprint = () => {
    if (!window.confirm("Regenerating will replace your story's foundation. All chapters, the Story Bible, and continuity data will be cleared. Are you sure?")) return;
    setStoryDNALocked(false);
    setStory(null); setOutline(null); setBible(null); setBibleLocked(false);
    setChapterProse({}); setChapterReports({}); setChapterSummaries({}); setChapterVersions({});
    setChapterSceneCards({}); setSceneProse({}); setSceneSummaries({}); setSceneLocked({});
    setBookPackage(null); setStoryHealthReport(null);
    goToSection("newStory");
  };

  // Story Intelligence Layer: run the full story health analysis
  const runStoryAnalysis = useCallback(async () => {
    if (!story || !outline) return;
    setAnalyzingHealth(true);
    setHealthAnalysisErr("");
    try {
      const report = await analyzeStoryHealth(story, outline, bible, chapterProse, chapterSummaries);
      setStoryHealthReport(report);
      setHealthAnalysisTimestamp(Date.now());
    } catch(e) { setHealthAnalysisErr(e.message); }
    finally { setAnalyzingHealth(false); }
  }, [story, outline, bible, chapterProse, chapterSummaries]);

  // Story Intelligence Layer: add a manual plot thread to the bible (Editor Mode)
  const addManualThreadApp = (name) => {
    setBible(prev => {
      if (!prev) return prev;
      const plot = { ...(prev.plot||{}) };
      plot.manualThreads = [...(plot.manualThreads||[]), { name, status:"open" }];
      return { ...prev, plot };
    });
  };

  const handleNewStory = () => {
    const proceed = () => {
      flushActive();
      resetBuilderState();
      createAndActivate(freshStoryRecord(newStoryId()));
      goToSection("newStory");
    };
    if (activeStoryId && hasProgress()) {
      if (window.confirm("Save current story and start a new one? Your current progress is saved automatically — you can return to it from My Stories.")) {
        proceed();
      }
    } else {
      proceed();
    }
  };

  const openStory = (id) => {
    const rec = stories.find(s => s.id === id);
    if (!rec) return;
    flushActive();
    hydrateFromRecord(rec);
    setActiveStoryId(id); saveActiveStoryId(id);
    goToSection("newStory");
  };

  const duplicateStory = (id) => {
    const rec = stories.find(s => s.id === id);
    if (!rec) return;
    flushActive();
    const copy = { ...JSON.parse(JSON.stringify(rec)), id: newStoryId(),
      title: "Copy of " + (rec.title || "Untitled Story"), createdAt: Date.now(), updatedAt: Date.now() };
    hydrateFromRecord(copy);
    createAndActivate(copy);
    goToSection("newStory");
  };

  const deleteStory = (id) => {
    if (!window.confirm("Delete this story? This cannot be undone.")) return;
    setStories(prev => { const next = prev.filter(s => s.id !== id); saveStories(next); return next; });
    if (activeStoryId === id) {
      setActiveStoryId(null); saveActiveStoryId(null);
      skipAutosaveRef.current = true;
      resetBuilderState();
    }
  };

  const importStoryFromJSON = (file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      let data;
      try { data = JSON.parse(e.target.result); }
      catch(err) { window.alert("Could not parse that JSON file: " + err.message); return; }
      if (!data || typeof data.title !== "string") {
        window.alert('That file does not look like an exported blueprint (missing a "title" field).');
        return;
      }
      flushActive();
      const rec = freshStoryRecord(newStoryId());
      rec.title = data.title || "Imported Story";
      rec.blueprint = data;
      hydrateFromRecord(rec);
      createAndActivate(rec);
      goToSection("newStory");
    };
    reader.readAsText(file);
  };

  // Debounced (1.5s) silent autosave of the active story
  useEffect(() => {
    if (skipAutosaveRef.current) { skipAutosaveRef.current = false; return; }
    if (!activeStoryId) return;
    setSaveStatus("unsaved");   // pending changes until the debounce fires
    const t = setTimeout(() => {
      setSaveStatus("saving");
      setStories(prev => {
        const idx = prev.findIndex(s => s.id === activeStoryId);
        if (idx === -1) return prev;
        const next = [...prev]; next[idx] = buildRecord(prev[idx]);
        saveStories(next); return next;
      });
      setSaveStatus("saved");
    }, 1500);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeStoryId, story, laneVals, tropes, heat, heroineArch, heroArch, heroineWound, heroWound,
      setting, city, family, intensity, externalConflict, relationshipObstacle, familyInfluence,
      spiceLevel, romanceIntensity, eroticRomance, streetLitEng, suspenseEng, outline, bible, bibleLocked, storyDNALocked, chapterProse, chapterReports, chapterSummaries,
      chapterVersions, chapterSceneCards, sceneProse, sceneSummaries, sceneLocked, bookPackage]);

  // Manual save — flush all current story state to localStorage immediately
  const forceSave = useCallback(() => {
    if (!activeStoryId) return;
    setSaveStatus("saving");
    try {
      const stories = loadStories();
      const record = stories.find(s => s.id === activeStoryId);
      if (!record) { setSaveStatus("unsaved"); return; }
      const updated = {
        ...record,
        updatedAt: Date.now(),
        blueprint: story,
        outline, bible,
        chapterProse, chapterReports, chapterSummaries,
        chapterSceneCards, sceneProse, sceneSummaries, sceneLocked,
        chapterVersions, bookPackage,
      };
      saveStories(stories.map(s => s.id === activeStoryId ? updated : s));
      setSaveStatus("saved");
    } catch(e) {
      setSaveStatus("unsaved");
    }
  }, [activeStoryId, story, outline, bible, chapterProse,
      chapterReports, chapterSummaries, chapterSceneCards,
      sceneProse, sceneSummaries, sceneLocked,
      chapterVersions, bookPackage]);

  // Cmd/Ctrl+S → manual save from anywhere
  useEffect(() => {
    const handler = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "s") {
        e.preventDefault();
        forceSave();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [forceSave]);

  // Hydrate the active story once on mount so a refresh restores your place
  useEffect(() => {
    if (activeStoryId) {
      const rec = loadStories().find(s => s.id === activeStoryId);
      if (rec) hydrateFromRecord(rec);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // W3: when the dominant erotic category changes, auto-populate the engines from
  // its calibration baseline (still manually adjustable afterward).
  useEffect(() => {
    const norm = normalize(laneVals);
    const cat = dominantEroticCategory(norm);
    if (cat && cat.id !== eroticAppliedRef.current) applyEroticCategory(cat.id);
    const sl = dominantUrbanEngine(norm, "streetLitEng");
    if (sl && sl.catId !== streetLitAppliedRef.current) applyStreetLit(sl.catId, sl.baseline);
    const sp = dominantUrbanEngine(norm, "suspenseEng");
    if (sp && sp.catId !== suspenseAppliedRef.current) applySuspense(sp.catId, sp.baseline);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [laneVals]);

  return (
    <div style={{ minHeight:"100vh", background:C.bg, color:C.text, fontFamily:"Nunito, sans-serif" }}>
      <style>{FONT_CSS}</style>
      <style>{`@keyframes obsidianSpin { to { transform: rotate(360deg); } }`}</style>
      <div style={{ display:"flex", minHeight:"100vh" }}>
        <Sidebar
          active={activeSection}
          onChange={goToSection}
          onNewStory={handleNewStory}
          hasStory={!!story}
          storyTitle={activeStoryRec ? activeStoryRec.title : null}
          universeCount={universes.length}
          saveStatus={saveStatus}/>

        <main style={{ flex:1, padding:"28px 32px", overflowX:"hidden" }}>
          <div style={{ maxWidth:1040, margin:"0 auto" }}>
        {/* ── VIEW ROUTER ────────────────────────────────── */}

        {view === "universes" && (
          <UniverseBuilder
            universes={universes}
            onCreate={createUniverse}
            onOpen={openUniverse}
            onDelete={deleteUniverse}/>
        )}

        {view === "universeDetail" && detailUniverseId && (() => {
          const u = universes.find(x=>x.id===detailUniverseId);
          if (!u) return <div style={{ color:C.muted, textAlign:"center", padding:40 }}>Universe not found</div>;
          return (
            <UniverseDetail
              universe={u}
              onBack={()=>{ setDetailUniverseId(null); setView("universes"); }}
              onUpdate={updateUniverse}
              onBuildBook={()=>buildBookInUniverse(u.id)}
              onDelete={()=>deleteUniverse(u.id)}/>
          );
        })()}

        {view === "story" && (
          <>

            {/* Placeholder sections */}
            {activeSection === "dashboard" && (
              <ComingSoonSection
                title="Dashboard"
                icon="🏠"
                description="A premium overview of your active stories, recent activity, generation queue, and quick-launch buttons into the rest of the studio. The home base for your fiction operation."
                features={["Recent stories with status", "Active manuscript progress", "Recent generations and exports", "Universe activity feed", "Quick-launch to any section"]}/>
            )}
            {activeSection === "readerIntelligence" && (
              story ? (
                <ComingSoonSection
                  title="Reader Intelligence"
                  icon="📈"
                  description="Reader response prediction, audience analysis, and emotional payoff mapping. Coming after the launch package engine is fully battle-tested."
                  features={["Predicted reader emotional journey", "Audience segment analysis", "Comp shelf positioning", "Reader review prediction", "Emotional payoff scoring per chapter"]}/>
              ) : (
                <NeedsStoryEmpty section="Reader Intelligence" onGoToBuilder={()=>goToSection("newStory")}/>
              )
            )}
            {activeSection === "settings" && (
              <ComingSoonSection
                title="Settings"
                icon="⚙️"
                description="API keys, model preferences, default manuscript spec, default spice/intensity, registry management, export defaults, and theme."
                features={["API & model configuration", "Default manuscript spec", "Default spice/intensity", "Global Registry management", "Export format defaults", "Theme & typography"]}/>
            )}

            {/* MY STORIES library */}
            {activeSection === "myStories" && (
              showingImport ? (
                <Suspense fallback={<GlassLoadingFallback label="Loading Import..." />}>
                  <ImportStoryLazy
                    onImportComplete={handleImportComplete}
                    onCancel={()=>setShowingImport(false)}
                    universes={universes}
                    activeUniverseId={activeUniverseId}
                    genrePresets={GENRE_PRESETS}
                    defaultLaneVals={DEFAULT_LANE_VALS}
                    defaultIntensity={DEFAULT_INTENSITY}
                    onGenerateBlueprint={generateBlueprint}
                    onGenerateOutlineFromImport={generateOutlineFromImport}
                    onGenerateBibleFromProse={generateBibleFromProse}
                    onGenerateContinuationOutline={generateContinuationOutline}
                    onLoadGlobalRegistry={loadGlobalRegistry}
                    onRegisterStoryEntities={registerStoryEntities}
                    onSaveGlobalRegistry={saveGlobalRegistry}/>
                </Suspense>
              ) : (
                <MyStories
                  stories={stories}
                  activeStoryId={activeStoryId}
                  onOpen={openStory}
                  onDuplicate={duplicateStory}
                  onDelete={deleteStory}
                  onImport={importStoryFromJSON}
                  onImportExisting={()=>setShowingImport(true)}/>
              )
            )}

            {/* EDITOR MODE dashboard (Story Intelligence Layer) */}
            {activeSection === "editorMode" && (
              story ? (
                <Suspense fallback={<GlassLoadingFallback label="Loading Editor..." />}>
                  <EditorModeDashboardLazy
                    story={story} outline={outline} bible={bible}
                    chapterProse={chapterProse} chapterSummaries={chapterSummaries}
                    report={storyHealthReport} analyzing={analyzingHealth}
                    timestamp={healthAnalysisTimestamp} error={healthAnalysisErr}
                    onRunAnalysis={runStoryAnalysis} onAddManualThread={addManualThreadApp}
                    onFixInSceneStudio={fixIssueInSceneStudio}/>
                </Suspense>
              ) : (
                <NeedsStoryEmpty section="Editor Mode" onGoToBuilder={()=>goToSection("newStory")}/>
              )
            )}

            {/* ── SCENE STUDIO — 3-panel writing workspace ── */}
            {activeSection === "sceneStudio" && (
              story ? (
                <Suspense fallback={<GlassLoadingFallback label="Loading Scene Studio..." />}>
                  <SceneStudioLazy
                    story={story} outline={outline} bible={bible} setBible={setBible}
                    universe={activeUniverse}
                    chapterSceneCards={chapterSceneCards} setChapterSceneCards={setChapterSceneCards}
                    chapterProse={chapterProse} setChapterProse={setChapterProse}
                    chapterReports={chapterReports} setChapterReports={setChapterReports}
                    chapterSummaries={chapterSummaries} setChapterSummaries={setChapterSummaries}
                    chapterVersions={chapterVersions} setChapterVersions={setChapterVersions}
                    sceneProse={sceneProse} setSceneProse={setSceneProse}
                    sceneSummaries={sceneSummaries} setSceneSummaries={setSceneSummaries}
                    sceneLocked={sceneLocked} setSceneLocked={setSceneLocked}
                    maxWordsPerGen={2500}
                    forceSave={forceSave}
                    storyHealthReport={storyHealthReport}
                    pendingSceneDirectorIssue={pendingSceneDirectorIssue}
                    setPendingSceneDirectorIssue={setPendingSceneDirectorIssue}
                    onGoToEditorMode={()=>{ setActiveSection("editorMode"); setView("story"); }}
                    renderReport={({ chapterNum }) => (
                      chapterReports[chapterNum] ? (
                        <ContinuityReportCard
                          report={chapterReports[chapterNum]}
                          onApplyPatch={async () => {
                            const r = chapterReports[chapterNum];
                            if (!r?.revisionPatch?.revisedText) return;
                            const note = "\n\n[EDITOR PATCH APPLIED]: " + r.revisionPatch.revisedText;
                            setChapterProse(prev => ({...prev, [chapterNum]: (prev[chapterNum]||"") + note}));
                            setChapterReports(prev => ({...prev, [chapterNum]: {...prev[chapterNum], resolved:true, _patchApplied:true}}));
                          }}
                          onAcknowledgePatch={() => setChapterReports(prev => ({...prev, [chapterNum]: {...prev[chapterNum], resolved:true}}))}
                          onMarkResolved={() => {
                            if (!window.confirm("Mark Chapter "+chapterNum+" as resolved?")) return;
                            setChapterReports(prev => ({...prev, [chapterNum]: {...prev[chapterNum], resolved:true}}));
                          }}
                          onRegenerate={() => {
                            setChapterSceneCards(prev => { const c={...prev}; delete c[chapterNum]; return c; });
                            setSceneProse(prev => { const c={...prev}; delete c[chapterNum]; return c; });
                            setSceneSummaries(prev => { const c={...prev}; delete c[chapterNum]; return c; });
                            setChapterReports(prev => { const c={...prev}; delete c[chapterNum]; return c; });
                          }}/>
                      ) : null
                    )}
                    renderVersionHistory={({ chapterNum }) => (
                      (chapterVersions[chapterNum]||[]).length > 0 ? (
                        <ChapterVersionHistory
                          chapterNum={chapterNum}
                          versions={chapterVersions[chapterNum]}
                          onRestore={(v) => {
                            if (!window.confirm("Restore this version?")) return;
                            setChapterProse(prev => ({...prev, [chapterNum]: v.prose}));
                            setChapterReports(prev => { const c={...prev}; delete c[chapterNum]; return c; });
                            setChapterSummaries(prev => { const c={...prev}; delete c[chapterNum]; return c; });
                          }}
                          onClose={() => {}}/>
                      ) : null
                    )}
                  />
                </Suspense>
              ) : (
                <NeedsStoryEmpty section="Scene Studio" onGoToBuilder={()=>goToSection("newStory")}/>
              )
            )}

            {/* Default story-builder view — activeSection in {newStory, storyBible, characterStudio, draftManuscript} render the full builder */}
            {!["dashboard","readerIntelligence","settings","myStories","editorMode","sceneStudio"].includes(activeSection) && (
              <>
            {activeUniverse && (
              <div style={{ padding:"14px 20px", background:C.glow, border:"1px solid "+C.gold,
                            borderRadius:10, marginBottom:22, display:"flex", alignItems:"center",
                            justifyContent:"space-between", gap:14, flexWrap:"wrap" }}>
                <div>
                  <div style={{ color:C.gold, fontSize:11, letterSpacing:1.5, textTransform:"uppercase", fontWeight:600, marginBottom:3 }}>
                    🌐 Building for Universe
                  </div>
                  <div style={{ color:C.text, fontFamily:"Cormorant Garamond, serif", fontSize:20, fontWeight:700 }}>
                    {activeUniverse.name} <span style={{ color:C.muted, fontWeight:400, fontSize:14, fontStyle:"italic" }}>· Book #{(activeUniverse.books||[]).length+1}</span>
                  </div>
                </div>
                <button onClick={()=>setActiveUniverseId(null)}
                  style={{ padding:"6px 12px", background:"transparent", color:C.muted,
                           border:"1px solid "+C.borderLight, borderRadius:6, fontSize:11, cursor:"pointer",
                           fontFamily:"Nunito, sans-serif" }}>
                  Clear universe
                </button>
              </div>
            )}

        {/* STORY CONCEPT — optional, first section in the New Story builder */}
        {activeSection === "newStory" && (
          <StoryConceptInput value={userConcept} onChange={setUserConcept}/>
        )}

        {/* STORY CONCEPT STICKY NAV */}
        <NewStoryStickyNav
          story={story} loading={loading} canRun={canRun}
          onGenerate={run} onRegenerate={regenerateBlueprint}
          storyDNALocked={storyDNALocked}/>

        {/* STORY BLEND */}
        <div id="blend" style={{ padding:"24px 28px", background:C.surface, border:"1px solid "+C.border, borderRadius:14, marginBottom:22 }}>
          <div style={{ color:C.gold, fontSize:11, letterSpacing:2, textTransform:"uppercase", fontWeight:700, marginBottom:4 }}>
            01 · Story Blend Engine
          </div>
          <div style={{ color:C.text, fontFamily:"Cormorant Garamond, serif", fontSize:22, fontWeight:600, marginBottom:14 }}>
            What kind of story is this?
          </div>
          <GenrePresetBar selected={selectedPreset} onSelect={handlePresetSelect}/>
          {LANES.filter(l => PRIMARY_LANE_IDS.includes(l.id)).map(l => (
            <LaneSlider key={l.id} lane={l} value={laneVals[l.id]} normValue={normalized[l.id]}
              onChange={v => setLaneVals(prev => ({...prev, [l.id]:v}))}/>
          ))}
          <BlendBar vals={laneVals}/>
        </div>

        {/* CHARACTERS */}
        <div id="characters" style={{ padding:"24px 28px", background:C.surface, border:"1px solid "+C.border, borderRadius:14, marginBottom:22 }}>
          <div style={{ color:C.gold, fontSize:11, letterSpacing:2, textTransform:"uppercase", fontWeight:700, marginBottom:4 }}>
            02 · Character Architecture
          </div>
          <div style={{ color:C.text, fontFamily:"Cormorant Garamond, serif", fontSize:22, fontWeight:600, marginBottom:6 }}>
            Choose your archetypes
          </div>
          <div style={{ color:C.muted, fontSize:12, marginBottom:18 }}>
            Recommendations are matched to your blend. Or browse all 60 of each.
          </div>
          <ArchetypePicker label="The Heroine" archetypes={HEROINES} selected={heroineArch}
            onSelect={setHeroineArch} recommendations={heroineRecs} accent="#D88830"/>
          <ArchetypePicker label="The Hero" archetypes={HEROES} selected={heroArch}
            onSelect={setHeroArch} recommendations={heroRecs} accent={C.gold}/>
        </div>

        {/* TROPES */}
        <div id="tropes" style={{ padding:"24px 28px", background:C.surface, border:"1px solid "+C.border, borderRadius:14, marginBottom:22 }}>
          <div style={{ color:C.gold, fontSize:11, letterSpacing:2, textTransform:"uppercase", fontWeight:700, marginBottom:4 }}>
            03 · Trope Engine
          </div>
          <div style={{ color:C.text, fontFamily:"Cormorant Garamond, serif", fontSize:22, fontWeight:600, marginBottom:6 }}>
            Stack your hooks
          </div>
          <div style={{ color:C.muted, fontSize:12, marginBottom:14 }}>
            Selected: {tropes.length} {tropes.length===1?"trope":"tropes"}
          </div>
          {(() => {
            const availableTropes = getTropesForPreset(selectedPreset);
            const presetMode = selectedPreset && selectedPreset !== "custom";
            const preset = presetMode ? GENRE_PRESETS.find(p => p.id === selectedPreset) : null;
            const shown = presetMode
              ? availableTropes
              : (tropeFilter === "All" ? availableTropes : availableTropes.filter(t => t.category === tropeFilter));
            return (
              <div>
                {presetMode ? (
                  <div style={{ color:C.muted, fontSize:12, marginBottom:10 }}>
                    {preset.icon} {preset.label} · {availableTropes.length} tropes available
                  </div>
                ) : (
                  <div style={{ display:"flex", flexWrap:"wrap", gap:6, marginBottom:12 }}>
                    <Chip active={tropeFilter==="All"} onClick={()=>setTropeFilter("All")} color={C.gold}>All</Chip>
                    {TROPE_CATEGORY_ORDER.map(cat => (
                      <Chip key={cat} active={tropeFilter===cat} onClick={()=>setTropeFilter(cat)} color={TROPE_CATEGORY_COLORS[cat]}>{cat}</Chip>
                    ))}
                  </div>
                )}
                <div style={{ display:"flex", flexWrap:"wrap", gap:7 }}>
                  {shown.map(t => (
                    <TropeChip key={t.name} trope={t} active={tropes.includes(t.name)} onClick={()=>toggleTrope(t.name)}/>
                  ))}
                </div>
                {tropes.length > 0 && (() => {
                  const selSet = new Set(tropes);
                  const seen = new Set();
                  const sugg = [];
                  tropes.forEach(name => {
                    const t = getTropeByName(name);
                    (t && t.worksWith || []).forEach(w => {
                      if (!selSet.has(w) && !seen.has(w) && getTropeByName(w)) { seen.add(w); sugg.push(w); }
                    });
                  });
                  const top = sugg.slice(0,6);
                  if (!top.length) return null;
                  return (
                    <div style={{ marginTop:14 }}>
                      <div style={{ color:C.muted, fontSize:10, textTransform:"uppercase", letterSpacing:1, marginBottom:6 }}>Pairs Well With ·</div>
                      <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
                        {top.map(w => (
                          <button key={w} onClick={()=>toggleTrope(w)}
                            style={{ padding:"5px 11px", borderRadius:14, background:"transparent", color:C.gold,
                                     border:"1px solid "+C.gold, fontSize:11, cursor:"pointer", fontFamily:"Nunito, sans-serif", opacity:0.85 }}>
                            + {w}
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })()}
              </div>
            );
          })()}
        </div>

        {/* HEAT */}
        <div style={{ padding:"24px 28px", background:C.surface, border:"1px solid "+C.border, borderRadius:14, marginBottom:22 }}>
          <div style={{ color:C.gold, fontSize:11, letterSpacing:2, textTransform:"uppercase", fontWeight:700, marginBottom:4 }}>
            04 · Heat Level
          </div>
          <div style={{ color:C.text, fontFamily:"Cormorant Garamond, serif", fontSize:22, fontWeight:600, marginBottom:14 }}>
            How spicy?
          </div>
          <div style={{ display:"flex", gap:10 }}>
            {HEAT.map(h => (
              <HeatBtn key={h.level} heat={h} active={heat===h.level} onClick={()=>setHeat(h.level)}/>
            ))}
          </div>
        </div>

        {/* ADVANCED STORY LAYERS — collapsible */}
        <div style={{ padding:"22px 28px", background:C.surface, border:"1px solid "+C.border, borderRadius:14, marginBottom:22 }}>
          <button onClick={()=>setLayersOpen(!layersOpen)}
            style={{ width:"100%", background:"transparent", border:"none", textAlign:"left", cursor:"pointer", padding:0 }}>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
              <div>
                <div style={{ color:C.gold, fontSize:11, letterSpacing:2, textTransform:"uppercase", fontWeight:700, marginBottom:4 }}>
                  05 · Advanced Story Layers <span style={{ color:C.muted, fontWeight:400, textTransform:"none", letterSpacing:0 }}>· optional</span>
                </div>
                <div style={{ color:C.text, fontFamily:"Cormorant Garamond, serif", fontSize:22, fontWeight:600 }}>
                  Wounds · Setting · Family · Intensity
                </div>
                <div style={{ color:C.muted, fontSize:12, marginTop:4 }}>
                  Skip = AI chooses. Pick = your story, your spec.
                </div>
              </div>
              <div style={{ color:C.gold, fontSize:24, marginLeft:14 }}>{layersOpen ? "−" : "+"}</div>
            </div>
          </button>
          {layersOpen && (
            <div style={{ marginTop:20, paddingTop:20, borderTop:"1px solid "+C.border }}>
              <div style={{ color:C.amber, fontSize:11, letterSpacing:1.5, textTransform:"uppercase", fontWeight:600, marginBottom:10 }}>
                Emotional Wounds
              </div>
              <BestPairingsBar onApply={applyPairing}/>
              <WoundPicker label="Heroine's Wound" selected={heroineWound} onSelect={setHeroineWound} accent="#D88830"/>
              <WoundPicker label="Hero's Wound" selected={heroWound} onSelect={setHeroWound} accent={C.gold}/>

              <div style={{ height:18 }}/>
              <div style={{ color:C.amber, fontSize:11, letterSpacing:1.5, textTransform:"uppercase", fontWeight:600, marginBottom:10 }}>
                World
              </div>
              <SettingPicker selected={setting} onSelect={setSetting} city={city} onCityChange={setCity} accent={C.gold}/>
              <FamilyPicker selected={family} onSelect={setFamily} accent={C.gold}/>
              <FamilyInfluenceSlider value={familyInfluence} onChange={setFamilyInfluence}/>

              <div style={{ height:18 }}/>
              <div style={{ color:C.amber, fontSize:11, letterSpacing:1.5, textTransform:"uppercase", fontWeight:600, marginBottom:10 }}>
                External Conflict & Obstacle
              </div>
              <div style={{ color:C.muted, fontSize:11, marginBottom:10, lineHeight:1.5 }}>
                The story engine triangle: Trope + Wound + External Conflict + Relationship Obstacle. Weak AI romance only uses tropes. Bestsellers use all four.
              </div>
              <ConflictStacksBar onApply={applyStack}/>
              <ConflictPicker selected={externalConflict} onSelect={setExternalConflict} accent={C.gold}/>
              <ObstaclePicker selected={relationshipObstacle} onSelect={setRelationshipObstacle} accent={C.gold}/>

              <div style={{ height:18 }}/>
              <div style={{ color:C.amber, fontSize:11, letterSpacing:1.5, textTransform:"uppercase", fontWeight:600, marginBottom:10 }}>
                Stakes
              </div>
              <IntensitySlider value={intensity} onChange={setIntensity}/>
            </div>
          )}
        </div>

        {/* SPICE + ROMANCE INTENSITY */}
        <div id="heat" style={{ marginBottom:22 }}>
          <div style={{ padding:"16px 18px", background:C.card, border:"1px solid "+C.borderLight, borderRadius:10, marginBottom:14 }}>
            <div style={{ color:C.amber, fontSize:11, letterSpacing:1.5, textTransform:"uppercase", fontWeight:700, marginBottom:2 }}>
              Extended Genre Lanes
            </div>
            <div style={{ color:C.muted, fontSize:11, marginBottom:10, lineHeight:1.4 }}>Set automatically by presets · fine-tune here</div>
            {LANES.filter(l => EXTENDED_LANE_IDS.includes(l.id)).map(l => (
              <LaneSlider key={l.id} lane={l} value={laneVals[l.id]} normValue={normalized[l.id]}
                onChange={v => setLaneVals(prev => ({...prev, [l.id]:v}))}/>
            ))}
          </div>
          <SpiceLevelSelector value={spiceLevel} onChange={setSpiceLevel}/>
          <IntensityProfile value={romanceIntensity} onChange={setRomanceIntensity}/>
          <EroticEngine value={eroticRomance} onChange={setEroticRomance}
            categoryName={eroticCat ? EROTIC_CATEGORIES[eroticCat.id].name : null}
            onApplyCategory={eroticCat ? (()=>applyEroticCategory(eroticCat.id)) : null}/>
          <EngineSliders icon="🔫" title="Street Lit Engine"
            note="Loyalty, danger, betrayal, empire, survival & consequence stakes — independent of romance. Powers Street Lit / Urban Fiction and Crime Family Saga."
            dims={STREETLIT_DIMENSIONS} value={streetLitEng} onChange={setStreetLitEng}
            categoryName={slCat ? URBAN_CATEGORIES[slCat.catId].name : null}
            onApplyCategory={slCat ? (()=>applyStreetLit(slCat.catId, slCat.baseline)) : null}/>
          <EngineSliders icon="🕵🏾" title="Suspense Engine"
            note="Mystery, danger, conspiracy, dread & twists. Powers Urban Suspense and tense thrillers."
            dims={SUSPENSE_DIMENSIONS} value={suspenseEng} onChange={setSuspenseEng}
            categoryName={spCat ? URBAN_CATEGORIES[spCat.catId].name : null}
            onApplyCategory={spCat ? (()=>applySuspense(spCat.catId, spCat.baseline)) : null}/>
        </div>


        {/* GENERATE */}
        <div style={{ textAlign:"center", marginBottom:22 }}>
          {story && storyDNALocked ? (
            <button onClick={regenerateBlueprint}
              style={{ padding:"6px 14px", background:"transparent", color:C.muted, border:"none",
                       fontSize:12, cursor:"pointer", textDecoration:"underline", fontFamily:"Nunito, sans-serif" }}>
              Regenerate Blueprint ↺
            </button>
          ) : (
          <button onClick={run} disabled={!canRun}
            style={{ padding:"16px 40px",
                     background: canRun ? "linear-gradient(135deg, "+C.gold+", "+C.amber+")" : C.faint,
                     color: canRun ? C.bg : C.muted,
                     border:"none", borderRadius:30,
                     fontWeight:700, fontSize:15, letterSpacing:1, textTransform:"uppercase",
                     cursor: canRun ? "pointer" : "not-allowed",
                     fontFamily:"Nunito, sans-serif",
                     boxShadow: canRun ? "0 8px 24px "+C.glow : "none",
                     transition:"all 0.2s" }}>
            {loading ? "Architecting Your Story..." : "✦ Generate Story Blueprint"}
          </button>
          )}
          {!blendActive && <div style={{ color:C.muted, fontSize:12, marginTop:10 }}>Move at least one Story Blend slider above zero</div>}
          {blendActive && tropes.length===0 && <div style={{ color:C.muted, fontSize:12, marginTop:10 }}>Pick at least one trope</div>}
        </div>

        {err && (
          <div style={{ padding:"14px 18px", background:"#FBE9E7", border:"1px solid #B8342D", borderRadius:8, color:"#B8342D", fontSize:13, marginBottom:20 }}>
            ⚠ Generation failed: {err}
          </div>
        )}

        {story && (
          <div id="blueprint">
          <Blueprint
            story={story}
            universes={universes}
            activeUniverseId={activeUniverseId}
            activeUniverse={activeUniverse}
            onSaveToUniverse={saveBookToUniverse}
            activatedPatterns={activatedPatterns}
            chapterState={chapterState}
            saveStatus={saveStatus}
            forceSave={forceSave}
            activeStoryId={activeStoryId}
            pendingSceneDirectorIssue={pendingSceneDirectorIssue}
            setPendingSceneDirectorIssue={setPendingSceneDirectorIssue}
            onGoToEditorMode={()=>{ setActiveSection("editorMode"); setView("story"); }}/>
          </div>
        )}

              </>
            )}

          </>
        )}

        <div style={{ textAlign:"center", color:C.muted, fontSize:11, marginTop:48, paddingTop:24, borderTop:"1px solid "+C.faint }}>
          Story OS · A Jenn Williams private studio · Built with Claude
        </div>
          </div>
        </main>
      </div>
    </div>
  );
}
