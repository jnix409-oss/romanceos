// AI generation functions. Pure async — receive state as params, return values.

import { apiCall, apiCallJSON } from "./api";
import { SYS_STORY, SYS_CHAPTER, SYS_BIBLE, SYS_ALTERNATIVES, SYS_SCENE, SYS_PUBLISHING } from "../prompts/systemPrompts";
import { MODEL_CONFIG } from "./modelConfig";
import { loadGlobalRegistry, registerStoryEntities, buildPlotFingerprint, similarityCheck } from "./registry";
import {
  LANES, GENRE_PRESETS, READER_ARCHETYPES, detectReaderArchetypes, TROPES_DATABASE, TROPE_CATEGORY_ORDER, TROPE_CATEGORY_COLORS, PRESET_TROPE_CATEGORIES, getTropesForPreset, getTropeByName, HEAT, SPICE_LEVELS, INTENSITY_DIMENSIONS, DEFAULT_INTENSITY, EROTIC_DIMENSIONS, DEFAULT_EROTIC, EROTIC_CATEGORIES, EROTIC_LANE_IDS, STREETLIT_DIMENSIONS, DEFAULT_STREETLIT, SUSPENSE_DIMENSIONS, DEFAULT_SUSPENSE, URBAN_CATEGORIES, LANE_TO_URBAN_CATEGORY, dominantUrbanEngine, dominantUrbanCategory, streetLitShare, streetLitLine, suspenseLine, dominantEroticCategory, eroticLine, INTENSITY_CALIBRATION, calibrationForActivatedPatterns, INTENSITY, GENRE_PATTERNS, LANE_TO_PATTERNS, PRIMARY_LANE_IDS, EXTENDED_LANE_IDS, getActivatedPatterns, HEROES, CONFLICTS, BESTSELLER_CONFLICTS, CONFLICT_STACKS, OBSTACLES, BESTSELLER_OBSTACLES, OBSTACLE_PAIRINGS, HEROINES, WOUNDS, BESTSELLER_WOUNDS, WOUND_PAIRINGS, SETTINGS, CITIES, FAMILIES, normalize, scoreForBlend, topArchetypes, UNIVERSE_GENRES, UNIVERSE_THEMES, DEFAULT_LANE_VALS, DEFAULT_TROPES
} from "../data/storyData";

export async function generateBlueprint(opts) {
  const { laneVals, tropes, heat, heroineArch, heroArch, heroineWound, heroWound,
          setting, city, family, intensity, externalConflict, relationshipObstacle,
          familyInfluence, spiceLevel, romanceIntensity, eroticRomance, streetLitEng, suspenseEng, universe, userConcept } = opts;
  const norm = normalize(laneVals);
  const blend = LANES.filter(l=>norm[l.id]>0).map(l=>l.label+": "+norm[l.id]+"%").join(", ");

  // ── Registry avoidance (uniqueness guardrail) — appended to call1 + call2 ──
  const reg = loadGlobalRegistry();
  const registryAvoidance = [
    (reg.characterNames||[]).length > 0
      ? "CHARACTER NAMES ALREADY IN USE — DO NOT REUSE OR CLOSELY VARY THESE: " + reg.characterNames.join(", ")
      : "",
    (reg.organizationNames||[]).length > 0
      ? "STORY TITLES ALREADY IN USE — GENERATE A COMPLETELY DIFFERENT TITLE: " + reg.organizationNames.join(", ")
      : "",
    (reg.plotFingerprints||[]).length > 0
      ? "EXISTING PLOT FINGERPRINTS — NEW PREMISE MUST BE SUBSTANTIALLY DIFFERENT FROM ALL OF THESE: " + reg.plotFingerprints.slice(0, 8).join(" | ")
      : "",
  ].filter(Boolean).join("\n");

  // ── Reader archetype detection (Story Intelligence Layer) — call2 only ──
  const detectedArchetypes = detectReaderArchetypes(opts.selectedPresetId);
  const primaryArch = detectedArchetypes.primary;
  const secondaryArch = detectedArchetypes.secondary;
  const archetypeCtx = primaryArch ? [
    "",
    "PRIMARY READER ARCHETYPE: " + primaryArch.name,
    "They want: " + primaryArch.wants.join(", "),
    "They hate: " + primaryArch.hates.join(", "),
    "Required payoff: " + primaryArch.requiredPayoff,
    secondaryArch
      ? "SECONDARY READER: " + secondaryArch.name +
        " · wants: " + secondaryArch.wants.slice(0,3).join(", ") +
        " · payoff: " + secondaryArch.requiredPayoff
      : "",
    "Design every chapter to honor the primary reader's required payoff.",
  ].filter(Boolean).join("\n") : "";
  const heatLabel = HEAT[heat-1].label;

  const heroineArchCtx = heroineArch
    ? "Heroine archetype: "+heroineArch.n+" ("+heroineArch.cat+"). Core wound: "+heroineArch.wound+". Hidden attributes — Power:"+heroineArch.P+"/10, Wealth:"+heroineArch.W+"/10, Emotional Availability:"+heroineArch.E+"/10, Protectiveness:"+heroineArch.R+"/10, Community Orientation:"+heroineArch.Ch+"/10."
    : "Heroine archetype: AI choice based on the blend.";
  const heroArchCtx = heroArch
    ? "Hero archetype: "+heroArch.n+" ("+heroArch.cat+"). Core wound: "+heroArch.wound+". Hidden attributes — Power:"+heroArch.P+"/10, Wealth:"+heroArch.W+"/10, Emotional Availability:"+heroArch.E+"/10, Protectiveness:"+heroArch.R+"/10, Community Orientation:"+heroArch.Ch+"/10."
    : "Hero archetype: AI choice — lean toward emotionally intelligent, protective heroes.";

  // ── Wound context: explicit if picked, bestseller-steered if not ──
  let woundCtx;
  if (heroineWound || heroWound) {
    woundCtx = "\nWOUND ARCHITECTURE (build the emotional spine around these): " +
      (heroineWound ? "Heroine carries "+heroineWound.n+" (severity "+heroineWound.sev+"/10, source: "+heroineWound.src+") — relationship fear: "+heroineWound.fear+"; trigger behaviors: "+heroineWound.trig+"; healing arc: "+heroineWound.heal+". " : "") +
      (heroWound ? "Hero carries "+heroWound.n+" (severity "+heroWound.sev+"/10, source: "+heroWound.src+") — relationship fear: "+heroWound.fear+"; trigger behaviors: "+heroWound.trig+"; healing arc: "+heroWound.heal+"." : "");
  } else {
    woundCtx = "\nWOUND ARCHITECTURE: Choose wounds from the BESTSELLING BLACK ROMANCE list: "+BESTSELLER_WOUNDS.join(", ")+". These are the highest-performing internal wounds in the current market. Give heroine and hero contrasting but compatible wounds — both should drive the relationship arc.";
  }

  // ── Setting context: explicit or bestseller-steered ──
  let settingCtx;
  if (setting) {
    settingCtx = "\nSETTING: "+setting.n+" ("+setting.cat+" world). Themes: "+setting.themes+"."+(city?" City: "+city+".":"");
  } else if (city) {
    settingCtx = "\nSETTING CITY: "+city;
  } else {
    settingCtx = "\nSETTING: AI choice — prioritize the FASTEST GROWING SETTINGS (Black-owned businesses, professional workplaces, HBCUs, family empires, luxury travel, community redevelopment, healthcare settings, corporate environments, tech companies, wellness retreats) OR the UNDER-SERVED HIGH-POTENTIAL SETTINGS (AI startup, workforce consulting firm, hospital administration, corporate transformation team, talent management, L&D organization, nonprofit workforce initiative, innovation lab, Black-owned venture capital firm, executive coaching practice). Choose what best fits the blend.";
  }

  // ── Family context: explicit or bestseller-steered ──
  let familyCtx;
  if (family) {
    familyCtx = "\nFAMILY STRUCTURE: "+family.n+" ("+family.cat+"). Themes: "+family.themes;
  } else {
    familyCtx = "\nFAMILY STRUCTURE: AI choice — favor bestseller-favorite Black romance family types (Strong Matriarch Family, Big Sunday Dinner Family, Raised By Single Mother, Family Empire, Multi-Generational Household, Tight-Knit Cousin Network, Family of Entrepreneurs).";
  }

  // ── Intensity ──
  const intensityCtx = intensity
    ? "\nCONFLICT INTENSITY: Level "+intensity+"/5 ("+INTENSITY[intensity-1].name+") — "+INTENSITY[intensity-1].desc+". Scale the stakes accordingly."
    : "";

  // ── Spice Level + Romance Intensity Profile ──
  let spiceCtx = "";
  if (spiceLevel) {
    const sl = SPICE_LEVELS[spiceLevel-1];
    spiceCtx = "\n\nSPICE LEVEL: "+sl.level+"/5 ("+sl.label+"). Focus: "+sl.focus+". "+sl.summary;
    spiceCtx += "\nIMPORTANT: Spice level controls romantic emphasis only — it does NOT replace character development, emotional depth, or plot. The relationship must remain believable.";
  }
  let intensityProfileCtx = "";
  if (romanceIntensity) {
    const ri = romanceIntensity;
    intensityProfileCtx = "\n\nROMANCE INTENSITY PROFILE (four dimensions, each 1-5 — higher = more relationship-centered prose, NOT more sex):";
    intensityProfileCtx += "\n  Attraction Intensity: "+(ri.attractionIntensity||3)+"/5 ("+INTENSITY_DIMENSIONS[0].scale[(ri.attractionIntensity||3)-1]+")";
    intensityProfileCtx += "\n  Emotional Intimacy: "+(ri.emotionalIntimacy||3)+"/5 ("+INTENSITY_DIMENSIONS[1].scale[(ri.emotionalIntimacy||3)-1]+") — this is what readers come for; never starve it";
    intensityProfileCtx += "\n  Physical Affection: "+(ri.physicalAffection||3)+"/5 ("+INTENSITY_DIMENSIONS[2].scale[(ri.physicalAffection||3)-1]+")";
    intensityProfileCtx += "\n  Relationship Focus: "+(ri.relationshipFocus||3)+"/5 ("+INTENSITY_DIMENSIONS[3].scale[(ri.relationshipFocus||3)-1]+") — how much page time the relationship gets vs external plot";
    intensityProfileCtx += "\nUse these to calibrate scene composition: high emotional intimacy + low physical = literary Black romance · high attraction + high physical + high focus = Black billionaire/luxury · balanced = women's fiction with romance · low focus = romantic suspense or mystery with subplot.";
  }

  // ── Universe context (when book is part of a universe) ──
  let universeCtx = "";
  if (universe) {
    const existingChars = [];
    (universe.books||[]).forEach(b=>{
      if (b.heroine) existingChars.push(b.heroine.name+" ("+b.heroine.occupation+")");
      if (b.hero) existingChars.push(b.hero.name+" ("+b.hero.occupation+")");
      (b.supporting||[]).forEach(s=>existingChars.push(s.name+" ("+s.role+")"));
    });
    const charList = existingChars.length ? existingChars.slice(0,40).join(", ") : "(none yet — this is the first book)";
    const existingTitles = (universe.books||[]).map(b=>b.title).join(", ") || "(none yet)";
    universeCtx = "\n\nUNIVERSE CONTEXT — this book is part of the universe \""+universe.name+"\".\n" +
      "Universe genres: "+(universe.genres||[]).join(", ")+"\n" +
      "Universe themes: "+(universe.themes||[]).join(", ")+"\n" +
      (universe.vision ? "Universe vision: "+universe.vision+"\n" : "") +
      "Books already in this universe: "+existingTitles+"\n" +
      "Characters already established (do NOT reuse names; you may reference them as off-page connections): "+charList+"\n" +
      "Maintain genre/theme consistency. Create characters that could plausibly inhabit the same world. Consider how this book connects to or stands apart from existing books.";
  }

  // ── Activated genre patterns from lane blend ──
  const activated = getActivatedPatterns(norm);
  let patternCtx = "";
  if (activated.length) {
    patternCtx = "\n\nACTIVATED GENRE PATTERNS (use these as market positioning — DO NOT name authors in output, just absorb the pattern):\n";
    activated.forEach((p, i) => {
      patternCtx += "\n["+(i+1)+"] "+p.name+" (weight "+p.blendWeight+"%)\n";
      patternCtx += "    Market space: this story sells in the same shelf as: "+p.authors.slice(0,5).join(", ")+"\n";
      patternCtx += "    Pattern themes: "+p.themes.join(", ")+"\n";
      patternCtx += "    Character archetypes that live here: "+p.characters.join(", ")+"\n";
      patternCtx += "    Typical conflicts: "+p.conflicts.join(", ")+"\n";
      patternCtx += "    Pacing: "+p.pacing+"\n";
      patternCtx += "    Audience: "+p.audience+"\n";
      patternCtx += "    Reader promise of the pattern: "+p.promise+"\n";
      patternCtx += "    Common tropes: "+p.tropes.join(", ")+"\n";
      patternCtx += "    Emotional depth: "+p.depth+"/10 · Series potential: "+p.seriesPotential+"/10 · Romance: "+p.romance+"/10 · Mystery: "+p.mystery+"/10 · Family influence: "+p.famInf+"/10\n";
      patternCtx += "    Commercial notes: "+p.notes;
    });
    patternCtx += "\n\nBlend these patterns — do not pick only one. The percentages reflect the dominant market positioning. Honor the strongest pattern while incorporating elements of the others.";
  }

  // ── Urban Drama calibration: when the Urban lane dominates the blend, force a
  //    high-stakes urban-drama experience instead of soft contemporary romance ──
  const urbanPct = norm.urban || 0;
  const urbanDrama = urbanPct >= 50;
  let urbanDramaCtx = "";
  if (urbanPct >= 50) {
    urbanDramaCtx = [
      "",
      "URBAN DRAMA CALIBRATION — DOMINANT (Urban lane at "+urbanPct+"%).",
      "This is HIGH-DRAMA URBAN FICTION / URBAN ROMANCE DRAMA — NOT soft, gentle, or polished contemporary Black romance. Where this block conflicts with any softer guidance above, THIS BLOCK WINS.",
      "TONE: raw, intense, high-stakes, emotionally volatile.",
      "PACING: fast, dramatic, cliffhanger-driven — scenes end on a turn, threat, or reveal.",
      "READER PROMISE: loyalty, betrayal, passion, danger, power, secrets, and consequences.",
      "URBAN DRAMA ENGINE (targets, 1-5): loyalty 5 · power/status 5 · danger 4 · relationship volatility 5 · family-drama 5 · betrayal risk 5 · consequence 5 · morality 4 (morally gray — the leads make hard, compromising choices).",
      "ROMANCE still drives the heart (attraction 5, emotional intimacy 3, physical 4, relationship focus 5) but DANGER, POWER, and BETRAYAL drive the plot. Passion runs hot and volatile, not gentle.",
      "SUSPENSE layer: mystery 3 · danger 4 · psychological tension 4 · twist intensity 5.",
      "MANDATORY: real pressure, betrayal risk, loyalty tests, morally gray decisions, and consequences. Include at least one secret capable of destroying a family, a relationship, or a business/empire.",
      "BUILD THE EXTERNAL CONFLICT FROM A COMBINATION OF: betrayal by someone close · family secrets · street-to-legitimate business tension · hidden money · revenge · loyalty tests · dangerous exes · business fronts · family-empire pressure · violence-adjacent consequences · reputation damage · public humiliation · secret alliances · criminal history resurfacing.",
      "CHARACTER BEHAVIOR: pride; guarded trust; emotional intensity; loyalty-first decision-making; protectiveness; suspicion; impulsive choices under pressure; public strength masking private vulnerability.",
      "DO NOT: make a soft, low-stakes misunderstanding the central conflict; default to a gentle or overly polished corporate-romance tone — UNLESS the blend also carries Power & Purpose / Luxury, in which case FUSE boardroom power with street-level danger and stakes.",
      "Category-level pattern calibration only — never imitate or name a specific author."
    ].join("\n");
  } else if (urbanPct >= 25) {
    urbanDramaCtx = [
      "",
      "URBAN DRAMA ELEMENTS — SECONDARY (Urban lane at "+urbanPct+"%).",
      "Push beyond soft romance: weave in betrayal risk, loyalty tests, a destructive secret, power dynamics, and real consequences. Sharpen the pacing and end scenes on turns; keep it emotionally volatile while letting the other lanes share the stage."
    ].join("\n");
  }

  // ── Erotic Romance Engine + category calibration ──
  let eroticCtx = "";
  const er = eroticRomance || DEFAULT_EROTIC;
  const eCat = dominantEroticCategory(norm);
  const eroticActive = !!eCat || EROTIC_DIMENSIONS.some(d => (er[d.key]||3) >= 4);
  if (eroticActive) {
    const lines = ["", "EROTIC ROMANCE ENGINE (each 1-5 — relationship / desire / chemistry / intimacy dynamics; INDEPENDENT of Spice Level, which alone governs explicit content/heat):"];
    EROTIC_DIMENSIONS.forEach(d => lines.push("  " + d.label + ": " + (er[d.key]||3) + "/5 (" + d.scale[(er[d.key]||3)-1] + ")"));
    lines.push("Use these to drive longing, chemistry, and intimate stakes — NOT to add explicit content. A story can be high Erotic Romance with low spice (tension-forward) or high spice.");
    if (eCat) {
      const cat = EROTIC_CATEGORIES[eCat.id];
      lines.push("");
      lines.push(cat.name.toUpperCase() + " CALIBRATION — DOMINANT (this category at " + eCat.pct + "%).");
      lines.push("Reader promise: " + cat.readerPromise);
      lines.push("Tone: " + cat.tone.join(", ") + ". Pacing: " + cat.pacing + ".");
      lines.push("Core themes: " + cat.coreThemes.join(", ") + ".");
      lines.push("Character types that live here: " + cat.characterTypes.slice(0,8).join(", ") + ".");
      lines.push("Typical conflicts: " + cat.conflicts.slice(0,8).join(", ") + ".");
      lines.push("Settings: " + cat.settings.slice(0,6).join(", ") + ".");
      lines.push("Scene expectations: " + cat.sceneExpectations.join("; ") + ".");
      lines.push("Avoid: " + cat.avoid.join("; ") + ".");
      if (eCat.id === "eroticUrban" && eCat.pct >= 40) {
        lines.push("Because Erotic Urban Romance is dominant (>=40%): increase chemistry frequency and romantic tension; make relationship transformation central; tie desire to character growth; keep romance scenes meaningful to the plot; prioritize emotionally charged private moments; do not make danger the main driver unless blended with suspense.");
      }
      if (eCat.id === "eroticDrama" && eCat.pct >= 40) {
        lines.push("Because Erotic Urban Drama is dominant (>=40%): increase relationship volatility, betrayal risk, loyalty pressure, and possessive/protective dynamics; keep chemistry and emotional conflict high; use family pressure and public/private relationship tension.");
      }
    }
    lines.push("MANDATE: chemistry appears early and creates story tension; intimacy changes the relationship; desire connects to emotional growth; the romance stays central; never let spice replace plot. Reference authors are MARKET POSITIONING ONLY — never imitate a voice, scene, title, or plot, and never name an author in the output.");
    eroticCtx = lines.join("\n");
  }

  // ── Street Lit / Suspense engines + urban-fiction category calibration ──
  let streetLitCtx = "";
  const sl = streetLitEng || DEFAULT_STREETLIT;
  const sp = suspenseEng || DEFAULT_SUSPENSE;
  const uCat = dominantUrbanCategory(norm);
  const slPct = streetLitShare(norm);
  const slActive = STREETLIT_DIMENSIONS.some(d => (sl[d.key]||2) >= 4);
  const spActive = SUSPENSE_DIMENSIONS.some(d => (sp[d.key]||2) >= 4);
  if (uCat || slActive || spActive) {
    const L = [];
    if (slActive) {
      L.push("", "STREET LIT ENGINE (each 1-5 — loyalty / danger / betrayal / empire / survival / consequence stakes; independent of romance):");
      STREETLIT_DIMENSIONS.forEach(d => L.push("  " + d.label + ": " + (sl[d.key]||2) + "/5 (" + d.scale[(sl[d.key]||2)-1] + ")"));
    }
    if (spActive) {
      // Compact single-line format saves ~200 prompt tokens vs. per-dimension verbose format
      L.push("Suspense calibration: mystery=" + (sp.mysteryLevel||2) + ", danger=" + (sp.dangerLevel||2) + ", conspiracy=" + (sp.conspiracyLevel||2) + ", psychological_tension=" + (sp.psychologicalTension||2) + ", investigation=" + (sp.investigationFocus||2) + ", twist_intensity=" + (sp.twistIntensity||2));
    }
    if (uCat) {
      const cat = URBAN_CATEGORIES[uCat.id];
      L.push("", cat.name.toUpperCase() + " CALIBRATION — DOMINANT (its lane at " + uCat.pct + "%).");
      L.push("Reader promise: " + cat.readerPromise);
      L.push("Tone: " + cat.tone.join(", ") + ". Pacing: " + cat.pacing + ".");
      L.push("Core themes: " + cat.coreThemes.join(", ") + ".");
      L.push("Character types that live here: " + cat.characterTypes.slice(0,8).join(", ") + ".");
      L.push("Typical conflicts: " + cat.conflicts.slice(0,8).join(", ") + ".");
      L.push("Avoid: " + cat.avoid.join("; ") + ".");
    }
    if (slPct >= 60) {
      L.push("Because Street Lit / Crime Saga is " + slPct + "% of the blend (>=60%): this should read PRIMARILY as street lit / urban fiction. Romance may exist but must not soften the stakes; family, money, danger, survival, betrayal, and power dominate.");
    } else if (slPct >= 40) {
      L.push("Because Street Lit / Crime Saga is " + slPct + "% (>=40%): raise danger, betrayal, loyalty, consequence, and street influence; increase cliffhanger frequency; prioritize external conflict; include secrets with real consequences; add morally gray choices; avoid low-stakes misunderstandings.");
    }
    L.push("URBAN OUTPUT QUALITY CHECK — ensure present: loyalty pressure, betrayal risk, real consequences, money/power/status stakes, family or street influence, emotionally charged conflict, high-stakes secrets, cliffhanger potential, morally complicated choices.");
    L.push("Reference authors are MARKET POSITIONING ONLY — never imitate a voice, scene, title, or plot, and never name an author in the output.");
    streetLitCtx = L.join("\n");
  }

  // ── External conflict: explicit or bestseller-steered ──
  let conflictCtx;
  if (externalConflict) {
    conflictCtx = "\nEXTERNAL CONFLICT (real-world pressure on the couple): "+externalConflict.n+" ("+externalConflict.cat+"). Pressure: "+externalConflict.pressure+". Weave this throughout — it is the engine that forces growth.";
  } else {
    conflictCtx = "\nEXTERNAL CONFLICT: AI choice — pick from the TOP BESTSELLING CONFLICTS RIGHT NOW: "+BESTSELLER_CONFLICTS.join(", ")+". Pair the conflict with the wound so they amplify each other (e.g. Career Burnout x Community Redevelopment = Kennedy Ryan style).";
  }

  // ── Relationship obstacle: explicit or bestseller-steered ──
  let obstacleCtx;
  if (relationshipObstacle) {
    obstacleCtx = "\nRELATIONSHIP OBSTACLE (what keeps them apart even when they want each other): "+relationshipObstacle.n+" ("+relationshipObstacle.cat+"). Central question: "+relationshipObstacle.question+". This is the emotional barrier the relationship arc must dismantle.";
  } else {
    obstacleCtx = "\nRELATIONSHIP OBSTACLE: AI choice — favor BESTSELLER obstacles: "+BESTSELLER_OBSTACLES.join(", ")+". The strongest romances aren't built on tropes alone — they are built on the emotional barriers keeping two people apart until they have grown enough to overcome them.";
  }

  // ── Family Influence Score (1-10) drives supporting cast size ──
  const famInf = familyInfluence || 5;
  let castSize, castCtx;
  if (famInf <= 3) { castSize = 2; castCtx = "low family influence — keep family supporting cast minimal"; }
  else if (famInf <= 6) { castSize = 3; castCtx = "moderate family influence — family is present but not dominant"; }
  else if (famInf <= 8) { castSize = 4; castCtx = "high family influence — family is a co-star, name the aunties/cousins/grandparents who shape the story"; }
  else { castSize = 5; castCtx = "maximum family influence — the family is practically a co-protagonist. Many bestselling Black romances are 9-10 here. Readers fall in love with the aunties, cousins, grandparents, and community as much as the couple."; }
  const familyInfCtx = "\nFAMILY INFLUENCE SCORE: "+famInf+"/10 ("+castCtx+"). Supporting cast must have at least "+castSize+" named characters with clear roles and emotional purpose to the couple's arc.";

  // ── Author's Story Concept (Import & Continue) — prepended to call1 ──
  const conceptBlock = (userConcept && userConcept.trim())
    ? "AUTHOR'S STORY CONCEPT — BUILD FROM THIS, DO NOT INVENT A DIFFERENT STORY:\n" +
      userConcept +
      "\n\nHonor this concept faithfully. Extract characters, premise, setting, " +
      "and emotional core from the author's vision. Fill gaps intelligently " +
      "using the genre blend and market patterns below, but stay true to " +
      "what the author has described. If the author named characters, use " +
      "those names. If they described a wound or conflict, use it.\n"
    : "";

  // ── CALL 1: Core story ──
  const call1 = [
    conceptBlock,
    "Build a Black romance story concept rooted in the STORY ENGINE TRIANGLE: Trope + Internal Wound + External Conflict + Relationship Obstacle. The bestselling books integrate all four — weak AI-generated romance only does tropes.",
    "Story blend: "+blend,
    "Tropes: "+tropes.join(", "),
    "Heat: "+heat+"/5 ("+heatLabel+")",
    heroineArchCtx,
    heroArchCtx,
    woundCtx,
    conflictCtx,
    obstacleCtx,
    settingCtx,
    familyCtx,
    familyInfCtx,
    intensityCtx,
    spiceCtx,
    intensityProfileCtx,
    universeCtx,
    patternCtx,
    urbanDramaCtx,
    eroticCtx,
    streetLitCtx,
    "",
    "Return a compact JSON object. KEEP EVERY VALUE SHORT — no long descriptions.",
    "Use these exact keys with these length limits:",
    "title: max 6 words",
    "tagline: 1 sentence, max 14 words",
    "hook: 2-3 sentences max, under 70 words total — the back-cover premise",
    "readerPromise: 1 sentence, max 18 words",
    "heroine: object with keys name (string), age (number or short string), occupation (max 8 words), wound (1 sentence max 14 words), externalGoal (1 sentence max 14 words)",
    "hero: object with keys name (string), age (number or short string), occupation (max 8 words), wound (1 sentence max 14 words), externalGoal (1 sentence max 14 words)",
    "openingLine: 1 evocative opening sentence, max 25 words",
    registryAvoidance
  ].filter(Boolean).join("\n");

  const core = await apiCallJSON(SYS_STORY, call1, 2200, MODEL_CONFIG.blueprint);

  const hname = (core.heroine && core.heroine.name) || "the heroine";
  const hocc  = (core.heroine && core.heroine.occupation) || "";
  const mname = (core.hero && core.hero.name) || "the hero";
  const mocc  = (core.hero && core.hero.occupation) || "";

  // ── CALL 2: Blueprint structure ──
  const call2 = [
    "Story: "+core.title,
    "Heroine: "+hname+(hocc?" ("+hocc+")":""),
    "Hero: "+mname+(mocc?" ("+mocc+")":""),
    "Blend: "+blend+" | Tropes: "+tropes.join(", ")+" | Heat: "+heat+"/5",
    woundCtx,
    conflictCtx,
    obstacleCtx,
    settingCtx,
    familyCtx,
    familyInfCtx,
    intensityCtx,
    spiceCtx,
    intensityProfileCtx,
    universeCtx,
    patternCtx,
    urbanDramaCtx,
    eroticCtx,
    streetLitCtx,
    archetypeCtx,
    registryAvoidance,
    "",
    "Return a compact JSON object. KEEP EVERY VALUE SHORT — no long descriptions.",
    "Use these exact keys with these length limits:",
    "heroineArchetype: short label, max 5 words",
    "heroineCoreFear: phrase, max 10 words",
    "heroineGrowthArc: 1 sentence, max 20 words",
    "heroArchetype: short label, max 5 words",
    "heroCoreFear: phrase, max 10 words",
    "heroGrowthArc: 1 sentence, max 20 words",
    "externalConflictSummary: 2 sentences max describing the central external pressure",
    "relationshipObstacleSummary: 2 sentences max describing the emotional barrier",
    "supporting: array of exactly "+castSize+" objects, each has name, role (short), purpose (1 sentence max)",
    "relationshipArc: array of exactly 7 short stage strings, each 3-8 words",
    "tropeSynergy: 2 sentences max — how the trope, wound, and conflict interlock",
    "marketingAngle: 2-3 sentences",
    "amazonCategories: array of exactly 3 short category strings",
    "readerProfile: 2 sentences max",
    "seriesPotential: 1-2 sentences",
    "wordCountTarget: short range like '75K-90K words',",
    "scores: object with keys (each 1-10 integer): emotionalDepth, commercialFamiliarity, originality, seriesPotential, romanceSatisfaction, mysteryStrength, powerPurposeAlignment",
    "familiarElements: array of exactly 3 short strings — recognizable market patterns this story carries (max 8 words each)",
    "uniqueDifferentiator: 2 sentences max — what makes this story stand out in its market",
    "emotionalPayoff: 1 sentence max — the catharsis the reader is paying for",
    "adaptationPotential: 2 sentences max — audio narration fit, streaming/film potential, series anchor capability",
    "primaryReader: object with keys archetypeId (string — use the id from READER_ARCHETYPES), archetypeName (string), requiredPayoff (string — copy exactly from archetype)",
    "secondaryReader: same shape as primaryReader or null",
    "readerSatisfactionForecast: integer 0-100 — realistic projection of how satisfied this archetype will be with this specific story premise",
    "potentialRisks: array of 3-5 strings — each max 18 words — specific ways this story could LOSE its primary reader (be concrete: which chapter types, which character behaviors, which pacing choices)",
    "readerExpectations: array of 4-6 strings — each max 18 words — what this reader DEMANDS from every single chapter (not just the book overall)",
    "storyDNA: object with keys: genreBlend (max 8 words — top 2-3 lanes as a phrase), readerPromise (copy from core.readerPromise), tone (max 8 words), heat (integer — the heat level), heroineWound (max 14 words), heroWound (max 14 words), centralConflict (max 14 words), relationshipObstacle (max 14 words)",
    "",
    "CRITICAL: Return ONLY the JSON object. Start with { and end with }. No markdown, no backticks, no text before or after the JSON. If a field would make the response too long, use a shorter value — but NEVER truncate mid-string. Complete every string value before closing the JSON."
  ].filter(Boolean).join("\n");

  const struct = await apiCallJSON(SYS_STORY, call2, 5000, MODEL_CONFIG.blueprint);
  const result = Object.assign({}, core, struct);
  if (urbanDrama) result.urbanDrama = true;
  return result;
}

export async function generateChapterOutline(story, opts) {
  const o = opts || {};
  const chapterCount = o.chapterCount || 12;
  const targetWordCount = o.targetWordCount || 80000;
  const avgWords = Math.round(targetWordCount / chapterCount);

  const user = [
    "Story: "+story.title,
    "Hook: "+story.hook,
    "Heroine: "+story.heroine.name+" — wound: "+story.heroine.wound,
    "Hero: "+story.hero.name+" — wound: "+story.hero.wound,
    "Relationship arc: "+(story.relationshipArc||[]).join(" → "),
    ...(story.urbanDrama ? ["",
      "URBAN DRAMA MODE: This is high-drama urban fiction / urban romance drama. Every chapter must carry real stakes — betrayal risk, loyalty tests, danger, power moves, secrets, or consequences — and end on a hard cliffhanger or turn. Keep pacing fast and tension high; no soft, low-stakes filler chapters. Passion is volatile; danger, power, and betrayal drive the plot."] : []),
    "",
    "MANUSCRIPT SPEC:",
    "Target manuscript length: "+targetWordCount.toLocaleString()+" words",
    "Total chapters: "+chapterCount,
    "Average words per chapter: "+avgWords,
    "",
    "Generate a "+chapterCount+"-chapter outline mapped across the 7-stage relationship arc.",
    "Distribute the 7 arc stages proportionally across "+chapterCount+" chapters (e.g. early chapters set up, middle chapters escalate, last 2-3 chapters resolve).",
    "",
    "Return a compact JSON object with key 'chapters' = array of EXACTLY "+chapterCount+" objects.",
    "Each object MUST have these keys (keep values short):",
    "number (1 through "+chapterCount+"),",
    "title (max 5 words, evocative),",
    "pov (heroine or hero or supporting character name),",
    "scene (1 sentence, max 16 words — physical setting + situation),",
    "beat (1 sentence, max 18 words — emotional purpose of this chapter),",
    "arcStage (which of the 7 relationship arc stages this chapter serves),",
    "targetWordCount (number — vary between "+Math.round(avgWords*0.85)+" and "+Math.round(avgWords*1.15)+", averaging "+avgWords+"),",
    "cliffhangerOrTurn (1 short phrase, max 12 words — the hook/turn that ends this chapter and pulls into the next),",
    "continuityNotes (1 short phrase, max 14 words — what MUST be tracked from this chapter into future chapters: a clue planted, a relational shift, an open thread)"
  ].join("\n");

  return await apiCallJSON(SYS_STORY, user, Math.max(4500, chapterCount * 280), MODEL_CONFIG.outline);
}

export async function generateAlternatives(itemType, currentItem, context, avoidList) {
  const user = [
    "Generate 10 distinct alternatives for a "+itemType+".",
    "Current item being replaced/inspired by: "+(currentItem || "(none)"),
    "Context: "+(context || "general Black romance fiction"),
    avoidList && avoidList.length ? "AVOID these existing items in our library (must be substantially different — different roots, different vibes): "+avoidList.slice(0,40).join(", ") : "",
    "",
    "Return a compact JSON object with key 'alternatives' = array of EXACTLY 10 objects.",
    "Each object MUST have:",
    "  option (string — the alternative itself; max 6 words for names, max 10 words for titles, max 22 words for premises),",
    "  genreFit (string, max 14 words — why this fits the genre/context),",
    "  uniquenessScore (integer 1-10 — how distinctive vs the AVOID list and common tropes),",
    "  reason (string, max 16 words — why this specific choice works)"
  ].filter(Boolean).join("\n");
  return await apiCallJSON(SYS_ALTERNATIVES, user, 2500, MODEL_CONFIG.alternatives);
}

export async function analyzeStoryHealth(story, outline, bible, chapterProse, chapterSummaries) {
  const writtenChapters = Object.keys(chapterProse)
    .map(Number).filter(n => chapterProse[n]).sort((a,b) => a-b);

  if (writtenChapters.length < 1)
    throw new Error("No chapters written yet.");

  const primaryArch = story.primaryReader
    ? READER_ARCHETYPES.find(a => a.id === story.primaryReader.archetypeId)
    : null;

  // Prose sampling: first chapter + last 2 chapters (capped at 2500 chars each)
  const sampleNums = [...new Set([
    writtenChapters[0],
    writtenChapters[writtenChapters.length - 2],
    writtenChapters[writtenChapters.length - 1],
  ])].filter(Boolean);

  const proseSamples = sampleNums
    .filter(n => chapterProse[n])
    .map(n =>
      `=== CH${n} PROSE SAMPLE ===\n${chapterProse[n].slice(0, 2500)}\n=== END ===`
    ).join("\n\n");

  const chapterDigest = writtenChapters.map(n => {
    const s = chapterSummaries[n];
    const ch = (outline?.chapters || [])[n - 1] || {};
    const entry = (bible?.chapters || []).find(c => c.number === n) || {};
    return [
      `Ch${n} [${ch.arcStage||""}·${ch.pov||""}POV]:`,
      s?.summary || "(no summary)",
      entry.unresolvedThreads?.length
        ? "Open: " + entry.unresolvedThreads.join("; ") : "",
      entry.characterChanges?.length
        ? "Shifts: " + entry.characterChanges.join("; ") : "",
    ].filter(Boolean).join(" | ");
  }).join("\n");

  const bibleSummary = bible ? [
    "Relationship now: " + (bible.relationship?.currentState || "unknown"),
    "Open mysteries: " + (bible.plot?.mysteries||[]).filter(m=>m.status!=="resolved").map(m=>m.name).join(", "),
    "Active secrets: " + (bible.plot?.secrets||[]).filter(s=>!s.revealedIn).length,
    "Subplots: " + (bible.plot?.subplots||[]).join(", "),
  ].join(" · ") : "";

  const sys = [
    "You are a senior developmental editor for commercial Black fiction.",
    "You perform story-level editorial analysis — not line editing.",
    "You find where the story works, where it risks losing readers, and exactly how to fix it.",
    "Your analysis is honest, specific, and actionable — not encouraging.",
    "Output strict JSON only. Start with { end with }. No prose, no markdown."
  ].join("\n");

  const user = [
    `BOOK: ${story.title}`,
    story.storyDNA ? `DNA: ${story.storyDNA.genreBlend} · ${story.storyDNA.tone} · Heat ${story.storyDNA.heat}/5` : "",
    `PROMISE: ${story.readerPromise || ""}`,
    primaryArch ? `PRIMARY READER: ${primaryArch.name}` : "",
    primaryArch ? `THEY WANT: ${primaryArch.wants.join(", ")}` : "",
    primaryArch ? `THEY HATE: ${primaryArch.hates.join(", ")}` : "",
    primaryArch ? `REQUIRED PAYOFF: ${primaryArch.requiredPayoff}` : "",
    story.readerExpectations?.length
      ? `CHAPTER EXPECTATIONS: ${story.readerExpectations.join("; ")}` : "",
    "",
    `CHAPTERS PLANNED: ${(outline?.chapters||[]).length} | WRITTEN: ${writtenChapters.length}`,
    `BIBLE: ${bibleSummary}`,
    "",
    "=== CHAPTER DIGEST ===",
    chapterDigest,
    "",
    proseSamples ? "=== PROSE SAMPLES ===" : "",
    proseSamples || "",
    "",
    "Return a compact JSON with these exact keys:",
    "",
    "overallHealth: { score(1-10), verdict(max 8 words), summary(max 24 words) }",
    "",
    "sagPoints: array of { chapters(number[]), issue(max 18 words), severity('low'|'medium'|'high'), fix(max 20 words) }",
    "",
    "dropoutRisk: array of { afterChapter(number), reason(max 18 words), riskLevel('low'|'medium'|'high'), fix(max 18 words) }",
    "",
    "characterAudit: array of { name, role('heroine'|'hero'|'supporting'), developmentScore(1-10), chaptersActive(integer), issue(max 18 words), suggestion(max 20 words) }",
    "",
    "subplotRanking: array of { subplot(max 12 words), strength(1-10), momentum('building'|'stalled'|'resolved'|'dormant'), lastActiveChapter(number) }",
    "",
    "promiseFulfillment: { score(1-10), onTrack(boolean), gaps(array of 2-4 strings max 16 words each) }",
    "",
    "readerArchetypeAlignment: { score(1-10), strengths(array of 2-3 strings max 14 words each), risks(array of 2-3 strings max 14 words each) }",
    "",
    "readabilityAnalysis: { overallScore(1-10), pacing(1-10), dialogue(1-10), interiority(1-10), tension(1-10), voiceConsistency(1-10), archetypeReadabilityNotes(max 24 words) }",
    "",
    "editorNotes: array of exactly 5 objects: { priority('P1'|'P2'|'P3'), note(max 22 words — specific and actionable), chapter(number or null if story-wide) }",
  ].filter(Boolean).join("\n");

  return await apiCallJSON(sys, user, 4500, MODEL_CONFIG.analysis);
}

export async function generateStoryBible(story, outline) {
  const chList = (outline.chapters||[]).map(c=>"Ch"+c.number+" ("+c.pov+", "+c.arcStage+"): "+c.beat).join("\n");
  const arc = (story.relationshipArc||[]).map((s,i)=>(i+1)+". "+s).join(" → ");
  const support = (story.supporting||[]).map(s=>s.name+" ("+s.role+"): "+s.purpose).join("; ");
  const user = [
    "Build the STORY BIBLE for this novel. The Bible is the source-of-truth that all chapters will reference.",
    "",
    "BOOK: "+story.title,
    "HOOK: "+story.hook,
    "READER PROMISE: "+story.readerPromise,
    "",
    "HEROINE: "+story.heroine.name+", "+story.heroine.age+", "+story.heroine.occupation+". Wound: "+story.heroine.wound+". Wants: "+story.heroine.externalGoal+(story.heroineArchetype?". Archetype: "+story.heroineArchetype:"")+(story.heroineCoreFear?". Core fear: "+story.heroineCoreFear:""),
    "HERO: "+story.hero.name+", "+story.hero.age+", "+story.hero.occupation+". Wound: "+story.hero.wound+". Wants: "+story.hero.externalGoal+(story.heroArchetype?". Archetype: "+story.heroArchetype:"")+(story.heroCoreFear?". Core fear: "+story.heroCoreFear:""),
    support ? "SUPPORTING CAST: "+support : "",
    "",
    "RELATIONSHIP ARC (7 stages): "+arc,
    story.externalConflictSummary ? "EXTERNAL CONFLICT: "+story.externalConflictSummary : "",
    story.relationshipObstacleSummary ? "RELATIONSHIP OBSTACLE: "+story.relationshipObstacleSummary : "",
    "",
    "12-CHAPTER OUTLINE BEATS:",
    chList,
    "",
    "Return a compact JSON object with these exact keys (keep values short):",
    "world: object with keys genre (max 5 words), themes (array of 3-5 strings), setting (max 12 words), tone (max 14 words), timeline (max 12 words describing narrative time span like '6 months, present day')",
    "characters: array of objects (heroine first, hero second, then supporting), each with name, role (heroine|hero|supporting), age, appearance (max 18 words, vivid sensory), occupation, wound (max 14 words), goals (max 14 words), fears (max 12 words), family (max 14 words), relationships (max 14 words about their relational world), speechPatterns (max 18 words — how they speak, what they say, what they avoid)",
    "relationship: object with beginningState (max 12 words), currentState (max 12 words — where they are at Ch1), desiredEndState (max 14 words), obstacle (max 12 words), milestones (empty array — populated as chapters are written)",
    "plot: object with mainConflict (1 sentence max 20 words), subplots (array of 2-4 strings, each max 14 words), mysteries (array of 1-3 objects each with name (max 10 words) and status='open'), secrets (array of 1-3 objects each with owner (name), secret (max 12 words), revealedIn (null)), clues (array of 2-4 objects each with chapter (number), clue (max 14 words), payoff (max 10 words)), reveals (array of 2-4 objects each with chapter (number), reveal (max 14 words))",
    "chapters: empty array — populated by the continuity loop after each chapter is written"
  ].filter(Boolean).join("\n");
  return await apiCallJSON(SYS_BIBLE, user, 3500, MODEL_CONFIG.bible);
}

export async function generateContinuityReport(story, bible, chapterNum, chapterProse, outline) {
  const primaryArch = story.primaryReader
    ? READER_ARCHETYPES.find(a => a.id === story.primaryReader.archetypeId)
    : null;
  const readerExpectations = story.readerExpectations || [];
  const readerPromise = story.readerPromise || "";
  const ch = (outline.chapters||[])[chapterNum-1] || {};
  const prevChapters = (bible.chapters||[]).slice(0,chapterNum-1);
  const prevSummary = prevChapters.map(c=>"Ch"+c.number+": "+(c.majorEvents||[]).join("; ")+(c.unresolvedThreads&&c.unresolvedThreads.length?" UNRESOLVED: "+c.unresolvedThreads.join("; "):"")).join(" || ") || "(first chapter)";

  // Compact bible snapshot
  const charLines = (bible.characters||[]).map(c=>c.name+" ("+c.role+", "+c.age+", "+c.occupation+", wound: "+c.wound+", speech: "+c.speechPatterns+")").join(" | ");
  const openMysteries = (bible.plot && bible.plot.mysteries||[]).filter(m=>m.status==="open").map(m=>m.name).join("; ");
  const unresolvedSecrets = (bible.plot && bible.plot.secrets||[]).filter(s=>!s.revealedIn).map(s=>s.owner+": "+s.secret).join("; ");

  const user = [
    "Run a continuity check on the chapter just written. Identify any consistency issues and produce bible updates.",
    "",
    "BOOK: "+story.title+" · Genre: "+(bible.world&&bible.world.genre||"")+" · Tone: "+(bible.world&&bible.world.tone||""),
    "",
    "STORY BIBLE SNAPSHOT:",
    "Characters: "+charLines,
    "Current relationship state: "+(bible.relationship&&bible.relationship.currentState||"unknown"),
    "Relationship obstacle: "+(bible.relationship&&bible.relationship.obstacle||"unknown"),
    "Open mysteries: "+(openMysteries||"none"),
    "Unrevealed secrets: "+(unresolvedSecrets||"none"),
    "",
    "WHAT HAPPENED IN PRIOR CHAPTERS: "+prevSummary,
    "",
    "CHAPTER "+chapterNum+" PURPOSE (from outline): "+(ch.beat||"")+" — arc stage: "+(ch.arcStage||""),
    "CHAPTER "+chapterNum+" POV: "+(ch.pov||""),
    "",
    "THE PROSE (chapter "+chapterNum+"):",
    chapterProse.slice(0, 6000),  // cap to avoid huge prompts
    "",
    "Return a compact JSON object with these exact keys:",
    "characterConsistency: object with status ('pass'|'warning'|'issue') and notes (array of 0-3 short strings, each max 18 words — flag any character behavior that contradicts their established traits/wound/speech)",
    "timelineConsistency: object with same shape — flag any sequence-of-events problems",
    "relationshipConsistency: object with same shape — flag any unearned intimacy jumps or arc-state contradictions",
    "plotConsistency: object with same shape — flag any forgotten threads, mishandled clues, contradicted setups",
    "readerPromiseFulfillment: object with status ('pass'|'warning'|'issue') and notes (array of 0-3 strings each max 18 words). Evaluate: (1) Did this chapter advance the reader toward the required payoff: " + (primaryArch ? '"' + primaryArch.requiredPayoff + '"' : "the story promise") + "? (2) Did it deliver at least one reader expectation: " + (readerExpectations.length ? readerExpectations.slice(0,3).join("; ") : "per the story promise") + "? (3) Did it avoid the primary reader's hates: " + (primaryArch ? primaryArch.hates.join(", ") : "weak character choices") + "? Issue if chapter actively works against the payoff. Warning if payoff not advanced. Pass if at least one expectation delivered.",
    "chapterEntry: object with keys number ("+chapterNum+"), pov (string), purpose (max 14 words), majorEvents (array of 2-4 short strings each max 14 words), characterChanges (array of 0-3 short strings each max 14 words — internal shifts that affect future chapters), unresolvedThreads (array of 1-3 short strings each max 14 words — what carries forward)",
    "relationshipUpdate: object with newCurrentState (max 12 words — where the relationship is at the end of this chapter) and newMilestone (object with chapter ("+chapterNum+") and event (max 14 words)) or null if no milestone reached",
    "mysteriesUpdate: array of objects each with name (existing mystery name) and newStatus ('open'|'closing'|'resolved')",
    "secretsRevealed: array of names of characters whose secrets were revealed in this chapter (empty array if none)",
    "newClues: array of 0-2 objects each with chapter ("+chapterNum+"), clue (max 14 words), payoff (max 10 words, when it pays off)",
    "",
    "OVERALL STATUS — output as the top-level 'status' key, one of:",
    "  'PASS'    — chapter is fully consistent with the Story Bible. All four checks are 'pass'. Next chapter can be drafted safely.",
    "  'WARNING' — minor inconsistencies that should be patched but do not break the story. One or more checks are 'warning' but none is 'issue'.",
    "  'FAIL'    — major contradiction, broken character, broken timeline, or destroyed plot thread. One or more checks are 'issue'. Subsequent chapters cannot be drafted until resolved.",
    "  If readerPromiseFulfillment.status is 'issue', the overall status must be at minimum 'WARNING'.",
    "",
    "Include the 'status' field on the returned JSON.",
    "",
    "IF status='WARNING', also include a 'revisionPatch' object with keys:",
    "  issue (string max 18 words — what is inconsistent),",
    "  location (string max 14 words — where in the chapter, e.g. 'opening scene' or 'dialogue with mother'),",
    "  recommendedChange (string max 20 words — what to change),",
    "  revisedText (string max 60 words — a short snippet of suggested replacement prose, if applicable, otherwise null),",
    "  reason (string max 18 words — why this change preserves continuity)",
    "",
    "IF status='FAIL', also include a 'repairReport' object with keys:",
    "  issueType (string — one of: 'character', 'timeline', 'relationship', 'plot'),",
    "  severity (string — one of: 'major', 'critical'),",
    "  affectedChapters (array of chapter numbers — which prior chapters are also implicated, or just ["+chapterNum+"] if isolated),",
    "  affectedCharacters (array of character names, max 4),",
    "  contradiction (string max 24 words — describe the specific contradiction),",
    "  repairOptions (array of 2-3 short strings, each max 16 words — concrete options the author can take, e.g. 'revise this chapter to match', 'update the bible to match this chapter', 'add a justifying scene'),",
    "  recommendedFix (string max 22 words — the option the editor recommends)",
    "",
    "If status='PASS', omit revisionPatch and repairReport entirely."
  ].filter(Boolean).join("\n");
  return await apiCallJSON(SYS_BIBLE, user, 3000, MODEL_CONFIG.continuity);
}

export function mergeBibleUpdates(bible, report, chapterNum) {
  const next = {
    world: bible.world,
    characters: bible.characters,
    relationship: { ...(bible.relationship||{}) },
    plot: { ...(bible.plot||{}) },
    chapters: [...(bible.chapters||[])]
  };

  // Chapter entry — replace or append
  if (report.chapterEntry) {
    const existingIdx = next.chapters.findIndex(c=>c.number===chapterNum);
    if (existingIdx >= 0) next.chapters[existingIdx] = report.chapterEntry;
    else next.chapters.push(report.chapterEntry);
    next.chapters.sort((a,b)=>(a.number||0)-(b.number||0));
  }

  // Relationship update
  if (report.relationshipUpdate) {
    if (report.relationshipUpdate.newCurrentState) {
      next.relationship.currentState = report.relationshipUpdate.newCurrentState;
    }
    if (report.relationshipUpdate.newMilestone) {
      next.relationship.milestones = [...(next.relationship.milestones||[]), report.relationshipUpdate.newMilestone];
    }
  }

  // Mystery status updates
  if (report.mysteriesUpdate && next.plot.mysteries) {
    next.plot.mysteries = next.plot.mysteries.map(m=>{
      const update = report.mysteriesUpdate.find(u=>u.name===m.name);
      return update ? { ...m, status: update.newStatus } : m;
    });
  }

  // Secrets revealed
  if (report.secretsRevealed && next.plot.secrets) {
    next.plot.secrets = next.plot.secrets.map(s=>{
      return report.secretsRevealed.includes(s.owner) ? { ...s, revealedIn: chapterNum } : s;
    });
  }

  // New clues
  if (report.newClues && report.newClues.length) {
    next.plot.clues = [...(next.plot.clues||[]), ...report.newClues];
  }

  return next;
}

export function bibleContextForChapter(bible, chapterNum, outline) {
  if (!bible) return "";
  const ch = (outline.chapters||[])[chapterNum-1] || {};
  const povName = ch.pov || "";
  const povChar = (bible.characters||[]).find(c=>c.name===povName) || (bible.characters||[]).find(c=>c.role===povName);
  const otherChars = (bible.characters||[]).filter(c=>c!==povChar);

  const parts = [];
  parts.push("\n── STORY BIBLE (continuity reference) ──");

  if (bible.world) {
    parts.push("WORLD: Genre "+bible.world.genre+" · Tone "+bible.world.tone+" · Setting "+bible.world.setting+" · Timeline "+bible.world.timeline);
  }

  if (povChar) {
    parts.push("");
    parts.push("POV CHARACTER FULL BIBLE — "+povChar.name+":");
    parts.push("  Appearance: "+povChar.appearance);
    parts.push("  Wound: "+povChar.wound+" · Fears: "+povChar.fears+" · Goals: "+povChar.goals);
    parts.push("  Family: "+povChar.family+" · Relationships: "+povChar.relationships);
    parts.push("  Speech patterns (MAINTAIN): "+povChar.speechPatterns);
  }

  if (otherChars.length) {
    parts.push("");
    parts.push("OTHER CHARACTERS IN SCENE (consistency check):");
    otherChars.slice(0,6).forEach(c=>{
      parts.push("  - "+c.name+" ("+c.role+", "+c.age+", "+c.occupation+") — speech: "+c.speechPatterns);
    });
  }

  if (bible.relationship) {
    parts.push("");
    parts.push("RELATIONSHIP STATE:");
    parts.push("  Current state (do not jump past this): "+bible.relationship.currentState);
    parts.push("  Obstacle: "+bible.relationship.obstacle);
    parts.push("  Desired end state (where we are going, not where we are): "+bible.relationship.desiredEndState);
    if (bible.relationship.milestones && bible.relationship.milestones.length) {
      parts.push("  Milestones reached: "+bible.relationship.milestones.map(m=>"Ch"+m.chapter+":"+m.event).join(" · "));
    }
  }

  if (bible.plot) {
    const openMysteries = (bible.plot.mysteries||[]).filter(m=>m.status!=="resolved");
    const unresolvedSecrets = (bible.plot.secrets||[]).filter(s=>!s.revealedIn);
    const upcomingPayoffs = (bible.plot.clues||[]).filter(c=>(c.chapter||0)<=chapterNum && c.payoff);
    parts.push("");
    parts.push("PLOT THREADS LIVE:");
    if (openMysteries.length) parts.push("  Open mysteries: "+openMysteries.map(m=>m.name).join(" · "));
    if (unresolvedSecrets.length) parts.push("  Active secrets (not yet revealed): "+unresolvedSecrets.map(s=>s.owner+" hides: "+s.secret).join(" · "));
    if (upcomingPayoffs.length) parts.push("  Clues planted earlier (may echo here): "+upcomingPayoffs.map(c=>"Ch"+c.chapter+" clue → "+c.payoff).join(" · "));
  }

  const prevChapters = (bible.chapters||[]).slice(0,chapterNum-1);
  if (prevChapters.length) {
    parts.push("");
    parts.push("PRIOR CHAPTER SUMMARIES (continuity):");
    prevChapters.slice(-3).forEach(c=>{
      parts.push("  Ch"+c.number+" ("+c.pov+"): "+(c.majorEvents||[]).join("; ")+(c.unresolvedThreads&&c.unresolvedThreads.length?" — carrying forward: "+c.unresolvedThreads.join("; "):""));
    });
  }

  // Future outline window — next 2 chapters
  const futureChs = (outline.chapters||[]).slice(chapterNum, chapterNum+2);
  if (futureChs.length) {
    parts.push("");
    parts.push("FUTURE BEATS (plant seeds, do not jump ahead):");
    futureChs.forEach(c=>{
      parts.push("  Ch"+c.number+": "+c.beat);
    });
  }

  parts.push("── END BIBLE ──");
  return parts.join("\n");
}

export function fastBibleContext(bible, chapterNum, outline) {
  if (!bible) return "";
  const parts = ["── FAST DRAFT CONTEXT ──"];

  if (bible.characters && bible.characters.length) {
    parts.push("CHARACTERS:");
    bible.characters.forEach(c => {
      parts.push(`  ${c.name} (${c.role}) · ${c.occupation} · wound: ${c.wound} · speech: ${c.speechPatterns}`);
    });
  }
  if (bible.relationship) {
    parts.push(`RELATIONSHIP: Currently "${bible.relationship.currentState}" · Obstacle: ${bible.relationship.obstacle}`);
  }
  const openMysteries = ((bible.plot && bible.plot.mysteries) || []).filter(m => m.status !== "resolved").map(m => m.name);
  const unresolvedSecrets = ((bible.plot && bible.plot.secrets) || []).filter(s => !s.revealedIn).map(s => s.owner + " hides: " + s.secret);
  if (openMysteries.length || unresolvedSecrets.length) {
    parts.push("ACTIVE THREADS: " + [...openMysteries, ...unresolvedSecrets].join(" · "));
  }
  const prevChapters = (bible.chapters || []).slice(-2);
  if (prevChapters.length) {
    parts.push("RECENT: " + prevChapters.map(c => `Ch${c.number}: ${(c.majorEvents || []).join("; ")}`).join(" || "));
  }
  parts.push("── END CONTEXT ──");
  return parts.join("\n");
}

export async function writeScenesInBatch(story, outline, chapterNum, scenes, bible, opts) {
  const o = opts || {};
  const ch = outline.chapters[chapterNum - 1];
  const context = fastBibleContext(bible, chapterNum, outline);
  const totalTarget = scenes.reduce((sum, s) => sum + (s.targetWordCount || 900), 0);

  const sceneDescriptions = scenes.map((s) =>
    `SCENE ${s.sceneNumber}: "${s.sceneTitle}"
  Purpose: ${s.scenePurpose}
  Location: ${s.location} · ${s.timeOfDay}
  POV: ${s.povCharacter}
  Goal: ${s.characterGoal}
  Conflict: ${s.conflictType}
  Emotional beat: ${s.emotionalBeat}
  Romance beat: ${s.romanceBeat}
  Wound triggered: ${s.woundTriggered}
  Outcome: ${s.sceneOutcome}
  Transition: ${s.transitionToNextScene}
  Target words: ${s.targetWordCount || 900}`
  ).join("\n\n");

  const user = [
    `BOOK: ${story.title}`,
    context,
    ``,
    `CHAPTER ${chapterNum}: ${ch.title}`,
    `Beat: ${ch.beat}`,
    `Arc stage: ${ch.arcStage}`,
    ``,
    `Write the following ${scenes.length} scenes as continuous prose.`,
    `Total target: ${totalTarget} words.`,
    `Separate scenes with exactly this delimiter on its own line: <<<SCENE_BREAK>>>`,
    ``,
    `Requirements for all scenes:`,
    `- Strong sensory prose, internal monologue, sharp dialogue`,
    `- Maintain character voices and relationship state`,
    `- Each scene ends at its stated outcome`,
    `- Do not summarize — write full prose`,
    ``,
    sceneDescriptions,
    ``,
    `Begin Scene ${scenes[0].sceneNumber} now. No headers, no labels, just prose.`,
    `Use <<<SCENE_BREAK>>> between scenes only.`,
  ].join("\n");

  const maxTok = Math.min(8000, Math.max(3000, Math.round(totalTarget * 1.5)));
  const raw = await apiCall(SYS_SCENE, user, maxTok, opts.model || MODEL_CONFIG.fastDraft);

  const parts = raw.split("<<<SCENE_BREAK>>>");
  const result = {};
  scenes.forEach((s, i) => {
    result[s.sceneNumber] = (parts[i] || "").trim();
  });
  return result;
}

export async function generateSceneCards(story, outline, chapterNum, bible, opts) {
  const ch = outline.chapters[chapterNum-1];
  const o = opts || {};
  const chapterTarget = ch.targetWordCount || 3200;
  const sceneCount = Math.max(3, Math.min(5, Math.round(chapterTarget / 850)));
  const avgScene = Math.round(chapterTarget / sceneCount);

  const bibleSlice = bibleContextForChapter(bible, chapterNum, outline);
  const spiceCtx = o.spiceLevel ? "Spice level: "+o.spiceLevel+"/5 ("+SPICE_LEVELS[o.spiceLevel-1].label+")" : "";
  const intensityCtx = (o.romanceIntensity ? "Romance intensity: attraction "+o.romanceIntensity.attractionIntensity+"/5, emotional "+o.romanceIntensity.emotionalIntimacy+"/5, physical "+o.romanceIntensity.physicalAffection+"/5, focus "+o.romanceIntensity.relationshipFocus+"/5" : "") + (eroticLine(o.eroticRomance) ? "\n"+eroticLine(o.eroticRomance) : "") + (streetLitLine(o.streetLitEng) ? "\n"+streetLitLine(o.streetLitEng) : "") + (suspenseLine(o.suspenseEng) ? "\n"+suspenseLine(o.suspenseEng) : "");

  const user = [
    "BOOK: "+story.title,
    bibleSlice,
    spiceCtx,
    intensityCtx,
    "",
    "CHAPTER "+chapterNum+" CARD:",
    "Title: "+(ch.title||""),
    "POV: "+(ch.pov||""),
    "Scene context: "+(ch.scene||""),
    "Beat to deliver: "+(ch.beat||""),
    "Arc stage: "+(ch.arcStage||""),
    "Cliffhanger/turn at chapter end: "+(ch.cliffhangerOrTurn||""),
    "Continuity notes: "+(ch.continuityNotes||""),
    "Chapter target word count: "+chapterTarget,
    "",
    "Architect this chapter as "+sceneCount+" SCENES. Each scene is a discrete unit with its own goal, conflict, and emotional beat.",
    "Total chapter target: "+chapterTarget+" words across "+sceneCount+" scenes (avg "+avgScene+" words/scene, range "+Math.round(avgScene*0.85)+"-"+Math.round(avgScene*1.15)+").",
    "Build scenes that ESCALATE — each scene raises stakes or deepens emotional state from the prior one. The final scene of the chapter must land the cliffhanger/turn.",
    "",
    "Return a compact JSON object with key 'scenes' = array of EXACTLY "+sceneCount+" scene-card objects.",
    "Each scene card MUST have these keys (keep values short):",
    "  sceneNumber (1 to "+sceneCount+"),",
    "  chapterNumber ("+chapterNum+"),",
    "  sceneTitle (max 5 words),",
    "  scenePurpose (max 14 words — why this scene exists),",
    "  povCharacter (the chapter POV unless a deliberate shift is needed),",
    "  location (max 8 words — physical setting),",
    "  timeOfDay (max 6 words — when in the day/night),",
    "  targetWordCount (number — varying around "+avgScene+", total summing close to "+chapterTarget+"),",
    "  storyGoal (max 12 words — what the plot needs from this scene),",
    "  characterGoal (max 12 words — what the POV character wants in this scene),",
    "  conflictType (max 10 words — what blocks the character: external, internal, or relational),",
    "  emotionalBeat (max 12 words — the emotional shift this scene delivers),",
    "  romanceBeat (max 12 words — what happens between the leads here; 'none on page' is valid if they're apart),",
    "  externalPlotBeat (max 12 words — what moves in the wider plot/conflict),",
    "  woundTriggered (max 10 words — which wound surfaces in this scene),",
    "  relationshipStatus (max 10 words — where the leads are by the END of this scene),",
    "  sceneOutcome (max 12 words — how the scene resolves; sets up the next),",
    "  transitionToNextScene (max 10 words — how we get from this scene to the next, e.g. 'time jump, same evening' or 'POV shift to hero')"
  ].filter(Boolean).join("\n");

  return await apiCallJSON(SYS_BIBLE, user, Math.max(3500, sceneCount * 850), MODEL_CONFIG.sceneCards);
}

export async function writeScene(story, outline, chapterNum, sceneNumber, bible, scene, opts) {
  const ch = outline.chapters[chapterNum-1];
  const o = opts || {};
  const target = scene.targetWordCount || 900;
  const maxPerGen = o.maxWordsPerGen || 2500;

  const bibleSlice = bibleContextForChapter(bible, chapterNum, outline);
  const prevSceneSummary = o.previousSceneSummary || null;
  const chapterScenesSoFar = o.scenesInChapter || [];
  const scenesBriefSoFar = chapterScenesSoFar.filter(s=>s.sceneNumber < sceneNumber).map(s=>"Scene "+s.sceneNumber+": "+(s.scenePurpose||"")+" → outcome: "+(s.sceneOutcome||"")).join(" || ");
  const futureSceneBriefs = chapterScenesSoFar.filter(s=>s.sceneNumber > sceneNumber).slice(0,2).map(s=>"Scene "+s.sceneNumber+": "+(s.scenePurpose||"")).join(" · ");

  const spiceCtx = o.spiceLevel ? "Spice level: "+o.spiceLevel+"/5 ("+SPICE_LEVELS[o.spiceLevel-1].label+") — "+SPICE_LEVELS[o.spiceLevel-1].summary : "";
  const intensityCtx = (o.romanceIntensity ? "Romance intensity dimensions — attraction "+o.romanceIntensity.attractionIntensity+"/5, emotional "+o.romanceIntensity.emotionalIntimacy+"/5, physical "+o.romanceIntensity.physicalAffection+"/5, focus "+o.romanceIntensity.relationshipFocus+"/5. Compose this scene's beats accordingly." : "") + (eroticLine(o.eroticRomance) ? "\n"+eroticLine(o.eroticRomance) : "") + (streetLitLine(o.streetLitEng) ? "\n"+streetLitLine(o.streetLitEng) : "") + (suspenseLine(o.suspenseEng) ? "\n"+suspenseLine(o.suspenseEng) : "");

  const user = [
    "BOOK: "+story.title,
    bibleSlice,
    spiceCtx,
    intensityCtx,
    "",
    "CHAPTER "+chapterNum+" CONTEXT:",
    "Beat: "+(ch.beat||""),
    "Arc stage: "+(ch.arcStage||""),
    scenesBriefSoFar ? "Scenes already written in this chapter: "+scenesBriefSoFar : "",
    futureSceneBriefs ? "Future scenes in this chapter (DO NOT WRITE THEM — plant seeds only): "+futureSceneBriefs : "",
    prevSceneSummary ? "Last scene summary: "+prevSceneSummary : "",
    "",
    "WRITE SCENE "+sceneNumber+" of "+chapterScenesSoFar.length+" — \""+(scene.sceneTitle||"")+"\"",
    "Target length: "+target+" words.",
    "Maximum words to write in THIS response: "+Math.min(maxPerGen, Math.round(target*1.2))+" words.",
    "",
    "SCENE CARD:",
    "POV: "+(scene.povCharacter||""),
    "Location: "+(scene.location||""),
    "Time: "+(scene.timeOfDay||""),
    "Scene purpose: "+(scene.scenePurpose||""),
    "Story goal: "+(scene.storyGoal||""),
    "Character goal (POV wants): "+(scene.characterGoal||""),
    "Conflict type (what blocks them): "+(scene.conflictType||""),
    "Emotional beat (the shift): "+(scene.emotionalBeat||""),
    "Romance beat (what happens between leads): "+(scene.romanceBeat||""),
    "External plot beat: "+(scene.externalPlotBeat||""),
    "Wound triggered: "+(scene.woundTriggered||""),
    "Relationship status BY END of scene: "+(scene.relationshipStatus||""),
    "Scene outcome (how it resolves): "+(scene.sceneOutcome||""),
    "",
    "WRITING REQUIREMENTS:",
    "- Strong opening: drop the reader into action or charged stillness, not exposition.",
    "- Clear scene goal — every paragraph should serve the POV character's want or the conflict against it.",
    "- Meaningful conflict — internal, external, or relational. Stakes must be felt.",
    "- Emotional progression — the POV character must end somewhere different from where they began.",
    "- Character consistency — speech patterns and behaviors per the Story Bible.",
    "- Sensory details — what they see, hear, smell, feel. Embodied prose.",
    "- Natural dialogue — line breaks, beats, subtext. Not a transcript.",
    "- Internal thoughts — italicized or seamlessly integrated. Show the POV mind.",
    "- Plot advancement — by scene's end, something has shifted.",
    "",
    "RULES:",
    "Do not summarize. Do not rush. Do not complete future scenes. Only write THIS scene.",
    "End naturally at the scene's stated outcome. Transition cleanly: \""+(scene.transitionToNextScene||"")+"\" — but write only to the end of THIS scene.",
    "Begin now — no headers, no scene labels, just prose."
  ].filter(Boolean).join("\n");

  const maxTok = Math.min(6000, Math.max(2000, Math.round(Math.min(maxPerGen, target*1.2) * 1.6)));
  return await apiCall(SYS_SCENE, user, maxTok, MODEL_CONFIG.sceneProse);
}

export async function continueScene(story, outline, chapterNum, sceneNumber, bible, scene, existingProse, opts) {
  const o = opts || {};
  const target = scene.targetWordCount || 900;
  const currentWords = (o.currentWordCount || 0);
  const remaining = Math.max(200, target - currentWords);
  const maxThisCall = Math.min(remaining + 150, o.maxWordsPerGen || 2500);
  const bibleSlice = bibleContextForChapter(bible, chapterNum, outline);
  const tail = existingProse.length > 3500 ? existingProse.slice(-3500) : existingProse;

  const user = [
    "BOOK: "+story.title,
    bibleSlice,
    "",
    "TASK: Continue Scene "+sceneNumber+" of Chapter "+chapterNum+" from the exact point it stopped.",
    "Do not recap. Do not restart. Do not contradict prior text.",
    "Remaining target word count: "+remaining+" words.",
    "Maximum words to write in THIS response: "+maxThisCall+" words.",
    "Complete the scene's remaining beats and land the outcome: "+(scene.sceneOutcome||""),
    "",
    "Maintain: same POV ("+(scene.povCharacter||"")+"), same emotional tone, same character voices, current relationship status, current conflict state.",
    "",
    "EXISTING SCENE PROSE (continue immediately after this):",
    "──────────",
    tail,
    "──────────",
    "",
    "Continue now. Pick up mid-flow. No preamble. No recap."
  ].join("\n");

  return await apiCall(SYS_SCENE, user, Math.min(6000, Math.max(2000, Math.round(maxThisCall * 1.6))), MODEL_CONFIG.sceneProse);
}

export async function summarizeScene(story, bible, chapterNum, sceneNumber, scene, sceneProse) {
  const user = [
    "Summarize this scene for the continuity tracker.",
    "BOOK: "+story.title,
    "Chapter "+chapterNum+", Scene "+sceneNumber+" — "+(scene.sceneTitle||""),
    "POV: "+(scene.povCharacter||""),
    "Scene card purpose: "+(scene.scenePurpose||""),
    "",
    "PROSE:",
    sceneProse.slice(0, 5000),
    "",
    "Return a compact JSON object with these keys:",
    "  sceneNumber ("+sceneNumber+"),",
    "  majorEvents (array of 1-3 strings, each max 12 words — what happened),",
    "  characterChanges (array of 0-2 strings, each max 12 words — internal shifts),",
    "  relationshipChanges (array of 0-2 strings, each max 12 words — where the relationship moved),",
    "  newInformation (array of 0-2 strings, each max 12 words — facts the reader learned),",
    "  unresolvedThreads (array of 0-2 strings, each max 12 words — what carries forward to next scene/chapter)"
  ].join("\n");
  return await apiCallJSON(SYS_BIBLE, user, 1200, MODEL_CONFIG.summarize);
}

export async function completeChapterWrap(story, outline, chapterNum, scenes, sceneSummaries, sceneProse, bible) {
  const ch = outline.chapters[chapterNum-1];
  const assembled = scenes.map(s => sceneProse[s.sceneNumber] || "").join("\n\n");

  // Run the existing chapter continuity report on the assembled prose
  // (reuses generateContinuityReport which already handles three-state)
  return await generateContinuityReport(story, bible, chapterNum, assembled, outline);
}

export async function generatePackagePart1(story, outline, bible) {
  const ctx = publishingStoryContext(story, outline, bible);
  const user = [
    "Build the FIRST HALF of the Book Launch Package. Focus on positioning + titles + descriptions.",
    "",
    ctx,
    "",
    "Return a compact JSON object with these exact keys:",
    "",
    "positioning: object with primaryGenre (max 6 words), secondaryGenre (max 6 words), readerAudience (max 18 words — specific demographic + psychographic), readerPromise (1 sentence, max 24 words), categoryPlacement (Amazon category path, max 14 words), marketPosition (max 22 words — what shelf this sits on, comparable bestsellers IMPLIED not named)",
    "",
    "titles: array of EXACTLY 12 title options. Each object has: title (max 6 words), commercialStrength (integer 1-10), memorability (integer 1-10), genreAlignment (integer 1-10), seriesPotential (integer 1-10). Range from punchy-commercial to literary-evocative. None should sound generic.",
    "",
    "readerPromiseDetail: object with emotionalOutcomes (array of 3-5 single-word emotions like 'Hope', 'Healing', 'Catharsis', 'Inspiration'), moodDescription (max 30 words — the emotional shape readers experience), targetEmotionalState (max 14 words — how readers feel when they finish)",
    "",
    "descriptions: object with these four keys:",
    "  amazonDescription (180-280 words — hook-first, agitate-then-promise structure, ends with stakes question. NO subtitle line, just punchy paragraphs)",
    "  extendedSalesDescription (500-650 words — three-act sales narrative: setup, complication, payoff. For websites and media kits)",
    "  backCoverCopy (90-130 words — retail-shelf version, tighter than Amazon, no spoilers)",
    "  oneSentenceHook (1 sentence, max 30 words — the elevator pitch)"
  ].join("\n");
  return await apiCallJSON(SYS_PUBLISHING, user, 4500, MODEL_CONFIG.publishing);
}

export async function generatePackagePart2(story, outline, bible, positioning) {
  const ctx = publishingStoryContext(story, outline, bible);
  const posCtx = positioning ? "\nPOSITIONING (already locked from Part 1): primary "+positioning.primaryGenre+" · audience "+positioning.readerAudience+" · promise "+positioning.readerPromise : "";
  const user = [
    "Build the SECOND PART of the Book Launch Package. Focus on cover + series + author brand.",
    "",
    ctx,
    posCtx,
    "",
    "Return a compact JSON object with these exact keys:",
    "",
    "coverStrategy: object with:",
    "  direction (max 6 words — visual genre direction, e.g. 'Premium literary Black romance'),",
    "  visualElements (object with characterAge (string max 10 words), characterStyle (max 14 words — clothing/styling), colorPalette (array of 3-5 color strings, max 4 words each), typography (max 14 words — title + author treatment), mood (max 12 words), composition (max 18 words — what is on the cover and how arranged)),",
    "  aiCoverPrompts (object with midjourney (string 60-100 words — full Midjourney v6 prompt with style descriptors, aspect ratio, lighting), gemini (string 60-100 words — Gemini-style descriptive prompt), canvaDirection (string 40-70 words — practical Canva direction with template type, key elements, font pairing, color picks))",
    "",
    "seriesBranding: object with:",
    "  seriesName (max 5 words — evocative, ownable),",
    "  namingConvention (max 16 words — the pattern for book titles in this series, e.g. 'The [Archetype]' or '[Verb] [Object]'),",
    "  visualIdentity (max 22 words — what visually connects every book in this series),",
    "  tagline (max 14 words — the series promise in one line),",
    "  futureBooks (array of 4 objects, each with bookNumber (integer 2-5), proposedTitle (max 6 words), concept (max 22 words — one-sentence premise that fits the series))",
    "",
    "authorBrand: object with:",
    "  positioning (max 6 words — author's subgenre niche, e.g. 'Power & Purpose Romance'),",
    "  tagline (max 14 words — author's reader promise, what to expect from every book they release),",
    "  subgenreSpecialty (max 14 words — what they uniquely write),",
    "  audiencePromise (max 22 words — what readers can count on across the catalog),",
    "  comparableAuthorShelf (max 18 words — describe the shelf this author belongs on; do NOT name specific authors)"
  ].join("\n");
  return await apiCallJSON(SYS_PUBLISHING, user, 4500, MODEL_CONFIG.publishing);
}

export async function generatePackagePart3(story, outline, bible, positioning) {
  const ctx = publishingStoryContext(story, outline, bible);
  const posCtx = positioning ? "\nPOSITIONING (locked): primary "+positioning.primaryGenre+" · audience "+positioning.readerAudience+" · promise "+positioning.readerPromise : "";
  const user = [
    "Build the THIRD PART of the Book Launch Package. Focus on marketing assets + adaptation + readiness.",
    "",
    ctx,
    posCtx,
    "",
    "Return a compact JSON object with these exact keys:",
    "",
    "marketingAssets: object with:",
    "  socialMediaPosts (array of 5 strings — each 1 Instagram/Threads-ready post, 35-60 words, hook-first, no hashtag spam),",
    "  launchPosts (array of 3 strings — launch-week announcement posts, 45-70 words each, with clear CTA),",
    "  readerMagnet (string 40-70 words — the bonus content offered for newsletter signup. Describe what it is and why readers want it),",
    "  newsletterContent (string 100-160 words — a launch newsletter the author can send to their list),",
    "  bookClubQuestions (array of 6 strings — discussion questions, each 12-22 words, no yes/no questions),",
    "  characterProfiles (array of 2 objects, one per lead, each with name (string) and profile (60-100 word character profile a reader could share on Pinterest)),",
    "  pressRelease (string 140-200 words — third-person announcement style, leads with the hook),",
    "  mediaKit (string 100-160 words — what the author can send to bloggers/podcasters: book summary + comp shelf + author quote)",
    "",
    "adaptationReadiness: object with these six sub-objects, each with score (integer 1-10) and reason (max 22 words):",
    "  audiobook,",
    "  podcastSeries,",
    "  motionComic,",
    "  youtubeSeries,",
    "  aiVideoAdaptation,",
    "  streamingAdaptation",
    "Plus a top-level recommendation (max 24 words — single-paragraph guidance on which adaptations to pursue first)",
    "",
    "commercialReadiness: object with:",
    "  score (number 1-10, can be decimal),",
    "  strengths (array of 3-4 strings, each max 16 words — what's commercially strong),",
    "  concerns (array of 1-3 strings, each max 16 words — what could limit market reach or be polished),",
    "  publishingRecommendation (max 36 words — concrete next step: 'Pitch agents' / 'KDP direct' / 'Polish for X' / 'Build series first' etc.)"
  ].join("\n");
  return await apiCallJSON(SYS_PUBLISHING, user, 4500, MODEL_CONFIG.publishing);
}

export async function generateBookLaunchPackage(story, outline, bible, onProgress) {
  if (onProgress) onProgress("Generating positioning, titles, descriptions...");
  const part1 = await generatePackagePart1(story, outline, bible);
  if (onProgress) onProgress("Generating cover strategy, series branding, author brand...");
  const part2 = await generatePackagePart2(story, outline, bible, part1.positioning);
  if (onProgress) onProgress("Generating marketing assets, adaptation, readiness score...");
  const part3 = await generatePackagePart3(story, outline, bible, part1.positioning);
  return { ...part1, ...part2, ...part3 };
}

export async function generateOutlineFromImport(rawOutlineText, story, targetWordCount, chapterCount) {
  const avgWords = Math.round((targetWordCount||80000) / (chapterCount||24));

  const user = [
    "Convert this author's existing outline into the Obsidian chapter card format.",
    "Honor the author's structure and content exactly — do not rewrite or reorder.",
    "Fill in any missing structural fields by inferring from context.",
    "",
    "BOOK: " + story.title,
    story.heroine ? "HEROINE: " + story.heroine.name + " — " + story.heroine.occupation : "",
    story.hero ? "HERO: " + story.hero.name + " — " + story.hero.occupation : "",
    story.storyDNA ? "GENRE/TONE: " + story.storyDNA.genreBlend + " · " + story.storyDNA.tone : "",
    story.relationshipArc ? "RELATIONSHIP ARC: " + (story.relationshipArc||[]).join(" → ") : "",
    "",
    "AUTHOR'S OUTLINE (convert this — do not change the story):",
    rawOutlineText,
    "",
    "Return a compact JSON object with key 'chapters' = array of chapter card objects.",
    "Each chapter card must have these keys:",
    "number (integer, sequential from 1),",
    "title (max 5 words — from the outline if given, else infer),",
    "pov (heroine | hero | character name — infer from outline),",
    "scene (1 sentence max 16 words — physical setting + situation),",
    "beat (1 sentence max 18 words — emotional purpose of this chapter),",
    "arcStage (which relationship arc stage this serves),",
    "targetWordCount (integer — vary around " + avgWords + ", range " +
      Math.round(avgWords*0.8) + "-" + Math.round(avgWords*1.2) + "),",
    "cliffhangerOrTurn (1 phrase max 12 words — chapter-end hook),",
    "continuityNotes (1 phrase max 14 words — what must carry forward)"
  ].filter(Boolean).join("\n");

  const tokenBudget = Math.max(4500, Math.ceil(rawOutlineText.length / 8) + 2000);
  return await apiCallJSON(SYS_STORY, user, Math.min(8000, tokenBudget), MODEL_CONFIG.importOutline);
}

export async function generateBibleFromProse(proseText, story, chapterCount) {
  // Analyze existing prose to extract a Story Bible
  // Cap prose to avoid token overflow — take first 8000 chars + last 2000
  const cap = 8000;
  const tail = 2000;
  const sampledProse = proseText.length > cap + tail
    ? proseText.slice(0, cap) + "\n\n[...middle omitted...]\n\n" + proseText.slice(-tail)
    : proseText;

  const user = [
    "Analyze this author's existing prose and extract a complete Story Bible.",
    "The author has written some chapters already and wants to continue.",
    "Build the bible from what's ACTUALLY in the prose — do not invent.",
    "If something isn't in the prose, mark it as 'not yet established'.",
    "",
    "BOOK: " + story.title,
    "CHAPTERS WRITTEN: approximately " + chapterCount,
    "",
    "EXISTING PROSE:",
    sampledProse,
    "",
    "Return a compact JSON object matching this exact Story Bible structure:",
    "world: { genre (max 5 words), themes (array of 3-5 strings), setting (max 12 words), tone (max 14 words), timeline (max 12 words) }",
    "characters: array — extract ALL characters who appear in the prose.",
    "  Each: name, role (heroine|hero|supporting), age (or 'unknown'), appearance (max 18 words from prose), occupation, wound (infer from behavior/internal thoughts), goals (from prose), fears (infer), family (from prose), relationships (from prose), speechPatterns (from dialogue — how do they actually speak?)",
    "relationship: { beginningState (max 12 words — how they started), currentState (max 12 words — where they are at the END of the written prose), desiredEndState (infer from genre/tropes), obstacle (from prose), milestones (array of { chapter, event } for milestones already reached) }",
    "plot: { mainConflict (1 sentence), subplots (array of 2-4 strings from prose), mysteries (array of { name, status } for open questions raised so far), secrets (array of { owner, secret, revealedIn } — secrets established in the prose), clues (array of { chapter, clue, payoff } for setups planted), reveals (empty array — these are future) }",
    "chapters: array — for each chapter in the prose, create: { number, pov, purpose (max 14 words), majorEvents (array of 2-4 strings), characterChanges (array of 0-3 strings), unresolvedThreads (array of 1-3 strings carrying forward) }"
  ].filter(Boolean).join("\n");

  return await apiCallJSON(SYS_BIBLE, user, 4500, MODEL_CONFIG.importProse);
}

export async function generateContinuationOutline(story, bible, writtenChapterCount,
                                            totalChapterCount, targetWordCount) {
  const remainingChapters = totalChapterCount - writtenChapterCount;
  if (remainingChapters <= 0) throw new Error("No remaining chapters to outline.");

  const avgWords = Math.round((targetWordCount||80000) / totalChapterCount);

  // Bible snapshot
  const charLines = (bible.characters||[]).map(c =>
    c.name + " (" + c.role + "): wound=" + c.wound + ", speech=" + c.speechPatterns
  ).join(" | ");
  const openMysteries = (bible.plot?.mysteries||[]).filter(m=>m.status!=="resolved")
    .map(m=>m.name).join(", ");
  const unresolvedSecrets = (bible.plot?.secrets||[]).filter(s=>!s.revealedIn)
    .map(s=>s.owner+": "+s.secret).join(" | ");
  const subplots = (bible.plot?.subplots||[]).join(", ");

  // What's happened so far
  const chapterHistory = (bible.chapters||[]).map(c =>
    "Ch" + c.number + ": " + (c.majorEvents||[]).join("; ") +
    (c.unresolvedThreads?.length ? " → open: " + c.unresolvedThreads.join("; ") : "")
  ).join(" || ");

  const user = [
    "Generate the continuation outline for the REMAINING " + remainingChapters +
    " chapters of this novel.",
    "The author has already written chapters 1-" + writtenChapterCount + ".",
    "Pick up EXACTLY where the story left off. Do not rewrite or recap what's done.",
    "",
    "BOOK: " + story.title,
    "READER PROMISE: " + (story.readerPromise||""),
    "RELATIONSHIP ARC: " + (story.relationshipArc||[]).join(" → "),
    story.externalConflictSummary ? "EXTERNAL CONFLICT: " + story.externalConflictSummary : "",
    story.relationshipObstacleSummary ? "RELATIONSHIP OBSTACLE: " + story.relationshipObstacleSummary : "",
    "",
    "STORY BIBLE SNAPSHOT:",
    "Characters: " + charLines,
    "Relationship NOW (end of Ch" + writtenChapterCount + "): " +
      (bible.relationship?.currentState||"unknown"),
    "Desired end state: " + (bible.relationship?.desiredEndState||"HEA"),
    openMysteries ? "Open mysteries: " + openMysteries : "",
    unresolvedSecrets ? "Unrevealed secrets: " + unresolvedSecrets : "",
    subplots ? "Active subplots: " + subplots : "",
    "",
    "WHAT HAS HAPPENED (Ch1-" + writtenChapterCount + "):",
    chapterHistory,
    "",
    "Generate exactly " + remainingChapters + " chapter cards " +
    "(chapters " + (writtenChapterCount+1) + " through " + totalChapterCount + ").",
    "Map remaining arc stages proportionally.",
    "Resolve all open mysteries and secrets before the final chapter.",
    "Land the relationship arc at the desired end state.",
    "",
    "Return JSON with key 'chapters' = array of EXACTLY " + remainingChapters +
    " chapter card objects with keys:",
    "number, title (max 5 words), pov (heroine|hero|character name), scene (1 sentence max 16 words), beat (1 sentence max 18 words), arcStage (which of the 7 arc stages), targetWordCount (integer near " + avgWords + "), cliffhangerOrTurn (1 phrase max 12 words), continuityNotes (1 phrase max 14 words)"
  ].filter(Boolean).join("\n");

  const tokenBudget = Math.max(4500, remainingChapters * 250);
  return await apiCallJSON(SYS_STORY, user, Math.min(8000, tokenBudget), MODEL_CONFIG.continuation);
}

export async function writeChapterProse(story, outline, chapterNum, universe, bible, opts) {
  const ch = outline.chapters[chapterNum-1];
  const prevBeats = outline.chapters.slice(0, chapterNum-1).map(c=>"Ch"+c.number+": "+c.beat).join(" | ");

  // Build chapter-specific bible slice (compact, only what's relevant for THIS chapter)
  const bibleSlice = bibleContextForChapter(bible, chapterNum, outline);

  // Fallback supporting cast context if no bible yet
  const supportLines = (story.supporting||[]).map(s=>"  - "+s.name+" ("+s.role+"): "+s.purpose).join("\n");
  let bibleCtx = "";
  if (!bible && supportLines) bibleCtx += "\nSUPPORTING CAST (use accurate names + roles):\n"+supportLines;
  if (universe && universe.books && universe.books.length > 1) {
    const otherBooks = universe.books.filter(b => b.title !== story.title).slice(0,3);
    const crossRefs = [];
    otherBooks.forEach(b=>{
      if (b.heroine) crossRefs.push(b.heroine.name+" ("+b.heroine.occupation+", from "+b.title+")");
      if (b.hero) crossRefs.push(b.hero.name+" ("+b.hero.occupation+", from "+b.title+")");
    });
    if (crossRefs.length) bibleCtx += "\n\nUNIVERSE CHARACTERS (other books in \""+universe.name+"\" — reference only if natural, do not force):\n  "+crossRefs.join("\n  ");
    bibleCtx += "\n\nMaintain continuity with the universe genres/themes: "+(universe.genres||[]).join(", ")+" · "+(universe.themes||[]).join(", ");
  }

  const user = [
    "Write Chapter "+ch.number+" of this novel.",
    universe ? "UNIVERSE: "+universe.name : "",
    "BOOK: "+story.title,
    "PREMISE: "+story.hook,
    bibleSlice,
    bibleCtx,
    prevBeats && !bible ? "WHAT HAS HAPPENED (outline beats): "+prevBeats : "",
    "",
    "CHAPTER "+ch.number+": "+ch.title,
    "POV: "+ch.pov,
    "Scene: "+ch.scene,
    "Beat to deliver: "+ch.beat,
    "Arc stage: "+ch.arcStage,
    "",
    "Write the OPENING of this chapter as prose.",
    "Target word count for the FULL chapter: "+(ch.targetWordCount || (opts && opts.desiredWordCount) || 2500)+" words.",
    "MAXIMUM words to write in THIS response: "+((opts && opts.maxWordsPerGen) || 2500)+" words.",
    "If the chapter target exceeds the max-per-response, write the strongest opening "+(opts && opts.maxWordsPerGen ? opts.maxWordsPerGen : 2500)+" words possible and stop at a natural breath point — the user will call Continue to extend.",
    "Open with a vivid scene. Use sensory detail, internal monologue from the POV character, sharp dialogue.",
    "STRICTLY maintain consistency with the Story Bible above — character speech patterns, current relationship state, open plot threads.",
    "Do not skip the current relationship state. Do not resolve open mysteries unless this chapter is designated for that.",
    ch.cliffhangerOrTurn ? "Aim toward this chapter-end turn (if you reach it in this response): "+ch.cliffhangerOrTurn : "",
    "Begin the chapter now — no headers, no labels, just the prose."
  ].filter(Boolean).join("\n");
  const maxTok = Math.min(8000, Math.max(2500, Math.round(((opts && opts.maxWordsPerGen) || 2500) * 1.6)));
  return await apiCall(SYS_CHAPTER, user, maxTok, MODEL_CONFIG.prose);
}

export async function continueChapter(story, outline, chapterNum, universe, bible, existingProse, opts) {
  const ch = outline.chapters[chapterNum-1];
  const o = opts || {};
  const remainingWords = Math.max(500, (ch.targetWordCount || o.desiredWordCount || 2500) - (o.currentWordCount || 0));
  const maxThisCall = Math.min(remainingWords + 200, o.maxWordsPerGen || 2500);

  const bibleSlice = bibleContextForChapter(bible, chapterNum, outline);

  // Use the last ~800 words as anchor so the model picks up the exact voice/scene
  const tail = existingProse.length > 4000 ? existingProse.slice(-4000) : existingProse;

  const remainingBeats = [
    ch.beat ? "Scene beat to land: "+ch.beat : "",
    ch.cliffhangerOrTurn ? "Chapter-end turn: "+ch.cliffhangerOrTurn : "",
    ch.continuityNotes ? "Continuity notes: "+ch.continuityNotes : ""
  ].filter(Boolean).join(" · ");

  const user = [
    "BOOK: "+story.title,
    bibleSlice,
    "",
    "TASK: Continue Chapter "+chapterNum+" from the exact point where it stopped.",
    "Do not recap. Do not restart the chapter. Do not contradict prior text.",
    "Remaining target word count: "+remainingWords+" words.",
    "Maximum words to write in THIS response: "+maxThisCall+" words.",
    "Complete the remaining scene beats: "+(remainingBeats || "advance to the chapter's emotional turn"),
    "",
    "Maintain:",
    "- same POV ("+ch.pov+")",
    "- same emotional tone",
    "- same character voices",
    "- current relationship status (per the Story Bible)",
    "- current conflict state (per the Story Bible)",
    "",
    "EXISTING CHAPTER PROSE (continue immediately after this, with no preamble — pick up mid-flow):",
    "──────────",
    tail,
    "──────────",
    "",
    "Continue now. Begin with the very next sentence. No labels, no recap, no scene break unless dramatically warranted."
  ].filter(Boolean).join("\n");

  const maxTok = Math.min(8000, Math.max(2500, Math.round(maxThisCall * 1.6)));
  return await apiCall(SYS_CHAPTER, user, maxTok, MODEL_CONFIG.prose);
}

export async function summarizeChapter(story, bible, chapterNum, chapterProse, outline) {
  const ch = (outline.chapters||[])[chapterNum-1] || {};
  const user = [
    "Summarize this chapter for the continuity tracker.",
    "BOOK: "+story.title,
    "CHAPTER "+chapterNum+" ("+(ch.pov||"")+" POV) — beat: "+(ch.beat||""),
    "",
    "PROSE:",
    chapterProse.slice(0, 6000),
    "",
    "Return a compact JSON object with these keys:",
    "summary: 2-3 sentence summary, max 60 words total",
    "keyEvents: array of 2-4 strings, each max 12 words — what happened plot-wise",
    "characterArcs: array of 0-3 strings, each max 14 words — who shifted internally and how",
    "openThreads: array of 0-3 strings, each max 12 words — what is unresolved and must echo forward",
    "closedThreads: array of 0-2 strings, each max 12 words — what was resolved in this chapter"
  ].join("\n");
  return await apiCallJSON(SYS_BIBLE, user, 1200, MODEL_CONFIG.summarize);
}

export async function generateUniverseLore(universe) {
  const hasBooks = universe.books && universe.books.length > 0;
  let booksContext = "";
  if (hasBooks) {
    booksContext = universe.books.map((b,i)=>(
      "BOOK "+(i+1)+": "+b.title+
      "\n  Premise: "+b.hook+
      "\n  Heroine: "+(b.heroine?b.heroine.name+" — "+b.heroine.occupation+" — wound: "+b.heroine.wound:"unknown")+
      "\n  Hero: "+(b.hero?b.hero.name+" — "+b.hero.occupation+" — wound: "+b.hero.wound:"unknown")+
      "\n  Supporting: "+((b.supporting||[]).map(s=>s.name+" ("+s.role+")").join(", "))
    )).join("\n\n");
  }

  const sys = "You are a fiction story architect building a Universe Bible — the master document that maintains continuity, lore, and expansion opportunities across multiple books in a fictional universe. Output strict JSON only. Start with { end with }. No markdown, no prose, no explanation.";

  const userParts = [
    "UNIVERSE: "+universe.name,
    "GENRES: "+(universe.genres||[]).join(", "),
    "THEMES: "+(universe.themes||[]).join(", "),
  ];
  if (universe.vision) userParts.push("FOUNDING VISION: "+universe.vision);
  if (hasBooks) {
    userParts.push("");
    userParts.push("BOOKS ALREADY IN THIS UNIVERSE:");
    userParts.push(booksContext);
    userParts.push("");
    userParts.push("Synthesize the universe bible from these books. Treat existing characters as canonical. Build cross-book continuity.");
  } else {
    userParts.push("");
    userParts.push("This universe has no books yet. Generate a FOUNDATIONAL universe bible — the world, the family architecture, the kinds of stories this universe will tell. Treat this as the worldbuilding seed document.");
  }
  userParts.push("");
  userParts.push("Return compact JSON. KEEP VALUES SHORT.");
  userParts.push("Keys (use these exact keys):");
  userParts.push("familyTrees: array of 1-3 objects, each with surname (string), members (array of 3-7 objects each with name, role, age, status — keep each field max 6 words), notes (1 sentence max about the family's place in the universe)");
  userParts.push("characterMap: array of 4-10 objects, each with name, book (book title or 'unwritten'), role (max 4 words), traits (max 8 words), connections (array of 1-3 character names)");
  userParts.push("timeline: array of 5-10 objects, each with year (string or era like 'Year 1' or '1985'), event (1 sentence max), book (title or 'background')");
  userParts.push("expansionOpportunities: array of 4-6 strings, each 1 sentence max — thematic directions the universe can grow");
  userParts.push("spinoffOpportunities: array of 3-5 objects, each with character (name from this universe), why (1 sentence why they deserve their own book), premise (1 sentence)");
  userParts.push("futureBookRecommendations: array of 3-5 objects, each with workingTitle (max 6 words), premise (2 sentences max), mainCharacter (name, can be new or existing)");

  const user = userParts.join("\n");
  return await apiCallJSON(sys, user, 4000, MODEL_CONFIG.universe);
}
