import { useState, useCallback, useEffect, useRef } from "react";

const FONT_CSS = `@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400;1,600&family=Nunito:wght@300;400;500;600;700&display=swap');`;

const C = {
  bg:"#FCFCF9", surface:"#FFFFFF", card:"#F8F7F2", cardLight:"#FFFFFF",
  border:"#E8E5DE", borderLight:"#EFEDE7",
  text:"#1A1612", muted:"#6B665E", faint:"#F2F0EA",
  gold:"#B8841C", amber:"#C8941F", glow:"rgba(184,132,28,0.10)",
  manuscript:"#FAF6EC", manuscriptBorder:"#EFE6CF",
  successBg:"#E8F5F0", successText:"#2D8B7A",
  warningBg:"#FAF5E8", warningText:"#B07A1F",
  errorBg:"#FBE9E7", errorText:"#B8342D",
};

const LANES = [
  { id:"healing",     label:"Emotional Healing",          color:"#A070C8", desc:"Deep wounds, vulnerability, transformation, catharsis" },
  { id:"community",   label:"Community Romance",           color:"#D88830", desc:"Friend groups, family gatherings, chosen community" },
  { id:"luxury",      label:"Luxury / Black Excellence",   color:"#D4A828", desc:"CEOs, power couples, ambition, aspirational world" },
  { id:"family",      label:"Family Saga",                 color:"#C05060", desc:"Generational conflict, legacy, family business drama" },
  { id:"urban",       label:"Urban Drama",                 color:"#B8342D", desc:"Loyalty, betrayal, danger, power, secrets, consequences — high-stakes urban drama" },
  { id:"reinvention", label:"Reinvention Romance",         color:"#30A888", desc:"Midlife, career change, divorce, starting over" },
  { id:"suspense",    label:"Romantic Suspense",           color:"#4888C8", desc:"Danger, secrets, investigations alongside love" },
  { id:"faith",       label:"Faith & Purpose",             color:"#C8A030", desc:"Calling, spiritual growth, moral dilemmas" },
  { id:"eroticUrban",  label:"Erotic Urban Romance",        color:"#9B2D4F", desc:"Desire, chemistry, fantasy, sexual confidence, intimate transformation" },
  { id:"sexyContemp",  label:"Sexy Contemporary Black Romance", color:"#C0607A", desc:"Modern love, chemistry, grown conversations, warmth, emotional heat" },
  { id:"eroticDrama",  label:"Erotic Urban Drama",          color:"#C0303A", desc:"Passion meets loyalty, jealousy, betrayal, possessive love, volatility" },
  { id:"luxuryErotic", label:"Luxury Erotic Black Romance", color:"#B07A2A", desc:"Wealth, power couples, sensual fantasy, status, aspirational desire" },
  { id:"streetLit",    label:"Street Lit / Urban Fiction",  color:"#7A2018", desc:"Loyalty, betrayal, ambition, danger, money, survival, revenge, consequences" },
  { id:"crimeSaga",    label:"Crime Family Saga",           color:"#5A2030", desc:"Legacy, succession, empire, family loyalty, inheritance, secrets, betrayal" },
];

const TROPES = [
  "Enemies to Lovers","Forced Proximity","Billionaire / CEO","Secret Baby",
  "Fake Dating","Second Chance","Small Town Return","Single Parent",
  "Workplace Romance","Family Empire","Marriage of Convenience","Opposites Attract",
  "Best Friend's Sibling","Forbidden Love","Age Gap","Grumpy x Sunshine",
  "Hurt / Comfort","Protective Hero","Friends to Lovers","Reunited Lovers",
  "Office Rivals","Redemption Arc","Sports Romance","Military Romance",
];

const HEAT = [
  { level:1, label:"Sweet",     emoji:"🌸", color:"#2D8B7A", desc:"Tension + emotional intimacy only" },
  { level:2, label:"Moderate",  emoji:"🌹", color:"#C09030", desc:"Kissing, romance, mild sensuality" },
  { level:3, label:"Steamy",    emoji:"🔥", color:"#D06030", desc:"Romantic tension + tasteful scenes" },
  { level:4, label:"High Heat", emoji:"🌶️", color:"#C83050", desc:"Frequent, explicit romantic scenes" },
  { level:5, label:"Very High", emoji:"💥", color:"#A01030", desc:"Explicit throughout" },
];

// ── Spice Level Framework ──────────────────────────────────────
// Controls how much the story emphasizes romantic and physical chemistry.
// Spice level NEVER replaces character development, emotional depth, or plot.
const SPICE_LEVELS = [
  { level: 1, label: "Sweet", focus: "Longing · Connection · Emotional intimacy",
    chars: ["Kissing", "Hand-holding", "Hugs", "Fade-to-black moments"],
    summary: "Tender, longing-focused. Physical affection is restrained and reverent." },
  { level: 2, label: "Warm", focus: "Chemistry · Romantic tension",
    chars: ["Frequent flirting", "Physical awareness", "Growing attraction"],
    summary: "Tension and chemistry simmer. Touches matter. Attraction is named but not consummated on page." },
  { level: 3, label: "Steamy", focus: "Strong chemistry",
    chars: ["Romantic tension is a major component", "Attraction influences decisions", "Relationship gets meaningful page time"],
    summary: "Chemistry drives scenes. On-page intimacy is present but selective." },
  { level: 4, label: "Hot", focus: "High romantic intensity",
    chars: ["Strong attraction", "Frequent romantic moments", "Relationship chemistry central"],
    summary: "Romantic scenes are vivid and frequent. Chemistry is a dominant story engine." },
  { level: 5, label: "Scorching", focus: "Maximum romance intensity",
    chars: ["Romantic chemistry dominant throughout", "Physical connection major story element"],
    summary: "Romance and physical connection are the through-line. Every scene serves the relationship." }
];

// ── Romance Intensity Profile ──────────────────────────────────
// FOUR DIMENSIONS, each 1-5. Together they shape the emotional and romantic experience.
// Higher values do not mean more sex — they mean more relationship-centered storytelling.
const INTENSITY_DIMENSIONS = [
  { key: "attractionIntensity", label: "Attraction Intensity",
    desc: "How strong the chemistry between leads is on the page",
    scale: ["Subtle attraction", "Noticeable attraction", "Frequent chemistry", "Strong attraction", "Intense attraction"] },
  { key: "emotionalIntimacy", label: "Emotional Intimacy",
    desc: "How deeply the characters open up to each other",
    scale: ["Emotionally guarded", "Occasional vulnerability", "Growing emotional connection", "Deep emotional sharing", "Transformational emotional intimacy"] },
  { key: "physicalAffection", label: "Physical Affection",
    desc: "How much physical connection appears on page (not the same as spice)",
    scale: ["Minimal affection", "Occasional affection", "Regular physical affection", "Significant physical affection", "Physical connection is a major story element"] },
  { key: "relationshipFocus", label: "Relationship Focus",
    desc: "How much of the novel is dedicated to the relationship vs external plot",
    scale: ["Romance subplot", "Secondary plot", "Balanced with external plot", "Primary story element", "Dominant story focus"] }
];

const DEFAULT_INTENSITY = { attractionIntensity:3, emotionalIntimacy:3, physicalAffection:2, relationshipFocus:3 };

// ── Erotic Romance Engine (W3) ─────────────────────────────────
// A first-class engine, independent of Spice Level. Spice = content/heat
// intensity; Erotic Romance = relationship/desire/chemistry/intimacy dynamics.
// Each dimension 1-5. A story can have high Erotic Romance + low Spice, etc.
const EROTIC_DIMENSIONS = [
  { key:"desireIntensity", label:"Desire Intensity",
    desc:"How strongly longing and wanting drive the characters",
    scale:["Faint longing","Simmering want","Strong desire","Consuming desire","All-consuming hunger"] },
  { key:"chemistryFrequency", label:"Chemistry Frequency",
    desc:"How often charged, electric moments appear on the page",
    scale:["Rare sparks","Occasional charge","Frequent chemistry","Constant pull","Magnetic throughout"] },
  { key:"fantasyFulfillment", label:"Fantasy Fulfillment",
    desc:"How much the story delivers aspirational romantic/sensual fantasy",
    scale:["Grounded","Lightly aspirational","Fantasy-leaning","Fantasy-forward","Full fantasy escape"] },
  { key:"emotionalVulnerability", label:"Emotional Vulnerability",
    desc:"How exposed and open the characters let themselves become",
    scale:["Guarded","Cautious","Opening up","Deeply vulnerable","Fully laid bare"] },
  { key:"relationshipIntensity", label:"Relationship Intensity",
    desc:"How all-consuming the central relationship feels",
    scale:["Casual","Building","Intense","All-in","Obsessive devotion"] },
  { key:"forbiddenFactor", label:"Forbidden Factor",
    desc:"How taboo, secret, or off-limits the attraction is",
    scale:["No barrier","Mild taboo","Forbidden pull","High-stakes secret","Truly off-limits"] },
  { key:"selfDiscovery", label:"Self Discovery",
    desc:"How much the heroine reclaims confidence, desire, and identity",
    scale:["Static","Slight growth","Reawakening","Major reclamation","Full transformation"] },
  { key:"sensualAtmosphere", label:"Sensual Atmosphere",
    desc:"How sensory, charged, and atmospheric the prose feels",
    scale:["Plain","Warm","Sensual","Heady","Saturated with sensuality"] },
  { key:"romanticRisk", label:"Romantic Risk",
    desc:"How much the characters gamble emotionally for love/desire",
    scale:["Safe","Cautious risk","Real risk","High stakes","Everything on the line"] },
  { key:"intimacyAsCharacterGrowth", label:"Intimacy as Character Growth",
    desc:"How much intimate moments change who the characters are",
    scale:["Decorative","Minor","Meaningful","Transformative","Central to the arc"] }
];

const DEFAULT_EROTIC = { desireIntensity:3, chemistryFrequency:3, fantasyFulfillment:3, emotionalVulnerability:3, relationshipIntensity:3, forbiddenFactor:2, selfDiscovery:3, sensualAtmosphere:3, romanticRisk:3, intimacyAsCharacterGrowth:3 };

// Category calibration profiles — selecting one of these lanes auto-populates
// the engines from these baselines (still manually adjustable afterward).
// Authors are MARKET-PATTERN references only; never imitate or name them.
const EROTIC_CATEGORIES = {
  eroticUrban: {
    name:"Erotic Urban Romance",
    readerPromise:"A sensual, emotionally charged romance centered on desire, chemistry, fantasy, confidence, relationship intensity, and romantic transformation.",
    tone:["sensual","passionate","emotionally intense","relationship-driven","confident","grown"],
    pacing:"moderate to fast",
    coreThemes:["desire","chemistry","sexual confidence","fantasy fulfillment","forbidden attraction","self-discovery","healing through intimacy","relationship transformation","emotional vulnerability","trust"],
    characterTypes:["confident heroine rediscovering desire","woman healing after betrayal","successful professional with hidden loneliness","charismatic love interest","emotionally guarded alpha hero","artist or creative hero","old flame with unfinished tension"],
    conflicts:["forbidden attraction","old flame resurfaces","relationship after betrayal","desire conflicts with reputation","friends become lovers","emotional walls block intimacy","secret relationship","independence vs commitment","public image vs private desire","trust after heartbreak"],
    settings:["Atlanta nightlife","luxury condo","creative studio","professional conference","private resort","upscale lounge","spa or wellness retreat","music industry","destination getaway"],
    sceneExpectations:["frequent romantic tension","charged dialogue","sensory atmosphere","private moments with emotional stakes","slow escalation of desire","desire tied to character growth","romance scenes that change the relationship dynamic"],
    avoid:["spice replacing plot","flat chemistry","intimacy without emotional consequence","low relationship stakes"],
    erotic:{ desireIntensity:5, chemistryFrequency:5, fantasyFulfillment:5, emotionalVulnerability:4, relationshipIntensity:5, forbiddenFactor:3, selfDiscovery:4, sensualAtmosphere:5, romanticRisk:4, intimacyAsCharacterGrowth:4 },
    romance:{ attractionIntensity:5, emotionalIntimacy:4, physicalAffection:5, relationshipFocus:5 },
    spice:5
  },
  sexyContemp: {
    name:"Sexy Contemporary Black Romance",
    readerPromise:"A modern Black love story with strong chemistry, emotional connection, humor, grown conversations, and satisfying romantic progression.",
    tone:["modern","romantic","warm","sexy","emotionally grounded","conversational"],
    pacing:"moderate",
    coreThemes:["modern love","chemistry","emotional maturity","friendship","trust","communication","healing","Black joy"],
    characterTypes:["creative professional","single parent","entrepreneur","divorced heroine","emotionally intelligent hero","best friend love interest","small business owner","writer","chef","teacher"],
    conflicts:["fear of commitment","work-life imbalance","old heartbreak","family expectations","friends-to-lovers tension","miscommunication with real stakes","career transition","second chance romance"],
    settings:["Black-owned business","creative studio","family gathering","neighborhood spot","wedding","small business"],
    sceneExpectations:["natural charged dialogue","warm chemistry","grown conversations","emotional honesty","romance central to the plot"],
    avoid:["manufactured drama","flat chemistry","spice without connection","low relationship stakes"],
    erotic:{ desireIntensity:4, chemistryFrequency:4, fantasyFulfillment:3, emotionalVulnerability:4, relationshipIntensity:4, forbiddenFactor:2, selfDiscovery:3, sensualAtmosphere:4, romanticRisk:3, intimacyAsCharacterGrowth:4 },
    romance:{ attractionIntensity:4, emotionalIntimacy:4, physicalAffection:4, relationshipFocus:5 },
    spice:4
  },
  eroticDrama: {
    name:"Erotic Urban Drama",
    readerPromise:"A sexy, high-drama relationship story where passion, loyalty, betrayal, jealousy, family pressure, and desire collide.",
    tone:["sexy","dramatic","possessive","emotionally volatile","high-chemistry","urban"],
    pacing:"fast to moderate",
    coreThemes:["passion","betrayal","jealousy","loyalty","family pressure","dangerous attraction","trust","possessive love"],
    characterTypes:["possessive protective hero","woman recovering from betrayal","ambitious heroine","single mother with guarded heart","hood-adjacent businessman","dangerous ex","best friend with hidden desire","celebrity or influencer heroine"],
    conflicts:["dangerous ex returns","secret relationship","relationship betrayal","love triangle","family interference","public humiliation","jealousy spiral","forbidden attraction","protective hero oversteps","trust after heartbreak"],
    settings:["upscale lounge","family event","city nightlife","luxury apartment","business front","influencer world"],
    sceneExpectations:["volatile high-chemistry moments","possessive tension","loyalty and betrayal beats","emotionally charged confrontations","passion tied to stakes"],
    avoid:["soft low-stakes misunderstandings as the core","flat chemistry","drama without emotional truth"],
    erotic:{ desireIntensity:5, chemistryFrequency:5, fantasyFulfillment:4, emotionalVulnerability:3, relationshipIntensity:5, forbiddenFactor:4, selfDiscovery:3, sensualAtmosphere:5, romanticRisk:5, intimacyAsCharacterGrowth:3 },
    romance:{ attractionIntensity:5, emotionalIntimacy:3, physicalAffection:5, relationshipFocus:5 },
    urbanDrama:{ loyaltyIntensity:4, powerStatusIntensity:3, dangerLevel:2, relationshipVolatility:5, familyDramaIntensity:4, betrayalRisk:4, consequenceLevel:4, moralityScale:3 },
    spice:5
  },
  luxuryErotic: {
    name:"Luxury Erotic Black Romance",
    readerPromise:"A sensual, aspirational romance centered on wealth, confidence, desire, power couples, emotional risk, and romantic fantasy fulfillment.",
    tone:["luxurious","sensual","aspirational","high-status","polished","romantic"],
    pacing:"moderate",
    coreThemes:["wealth","desire","confidence","power couples","luxury fantasy","emotional risk","status","public image vs private passion"],
    characterTypes:["billionaire CEO","luxury brand founder","celebrity-adjacent heroine","private chef","fashion designer","entertainment mogul","real estate developer","wealthy divorcee","power couple in crisis"],
    conflicts:["public scandal","forbidden workplace attraction","fake relationship becomes real","status gap","privacy vs public image","family pressure","old betrayal resurfaces","desire threatens reputation"],
    settings:["penthouse","private jet","destination getaway","luxury brand HQ","gala","upscale resort"],
    sceneExpectations:["polished sensual atmosphere","high-status settings","power-couple tension","fantasy fulfillment with emotional risk","desire that threatens reputation"],
    avoid:["gaudy materialism without feeling","flat chemistry","status without emotional stakes"],
    erotic:{ desireIntensity:5, chemistryFrequency:4, fantasyFulfillment:5, emotionalVulnerability:4, relationshipIntensity:4, forbiddenFactor:3, selfDiscovery:3, sensualAtmosphere:5, romanticRisk:4, intimacyAsCharacterGrowth:4 },
    romance:{ attractionIntensity:5, emotionalIntimacy:4, physicalAffection:5, relationshipFocus:5 },
    urbanDrama:{ loyaltyIntensity:3, powerStatusIntensity:5, dangerLevel:1, relationshipVolatility:3, familyDramaIntensity:3, betrayalRisk:3, consequenceLevel:3, moralityScale:2 },
    spice:5
  }
};
const EROTIC_LANE_IDS = Object.keys(EROTIC_CATEGORIES);

// ── Street Lit + Suspense engines (W4) ─────────────────────────
const STREETLIT_DIMENSIONS = [
  { key:"survivalPressure", label:"Survival Pressure", desc:"How much characters fight just to stay safe, free, or alive",
    scale:["Comfortable","Some pressure","Real stakes","Under siege","Life-or-death"] },
  { key:"empireBuilding", label:"Empire Building", desc:"How central building/holding money, territory, or power is",
    scale:["None","Side hustle","Growing operation","Major empire","Empire is the spine"] },
  { key:"betrayalRisk", label:"Betrayal Risk", desc:"How likely someone close turns on them",
    scale:["Trusting world","Minor doubts","Real risk","Betrayal looms","No one is safe"] },
  { key:"revengeDrive", label:"Revenge Drive", desc:"How much payback fuels the plot",
    scale:["None","Simmering","A motive","A mission","Revenge is everything"] },
  { key:"streetInfluence", label:"Street Influence", desc:"How present the street world, code, and culture is",
    scale:["Absent","Background","Present","Strong","Saturates the story"] },
  { key:"dangerLevel", label:"Danger Level", desc:"How dangerous the world is on the page",
    scale:["Safe","Tense","Dangerous","Deadly","Constant threat"] },
  { key:"loyaltyIntensity", label:"Loyalty Intensity", desc:"How much loyalty and ride-or-die bonds drive choices",
    scale:["Loose","Conditional","Strong","Ride-or-die","Loyalty above all"] },
  { key:"consequenceLevel", label:"Consequence Level", desc:"How real and lasting the fallout of choices is",
    scale:["Soft","Some cost","Real cost","Heavy fallout","Everything has a price"] },
  { key:"moralityScale", label:"Morality (Gray)", desc:"How morally gray the choices and characters are",
    scale:["Clear-cut","Mostly clear","Gray areas","Very gray","Survival morality"] },
  { key:"cliffhangerFrequency", label:"Cliffhanger Frequency", desc:"How often chapters end on turns, threats, or reveals",
    scale:["Rare","Occasional","Frequent","Most chapters","Relentless"] }
];
const DEFAULT_STREETLIT = { survivalPressure:2, empireBuilding:2, betrayalRisk:2, revengeDrive:2, streetInfluence:2, dangerLevel:2, loyaltyIntensity:3, consequenceLevel:2, moralityScale:2, cliffhangerFrequency:3 };

const SUSPENSE_DIMENSIONS = [
  { key:"mysteryLevel", label:"Mystery Level", desc:"How much an unanswered question drives the plot",
    scale:["None","Light","Present","Strong","Central mystery"] },
  { key:"dangerLevel", label:"Danger Level", desc:"How much physical danger threatens the leads",
    scale:["Safe","Uneasy","Dangerous","Deadly","Constant threat"] },
  { key:"conspiracyLevel", label:"Conspiracy Level", desc:"How wide and layered the hidden forces are",
    scale:["None","A secret","A scheme","A network","Deep conspiracy"] },
  { key:"psychologicalTension", label:"Psychological Tension", desc:"How much dread, paranoia, and mind-games build",
    scale:["Calm","Uneasy","Tense","High dread","Paranoid pressure"] },
  { key:"investigationFocus", label:"Investigation Focus", desc:"How much the plot is uncovering the truth",
    scale:["None","Minor","Present","Strong","Investigation drives it"] },
  { key:"twistIntensity", label:"Twist Intensity", desc:"How sharp and frequent the reversals are",
    scale:["None","Mild","Real twists","Major reversals","Reversal-driven"] }
];
const DEFAULT_SUSPENSE = { mysteryLevel:2, dangerLevel:2, conspiracyLevel:2, psychologicalTension:2, investigationFocus:2, twistIntensity:2 };

// Urban-fiction category profiles. Each lane maps to one; selecting it
// auto-populates whichever engines that category defines. Authors are
// MARKET-PATTERN references only — never imitate or name them.
const URBAN_CATEGORIES = {
  streetLit: {
    name:"Street Lit / Urban Fiction",
    readerPromise:"A fast-paced story of loyalty, betrayal, ambition, danger, money, survival, passion, revenge, and consequences.",
    tone:["raw","intense","dramatic","high-stakes","morally gray"], pacing:"fast and cliffhanger-driven",
    coreThemes:["loyalty","betrayal","survival","money","power","revenge","secrets","consequences"],
    characterTypes:["drug kingpin","reformed hustler","club owner","street-legitimate entrepreneur","ride-or-die heroine","ambitious woman caught between worlds","family protector","enforcer","businesswoman with dangerous ties","daughter discovering family secrets"],
    conflicts:["hidden money","revenge plot","rival crew","dangerous family secret","snitch or blackmail","double life","criminal past resurfaces","family betrayal","empire under attack","loyalty test"],
    avoid:["soft low-stakes misunderstandings","overly gentle therapy-heavy tone","slow-burn emotional healing as the primary engine unless intentionally blended"],
    streetLitEng:{ survivalPressure:5, empireBuilding:5, betrayalRisk:5, revengeDrive:4, streetInfluence:5, dangerLevel:5, loyaltyIntensity:5, consequenceLevel:5, moralityScale:5, cliffhangerFrequency:5 },
    suspenseEng:{ mysteryLevel:3, dangerLevel:5, conspiracyLevel:2, psychologicalTension:4, investigationFocus:2, twistIntensity:5 },
    romance:{ attractionIntensity:4, emotionalIntimacy:3, physicalAffection:4, relationshipFocus:3 }
  },
  crimeSaga: {
    name:"Crime Family Saga",
    readerPromise:"A family fights to protect power, money, legacy, and loyalty while secrets threaten to destroy everything.",
    tone:["strategic","dangerous","dramatic","legacy-driven","betrayal-heavy"], pacing:"fast to moderate with major reversals",
    coreThemes:["legacy","succession","family loyalty","empire","inheritance","betrayal","secrets"],
    characterTypes:["family patriarch","family matriarch","reluctant heir","oldest daughter","black sheep son","corporate professional with criminal family ties","wife protecting family secrets","daughter uncovering the truth"],
    conflicts:["succession battle","family betrayal","hidden heir","business front exposed","law enforcement pressure","rival family","inheritance fight","matriarch secret","child discovers family truth"],
    avoid:["making the story only about romance","small stakes","family that has no real influence"],
    streetLitEng:{ survivalPressure:4, empireBuilding:5, betrayalRisk:5, revengeDrive:3, streetInfluence:4, dangerLevel:5, loyaltyIntensity:5, consequenceLevel:5, moralityScale:4, cliffhangerFrequency:5 },
    romance:{ attractionIntensity:3, emotionalIntimacy:3, physicalAffection:3, relationshipFocus:2 }
  },
  urbanSuspense: {
    name:"Urban Suspense",
    readerPromise:"A tense, dangerous story where secrets, betrayal, hidden enemies, and survival drive the plot.",
    tone:["tense","dangerous","twisty","urgent","paranoid"], pacing:"fast",
    coreThemes:["secrets","survival","hidden enemies","betrayal","danger","truth"],
    characterTypes:["woman being watched","wrongfully accused protagonist","ex with secrets","journalist","private investigator","survivor with hidden past","family member hiding the truth"],
    conflicts:["someone is watching","missing person","blackmail","wrongful accusation","hidden enemy","crime coverup","dangerous secret","witness to crime"],
    avoid:["too much softness","slow cozy pacing","low tension"],
    streetLitEng:{ survivalPressure:5, empireBuilding:2, betrayalRisk:5, revengeDrive:3, streetInfluence:4, dangerLevel:5, loyaltyIntensity:3, consequenceLevel:5, moralityScale:3, cliffhangerFrequency:5 },
    suspenseEng:{ mysteryLevel:4, dangerLevel:5, conspiracyLevel:3, psychologicalTension:5, investigationFocus:3, twistIntensity:5 },
    romance:{ attractionIntensity:2, emotionalIntimacy:2, physicalAffection:2, relationshipFocus:2 }
  },
  urbanRomanceDrama: {
    name:"Urban Romance Drama",
    readerPromise:"High-emotion romance driven by passion, loyalty, family pressure, betrayal, jealousy, and dramatic relationship stakes.",
    tone:["sexy","dramatic","emotionally volatile","romantic","possessive"], pacing:"fast to moderate",
    coreThemes:["passion","loyalty","trust","betrayal","family pressure","chemistry","protective love"],
    characterTypes:["possessive protective hero","ambitious heroine","single mother","ex with unfinished business","successful entrepreneur","hood-adjacent businessman","woman rebuilding after betrayal"],
    conflicts:["dangerous ex returns","secret child","family disapproval","relationship betrayal","love triangle","trust issues","public humiliation","jealousy spiral","protective hero crosses a line"],
    avoid:["too much procedural mystery","too little romance","emotionally flat couple dynamics"],
    romance:{ attractionIntensity:5, emotionalIntimacy:3, physicalAffection:5, relationshipFocus:5 }
  },
  luxuryUrban: {
    name:"Luxury Urban Romance",
    readerPromise:"A sexy, aspirational romance filled with wealth, power, passion, status, secrets, and high-drama relationship stakes.",
    tone:["glamorous","sexy","dramatic","aspirational","high-status"], pacing:"moderate to fast",
    coreThemes:["wealth","status","image","power couples","ambition","desire","secrets"],
    characterTypes:["billionaire CEO","entertainment mogul","real estate developer","luxury brand founder","celebrity-adjacent heroine","public-facing power couple","heiress","image consultant"],
    conflicts:["public scandal","business rivalry","family pressure","fake relationship","enemies to lovers","status gap","image management","hidden past threatens reputation"],
    avoid:["poverty survival focus unless intentionally blended","low glamour","low chemistry"],
    romance:{ attractionIntensity:5, emotionalIntimacy:3, physicalAffection:5, relationshipFocus:5 }
  }
};
// Lane → urban category (option A: overlapping categories reuse existing lanes)
const LANE_TO_URBAN_CATEGORY = { streetLit:"streetLit", crimeSaga:"crimeSaga", suspense:"urbanSuspense", urban:"urbanRomanceDrama", luxury:"luxuryUrban" };

// Highest-weighted lane whose mapped category defines the given engine baseline
function dominantUrbanEngine(normLanes, engField) {
  let best = null, bestPct = 0;
  for (const laneId in LANE_TO_URBAN_CATEGORY) {
    const cat = URBAN_CATEGORIES[LANE_TO_URBAN_CATEGORY[laneId]];
    if (cat && cat[engField]) {
      const p = normLanes[laneId] || 0;
      if (p > 0 && p > bestPct) { best = { laneId, catId: LANE_TO_URBAN_CATEGORY[laneId], baseline: cat[engField], pct: p }; bestPct = p; }
    }
  }
  return best;
}
// Dominant urban category overall (for prompt calibration text)
function dominantUrbanCategory(normLanes) {
  let best = null, bestPct = 0;
  for (const laneId in LANE_TO_URBAN_CATEGORY) {
    const p = normLanes[laneId] || 0;
    if (p > 0 && p > bestPct) { best = { id: LANE_TO_URBAN_CATEGORY[laneId], laneId, pct: p }; bestPct = p; }
  }
  return best;
}
// Street-lit family share of the blend (street lit + crime saga lanes)
function streetLitShare(normLanes) { return (normLanes.streetLit || 0) + (normLanes.crimeSaga || 0); }

// Compact prompt fragments for scene/prose generation
function streetLitLine(sl) {
  if (!sl) return "";
  const raised = STREETLIT_DIMENSIONS.filter(d => (sl[d.key]||2) >= 4).map(d => d.label + " " + sl[d.key] + "/5");
  if (!raised.length) return "";
  return "Street Lit engine (loyalty/danger/betrayal/empire stakes): " + raised.join(", ") + ". Keep external stakes, consequences, and cliffhanger pressure high.";
}
function suspenseLine(sp) {
  if (!sp) return "";
  const raised = SUSPENSE_DIMENSIONS.filter(d => (sp[d.key]||2) >= 4).map(d => d.label + " " + sp[d.key] + "/5");
  if (!raised.length) return "";
  return "Suspense engine: " + raised.join(", ") + ". Sustain dread, danger, and reversals.";
}

// Dominant erotic category in a normalized blend (highest erotic lane > 0), or null
function dominantEroticCategory(normLanes) {
  let best = null, bestPct = 0;
  for (const id of EROTIC_LANE_IDS) {
    const p = normLanes[id] || 0;
    if (p > 0 && p > bestPct) { best = id; bestPct = p; }
  }
  return best ? { id: best, pct: bestPct } : null;
}

// Compact one-line erotic-engine prompt fragment for scene/prose generation
function eroticLine(er) {
  if (!er) return "";
  const raised = EROTIC_DIMENSIONS.filter(d => (er[d.key]||3) >= 4).map(d => d.label + " " + er[d.key] + "/5");
  if (!raised.length) return "";
  return "Erotic Romance engine (relationship/desire/chemistry/intimacy dynamics — INDEPENDENT of spice, which controls explicitness): " + raised.join(", ") + ". Drive chemistry, longing, and intimate stakes accordingly; tie intimacy to character growth.";
}

// ── Pattern Database Calibration ───────────────────────────────
// Per genre-pattern defaults — when patterns activate from blended lanes,
// the system suggests these values as starting points. User can override.
const INTENSITY_CALIBRATION = {
  soft_black_romance:    { spice: 1, intensity: { attractionIntensity:3, emotionalIntimacy:5, physicalAffection:2, relationshipFocus:4 } },
  power_purpose:         { spice: 2, intensity: { attractionIntensity:4, emotionalIntimacy:4, physicalAffection:2, relationshipFocus:4 } },
  billionaire:           { spice: 3, intensity: { attractionIntensity:5, emotionalIntimacy:4, physicalAffection:3, relationshipFocus:5 } },
  family_saga:           { spice: 2, intensity: { attractionIntensity:3, emotionalIntimacy:5, physicalAffection:2, relationshipFocus:3 } },
  urban_romance_drama:   { spice: 3, intensity: { attractionIntensity:5, emotionalIntimacy:4, physicalAffection:4, relationshipFocus:5 } },
  faith_based:           { spice: 1, intensity: { attractionIntensity:3, emotionalIntimacy:5, physicalAffection:1, relationshipFocus:4 } },
  urban_fiction:         { spice: 3, intensity: { attractionIntensity:3, emotionalIntimacy:3, physicalAffection:3, relationshipFocus:2 } },
  romantic_suspense:     { spice: 2, intensity: { attractionIntensity:4, emotionalIntimacy:4, physicalAffection:3, relationshipFocus:4 } },
  crime_thriller:        { spice: 1, intensity: { attractionIntensity:2, emotionalIntimacy:3, physicalAffection:1, relationshipFocus:1 } },
  cozy_mystery:          { spice: 1, intensity: { attractionIntensity:3, emotionalIntimacy:3, physicalAffection:1, relationshipFocus:2 } },
  corporate_mystery:     { spice: 1, intensity: { attractionIntensity:2, emotionalIntimacy:3, physicalAffection:2, relationshipFocus:2 } },
  southern_black_mystery:{ spice: 1, intensity: { attractionIntensity:3, emotionalIntimacy:4, physicalAffection:1, relationshipFocus:2 } },
  cozy_black_mystery:    { spice: 1, intensity: { attractionIntensity:3, emotionalIntimacy:3, physicalAffection:2, relationshipFocus:2 } },
  intellectual_mystery:  { spice: 1, intensity: { attractionIntensity:2, emotionalIntimacy:3, physicalAffection:1, relationshipFocus:1 } },
  urban_family_empire:   { spice: 3, intensity: { attractionIntensity:3, emotionalIntimacy:4, physicalAffection:3, relationshipFocus:3 } }
};

// Weighted average of activated patterns' calibrations
function calibrationForActivatedPatterns(activatedPatterns) {
  if (!activatedPatterns || activatedPatterns.length === 0) return null;
  let totalWeight = 0;
  let spice = 0, attr = 0, emo = 0, phys = 0, focus = 0;
  activatedPatterns.forEach(p => {
    const id = (p.pattern && p.pattern.id) || p.id;
    const weight = p.weight || p.percentage || 1;
    const cal = INTENSITY_CALIBRATION[id];
    if (cal) {
      spice += cal.spice * weight;
      attr += cal.intensity.attractionIntensity * weight;
      emo += cal.intensity.emotionalIntimacy * weight;
      phys += cal.intensity.physicalAffection * weight;
      focus += cal.intensity.relationshipFocus * weight;
      totalWeight += weight;
    }
  });
  if (totalWeight === 0) return null;
  return {
    spice: Math.max(1, Math.min(5, Math.round(spice / totalWeight))),
    intensity: {
      attractionIntensity: Math.max(1, Math.min(5, Math.round(attr / totalWeight))),
      emotionalIntimacy: Math.max(1, Math.min(5, Math.round(emo / totalWeight))),
      physicalAffection: Math.max(1, Math.min(5, Math.round(phys / totalWeight))),
      relationshipFocus: Math.max(1, Math.min(5, Math.round(focus / totalWeight)))
    }
  };
}


const INTENSITY = [
  {level:1, name:"Low Stakes",          desc:"Misunderstandings, relocation, promotion"},
  {level:2, name:"Moderate Stakes",     desc:"Business struggles, family pressure"},
  {level:3, name:"High Stakes",         desc:"Divorce, inheritance, public scandal"},
  {level:4, name:"Major Stakes",        desc:"Custody battle, corruption, criminal investigation"},
  {level:5, name:"Life-Changing Stakes",desc:"Death threats, major betrayal, community destruction"},
];

// ── GENRE PATTERN DATABASE ────────────────────────────────────
// Identifies market patterns across 15 commercial fiction categories.
// Reference authors are seeds for THE PATTERN, not for imitation.
// The AI is instructed: blend the PATTERN, never copy the author.

const GENRE_PATTERNS = [
  {
    id:"soft_black_romance", name:"Soft Black Romance",
    authors:["Kennedy Ryan","Christina C. Jones","Alexandria House","Farrah Rochon","Beverly Jenkins","Reese Ryan","Synithia Williams","Nicole Falls","D. Rose","Love Belvin"],
    themes:["Healing","Love after loss","Emotional safety","Self-worth","Second chances"],
    characters:["Professionals","Creatives","Divorced women","Single parents","Community-rooted men"],
    depth:9, conflicts:["Emotional wounds","Trust issues","Grief","Divorce","Family pressure"],
    pacing:"Moderate, emotionally layered", audience:"Readers who want depth, catharsis, mature love",
    promise:"Real, mature love that heals what life broke",
    tropes:["Second chance","Reunited lovers","Single parent","Slow burn","Hurt/comfort"],
    settings:["Historic Black neighborhood","HBCU","Coffee shop","Brownstone"],
    seriesPotential:7, spice:3, violence:1, mystery:1, romance:10, famInf:7,
    notes:"Premium market share. Mature audience. High audio adaptation potential."
  },
  {
    id:"power_purpose", name:"Power & Purpose Romance",
    authors:["Reese Ryan","Synithia Williams","Brenda Jackson","Kennedy Ryan","Zuri Day"],
    themes:["Ambition","Leadership","Reinvention","Legacy","Purpose","Boundaries"],
    characters:["Executives","Founders","Healthcare leaders","Strategists","Nonprofit leaders"],
    depth:9, conflicts:["Career burnout","Public pressure","Identity crisis","Success vs fulfillment"],
    pacing:"Moderate", audience:"Professional Black women 30-60 who want love plus life transformation",
    promise:"A powerful Black woman learns love is not another thing she has to earn",
    tropes:["Workplace romance","Boss-employee","Forced proximity","Forbidden love"],
    settings:["Corporate HQ","Healthcare system","Nonprofit","Executive coaching practice","AI startup"],
    seriesPotential:8, spice:3, violence:1, mystery:2, romance:9, famInf:6,
    notes:"Underserved market with growing demand. Strong audio + streaming potential."
  },
  {
    id:"billionaire", name:"Black Billionaire Romance",
    authors:["Reese Ryan","J.L. Seegars","Sherelle Green","K.C. Mills","A.C. Arthur","Delaney Diamond","Synithia Williams","Brenda Jackson","Zuri Day","Donna Hill"],
    themes:["Wealth","Luxury","Black excellence","Power couples","Status","Protection"],
    characters:["CEOs","Athletes","Heirs","Founders","Moguls","Luxury brand owners"],
    depth:7, conflicts:["Power imbalance","Family expectations","Secrets","Enemies-to-lovers"],
    pacing:"Fast to moderate", audience:"Readers seeking fantasy, success, glamour, intense romance",
    promise:"Aspirational love at the top with stakes that feel earned",
    tropes:["Billionaire","Marriage of convenience","Enemies to lovers","Fake dating","Forced proximity"],
    settings:["Atlanta luxury neighborhood","Manhattan penthouse","Black-owned luxury hotel","Napa vineyard"],
    seriesPotential:8, spice:4, violence:2, mystery:2, romance:10, famInf:6,
    notes:"High-velocity commercial market. Power-couple fantasy. Audio + adaptation friendly."
  },
  {
    id:"family_saga", name:"Family Saga Romance",
    authors:["Beverly Jenkins","Brenda Jackson","Synithia Williams","Donna Hill","A.C. Arthur"],
    themes:["Legacy","Inheritance","Family loyalty","Secrets","Succession"],
    characters:["Siblings","Heirs","Matriarchs","Cousins","Family business leaders"],
    depth:9, conflicts:["Succession battles","Family secrets","Inheritance","Betrayal"],
    pacing:"Moderate to layered", audience:"Readers who binge interconnected series",
    promise:"A family this big means every book opens a new heart",
    tropes:["Family empire","Reunited lovers","Forbidden love","Best friend's sibling"],
    settings:["Family estate","Family business","HBCU homecoming","Multi-generational home"],
    seriesPotential:10, spice:3, violence:2, mystery:3, romance:9, famInf:10,
    notes:"Maximum series potential. Each sibling/cousin = next book. Auto-binge fuel."
  },
  {
    id:"faith_based", name:"Faith-Based Romance",
    authors:["Toni Shiloh","Vanessa Miller","Kim Cash Tate","Pat Simmons","Rhonda McKnight","Victoria Christopher Murray","Michelle Lindo-Rice","Tia McCollors","Sherri L. Lewis","Stacy Hawkins Adams"],
    themes:["Forgiveness","Redemption","Calling","Family","Faith","Moral choice"],
    characters:["Pastors","Teachers","Nonprofit leaders","Widows","Community servants"],
    depth:8, conflicts:["Faith conflict","Past mistakes","Forgiveness","Purpose journey"],
    pacing:"Gentle to moderate", audience:"Readers wanting clean/inspirational romance with emotional payoff",
    promise:"Love grounded in faith, family, and forgiveness",
    tropes:["Second chance","Single parent","Small town return","Friends to lovers"],
    settings:["Church community","Small Southern town","Multi-generational home","Nonprofit"],
    seriesPotential:7, spice:1, violence:1, mystery:1, romance:9, famInf:8,
    notes:"Devoted niche audience. Crosses into Christian fiction market. Audio + book club friendly."
  },
  {
    id:"urban_romance", name:"Urban Romance Drama",
    authors:["K.C. Mills","N'Dia Rae","Thee Tasha Marie","Twyla T.","B. Love","Shvonne Latrice","Bianca Xaviera","Chenell Parker","J. Charyse","Jahquel J."],
    themes:["Loyalty","Protection","Betrayal","Survival","Passion","Family pressure"],
    characters:["Protective heroes","Entrepreneurs","Reformed hustlers","Strong heroines"],
    depth:7, conflicts:["Exes","Secrets","Family drama","Danger-adjacent tension"],
    pacing:"Fast", audience:"Readers who want high emotion, spice, drama, intensity",
    promise:"Loyalty and love when both feel like life and death",
    tropes:["Enemies to lovers","Forced proximity","Protective hero","Second chance"],
    settings:["Family-owned security company","Upscale nightclub","Automotive shop","Boxing gym"],
    seriesPotential:9, spice:5, violence:3, mystery:3, romance:9, famInf:7,
    notes:"High-velocity market. Strong audiobook and KU performer."
  },
  {
    id:"urban_fiction", name:"Urban Fiction / Street Lit",
    authors:["Ashley Antoinette","JaQuavis Coleman","Wahida Clark","K'wan","Carl Weber","Treasure Hernandez","Nikki Turner","Tracy Brown","Kiki Swinson","Noire"],
    themes:["Power","Crime","Money","Betrayal","Survival","Empire","Revenge"],
    characters:["Hustlers","Wives","Daughters","Crime families","Business fronts"],
    depth:6, conflicts:["Betrayal","Violence","Double lives","Money","Loyalty tests"],
    pacing:"Fast, cliffhanger-heavy", audience:"Readers who want drama, danger, twists, series addiction",
    promise:"Money makes some, breaks others — and someone always pays",
    tropes:["Family empire","Enemies to lovers","Forbidden love","Second chance"],
    settings:["Family security business","Entertainment management","Underground operation","Family estate"],
    seriesPotential:10, spice:4, violence:5, mystery:3, romance:6, famInf:9,
    notes:"Established commercial powerhouse. Series + adaptation gold."
  },
  {
    id:"romantic_suspense", name:"Romantic Suspense",
    authors:["Rachel Howzell Hall","Alyssa Cole","Pamela Samuels Young","Tracy Clark","Kellye Garrett"],
    themes:["Trust","Danger","Justice","Secrets","Protection","Truth"],
    characters:["Detectives","Attorneys","Journalists","Agents","Security pros"],
    depth:7, conflicts:["Threats","Stalking","Corruption","Hidden identity","Investigation"],
    pacing:"Fast to moderate", audience:"Readers who want romance plus danger and mystery",
    promise:"Find love in the middle of the storm — and survive it together",
    tropes:["Protective hero","Forced proximity","Enemies to lovers","Reunited lovers"],
    settings:["Private security firm","Newsroom","Federal agency","Cybersecurity company"],
    seriesPotential:8, spice:3, violence:3, mystery:5, romance:8, famInf:5,
    notes:"Hybrid market with strong audio and Netflix-style adaptation potential."
  },
  {
    id:"crime_thriller", name:"Crime / Political Thriller",
    authors:["Walter Mosley","S.A. Cosby","Attica Locke","James Patterson","David Baldacci","John Grisham","Michael Connelly","Harlan Coben","Rachel Howzell Hall","Pamela Samuels Young"],
    themes:["Justice","Corruption","Power","Conspiracy","Institutions","Moral stakes"],
    characters:["Detectives","Profilers","Lawyers","Politicians","Journalists"],
    depth:7, conflicts:["Murder","Conspiracy","Serial crimes","Coverups","Institutional betrayal"],
    pacing:"Fast, plot-driven", audience:"Readers who want page-turning suspense and sharp stakes",
    promise:"The truth costs something — and someone is going to pay",
    tropes:["Wrongfully accused","Cat and mouse","Reluctant partners","Lone investigator"],
    settings:["Newsroom","Federal agency","Law firm","Political campaign","Historic estate"],
    seriesPotential:9, spice:1, violence:4, mystery:10, romance:3, famInf:4,
    notes:"Massive commercial readership. Streaming + film potential is strongest here."
  },
  {
    id:"cozy_mystery", name:"Cozy Mystery",
    authors:["Joanne Fluke","Laura Childs","Kathi Daley","Jessica Beck","Maddie Day","Jenn McKinlay","Ellery Adams","Vivien Chien","Mia P. Manansala","Abby Collette"],
    themes:["Community","Curiosity","Justice","Food","Friendship","Small-town secrets"],
    characters:["Amateur sleuths","Bakers","Bookstore owners","Librarians","Retirees"],
    depth:5, conflicts:["Local murder","Secrets","Quirky suspects","Community gossip"],
    pacing:"Moderate, episodic", audience:"Readers who want comfort, recurring cast, low gore, puzzle solving",
    promise:"Murder solved before dinner — with cake, friends, and a little justice",
    tropes:["Amateur sleuth","Small town return","Friends to lovers","Slow burn"],
    settings:["Bookstore","Bakery","Coffee shop","Small Southern downtown","Family-owned restaurant"],
    seriesPotential:10, spice:1, violence:2, mystery:8, romance:4, famInf:5,
    notes:"Series machine. Each book = new case, same beloved cast. Devoted reader base."
  },
  {
    id:"corporate_mystery", name:"Corporate Mystery",
    authors:["Pamela Samuels Young","Attica Locke","Walter Mosley"],
    themes:["Ambition","Betrayal","Workplace power","Ethics","Reputation"],
    characters:["HR leaders","Executives","Consultants","Lawyers","Analysts"],
    depth:7, conflicts:["Fraud","Whistleblowing","Harassment","Sabotage","Coverup"],
    pacing:"Moderate", audience:"Readers who like intelligent suspense in professional settings",
    promise:"The smartest person in the room is the one who shouldn't be trusted",
    tropes:["Whistleblower","Forced partnership","Hidden identity","Office rivals"],
    settings:["Corporate HQ","Consulting firm","Law firm","Tech startup","AI startup"],
    seriesPotential:7, spice:2, violence:2, mystery:8, romance:5, famInf:3,
    notes:"Fresh terrain. Crosses with Power & Purpose. Hospital admin and tech are underserved."
  },
  {
    id:"southern_black_mystery", name:"Southern Black Mystery",
    authors:["Attica Locke","S.A. Cosby","Rachel Howzell Hall","Tananarive Due"],
    themes:["Family","Place","History","Secrets","Community","Justice"],
    characters:["Detectives","Returning daughters","Journalists","Local leaders"],
    depth:8, conflicts:["Buried crimes","Old secrets","Family ties","Political pressure"],
    pacing:"Moderate", audience:"Readers who want atmosphere, culture, suspense, identity",
    promise:"The past is never buried — only waiting to be dug up",
    tropes:["Small town return","Reunited lovers","Family secrets","Wrongfully accused"],
    settings:["Tight-knit Southern town","Historic family estate","Church community","Family farm"],
    seriesPotential:8, spice:2, violence:3, mystery:7, romance:5, famInf:8,
    notes:"Critical and commercial darling. Strong literary adaptation potential."
  },
  {
    id:"cozy_black_mystery", name:"Cozy Black Mystery",
    authors:["Abby Collette","Vivien Chien","Mia P. Manansala","Kellye Garrett"],
    themes:["Community","Food","Family","Church","Humor","Local secrets"],
    characters:["Bakery owners","Coffee shop owners","Event planners","Aunties","Librarians"],
    depth:6, conflicts:["Local death","Missing person","Family secrets","Small-town politics"],
    pacing:"Moderate", audience:"Readers who want warmth, humor, mystery, recurring characters",
    promise:"Murder, mayhem, and a slice of grandma's pound cake",
    tropes:["Amateur sleuth","Small town return","Friends to lovers","Family empire"],
    settings:["Bakery","Coffee shop","Church community","Bookstore","Family-owned restaurant"],
    seriesPotential:9, spice:1, violence:2, mystery:7, romance:5, famInf:7,
    notes:"Underserved subgenre. Strong audio + comfort-read positioning."
  },
  {
    id:"intellectual_mystery", name:"Intellectual Mystery",
    authors:["Walter Mosley","Attica Locke","Tananarive Due"],
    themes:["Systems","Truth","Politics","Psychology","Institutions","Hidden motives"],
    characters:["Professors","Strategists","Lawyers","Detectives","Analysts"],
    depth:9, conflicts:["Conspiracy","Moral dilemma","Institutional corruption","Coded clues"],
    pacing:"Slower to moderate", audience:"Readers who enjoy smart puzzles and layered social commentary",
    promise:"The case is intellectual chess — and the board is rigged",
    tropes:["Wrongfully accused","Reluctant partners","Cat and mouse","Hidden identity"],
    settings:["University","Law firm","Newsroom","Political campaign","Think tank"],
    seriesPotential:7, spice:1, violence:2, mystery:10, romance:3, famInf:3,
    notes:"Prestige market. Literary award and book-club potential."
  },
  {
    id:"urban_family_empire", name:"Urban Suspense Family Empire",
    authors:["Ashley Antoinette","JaQuavis Coleman","Wahida Clark","Carl Weber"],
    themes:["Legacy","Money","Crime","Loyalty","Secrets","Protection"],
    characters:["Family patriarchs","Wives","Daughters","Heirs","Fixers"],
    depth:8, conflicts:["Family crime","Betrayal","Hidden money","Succession","Revenge"],
    pacing:"Fast to moderate", audience:"Readers who want Power-style drama with family stakes",
    promise:"Blood, money, loyalty — pick two, lose one",
    tropes:["Family empire","Enemies to lovers","Reformed hustler","Forbidden love"],
    settings:["Family estate","Family security business","Entertainment management","Historic family estate"],
    seriesPotential:10, spice:4, violence:4, mystery:5, romance:7, famInf:10,
    notes:"Strongest TV adaptation profile. Empire/Power/Snowfall lane. Multi-book empire potential."
  },
];

// Map current Story Blend lanes to activated genre patterns
const LANE_TO_PATTERNS = {
  healing:     ["soft_black_romance","faith_based"],
  community:   ["soft_black_romance","cozy_black_mystery"],
  luxury:      ["billionaire","power_purpose"],
  family:      ["family_saga","urban_family_empire"],
  urban:       ["urban_romance","urban_fiction"],
  reinvention: ["power_purpose","soft_black_romance"],
  suspense:    ["romantic_suspense","crime_thriller","corporate_mystery"],
  faith:       ["faith_based","southern_black_mystery"],
};

// Compute the top 3 activated patterns weighted by lane percentages
function getActivatedPatterns(normLanes) {
  const scores = {};
  Object.entries(normLanes).forEach(([lane, pct]) => {
    if (!pct) return;
    const pats = LANE_TO_PATTERNS[lane] || [];
    pats.forEach((pid, idx) => {
      const weight = pct * (1 - idx*0.3);  // primary > secondary > tertiary
      scores[pid] = (scores[pid]||0) + weight;
    });
  });
  return Object.entries(scores)
    .sort((a,b) => b[1]-a[1])
    .slice(0,3)
    .map(([id,score]) => {
      const p = GENRE_PATTERNS.find(g=>g.id===id);
      return p ? { ...p, blendWeight: Math.round(score) } : null;
    })
    .filter(Boolean);
}



// ── Hero Archetypes (60) ──────────────────────────────────────
const HEROES = [
  {id:"h_ceo",       n:"The Self-Made CEO",                cat:"Power & Success",  wound:"Believes love is a distraction",        P:10,W:9, E:4,R:6, Ch:5, tags:["top"]},
  {id:"h_tech",      n:"The Tech Founder",                 cat:"Power & Success",  wound:"Emotionally unavailable due to ambition", P:9, W:9, E:3,R:5, Ch:4, tags:["top"]},
  {id:"h_re",        n:"The Real Estate Mogul",            cat:"Power & Success",  wound:"Fear of returning to poverty",          P:9, W:10,E:4,R:7, Ch:6, tags:["top"]},
  {id:"h_invest",    n:"The Investment Executive",         cat:"Power & Success",  wound:"Treats relationships like business",    P:9, W:10,E:3,R:5, Ch:4, tags:[]},
  {id:"h_ent",       n:"The Entertainment Mogul",          cat:"Power & Success",  wound:"Questions if people love him or status",P:10,W:10,E:5,R:6, Ch:5, tags:[]},
  {id:"h_athlete",   n:"The Professional Athlete",         cat:"Power & Success",  wound:"Struggles with identity beyond sports", P:9, W:9, E:5,R:7, Ch:7, tags:["top"]},
  {id:"h_retired",   n:"The Retired Athlete",              cat:"Power & Success",  wound:"Fear of irrelevance",                   P:7, W:7, E:6,R:7, Ch:7, tags:[]},
  {id:"h_hotel",     n:"The Luxury Hotel Owner",           cat:"Power & Success",  wound:"Provides comfort, rarely receives it",  P:8, W:9, E:6,R:7, Ch:6, tags:[]},
  {id:"h_pe",        n:"The Private Equity Titan",         cat:"Power & Success",  wound:"Calculates every relationship",         P:10,W:10,E:3,R:5, Ch:3, tags:[]},
  {id:"h_rest",      n:"The Restaurant Empire Founder",    cat:"Power & Success",  wound:"Feels valuable only when feeding others",P:8,W:8, E:6,R:7, Ch:7, tags:[]},
  {id:"h_pastor",    n:"The Pastor",                       cat:"Community Leader", wound:"Feels responsible for everyone",        P:7, W:5, E:8,R:8, Ch:10,tags:["grow"]},
  {id:"h_mentor",    n:"The Youth Mentor",                 cat:"Community Leader", wound:"Saving others after failing someone",   P:5, W:5, E:8,R:9, Ch:10,tags:["grow"]},
  {id:"h_coach",     n:"The High School Coach",            cat:"Community Leader", wound:"Lives through helping others succeed",  P:6, W:5, E:7,R:9, Ch:9, tags:["grow"]},
  {id:"h_comdev",    n:"The Community Developer",          cat:"Community Leader", wound:"Carries weight of his neighborhood",    P:7, W:7, E:8,R:8, Ch:10,tags:["top","grow"]},
  {id:"h_nonprof",   n:"The Nonprofit Director",           cat:"Community Leader", wound:"Martyr complex",                        P:7, W:5, E:7,R:8, Ch:10,tags:[]},
  {id:"h_security",  n:"The Security Company Owner",       cat:"Protector",        wound:"Always on guard",                       P:8, W:7, E:5,R:10,Ch:7, tags:["top"]},
  {id:"h_marine",    n:"The Former Marine",                cat:"Protector",        wound:"Difficulty adjusting to peace",         P:7, W:6, E:4,R:10,Ch:7, tags:[]},
  {id:"h_detective", n:"The Detective",                    cat:"Protector",        wound:"Trust issues",                          P:7, W:5, E:5,R:9, Ch:7, tags:[]},
  {id:"h_firefight", n:"The Firefighter",                  cat:"Protector",        wound:"Feels responsible for saving everyone", P:6, W:5, E:7,R:10,Ch:8, tags:[]},
  {id:"h_fed",       n:"The Federal Agent",                cat:"Protector",        wound:"Keeps emotional distance",              P:8, W:6, E:4,R:9, Ch:5, tags:[]},
  {id:"h_guard",     n:"The Bodyguard",                    cat:"Protector",        wound:"Protects others while neglecting self", P:7, W:6, E:5,R:10,Ch:6, tags:[]},
  {id:"h_sar",       n:"The Search & Rescue Specialist",   cat:"Protector",        wound:"Haunted by someone he couldn't save",   P:7, W:5, E:6,R:10,Ch:7, tags:[]},
  {id:"h_heir",      n:"The Family Business Heir",         cat:"Family Empire",    wound:"Pressure to live up to expectations",   P:8, W:9, E:5,R:7, Ch:7, tags:[]},
  {id:"h_reluctant", n:"The Reluctant Successor",          cat:"Family Empire",    wound:"Never wanted the family legacy",        P:7, W:9, E:5,R:6, Ch:7, tags:[]},
  {id:"h_oldest",    n:"The Oldest Son",                   cat:"Family Empire",    wound:"Parentified young",                     P:6, W:6, E:6,R:9, Ch:8, tags:[]},
  {id:"h_fixer",     n:"The Family Fixer",                 cat:"Family Empire",    wound:"Everyone's problems are his",           P:7, W:7, E:7,R:9, Ch:8, tags:[]},
  {id:"h_blacksheep",n:"The Black Sheep Son",              cat:"Family Empire",    wound:"Never fully accepted",                  P:7, W:6, E:6,R:7, Ch:5, tags:[]},
  {id:"h_therapist", n:"The Therapist",                    cat:"Soft Life",        wound:"Excellent listener, poor sharer",       P:5, W:6, E:9,R:7, Ch:8, tags:["top","grow"]},
  {id:"h_psych",     n:"The Psychologist",                 cat:"Soft Life",        wound:"Overanalyzes everything",               P:6, W:7, E:9,R:7, Ch:7, tags:["grow"]},
  {id:"h_prof",      n:"The College Professor",            cat:"Soft Life",        wound:"Lives in his head",                     P:6, W:6, E:7,R:5, Ch:7, tags:["grow"]},
  {id:"h_lib",       n:"The Librarian",                    cat:"Soft Life",        wound:"Comfortable with books, not emotions",  P:4, W:4, E:7,R:5, Ch:8, tags:[]},
  {id:"h_author",    n:"The Author",                       cat:"Soft Life",        wound:"Writes feelings better than he speaks", P:6, W:7, E:7,R:5, Ch:6, tags:[]},
  {id:"h_surgeon",   n:"The Surgeon",                      cat:"Healthcare",       wound:"Perfectionism",                         P:9, W:9, E:5,R:8, Ch:6, tags:[]},
  {id:"h_er",        n:"The Emergency Room Doctor",        cat:"Healthcare",       wound:"Constant exposure to crisis",           P:8, W:8, E:6,R:9, Ch:7, tags:[]},
  {id:"h_hospexec",  n:"The Hospital Executive",           cat:"Healthcare",       wound:"Workaholism",                           P:9, W:9, E:5,R:7, Ch:7, tags:["top"]},
  {id:"h_pt",        n:"The Physical Therapist",           cat:"Healthcare",       wound:"Always helping others heal",            P:6, W:6, E:8,R:8, Ch:8, tags:[]},
  {id:"h_coffee",    n:"The Coffee Shop Owner",            cat:"Entrepreneur",     wound:"Fear of expansion and failure",         P:5, W:5, E:7,R:6, Ch:9, tags:[]},
  {id:"h_barber",    n:"The Barbershop Owner",             cat:"Entrepreneur",     wound:"Everyone knows him, few know the real",P:6, W:6, E:7,R:7, Ch:10,tags:[]},
  {id:"h_franchise", n:"The Franchise Owner",              cat:"Entrepreneur",     wound:"Obsessed with success",                 P:7, W:8, E:5,R:6, Ch:7, tags:[]},
  {id:"h_construct", n:"The Construction Company Owner",   cat:"Entrepreneur",     wound:"Feels valuable only when producing",    P:7, W:8, E:6,R:8, Ch:8, tags:["grow"]},
  {id:"h_journo",    n:"The Investigative Journalist",     cat:"Romantic Suspense",wound:"Can't let go of the truth",             P:7, W:5, E:6,R:7, Ch:7, tags:[]},
  {id:"h_defense",   n:"The Criminal Defense Attorney",    cat:"Romantic Suspense",wound:"Sees the worst in humanity",            P:9, W:8, E:5,R:8, Ch:6, tags:[]},
  {id:"h_crisis",    n:"The Crisis Management Consultant", cat:"Romantic Suspense",wound:"Fixes everyone's disasters",            P:8, W:8, E:6,R:7, Ch:5, tags:[]},
  {id:"h_cyber",     n:"The Cybersecurity Expert",         cat:"Romantic Suspense",wound:"Trusts systems more than people",       P:8, W:8, E:4,R:7, Ch:4, tags:[]},
  {id:"h_pi",        n:"The Private Investigator",         cat:"Romantic Suspense",wound:"Suspicious by nature",                  P:6, W:5, E:5,R:8, Ch:6, tags:[]},
  {id:"h_hustler",   n:"The Reformed Hustler",             cat:"Urban Romance",    wound:"Trying to outrun his past",             P:8, W:7, E:5,R:10,Ch:8, tags:["top"]},
  {id:"h_club",      n:"The Club Owner",                   cat:"Urban Romance",    wound:"Surrounded by people, feels alone",     P:8, W:8, E:5,R:7, Ch:6, tags:[]},
  {id:"h_streetbiz", n:"The Street-Legitimate Business Owner",cat:"Urban Romance", wound:"Caught between two worlds",             P:7, W:8, E:5,R:8, Ch:8, tags:[]},
  {id:"h_brother",   n:"The Protective Brother",           cat:"Urban Romance",    wound:"Feels responsible for family survival", P:7, W:6, E:6,R:10,Ch:8, tags:[]},
  {id:"h_king",      n:"The Family Empire King",           cat:"Urban Romance",    wound:"Believes vulnerability is weakness",    P:10,W:10,E:4,R:10,Ch:8, tags:["top"]},
  {id:"h_ai",        n:"The AI Founder",                   cat:"Fresh Opportunity",wound:"Believes systems are safer than people",P:9, W:9, E:4,R:5, Ch:5, tags:["fresh"]},
  {id:"h_chro",      n:"The Chief HR Officer",             cat:"Fresh Opportunity",wound:"Solves everyone's people problems",     P:9, W:8, E:8,R:8, Ch:9, tags:["fresh"]},
  {id:"h_wfstrat",   n:"The Workforce Strategist",         cat:"Fresh Opportunity",wound:"Plans futures, can't see his own",      P:8, W:7, E:7,R:7, Ch:9, tags:["fresh"]},
  {id:"h_talent",    n:"The Talent Executive",             cat:"Fresh Opportunity",wound:"Develops others, hasn't healed himself",P:8, W:7, E:7,R:7, Ch:8, tags:["fresh"]},
  {id:"h_learning",  n:"The Learning Executive",           cat:"Fresh Opportunity",wound:"Teaches growth but resists his own",    P:7, W:7, E:8,R:7, Ch:9, tags:["fresh"]},
  {id:"h_hcexec",    n:"The Healthcare Executive",         cat:"Fresh Opportunity",wound:"Built to fix, struggles to feel",       P:9, W:9, E:6,R:7, Ch:7, tags:["fresh"]},
  {id:"h_program",   n:"The Program Director",             cat:"Fresh Opportunity",wound:"Manages everyone's success but his own",P:7, W:6, E:7,R:7, Ch:8, tags:["fresh"]},
  {id:"h_change",    n:"The Change Management Consultant", cat:"Fresh Opportunity",wound:"Helps others transform, fears his own", P:8, W:8, E:6,R:6, Ch:6, tags:["fresh"]},
  {id:"h_turnaround",n:"The Corporate Turnaround Specialist",cat:"Fresh Opportunity",wound:"Saves companies, can't save himself", P:9, W:8, E:4,R:6, Ch:4, tags:["fresh"]},
  {id:"h_aero",      n:"The Aerospace Engineer",           cat:"Fresh Opportunity",wound:"Comfortable with sky, not feelings",    P:8, W:8, E:5,R:6, Ch:5, tags:["fresh"]},
];

// ── External Conflicts (50) ───────────────────────────────────
const CONFLICTS = [
  {id:"c_succession",  n:"Family Business Succession Battle", cat:"Family",   pressure:"Legacy and inheritance",          tags:["bestseller"]},
  {id:"c_disparent",   n:"Disapproving Parent",               cat:"Family",   pressure:"Loyalty vs love",                 tags:[]},
  {id:"c_famsecret",   n:"Family Secret About To Be Exposed", cat:"Family",   pressure:"Truth threatens everything",      tags:["bestseller"]},
  {id:"c_longlost",    n:"Long-Lost Relative Appears",        cat:"Family",   pressure:"Identity and inheritance",        tags:[]},
  {id:"c_famcrisis",   n:"Family Financial Crisis",           cat:"Family",   pressure:"Everyone depends on the protagonist", tags:[]},
  {id:"c_custody",     n:"Custody Dispute",                   cat:"Family",   pressure:"Child's future",                  tags:[]},
  {id:"c_eldercare",   n:"Elder Care Responsibility",         cat:"Family",   pressure:"Competing obligations",           tags:[]},
  {id:"c_siblingriv",  n:"Sibling Rivalry",                   cat:"Family",   pressure:"Competition and comparison",      tags:[]},
  {id:"c_famfeud",     n:"Family Feud",                       cat:"Family",   pressure:"Generational conflict",           tags:[]},
  {id:"c_inherit",     n:"Unexpected Inheritance",            cat:"Family",   pressure:"New responsibilities",            tags:[]},
  {id:"c_promo",       n:"Competing For The Same Promotion",  cat:"Career",   pressure:"Career vs relationship",          tags:["bestseller"]},
  {id:"c_layoffs",     n:"Corporate Layoffs",                 cat:"Career",   pressure:"Financial instability",           tags:[]},
  {id:"c_bizfail",     n:"Business On The Verge Of Failure",  cat:"Career",   pressure:"Survival",                        tags:[]},
  {id:"c_startupfund", n:"Startup Running Out Of Funding",    cat:"Career",   pressure:"Dreams at risk",                  tags:[]},
  {id:"c_pubscandal",  n:"Public Scandal Threatens Career",   cat:"Career",   pressure:"Reputation",                      tags:[]},
  {id:"c_forcedpart",  n:"Forced Business Partnership",       cat:"Career",   pressure:"Working closely together",        tags:["bestseller"]},
  {id:"c_workpolicy",  n:"Workplace Romance Policy",          cat:"Career",   pressure:"Professional consequences",       tags:[]},
  {id:"c_takeover",    n:"Hostile Takeover",                  cat:"Career",   pressure:"Loss of control",                 tags:[]},
  {id:"c_relocate",    n:"Career Relocation",                 cat:"Career",   pressure:"Distance",                        tags:[]},
  {id:"c_profcomp",    n:"Professional Competition",          cat:"Career",   pressure:"Only one can win",                tags:[]},
  {id:"c_exreturns",   n:"Ex Returns",                        cat:"Love",     pressure:"Old feelings",                    tags:["bestseller"]},
  {id:"c_secretengage",n:"Secret Engagement",                 cat:"Love",     pressure:"Truth eventually surfaces",       tags:[]},
  {id:"c_secretchild", n:"Secret Child",                      cat:"Love",     pressure:"Trust",                           tags:[]},
  {id:"c_marriageconv",n:"Marriage Of Convenience",           cat:"Love",     pressure:"Lines blur between real and fake",tags:[]},
  {id:"c_fakerel",     n:"Fake Relationship",                 cat:"Love",     pressure:"Feelings become real",            tags:[]},
  {id:"c_longdist",    n:"Long Distance Relationship",        cat:"Love",     pressure:"Time and distance",               tags:[]},
  {id:"c_diffgoals",   n:"Different Life Goals",              cat:"Love",     pressure:"Future incompatibility",          tags:[]},
  {id:"c_diffclass",   n:"Different Social Classes",          cat:"Love",     pressure:"Lifestyle differences",           tags:[]},
  {id:"c_religdiff",   n:"Religious Differences",             cat:"Love",     pressure:"Values",                          tags:[]},
  {id:"c_bestenem",    n:"Former Best Friends Turned Enemies",cat:"Love",     pressure:"History and hurt",                tags:[]},
  {id:"c_watched",     n:"Someone Is Watching",               cat:"Suspense", pressure:"Safety",                          tags:[]},
  {id:"c_crimeinv",    n:"Hidden Criminal Investigation",     cat:"Suspense", pressure:"Secrets",                         tags:[]},
  {id:"c_witness",     n:"Witness To A Crime",                cat:"Suspense", pressure:"Danger",                          tags:[]},
  {id:"c_wrongaccus",  n:"Wrongfully Accused",                cat:"Suspense", pressure:"Reputation and freedom",          tags:[]},
  {id:"c_blackmail",   n:"Blackmail",                         cat:"Suspense", pressure:"Exposure",                        tags:[]},
  {id:"c_corruption",  n:"Corporate Corruption Discovery",    cat:"Suspense", pressure:"Doing the right thing",           tags:[]},
  {id:"c_missing",     n:"Missing Person Case",               cat:"Suspense", pressure:"Urgency",                         tags:[]},
  {id:"c_dangersecret",n:"Dangerous Family Secret",           cat:"Suspense", pressure:"Generational consequences",       tags:[]},
  {id:"c_polit",       n:"Political Scandal",                 cat:"Suspense", pressure:"Public fallout",                  tags:[]},
  {id:"c_cyberbreach", n:"Cybersecurity Breach",              cat:"Suspense", pressure:"Information exposure",            tags:[]},
  {id:"c_div20",       n:"Divorce After 20+ Years",           cat:"Reinvention", pressure:"Identity shift",               tags:["bestseller"]},
  {id:"c_empty",       n:"Empty Nest Transition",             cat:"Reinvention", pressure:"Rediscovering purpose",        tags:[]},
  {id:"c_jobloss",     n:"Job Loss Mid-Career",               cat:"Reinvention", pressure:"Reinvention",                  tags:["bestseller"]},
  {id:"c_agingparents",n:"Caring For Aging Parents",          cat:"Reinvention", pressure:"Competing priorities",         tags:[]},
  {id:"c_health",      n:"Major Health Challenge",            cat:"Reinvention", pressure:"Life reassessment",            tags:[]},
  {id:"c_hometown",    n:"Returning To Hometown",             cat:"Black Romance", pressure:"Past unresolved issues",     tags:["bestseller"]},
  {id:"c_savelegacy",  n:"Saving The Family Legacy",          cat:"Black Romance", pressure:"Generational responsibility",tags:["bestseller"]},
  {id:"c_redev",       n:"Community Redevelopment Battle",    cat:"Black Romance", pressure:"Protecting neighborhood identity", tags:["bestseller"]},
  {id:"c_wealthkeep",  n:"Building Wealth Without Losing Relationships", cat:"Black Romance", pressure:"Success changes dynamics", tags:[]},
  {id:"c_excelhappy",  n:"Balancing Black Excellence With Personal Happiness", cat:"Black Romance", pressure:"Achievement vs fulfillment", tags:[]},
];

const BESTSELLER_CONFLICTS = [
  "Family Business Succession Battle","Returning To Hometown","Job Loss Mid-Career",
  "Professional Competition","Family Secret About To Be Exposed","Saving The Family Legacy",
  "Forced Business Partnership","Ex Returns","Divorce After 20+ Years","Community Redevelopment Battle"
];

// Marketable Conflict Stacks — pre-built wound + conflict combos
const CONFLICT_STACKS = [
  {id:"st_kennedy", name:"Kennedy Ryan Style",     theme:"Purpose + Love + Impact", woundId:"w_burnout",  conflictId:"c_redev",     desc:"Career Burnout meets Community Redevelopment"},
  {id:"st_wfic",    name:"Women's Fiction",         theme:"Reinvention",             woundId:"w_strong",   conflictId:"c_jobloss",   desc:"Always The Strong One meets Job Loss Mid-Career"},
  {id:"st_luxury",  name:"Luxury Romance",          theme:"Legacy + Power",          woundId:"w_earned",   conflictId:"c_succession",desc:"Love Must Be Earned meets Family Business Succession"},
  {id:"st_urban",   n:"Urban Romance",              theme:"Loyalty",                 woundId:"w_fambetr",  conflictId:"c_dangersecret",desc:"Family Betrayal meets Dangerous Family Secret"},
  {id:"st_susp",    name:"Romantic Suspense",       theme:"Truth + Trust",           woundId:"w_fambetr",  conflictId:"c_corruption",desc:"Trust collapse meets Corporate Corruption"},
];

// ── Relationship Obstacles (50) ───────────────────────────────
const OBSTACLES = [
  {id:"o_notrust",   n:"One Partner Doesn't Trust Easily",         cat:"Trust",        question:"Can they trust again?",                tags:["bestseller"]},
  {id:"o_bothsecret",n:"Both Are Keeping Secrets",                 cat:"Trust",        question:"What happens when truth comes out?",   tags:[]},
  {id:"o_wascheated",n:"One Partner Was Cheated On",               cat:"Trust",        question:"Can they stop expecting history to repeat?", tags:[]},
  {id:"o_loveends",  n:"One Partner Believes Love Always Ends",    cat:"Trust",        question:"Can happiness last?",                  tags:[]},
  {id:"o_tests",     n:"One Partner Constantly Tests The Relationship", cat:"Trust",   question:"Will the other stay?",                 tags:[]},
  {id:"o_neednone",  n:"Neither Wants To Need Anyone",              cat:"Vulnerability",question:"Who breaks first?",                    tags:["bestseller"]},
  {id:"o_nofeelings",n:"One Partner Refuses To Discuss Feelings",  cat:"Vulnerability",question:"Can intimacy develop?",                tags:[]},
  {id:"o_hideswork", n:"One Partner Hides Behind Work",            cat:"Vulnerability",question:"Can they make room for love?",         tags:["bestseller"]},
  {id:"o_humor",     n:"One Partner Uses Humor To Avoid",          cat:"Vulnerability",question:"Can they be emotionally honest?",      tags:[]},
  {id:"o_strong",    n:"One Partner Always Appears Strong",        cat:"Vulnerability",question:"Can they let someone care for them?", tags:["bestseller"]},
  {id:"o_wrongtime", n:"Wrong Time In Life",                       cat:"Timing",       question:"Can timing align?",                    tags:[]},
  {id:"o_recentdiv", n:"Recent Divorce",                           cat:"Timing",       question:"Is one ready?",                        tags:["bestseller"]},
  {id:"o_career",    n:"Career Launch Period",                     cat:"Timing",       question:"Ambition vs romance",                  tags:["bestseller"]},
  {id:"o_famrespons",n:"Major Family Responsibility",              cat:"Timing",       question:"Is love a priority?",                  tags:[]},
  {id:"o_movingsoon",n:"Preparing To Relocate",                    cat:"Timing",       question:"Future uncertainty",                   tags:[]},
  {id:"o_famdisapp", n:"Family Doesn't Approve",                   cat:"Family",       question:"Whose voice wins?",                    tags:["bestseller"]},
  {id:"o_famdepend", n:"Family Depends Too Much On One Partner",   cat:"Family",       question:"Can love compete with duty?",          tags:[]},
  {id:"o_exembed",   n:"Ex Is Still Embedded In Family Life",      cat:"Family",       question:"Can past coexist with present?",       tags:[]},
  {id:"o_kidsresist",n:"Children Resist The Relationship",         cat:"Family",       question:"Can the family blend?",                tags:[]},
  {id:"o_legacy",    n:"Family Legacy Creates Pressure",           cat:"Family",       question:"Choose love or legacy?",               tags:[]},
  {id:"o_wealthier", n:"One Partner Is Significantly Wealthier",   cat:"Power",        question:"Can power balance?",                   tags:[]},
  {id:"o_moresucc",  n:"One Partner Is More Successful",           cat:"Power",        question:"Comparison and insecurity",            tags:[]},
  {id:"o_compet",    n:"Competitive Personalities",                cat:"Power",        question:"Everything becomes a contest",         tags:[]},
  {id:"o_public",    n:"One Partner Is Publicly Known",            cat:"Power",        question:"Privacy becomes difficult",            tags:[]},
  {id:"o_diffsucc",  n:"Different Views Of Success",               cat:"Power",        question:"Different futures",                    tags:[]},
  {id:"o_idsearch",  n:"One Partner Doesn't Know Who They Are Yet",cat:"Identity",     question:"Can they grow together?",              tags:[]},
  {id:"o_midlife",   n:"Midlife Reinvention",                      cat:"Identity",     question:"Everything is changing",               tags:["bestseller"]},
  {id:"o_forothers", n:"One Partner Is Living For Others",         cat:"Identity",     question:"Can they choose self?",                tags:[]},
  {id:"o_outgrow",   n:"Afraid Of Outgrowing Their Community",     cat:"Identity",     question:"Can they have both?",                  tags:[]},
  {id:"o_undeserv",  n:"One Doesn't Believe They Deserve Happiness", cat:"Identity",   question:"Can they accept being chosen?",        tags:["bestseller"]},
  {id:"o_conflictdiff",n:"They Interpret Conflict Differently",    cat:"Communication",question:"Can they speak the same language?",    tags:[]},
  {id:"o_avoidcon",  n:"One Partner Avoids Conflict",              cat:"Communication",question:"Forces growth",                        tags:[]},
  {id:"o_constcomm", n:"One Wants Constant Communication",         cat:"Communication",question:"Different needs",                      tags:[]},
  {id:"o_needspace", n:"One Partner Needs Space",                  cat:"Communication",question:"Independence vs closeness",            tags:[]},
  {id:"o_expressneeds",n:"They Struggle To Express Needs",         cat:"Communication",question:"Can they be heard?",                   tags:[]},
  {id:"o_reass",     n:"One Needs Reassurance, Other Needs Independence",cat:"Wound Collision",question:"Push-pull dynamic",          tags:["bestseller"]},
  {id:"o_chasewithdraw",n:"One Chases, One Withdraws",             cat:"Wound Collision",question:"Classic romance tension",            tags:["bestseller"]},
  {id:"o_bothfear",  n:"Both Fear Rejection",                      cat:"Wound Collision",question:"Nobody makes the first move",       tags:[]},
  {id:"o_bothcontrol",n:"Both Want Control",                        cat:"Wound Collision",question:"Power struggle",                    tags:[]},
  {id:"o_oldwounds", n:"Both Are Protecting Old Wounds",            cat:"Wound Collision",question:"Fear drives behavior",              tags:["bestseller"]},
  {id:"o_diffcities",n:"Different Cities",                         cat:"Lifestyle",     question:"Distance",                            tags:[]},
  {id:"o_diffcircles",n:"Different Social Circles",                cat:"Lifestyle",     question:"Belonging issues",                    tags:[]},
  {id:"o_religion",  n:"Different Religious Commitment Levels",    cat:"Lifestyle",     question:"Values conflict",                     tags:[]},
  {id:"o_famgoals",  n:"Different Family Goals",                   cat:"Lifestyle",     question:"Marriage, children, lifestyle",       tags:[]},
  {id:"o_risk",      n:"Different Risk Tolerance",                 cat:"Lifestyle",     question:"Security vs adventure",               tags:[]},
  {id:"o_oneavail",  n:"One Emotionally Available, Other Isn't",   cat:"High Tension",  question:"Who closes the gap?",                 tags:["bestseller"]},
  {id:"o_4ever1now", n:"One Wants Forever, One Wants Casual",      cat:"High Tension",  question:"Will hearts align?",                  tags:["bestseller"]},
  {id:"o_runnerchooser",n:"One Ready To Be Chosen, Other Still Running",cat:"High Tension",question:"Can the runner stop?",            tags:["bestseller"]},
  {id:"o_lovenotfit",n:"They Love Each Other But Lives Don't Fit", cat:"High Tension",  question:"Can they build a life that fits?",   tags:["bestseller"]},
  {id:"o_mustchange",n:"Must Become Different People To Be Together",cat:"High Tension",question:"The highest-level obstacle",         tags:["bestseller"]},
];

const BESTSELLER_OBSTACLES = [
  "One Partner Doesn't Trust Easily","Career Launch Period","Family Doesn't Approve",
  "One Partner Always Appears Strong","One Partner Hides Behind Work","Neither Wants To Need Anyone",
  "One Emotionally Available, Other Isn't","One Doesn't Believe They Deserve Happiness",
  "One Ready To Be Chosen, Other Still Running","Both Are Protecting Old Wounds"
];

// Powerful obstacle pairings
const OBSTACLE_PAIRINGS = [
  {name:"Vulnerability x Strong One",   hero:"Fears Vulnerability",          heroine:"Always The Strong One",     note:"Both refuse help"},
  {name:"Career First x Burnout",       hero:"Career First",                 heroine:"Rebuilding After Burnout",  note:"Different priorities"},
  {name:"Protective x Independent",     hero:"Protective And Controlling",   heroine:"Values Independence",        note:"Natural tension"},
  {name:"Undeserving x Reassurance",    hero:"Doesn't Believe He Deserves Love", heroine:"Needs Reassurance",     note:"Push-pull dynamic"},
  {name:"Avoid x Direct",               hero:"Avoids Conflict",              heroine:"Demands Direct Communication",note:"Forces growth"},
];


const HEROINES = [
  {id:"f_burnout",   n:"The Burned-Out Executive",         cat:"Corporate",        wound:"Self-worth tied to achievement",        P:10,W:9, E:4,R:6, Ch:5, tags:["top"]},
  {id:"f_hr",        n:"The HR Leader",                    cat:"Corporate",        wound:"Over-functioning for others",           P:8, W:7, E:7,R:8, Ch:8, tags:[]},
  {id:"f_attorney",  n:"The Attorney",                     cat:"Corporate",        wound:"Difficulty trusting others",            P:9, W:8, E:4,R:6, Ch:5, tags:[]},
  {id:"f_surgeon",   n:"The Surgeon",                      cat:"Corporate",        wound:"Fear of dependence",                    P:9, W:9, E:4,R:8, Ch:6, tags:[]},
  {id:"f_hospadmin", n:"The Hospital Administrator",       cat:"Corporate",        wound:"Need for control",                      P:9, W:8, E:5,R:7, Ch:7, tags:[]},
  {id:"f_tech",      n:"The Tech Founder",                 cat:"Corporate",        wound:"Fear of failure",                       P:9, W:9, E:3,R:5, Ch:4, tags:["top"]},
  {id:"f_acct",      n:"The Accountant",                   cat:"Corporate",        wound:"Fear of risk",                          P:7, W:7, E:4,R:5, Ch:5, tags:[]},
  {id:"f_finadv",    n:"The Financial Advisor",            cat:"Corporate",        wound:"Scarcity mindset",                      P:8, W:8, E:4,R:6, Ch:5, tags:[]},
  {id:"f_mkting",    n:"The Marketing Executive",          cat:"Corporate",        wound:"Fear of authenticity",                  P:8, W:8, E:5,R:5, Ch:6, tags:[]},
  {id:"f_re",        n:"The Real Estate Mogul",            cat:"Corporate",        wound:"Fear of losing everything",             P:9, W:10,E:4,R:6, Ch:6, tags:[]},
  {id:"f_boutique",  n:"The Boutique Owner",               cat:"Entrepreneur",     wound:"Trusts her brand more than people",     P:6, W:6, E:7,R:6, Ch:8, tags:["top"]},
  {id:"f_event",     n:"The Event Planner",                cat:"Entrepreneur",     wound:"Designs joy for others, not herself",   P:7, W:6, E:7,R:7, Ch:8, tags:[]},
  {id:"f_interior",  n:"The Interior Designer",            cat:"Entrepreneur",     wound:"Builds beautiful spaces, hides in them",P:7, W:7, E:7,R:6, Ch:7, tags:[]},
  {id:"f_influencer",n:"The Influencer",                   cat:"Entrepreneur",     wound:"Curates self for the world",            P:8, W:8, E:6,R:5, Ch:7, tags:[]},
  {id:"f_podcaster", n:"The Podcaster",                    cat:"Entrepreneur",     wound:"Voice for many, listens to few",        P:7, W:6, E:8,R:6, Ch:8, tags:[]},
  {id:"f_author",    n:"The Author",                       cat:"Entrepreneur",     wound:"Writes love stories, doesn't live them",P:6, W:7, E:7,R:5, Ch:6, tags:[]},
  {id:"f_fashion",   n:"The Fashion Designer",             cat:"Entrepreneur",     wound:"Designs identity for others",           P:8, W:8, E:7,R:5, Ch:6, tags:[]},
  {id:"f_restowner", n:"The Restaurant Owner",             cat:"Entrepreneur",     wound:"Feeds the world, starves emotionally",  P:7, W:7, E:7,R:7, Ch:9, tags:[]},
  {id:"f_beauty",    n:"The Beauty Brand Founder",         cat:"Entrepreneur",     wound:"Built around looking unbreakable",      P:8, W:8, E:7,R:6, Ch:7, tags:[]},
  {id:"f_coffee",    n:"The Coffee Shop Owner",            cat:"Entrepreneur",     wound:"Creates community, lives outside it",   P:5, W:5, E:7,R:6, Ch:9, tags:[]},
  {id:"f_teacher",   n:"The Teacher",                      cat:"Community",        wound:"Gives more than she receives",          P:5, W:5, E:8,R:9, Ch:10,tags:[]},
  {id:"f_principal", n:"The Principal",                    cat:"Community",        wound:"Authority lonely at the top",           P:7, W:6, E:7,R:9, Ch:10,tags:[]},
  {id:"f_sw",        n:"The Social Worker",                cat:"Community",        wound:"Boundary erosion",                      P:6, W:4, E:7,R:10,Ch:10,tags:[]},
  {id:"f_nonprof",   n:"The Nonprofit Founder",            cat:"Community",        wound:"Mission over self",                     P:7, W:5, E:7,R:9, Ch:10,tags:["top"]},
  {id:"f_activist",  n:"The Community Activist",           cat:"Community",        wound:"Fighting drains her ability to receive",P:7, W:4, E:8,R:9, Ch:10,tags:[]},
  {id:"f_youthmentor",n:"The Youth Mentor",                cat:"Community",        wound:"Mothers others, not herself",           P:5, W:5, E:8,R:9, Ch:10,tags:[]},
  {id:"f_pd",        n:"The Pastor's Daughter",            cat:"Community",        wound:"Performing perfection",                 P:6, W:5, E:6,R:7, Ch:10,tags:[]},
  {id:"f_church",    n:"The Church Leader",                cat:"Community",        wound:"Faith strong, vulnerability scary",     P:7, W:5, E:7,R:8, Ch:10,tags:[]},
  {id:"f_counselor", n:"The Guidance Counselor",           cat:"Community",        wound:"Sees everyone's pain but her own",      P:6, W:5, E:8,R:9, Ch:9, tags:[]},
  {id:"f_foster",    n:"The Foster Parent",                cat:"Community",        wound:"Loves what others abandoned",           P:6, W:5, E:8,R:10,Ch:9, tags:[]},
  {id:"f_nurse",     n:"The Nurse",                        cat:"Healthcare",       wound:"Caregiver burnout",                     P:6, W:5, E:6,R:10,Ch:8, tags:[]},
  {id:"f_travnurse", n:"The Traveling Nurse",              cat:"Healthcare",       wound:"Never stops moving",                    P:6, W:6, E:5,R:10,Ch:6, tags:[]},
  {id:"f_pt",        n:"The Physical Therapist",           cat:"Healthcare",       wound:"Helping others rebuild while she breaks",P:6, W:6, E:8,R:8, Ch:8, tags:[]},
  {id:"f_psych",     n:"The Psychologist",                 cat:"Healthcare",       wound:"Holds others' stories, hides her own",  P:7, W:7, E:8,R:7, Ch:7, tags:["top"]},
  {id:"f_doula",     n:"The Doula",                        cat:"Healthcare",       wound:"Witnesses life, lives in service",      P:6, W:5, E:9,R:10,Ch:9, tags:[]},
  {id:"f_divorced",  n:"The Recently Divorced Woman",      cat:"Reinvention",      wound:"Rebuilding identity post-marriage",     P:6, W:6, E:5,R:6, Ch:6, tags:["top"]},
  {id:"f_empty",     n:"The Empty Nester",                 cat:"Reinvention",      wound:"Mother first, woman second",            P:6, W:6, E:6,R:8, Ch:7, tags:["top"]},
  {id:"f_laidoff",   n:"The Recently Laid-Off Executive",  cat:"Reinvention",      wound:"Identity tied to her title",            P:8, W:6, E:5,R:6, Ch:6, tags:[]},
  {id:"f_retired",   n:"The Newly Retired Professional",   cat:"Reinvention",      wound:"What now?",                             P:7, W:8, E:6,R:6, Ch:7, tags:[]},
  {id:"f_widow",     n:"The Widow",                        cat:"Reinvention",      wound:"Loving again feels like betrayal",      P:6, W:6, E:5,R:7, Ch:7, tags:[]},
  {id:"f_heir",      n:"The Reluctant Heir",               cat:"Family Saga",      wound:"Forced into a legacy she didn't choose",P:7, W:9, E:5,R:6, Ch:7, tags:["top"]},
  {id:"f_fixer",     n:"The Family Fixer",                 cat:"Family Saga",      wound:"Cleans everyone's mess",                P:7, W:7, E:7,R:9, Ch:8, tags:["top"]},
  {id:"f_blacksheep",n:"The Black Sheep Daughter",         cat:"Family Saga",      wound:"Never fully accepted",                  P:6, W:5, E:6,R:6, Ch:5, tags:[]},
  {id:"f_oldest",    n:"The Oldest Daughter",              cat:"Family Saga",      wound:"Parentified",                           P:6, W:6, E:6,R:9, Ch:8, tags:[]},
  {id:"f_secrethr",  n:"The Secret Heir",                  cat:"Family Saga",      wound:"Discovers a hidden lineage",            P:6, W:9, E:6,R:6, Ch:6, tags:[]},
  {id:"f_journo",    n:"The Investigative Journalist",     cat:"Romantic Suspense",wound:"Chases truth, runs from her own",       P:7, W:5, E:6,R:7, Ch:7, tags:["top"]},
  {id:"f_det",       n:"The Detective",                    cat:"Romantic Suspense",wound:"Protects everyone except herself",      P:7, W:5, E:5,R:9, Ch:7, tags:[]},
  {id:"f_fed",       n:"The Federal Agent",                cat:"Romantic Suspense",wound:"Lives behind emotional walls",          P:8, W:6, E:4,R:9, Ch:5, tags:[]},
  {id:"f_crisis",    n:"The Crisis Consultant",            cat:"Romantic Suspense",wound:"Solves disasters, ignores her own",     P:8, W:8, E:6,R:7, Ch:5, tags:[]},
  {id:"f_whistle",   n:"The Whistleblower",                cat:"Romantic Suspense",wound:"Risked everything for truth",           P:6, W:4, E:5,R:8, Ch:7, tags:[]},
  {id:"f_chro",      n:"The CHRO",                         cat:"Fresh Opportunity",wound:"Builds people, neglects her own heart", P:9, W:8, E:8,R:8, Ch:9, tags:["fresh"]},
  {id:"f_hadmin",    n:"The Hospital Administrator (Sr)",  cat:"Fresh Opportunity",wound:"Manages crisis daily, can't manage hers",P:9,W:8, E:5,R:7, Ch:7, tags:["fresh"]},
  {id:"f_pm",        n:"The Program Manager",              cat:"Fresh Opportunity",wound:"Manages everyone else's chaos",         P:7, W:6, E:7,R:7, Ch:8, tags:["fresh"]},
  {id:"f_aic",       n:"The AI Consultant",                cat:"Fresh Opportunity",wound:"Trusts logic over feelings",            P:8, W:8, E:5,R:5, Ch:5, tags:["fresh"]},
  {id:"f_wfstrat",   n:"The Workforce Strategist",         cat:"Fresh Opportunity",wound:"Plans futures, lives in spreadsheets",  P:8, W:7, E:7,R:7, Ch:9, tags:["fresh"]},
  {id:"f_cclead",    n:"The Corporate Change Leader",      cat:"Fresh Opportunity",wound:"Transforms companies, not herself",     P:8, W:8, E:6,R:6, Ch:6, tags:["fresh"]},
  {id:"f_recruiter", n:"The Internal Recruiter",           cat:"Fresh Opportunity",wound:"Finds matches for everyone else",       P:7, W:6, E:7,R:7, Ch:8, tags:["fresh"]},
  {id:"f_ld",        n:"The L&D Leader",                   cat:"Fresh Opportunity",wound:"Designs growth, resists her own",       P:7, W:7, E:8,R:7, Ch:9, tags:["fresh"]},
  {id:"f_hcops",     n:"The Healthcare Operations Leader", cat:"Fresh Opportunity",wound:"Built to fix systems",                  P:9, W:9, E:5,R:7, Ch:7, tags:["fresh"]},
  {id:"f_tmexec",    n:"The Talent Management Executive",  cat:"Fresh Opportunity",wound:"Develops potential, hers untapped",     P:9, W:8, E:7,R:7, Ch:8, tags:["fresh"]},
];

// ── Emotional Wounds (50) — enriched with sev/src/trig ────────
// sev = severity (1-10), src = source (Family/Love/Career/Identity/Faith/Community)
// fear = relationship impact, trig = trigger behaviors, heal = healing requirements
const WOUNDS = [
  {id:"w_father",   n:"Father Abandonment",                 cat:"Abandonment", src:"Family",    sev:9,  fear:"Getting too attached",        trig:"Tests partner; pulls away when love feels real", heal:"Learning consistency exists",          tags:["bestseller"]},
  {id:"w_mother",   n:"Mother Abandonment",                 cat:"Abandonment", src:"Family",    sev:9,  fear:"Not worth staying for",       trig:"Self-sabotage; preemptive rejection",            heal:"Discovering inherent worth",           tags:[]},
  {id:"w_addict",   n:"Parent Chose Addiction Over Family", cat:"Abandonment", src:"Family",    sev:9,  fear:"Always expecting disappointment", trig:"Hypervigilance for inconsistency",          heal:"Trusting reliability",                 tags:[]},
  {id:"w_grandpar", n:"Raised By Grandparents",             cat:"Abandonment", src:"Family",    sev:6,  fear:"Feeling unwanted",            trig:"Difficulty accepting being a priority",          heal:"Understanding sacrifice and love",     tags:[]},
  {id:"w_foster",   n:"Childhood Foster Care",              cat:"Abandonment", src:"Family",    sev:8,  fear:"Never truly belonging",       trig:"Keeping one foot out the door",                  heal:"Finding home",                         tags:[]},
  {id:"w_chosen",   n:"Never Felt Chosen",                  cat:"Rejection",   src:"Identity",  sev:7,  fear:"Being second best",           trig:"Constant comparison; jealousy spirals",          heal:"Accepting love fully",                 tags:[]},
  {id:"w_romreject",n:"Repeated Romantic Rejection",        cat:"Rejection",   src:"Love",      sev:6,  fear:"Risking vulnerability",       trig:"Emotional armor; deflection with humor",         heal:"Trying again",                         tags:[]},
  {id:"w_acafail",  n:"Academic Failure",                   cat:"Rejection",   src:"Identity",  sev:5,  fear:"Inadequacy",                  trig:"Overachieving to compensate; impostor spirals",  heal:"Separating worth from achievement",    tags:[]},
  {id:"w_careersb", n:"Career Setback",                     cat:"Rejection",   src:"Career",    sev:5,  fear:"Feeling like a failure",      trig:"Avoidance of new risks; defensive about work",   heal:"Redefining success",                   tags:[]},
  {id:"w_humiliat", n:"Public Humiliation",                 cat:"Rejection",   src:"Identity",  sev:7,  fear:"Being seen",                  trig:"Hiding; over-controlled image management",       heal:"Authenticity",                         tags:[]},
  {id:"w_parent",   n:"Parentification",                    cat:"Family",      src:"Family",    sev:8,  fear:"Believing rest is selfish",   trig:"Compulsive caretaking; resentment of own needs", heal:"Learning to receive care",             tags:["bestseller"]},
  {id:"w_oldest",   n:"Oldest Daughter Syndrome",           cat:"Family",      src:"Family",    sev:7,  fear:"Needing to carry everyone",   trig:"Cannot say no; collapse-then-reset cycles",      heal:"Setting boundaries",                   tags:[]},
  {id:"w_scape",    n:"Family Scapegoat",                   cat:"Family",      src:"Family",    sev:8,  fear:"Never being enough",          trig:"Self-deprecation; over-apologizing",             heal:"Self-acceptance",                      tags:[]},
  {id:"w_golden",   n:"Family Golden Child",                cat:"Family",      src:"Family",    sev:7,  fear:"Losing approval",             trig:"Perfectionism; people-pleasing",                 heal:"Living authentically",                 tags:[]},
  {id:"w_fambetr",  n:"Family Betrayal",                    cat:"Family",      src:"Family",    sev:9,  fear:"Trust",                       trig:"Refusing to confide; assumes worst motives",     heal:"Opening up again",                     tags:["bestseller"]},
  {id:"w_cheated",  n:"Cheated On",                         cat:"Love",        src:"Love",      sev:9,  fear:"Infidelity",                  trig:"Snooping; suspicion; needing constant proof",    heal:"Trusting again",                       tags:["bestseller"]},
  {id:"w_engaged",  n:"Broken Engagement",                  cat:"Love",        src:"Love",      sev:7,  fear:"Commitment",                  trig:"Bolts at the first 'forever' conversation",      heal:"Risking love",                         tags:[]},
  {id:"w_toxic",    n:"Toxic Marriage",                     cat:"Love",        src:"Love",      sev:9,  fear:"Repeating history",           trig:"Pattern recognition paranoia; flight response",  heal:"Healthy partnership",                  tags:[]},
  {id:"w_divorce",  n:"Divorce",                            cat:"Love",        src:"Love",      sev:8,  fear:"Failure",                     trig:"Guards independence fiercely; resists merging",  heal:"Second chances",                       tags:["bestseller"]},
  {id:"w_unreq",    n:"Unrequited Love",                    cat:"Love",        src:"Love",      sev:6,  fear:"Being unwanted",              trig:"Hides feelings; preemptively rejects self",      heal:"Being chosen",                         tags:[]},
  {id:"w_strong",   n:"Always The Strong One",              cat:"Identity",    src:"Identity",  sev:8,  fear:"Needing help",                trig:"Refuses care; downplays own crises",             heal:"Allowing support",                     tags:["bestseller"]},
  {id:"w_outsider", n:"Black Sheep Of The Family",          cat:"Identity",    src:"Family",    sev:7,  fear:"Rejection",                   trig:"Self-isolation; assumes exclusion",              heal:"Belonging",                            tags:[]},
  {id:"w_imposter", n:"Imposter Syndrome",                  cat:"Identity",    src:"Career",    sev:7,  fear:"Being exposed",               trig:"Overworking; can't accept compliments",          heal:"Owning success",                       tags:[]},
  {id:"w_attract",  n:"Never Felt Attractive",              cat:"Identity",    src:"Identity",  sev:6,  fear:"Physical vulnerability",      trig:"Deflects compliments; avoids intimacy",          heal:"Confidence",                           tags:[]},
  {id:"w_compare",  n:"Constant Comparison",                cat:"Identity",    src:"Identity",  sev:6,  fear:"Not measuring up",            trig:"Status anxiety; jealousy",                       heal:"Self-acceptance",                      tags:[]},
  {id:"w_poverty",  n:"Poverty Trauma",                     cat:"Success",     src:"Career",    sev:9,  fear:"Losing stability",            trig:"Hoarding; refusal to spend on self; control",    heal:"Security",                             tags:["bestseller"]},
  {id:"w_firstgen", n:"First Generation Success",           cat:"Success",     src:"Career",    sev:7,  fear:"Outgrowing loved ones",       trig:"Guilt about success; over-providing for family", heal:"Balance",                              tags:[]},
  {id:"w_workhol",  n:"Workaholism",                        cat:"Success",     src:"Career",    sev:7,  fear:"Prioritizing relationships",  trig:"Cancels plans; phone always out; emotional absence", heal:"Presence",                         tags:[]},
  {id:"w_bizfail",  n:"Business Failure",                   cat:"Success",     src:"Career",    sev:7,  fear:"Taking risks again",          trig:"Risk paralysis; over-cautious",                  heal:"Courage",                              tags:[]},
  {id:"w_burnout",  n:"Career Burnout",                     cat:"Success",     src:"Career",    sev:8,  fear:"Trusting life again",         trig:"Cynicism; flatness; dissociation from work",     heal:"Joy",                                  tags:["bestseller"]},
  {id:"w_lossparent",n:"Loss Of Parent",                    cat:"Grief",       src:"Family",    sev:9,  fear:"More loss",                   trig:"Anniversary dread; clings or distances",         heal:"Living fully",                         tags:[]},
  {id:"w_losschild",n:"Loss Of Child",                      cat:"Grief",       src:"Family",    sev:10, fear:"Future happiness",            trig:"Avoids joy; flinches from children",             heal:"Hope",                                 tags:[]},
  {id:"w_losssib",  n:"Loss Of Sibling",                    cat:"Grief",       src:"Family",    sev:8,  fear:"Family vulnerability",        trig:"Over-protects remaining family",                 heal:"Connection",                           tags:[]},
  {id:"w_widow",    n:"Widowhood",                          cat:"Grief",       src:"Love",      sev:9,  fear:"Loving again",                trig:"Loyalty guilt; comparing new love",              heal:"New beginnings",                       tags:[]},
  {id:"w_caregv",   n:"Caregiver Exhaustion",               cat:"Grief",       src:"Family",    sev:7,  fear:"Self-prioritization",         trig:"Can't accept help; identity tied to caring",     heal:"Receiving care",                       tags:[]},
  {id:"w_bestfr",   n:"Betrayed By Best Friend",            cat:"Trust",       src:"Community", sev:7,  fear:"Friendship intimacy",         trig:"Holds friends at arm's length",                  heal:"Trust",                                tags:[]},
  {id:"w_bizpart",  n:"Business Partner Betrayal",          cat:"Trust",       src:"Career",    sev:8,  fear:"Collaboration",               trig:"Insists on solo control; no co-founders",        heal:"Partnership",                          tags:[]},
  {id:"w_religion", n:"Religious Hurt",                     cat:"Trust",       src:"Faith",     sev:7,  fear:"Community",                   trig:"Avoids spiritual conversations; cynicism",       heal:"Faith renewal",                        tags:[]},
  {id:"w_leadbtr",  n:"Leadership Betrayal",                cat:"Trust",       src:"Career",    sev:7,  fear:"Authority",                   trig:"Authority-allergic; can't accept being led",     heal:"Trusting wisely",                      tags:[]},
  {id:"w_commreject",n:"Community Rejection",               cat:"Trust",       src:"Community", sev:7,  fear:"Belonging",                   trig:"Outsider posture; cynicism about groups",        heal:"Acceptance",                           tags:[]},
  {id:"w_someelse", n:"Living Someone Else's Dream",        cat:"Purpose",     src:"Identity",  sev:7,  fear:"Authenticity",                trig:"Going through motions; emotional flatness",      heal:"Choosing self",                        tags:["bestseller"]},
  {id:"w_lostpurp", n:"Lost Sense Of Purpose",              cat:"Purpose",     src:"Identity",  sev:7,  fear:"Meaninglessness",             trig:"Existential numbness; can't commit forward",     heal:"Rediscovery",                          tags:[]},
  {id:"w_gaveup",   n:"Gave Up Dreams For Family",          cat:"Purpose",     src:"Family",    sev:8,  fear:"Resentment",                  trig:"Sudden anger about past sacrifices",             heal:"Reclaiming identity",                  tags:["bestseller"]},
  {id:"w_wasted",   n:"Fear Of Wasted Potential",           cat:"Purpose",     src:"Identity",  sev:6,  fear:"Regret",                      trig:"Restless inability to settle; chronic dissatisfaction", heal:"Action",                        tags:[]},
  {id:"w_midlife",  n:"Midlife Identity Crisis",            cat:"Purpose",     src:"Identity",  sev:7,  fear:"Starting over",               trig:"Impulsive change-everything energy",             heal:"Reinvention",                          tags:[]},
  {id:"w_earned",   n:"Believes Love Must Be Earned",       cat:"Deep Romance",src:"Love",      sev:8,  fear:"Receiving without performing",trig:"Over-gives; cannot rest in being loved",         heal:"Receiving unconditional love",         tags:["bestseller"]},
  {id:"w_vuln",     n:"Believes Vulnerability Is Weakness", cat:"Deep Romance",src:"Identity",  sev:8,  fear:"Emotional exposure",          trig:"Stoicism; refuses to name feelings",             heal:"Emotional openness",                   tags:[]},
  {id:"w_toomuch",  n:"Believes They Are Too Much",         cat:"Deep Romance",src:"Identity",  sev:7,  fear:"Being abandoned for intensity",trig:"Self-shrinking; pre-apologizing for big feelings",heal:"Being fully accepted",                tags:[]},
  {id:"w_notenough",n:"Believes They Are Not Enough",       cat:"Deep Romance",src:"Identity",  sev:8,  fear:"Being rejected as inadequate",trig:"Compulsive improvement; never settling into self",heal:"Self-worth",                          tags:["bestseller"]},
  {id:"w_lasting",  n:"Believes Happiness Never Lasts",     cat:"Deep Romance",src:"Identity",  sev:7,  fear:"Joy being taken away",        trig:"Bracing in good moments; preemptive sadness",    heal:"Trusting joy",                         tags:[]},
];

// Bestseller wound names — used as AI defaults
const BESTSELLER_WOUNDS = [
  "Parentification","Always The Strong One","Career Burnout","Divorce","Father Abandonment",
  "Cheated On","Poverty Trauma","Family Betrayal","Living Someone Else's Dream",
  "Gave Up Dreams For Family","Believes Love Must Be Earned","Believes They Are Not Enough"
];

// Bestseller wound pairings — pre-built combinations
const WOUND_PAIRINGS = [
  {name:"Vulnerability x Strong One",   heroId:"w_vuln",    heroineId:"w_strong",   note:"Both refuse help"},
  {name:"Father Wound x Earn Love",     heroId:"w_father",  heroineId:"w_earned",   note:"Trust deficit meets performance"},
  {name:"Workaholism x Burnout",        heroId:"w_workhol", heroineId:"w_burnout",  note:"Achievement-driven collision"},
  {name:"Family Betrayal x Divorce",    heroId:"w_fambetr", heroineId:"w_divorce",  note:"Both rebuilding trust"},
  {name:"Strong One x Parentification", heroId:"w_strong",  heroineId:"w_parent",   note:"Two over-functioners learning to rest"},
];

// ── Settings (50) ────────────────────────────────────────────
const SETTINGS = [
  {id:"st_atl",      n:"Atlanta Luxury Neighborhood",         cat:"Luxury",      themes:"Black excellence, entrepreneurship, power couples"},
  {id:"st_vineyard", n:"Martha's Vineyard Summer Community",  cat:"Luxury",      themes:"Legacy, family wealth, tradition"},
  {id:"st_caribbean",n:"Private Caribbean Resort",            cat:"Luxury",      themes:"Escape, intimacy, luxury"},
  {id:"st_hotel",    n:"Black-Owned Luxury Hotel",            cat:"Luxury",      themes:"Business, hospitality, ambition"},
  {id:"st_miami",    n:"Miami Waterfront Penthouse",          cat:"Luxury",      themes:"Success, image, reinvention"},
  {id:"st_napa",     n:"Napa Valley Vineyard",                cat:"Luxury",      themes:"Legacy, healing, slow romance"},
  {id:"st_destwed",  n:"Destination Wedding Resort",          cat:"Luxury",      themes:"Celebration, reunions"},
  {id:"st_realestate",n:"Luxury Real Estate Development",     cat:"Luxury",      themes:"Growth, wealth, competition"},
  {id:"st_country",  n:"High-End Country Club",               cat:"Luxury",      themes:"Status, expectations"},
  {id:"st_travel",   n:"Black-Owned Luxury Travel Company",   cat:"Luxury",      themes:"Adventure, discovery"},
  {id:"st_historic", n:"Historic Black Neighborhood",         cat:"Community",   themes:"Community preservation, redevelopment battles"},
  {id:"st_southern", n:"Tight-Knit Southern Town",            cat:"Community",   themes:"Family reputation, returning home"},
  {id:"st_church",   n:"Church Community",                    cat:"Community",   themes:"Faith, purpose"},
  {id:"st_centerCM", n:"Community Center",                    cat:"Community",   themes:"Service, impact"},
  {id:"st_hbcu",     n:"HBCU Campus",                         cat:"Community",   themes:"Ambition, growth"},
  {id:"st_homecome", n:"HBCU Homecoming Weekend",             cat:"Community",   themes:"Reunion, nostalgia, second chances"},
  {id:"st_cafe",     n:"Neighborhood Coffee Shop",            cat:"Community",   themes:"Daily connection"},
  {id:"st_arts",     n:"Black Cultural Arts District",        cat:"Community",   themes:"Creativity, artist romance"},
  {id:"st_bookstore",n:"Local Bookstore",                     cat:"Community",   themes:"Intellectual connection, slow burn"},
  {id:"st_festival", n:"Community Festival Planning",         cat:"Community",   themes:"Collaboration, forced proximity"},
  {id:"st_corpHQ",   n:"Corporate Headquarters",              cat:"Professional",themes:"Power, ambition, executive romance"},
  {id:"st_hospital", n:"Hospital System",                     cat:"Professional",themes:"Service, burnout"},
  {id:"st_startup",  n:"Tech Startup",                        cat:"Professional",themes:"Innovation, founder romance"},
  {id:"st_lawfirm",  n:"Law Firm",                            cat:"Professional",themes:"Competition, enemies-to-lovers"},
  {id:"st_pr",       n:"Public Relations Agency",             cat:"Professional",themes:"Image management, workplace romance"},
  {id:"st_media",    n:"Media Company",                       cat:"Professional",themes:"Influence, journalist romance"},
  {id:"st_event",    n:"Event Planning Company",              cat:"Professional",themes:"Celebration and chaos"},
  {id:"st_brokerage",n:"Luxury Real Estate Brokerage",        cat:"Professional",themes:"Success, competitive romance"},
  {id:"st_nonprofit",n:"Nonprofit Organization",              cat:"Professional",themes:"Purpose, mission-driven romance"},
  {id:"st_consulting",n:"Consulting Firm",                    cat:"Professional",themes:"Travel, achievement"},
  {id:"st_fixerupper",n:"Recently Purchased Fixer-Upper",     cat:"Women's Fiction",themes:"Rebuilding life"},
  {id:"st_famrest",  n:"Family-Owned Restaurant",             cat:"Women's Fiction",themes:"Legacy"},
  {id:"st_famfarm",  n:"Family Farm",                         cat:"Women's Fiction",themes:"Roots"},
  {id:"st_boutiqueB",n:"Boutique Business",                   cat:"Women's Fiction",themes:"Entrepreneurship"},
  {id:"st_downtown", n:"Small Southern Downtown",             cat:"Women's Fiction",themes:"Community"},
  {id:"st_divgroup", n:"Divorce Support Group",               cat:"Women's Fiction",themes:"Healing"},
  {id:"st_retreat",  n:"Wellness Retreat",                    cat:"Women's Fiction",themes:"Transformation"},
  {id:"st_empty",    n:"Empty Nest Suburb",                   cat:"Women's Fiction",themes:"Rediscovery"},
  {id:"st_reunion",  n:"Family Reunion Weekend",              cat:"Women's Fiction",themes:"History"},
  {id:"st_multifam", n:"Multi-Generational Family Home",      cat:"Women's Fiction",themes:"Legacy"},
  {id:"st_security", n:"Family-Owned Security Company",       cat:"Urban",       themes:"Protection"},
  {id:"st_entmgmt",  n:"Entertainment Management Firm",       cat:"Urban",       themes:"Power"},
  {id:"st_club",     n:"Upscale Nightclub",                   cat:"Urban",       themes:"Status"},
  {id:"st_gym",      n:"Boxing Gym",                          cat:"Urban",       themes:"Discipline"},
  {id:"st_garage",   n:"Automotive Customization Shop",       cat:"Urban",       themes:"Community"},
  {id:"st_newsroom", n:"Investigative Newsroom",              cat:"Suspense",    themes:"Truth"},
  {id:"st_campaign", n:"Political Campaign",                  cat:"Suspense",    themes:"Secrets"},
  {id:"st_privsec",  n:"Private Security Firm",               cat:"Suspense",    themes:"Protection"},
  {id:"st_cyber",    n:"Cybersecurity Company",               cat:"Suspense",    themes:"Trust"},
  {id:"st_estate",   n:"Historic Family Estate",              cat:"Suspense",    themes:"Inheritance, secrets"},
];

const CITIES = {
  tier1: ["Atlanta","Charlotte","Houston","Dallas","Washington DC","Chicago"],
  tier2: ["Tampa Bay","Jacksonville","Miami","Nashville","New Orleans","Detroit"],
  tier3: ["Martha's Vineyard","Los Angeles","New York","Oakland","Baltimore","Philadelphia"],
};

// ── Family Structures (40) ────────────────────────────────────
const FAMILIES = [
  {id:"fm_2mid",     n:"Two-Parent Middle-Class Family",     cat:"Traditional",  themes:"Achievement, pressure, perfectionism"},
  {id:"fm_2work",    n:"Two-Parent Working-Class Family",    cat:"Traditional",  themes:"Sacrifice, resilience"},
  {id:"fm_largesibs",n:"Large Family With Multiple Siblings",cat:"Traditional",  themes:"Competition, loyalty"},
  {id:"fm_small1",   n:"Small Family With One Child",        cat:"Traditional",  themes:"Pressure, independence"},
  {id:"fm_multigen", n:"Multi-Generational Household",       cat:"Traditional",  themes:"Tradition, wisdom"},
  {id:"fm_singlemom",n:"Raised By Single Mother",            cat:"Single Parent",themes:"Resilience, responsibility"},
  {id:"fm_singledad",n:"Raised By Single Father",            cat:"Single Parent",themes:"Emotional expression, protection"},
  {id:"fm_singlechoice",n:"Single Mother By Choice",         cat:"Single Parent",themes:"Independence"},
  {id:"fm_widowed",  n:"Widowed Parent Household",           cat:"Single Parent",themes:"Grief, healing"},
  {id:"fm_coparent", n:"Divorced Co-Parent Household",       cat:"Single Parent",themes:"Blending families"},
  {id:"fm_grandma",  n:"Raised By Grandmother",              cat:"Grandparent-Led",themes:"Wisdom, strength"},
  {id:"fm_grandparents",n:"Raised By Grandparents",          cat:"Grandparent-Led",themes:"Belonging, sacrifice"},
  {id:"fm_matriarchgp",n:"Grandparent As Family Matriarch",  cat:"Grandparent-Led",themes:"Legacy"},
  {id:"fm_gpbiz",    n:"Grandparent-Owned Family Business",  cat:"Grandparent-Led",themes:"Inheritance"},
  {id:"fm_legacy",   n:"Multi-Generational Legacy Family",   cat:"Grandparent-Led",themes:"Duty"},
  {id:"fm_empire",   n:"Family Empire",                      cat:"Family Saga",  themes:"Power, succession, legacy"},
  {id:"fm_redynasty",n:"Family Real Estate Dynasty",         cat:"Family Saga",  themes:"Legacy wealth"},
  {id:"fm_restdyn",  n:"Family Restaurant Dynasty",          cat:"Family Saga",  themes:"Tradition"},
  {id:"fm_political",n:"Political Family",                   cat:"Family Saga",  themes:"Public image"},
  {id:"fm_church",   n:"Church Leadership Family",           cat:"Family Saga",  themes:"Faith, expectations"},
  {id:"fm_blended",  n:"Blended Family",                     cat:"Complex",      themes:"Adjustment"},
  {id:"fm_step",     n:"Step-Parent Household",              cat:"Complex",      themes:"Acceptance"},
  {id:"fm_newblend", n:"Newly Blended Family",               cat:"Complex",      themes:"Trust"},
  {id:"fm_halfsib",  n:"Half-Sibling Family",                cat:"Complex",      themes:"Identity"},
  {id:"fm_hidden",   n:"Hidden Relative Family",             cat:"Complex",      themes:"Secrets"},
  {id:"fm_estranged",n:"Estranged Parent Relationship",      cat:"High-Conflict",themes:"Forgiveness"},
  {id:"fm_feud",     n:"Family Feud",                        cat:"High-Conflict",themes:"Loyalty"},
  {id:"fm_dividedbiz",n:"Divided Family Business",           cat:"High-Conflict",themes:"Control"},
  {id:"fm_secret",   n:"Family Secret Household",            cat:"High-Conflict",themes:"Truth"},
  {id:"fm_emptynest",n:"Empty Nest Family",                  cat:"Women's Fiction",themes:"Reinvention"},
  {id:"fm_sandwich", n:"Sandwich Generation Family",         cat:"Women's Fiction",themes:"Burnout, competing care"},
  {id:"fm_returning",n:"Adult Children Returning Home",      cat:"Women's Fiction",themes:"Transition"},
  {id:"fm_security2",n:"Family-Owned Security Business",     cat:"Urban Romance",themes:"Protection"},
  {id:"fm_entbiz",   n:"Family-Owned Entertainment Business",cat:"Urban Romance",themes:"Power"},
  {id:"fm_dualworld",n:"Family With Street & Corporate Worlds",cat:"Urban Romance",themes:"Dual identities"},
  {id:"fm_reformed", n:"Reformed Family Legacy",             cat:"Urban Romance",themes:"Redemption"},
  {id:"fm_cousins",  n:"Tight-Knit Cousin Network",          cat:"Urban Romance",themes:"Community"},
  {id:"fm_matriarch",n:"Strong Matriarch Family",            cat:"Black Romance Favorite",themes:"Strength and wisdom",tags:["bestseller"]},
  {id:"fm_sundinner",n:"Big Sunday Dinner Family",           cat:"Black Romance Favorite",themes:"Tradition",tags:["bestseller"]},
  {id:"fm_entrepfam",n:"Family Of Entrepreneurs",            cat:"Black Romance Favorite",themes:"Ambition"},
  {id:"fm_hbculegacy",n:"HBCU Legacy Family",                cat:"Black Romance Favorite",themes:"Achievement"},
  {id:"fm_military", n:"Military Family",                    cat:"Black Romance Favorite",themes:"Duty"},
  {id:"fm_corpexec", n:"Corporate Executive Family",         cat:"Fresh Opportunity",themes:"Achievement vs connection",tags:["fresh"]},
  {id:"fm_hclead",   n:"Healthcare Leadership Family",       cat:"Fresh Opportunity",themes:"Service and sacrifice",tags:["fresh"]},
  {id:"fm_npleader", n:"Nonprofit Leadership Family",        cat:"Fresh Opportunity",themes:"Purpose",tags:["fresh"]},
  {id:"fm_techfound",n:"Tech Founder Family",                cat:"Fresh Opportunity",themes:"Innovation vs relationships",tags:["fresh"]},
  {id:"fm_wftransf", n:"Workforce Transformation Family",    cat:"Fresh Opportunity",themes:"Legacy through impact",tags:["fresh"]},
];

// ── Helpers ───────────────────────────────────────────────────
function normalize(vals) {
  const total = Object.values(vals).reduce((a,b)=>a+b,0);
  if (!total) return Object.fromEntries(Object.entries(vals).map(([k])=>[k,0]));
  return Object.fromEntries(Object.entries(vals).map(([k,v])=>[k,Math.round((v/total)*100)]));
}

function scoreForBlend(arch, normLanes) {
  const weights = {
    healing:     {E:1.0, R:0.3, Ch:0.3, P:-0.2},
    community:   {Ch:1.0, E:0.5, R:0.3},
    luxury:      {P:1.0, W:1.0, E:-0.2},
    family:      {P:0.5, W:0.5, R:0.7, Ch:0.5},
    urban:       {P:1.0, W:0.7, R:1.0, Ch:0.4, E:-0.2}, // power + wealth + loyalty (empire/hustler/street-legit); penalize soft high-E archetypes
    reinvention: {E:0.6, P:0.2, Ch:0.3},
    suspense:    {P:0.6, R:0.6, E:-0.3},
    faith:       {Ch:1.0, E:0.5, R:0.3},
    eroticUrban:  {E:0.8, R:0.4, Ch:0.3, P:0.3}, // desire + emotional openness
    sexyContemp:  {E:1.0, Ch:0.5, R:0.3},        // emotional, modern, community
    eroticDrama:  {R:0.9, P:0.6, E:0.4, Ch:0.4}, // possessive/protective, charged
    luxuryErotic: {P:1.0, W:1.0, E:0.2},         // wealth + power, sensual
    streetLit:    {R:1.0, P:0.9, W:0.6, Ch:0.4, E:-0.2}, // loyalty, power, survival; penalize soft
    crimeSaga:    {P:1.0, W:1.0, R:0.8, Ch:0.5, E:-0.2}, // empire, legacy, family power
  };
  let score = 0;
  for (const lane in normLanes) {
    if (!normLanes[lane]) continue;
    const w = weights[lane] || {};
    const pct = normLanes[lane] / 100;
    score += pct * ((w.P||0)*arch.P + (w.W||0)*arch.W + (w.E||0)*arch.E + (w.R||0)*arch.R + (w.Ch||0)*arch.Ch);
  }
  // ── Urban Drama category affinity: attribute scores alone can't tell an
  //    empire king from a same-stat corporate mogul. When the urban lane is
  //    weighted, lift archetypes that actually inhabit the urban-drama world
  //    (power, loyalty, danger), scaled by the urban blend share ──
  const urbanAffinity = { "Urban Romance":1.0, "Protector":0.8, "Family Empire":0.8, "Romantic Suspense":0.6, "Family Saga":0.5, "Entrepreneur":0.3 };
  if (normLanes.urban && urbanAffinity[arch.cat]) {
    score += (normLanes.urban / 100) * 6 * urbanAffinity[arch.cat];
  }

  if (arch.tags.includes("top")) score += 0.3;
  if (arch.tags.includes("grow")) score += 0.2;
  if (arch.tags.includes("fresh")) score += 0.15;
  return score;
}

function topArchetypes(archetypes, normLanes, n=5) {
  if (!Object.values(normLanes).some(v=>v>0)) return [];
  return [...archetypes].map(a=>({a, s:scoreForBlend(a, normLanes)}))
    .sort((x,y)=>y.s-x.s).slice(0,n).map(x=>x.a);
}

// ── API ───────────────────────────────────────────────────────
async function apiCall(sys, user, maxTokens) {
  // Streamed request. Long generations (e.g. the chapter outline) take ~30s,
  // which exceeds the proxy/gateway inactivity timeout for a buffered response.
  // Streaming keeps bytes flowing so the connection stays alive, and we
  // reassemble the text deltas into the same string the callers expect.
  let res;
  try {
    res = await fetch("/api/anthropic/v1/messages", {
      method:"POST",
      headers:{
        "Content-Type":"application/json",
        "x-proxy-secret": import.meta.env.VITE_PROXY_SECRET || "",
      },
      body:JSON.stringify({
        model:"claude-sonnet-4-20250514",
        max_tokens: maxTokens||1500,
        system:sys,
        messages:[{role:"user",content:user}],
        stream:true
      })
    });
  } catch(e) { throw new Error("Network: "+e.message); }

  // Non-streaming error responses (auth, rate limit, bad request) come back as
  // JSON with a non-2xx status — surface their message.
  if (!res.ok || !res.body) {
    let msg = "API error ("+res.status+")";
    try {
      const t = await res.text();
      try { msg = (JSON.parse(t).error?.message) || msg; } catch { if (t) msg = t.slice(0,200); }
    } catch {}
    throw new Error(msg);
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "", text = "", apiError = null;
  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream:true });
      let nl;
      while ((nl = buffer.indexOf("\n")) !== -1) {
        const line = buffer.slice(0, nl).trim();
        buffer = buffer.slice(nl + 1);
        if (!line.startsWith("data:")) continue;
        const payload = line.slice(5).trim();
        if (!payload || payload === "[DONE]") continue;
        let evt;
        try { evt = JSON.parse(payload); } catch { continue; }
        if (evt.type === "content_block_delta" && evt.delta?.type === "text_delta") {
          text += evt.delta.text;
        } else if (evt.type === "error") {
          apiError = evt.error?.message || "API stream error";
        }
      }
    }
  } catch(e) { throw new Error("Network: "+e.message); }

  if (apiError) throw new Error(apiError);
  const raw = text.replace(/```json|```/g,"").trim();
  if (!raw) throw new Error("Empty response");
  return raw;
}

async function apiCallJSON(sys, user, maxTokens) {
  const raw = await apiCall(sys, user, maxTokens);
  const s = raw.indexOf("{");
  const e = raw.lastIndexOf("}");
  if (s===-1||e===-1) throw new Error("No JSON. Got: "+raw.slice(0,100));
  try {
    return JSON.parse(raw.slice(s,e+1));
  } catch(pe) {
    throw new Error("Bad JSON: "+raw.slice(s,s+120));
  }
}

const SYS_STORY = [
  "You are a market-intelligent fiction architect for a private author studio.",
  "You serve a fiction author building original Black romance, women's fiction, urban suspense, family sagas, romantic suspense, and crime mystery for potential audio/streaming adaptation.",
  "",
  "PATTERN RULES (these are absolute):",
  "1. BLEND PATTERNS, DO NOT COPY AUTHORS. Reference authors describe market positioning — never imitate their voice, never name them in output, never copy their plots. Use the PATTERN (themes, character types, emotional depth, pacing, audience) as the genre fingerprint.",
  "2. Every story must include all of: primary genre blend, heroine archetype, hero archetype, emotional wound, external conflict, relationship obstacle, family structure, setting, reader promise, series hook.",
  "3. Every story must identify: familiar market elements, unique differentiator, emotional payoff, adaptation potential.",
  "4. Characters are unapologetically Black, fully realized — authentic joy, excellence, community, love. Never stereotypes. Never tokenized.",
  "5. Stories should be commercially viable AND emotionally true — readers come for the familiar, stay for the differentiator.",
  "",
  "CRITICAL OUTPUT: a single valid JSON object only. Start with { end with }. No prose, no markdown, no explanation. Compact JSON, no extra whitespace inside strings."
].join("\n");

const SYS_CHAPTER = "You are a Black romance novelist writing in the style of Kennedy Ryan and Christina C. Jones — emotionally rich, sensory, character-driven prose. Black characters fully realized. Vivid scene-setting. Show don't tell. Strong voice. Write the requested chapter as continuous narrative prose. No JSON, no markdown headers, no commentary. Just the chapter itself.";

async function generateBlueprint(opts) {
  const { laneVals, tropes, heat, heroineArch, heroArch, heroineWound, heroWound,
          setting, city, family, intensity, externalConflict, relationshipObstacle,
          familyInfluence, spiceLevel, romanceIntensity, eroticRomance, streetLitEng, suspenseEng, universe } = opts;
  const norm = normalize(laneVals);
  const blend = LANES.filter(l=>norm[l.id]>0).map(l=>l.label+": "+norm[l.id]+"%").join(", ");
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
      L.push("", "SUSPENSE ENGINE (each 1-5 — mystery / danger / conspiracy / dread / twists):");
      SUSPENSE_DIMENSIONS.forEach(d => L.push("  " + d.label + ": " + (sp[d.key]||2) + "/5 (" + d.scale[(sp[d.key]||2)-1] + ")"));
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

  // ── CALL 1: Core story ──
  const call1 = [
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
    "openingLine: 1 evocative opening sentence, max 25 words"
  ].filter(Boolean).join("\n");

  const core = await apiCallJSON(SYS_STORY, call1, 2200);

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
    "adaptationPotential: 2 sentences max — audio narration fit, streaming/film potential, series anchor capability"
  ].filter(Boolean).join("\n");

  const struct = await apiCallJSON(SYS_STORY, call2, 3500);
  const result = Object.assign({}, core, struct);
  if (urbanDrama) result.urbanDrama = true;
  return result;
}

async function generateChapterOutline(story, opts) {
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

  return await apiCallJSON(SYS_STORY, user, Math.max(4500, chapterCount * 280));
}

// ── Story Bible System ───────────────────────────────────────
// Persistent state that prevents the most common AI fiction failures:
// characters changing, timelines breaking, plot threads disappearing.

const SYS_BIBLE = [
  "You are a story continuity architect — the developmental editor's brain inside a novelist's process.",
  "Your job: build and maintain the Story Bible that keeps a long-form novel coherent across chapters.",
  "Characters do not change personalities unless an arc justifies it. Timelines do not break. Plot threads do not disappear.",
  "Output is strict JSON only. Start with { end with }. No prose, no markdown, no explanation. Compact JSON, no extra whitespace inside strings."
].join("\n");

// ── Uniqueness Guardrail ─────────────────────────────────────
// Global Registry stored in localStorage; checks new items against history.
// Does not block — flags + suggests alternatives.

const GLOBAL_REGISTRY_KEY = "romanceStoryOS:globalRegistry";

function loadGlobalRegistry() {
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

function saveGlobalRegistry(reg) {
  try {
    if (typeof localStorage !== "undefined") localStorage.setItem(GLOBAL_REGISTRY_KEY, JSON.stringify(reg));
  } catch(e) {}
}

// Token-based Jaccard similarity (0..1). Simple, robust, fast.
function similarityScore(a, b) {
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

// Returns { status: 'PASS'|'WARNING'|'FAIL', score, mostSimilar }
function similarityCheck(item, registryItems) {
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

// Build a plot fingerprint from a story blueprint — used for premise dedup
function buildPlotFingerprint(story) {
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

// Auto-register entities from a generated story into the global registry
function registerStoryEntities(reg, story) {
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

// AI function: generate 10 distinct alternatives for an item
const SYS_ALTERNATIVES = "You are a Black-romance editor with deep market knowledge. You generate distinctive, fresh, commercially viable alternatives that avoid duplicates and tropes-overused-to-death. Output strict JSON only. Start with { end with }.";

async function generateAlternatives(itemType, currentItem, context, avoidList) {
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
  return await apiCallJSON(SYS_ALTERNATIVES, user, 2500);
}

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
async function generateStoryBible(story, outline) {
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
  return await apiCallJSON(SYS_BIBLE, user, 3500);
}

// Generate a continuity report for a chapter that was just written.
// Returns both diagnostics AND structured bible updates to merge.
async function generateContinuityReport(story, bible, chapterNum, chapterProse, outline) {
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
  return await apiCallJSON(SYS_BIBLE, user, 3000);
}

// Apply a continuity report to the bible, returning a new bible object
function mergeBibleUpdates(bible, report, chapterNum) {
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

// Build a compact, chapter-relevant bible slice for the prose prompt
function bibleContextForChapter(bible, chapterNum, outline) {
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

// ── Scene Engine AI Functions ────────────────────────────────
// Replaces single-chapter generation with scene-card-driven writing.
// Story → Part → Chapter → Scene. Scene is the smallest drafting unit.

const SYS_SCENE = [
  "You are a Black-romance novelist writing in the literary commercial vein (Kennedy Ryan, Tia Williams, Ashley Jaquavis).",
  "You are writing ONE SCENE at a time. Not a whole chapter. Not a summary. One scene.",
  "Prose is sensory, character-driven, layered with internal monologue and sharp dialogue.",
  "Maintain the POV, voice, relationship state, conflict state, and continuity defined in the Story Bible exactly.",
  "Never rush, never summarize, never write future scenes. End naturally at the scene's stated outcome."
].join("\n");

// Generate 3-5 scene cards for a single chapter
async function generateSceneCards(story, outline, chapterNum, bible, opts) {
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

  return await apiCallJSON(SYS_BIBLE, user, Math.max(3500, sceneCount * 850));
}

// Write the prose for a single scene
async function writeScene(story, outline, chapterNum, sceneNumber, bible, scene, opts) {
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
  return await apiCall(SYS_SCENE, user, maxTok);
}

// Continue a partially-written scene (same no-recap discipline as continueChapter)
async function continueScene(story, outline, chapterNum, sceneNumber, bible, scene, existingProse, opts) {
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

  return await apiCall(SYS_SCENE, user, Math.min(6000, Math.max(2000, Math.round(maxThisCall * 1.6))));
}

// Auto-summarize a completed scene for the continuity tracker
async function summarizeScene(story, bible, chapterNum, sceneNumber, scene, sceneProse) {
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
  return await apiCallJSON(SYS_BIBLE, user, 1200);
}

// Wrap-up after all scenes in a chapter are complete — chapter-level continuity + arc updates
async function completeChapterWrap(story, outline, chapterNum, scenes, sceneSummaries, sceneProse, bible) {
  const ch = outline.chapters[chapterNum-1];
  const assembled = scenes.map(s => sceneProse[s.sceneNumber] || "").join("\n\n");

  // Run the existing chapter continuity report on the assembled prose
  // (reuses generateContinuityReport which already handles three-state)
  return await generateContinuityReport(story, bible, chapterNum, assembled, outline);
}

// ── Publishing Studio — Book Launch Engine ──────────────────
// Three split calls to avoid JSON truncation on the comprehensive package.

const SYS_PUBLISHING = [
  "You are a Black-romance publishing strategist with deep market intelligence (Amazon KDP, indie publishing, traditional Big Five romance lines).",
  "You produce launch packaging that converts: titles that sell, descriptions that earn clicks, cover direction that fits the shelf, marketing assets that build audience.",
  "Voice: confident, specific, commercially literate. Never generic. Every recommendation must be tied to the genre, the audience, and the actual story.",
  "Output strict JSON only. Start with { end with }. No prose, no markdown, no explanation."
].join("\n");

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
async function generatePackagePart1(story, outline, bible) {
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
  return await apiCallJSON(SYS_PUBLISHING, user, 4500);
}

// CALL 2: Cover Strategy + Series Branding + Author Brand
async function generatePackagePart2(story, outline, bible, positioning) {
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
  return await apiCallJSON(SYS_PUBLISHING, user, 4500);
}

// CALL 3: Marketing Assets + Adaptation + Commercial Readiness
async function generatePackagePart3(story, outline, bible, positioning) {
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
  return await apiCallJSON(SYS_PUBLISHING, user, 4500);
}

// Convenience function — generates ALL three parts in sequence
async function generateBookLaunchPackage(story, outline, bible, onProgress) {
  if (onProgress) onProgress("Generating positioning, titles, descriptions...");
  const part1 = await generatePackagePart1(story, outline, bible);
  if (onProgress) onProgress("Generating cover strategy, series branding, author brand...");
  const part2 = await generatePackagePart2(story, outline, bible, part1.positioning);
  if (onProgress) onProgress("Generating marketing assets, adaptation, readiness score...");
  const part3 = await generatePackagePart3(story, outline, bible, part1.positioning);
  return { ...part1, ...part2, ...part3 };
}

async function writeChapterProse(story, outline, chapterNum, universe, bible, opts) {
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
  return await apiCall(SYS_CHAPTER, user, maxTok);
}

// Continue a partially-written chapter from the exact point it stopped.
// Spec: do NOT recap, do NOT restart, do NOT contradict prior text.
async function continueChapter(story, outline, chapterNum, universe, bible, existingProse, opts) {
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
  return await apiCall(SYS_CHAPTER, user, maxTok);
}

// Generate a structured summary of a completed chapter for the continuity tracker.
async function summarizeChapter(story, bible, chapterNum, chapterProse, outline) {
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
  return await apiCallJSON(SYS_BIBLE, user, 1200);
}

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

const UNIVERSE_GENRES = [
  "Black Contemporary Romance","Women's Fiction","Emotional Healing Romance",
  "Power & Purpose Romance","Romantic Suspense","Family Saga",
  "Urban Suspense","Crime Drama","Crime Mystery","Political Thriller",
  "Corporate Mystery","Reinvention Romance","Faith Fiction","Coming of Age",
];

const UNIVERSE_THEMES = [
  "Power","Legacy","Family Secrets","Loyalty","Purpose","Leadership",
  "Reinvention","Community","Love","Truth","Corruption","Identity",
  "Justice","Faith","Redemption","Healing","Black Excellence",
  "Generational Wealth","Sisterhood","Brotherhood","Forgiveness","Sacrifice",
];

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
const DEFAULT_LANE_VALS = { healing:5, community:0, luxury:7, family:0, urban:0, reinvention:0, suspense:0, faith:0, eroticUrban:0, sexyContemp:0, eroticDrama:0, luxuryErotic:0, streetLit:0, crimeSaga:0 };
const DEFAULT_TROPES = ["Enemies to Lovers","Family Empire"];

function freshStoryRecord(id) {
  const now = Date.now();
  return {
    id, title:"Untitled Story", createdAt:now, updatedAt:now,
    laneVals:{...DEFAULT_LANE_VALS}, tropes:[...DEFAULT_TROPES], heat:3,
    heroineArch:null, heroArch:null, heroineWound:null, heroWound:null,
    setting:null, city:null, family:null, intensity:3, externalConflict:null,
    relationshipObstacle:null, familyInfluence:7, spiceLevel:2, romanceIntensity:DEFAULT_INTENSITY,
    eroticRomance:{...DEFAULT_EROTIC}, streetLitEng:{...DEFAULT_STREETLIT}, suspenseEng:{...DEFAULT_SUSPENSE},
    blueprint:null, outline:null, bible:null, chapterProse:{}, chapterReports:{},
    chapterSummaries:{}, chapterSceneCards:{}, sceneProse:{}, sceneSummaries:{}, sceneLocked:{}, bookPackage:null
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
async function generateUniverseLore(universe) {
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
  return await apiCallJSON(sys, user, 4000);
}

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

function Chip({ active, onClick, children, color }) {
  return (
    <button onClick={onClick}
      style={{
        padding:"7px 14px", borderRadius:18,
        background: active ? (color||C.gold) : "transparent",
        color: active ? C.bg : C.text,
        border: "1px solid " + (active ? (color||C.gold) : C.borderLight),
        fontSize:13, fontWeight:500, cursor:"pointer", transition:"all 0.15s",
        fontFamily:"Nunito, sans-serif"
      }}>
      {children}
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
  return (
    <div style={{ marginBottom:18 }}>
      <div style={{ display:"flex", alignItems:"baseline", justifyContent:"space-between", marginBottom:8 }}>
        <div style={{ color:accent||C.gold, fontFamily:"Cormorant Garamond, serif", fontSize:18, fontWeight:600 }}>{label}</div>
        <button onClick={()=>setOpen(!open)}
          style={{ background:"transparent", border:"none", color:C.muted, fontSize:12, cursor:"pointer", textDecoration:"underline" }}>
          {open ? "Close picker" : "Browse all"}
        </button>
      </div>
      <div style={{ padding:"10px 12px", background:C.card, border:"1px solid "+(selected?C.gold:C.border), borderRadius:8 }}>
        <div style={{ color:selected?C.text:C.muted, fontSize:14, fontWeight:600 }}>
          {selected ? selected.n : "AI will choose based on your blend"}
        </div>
        {selected && <div style={{ color:C.muted, fontSize:12, marginTop:3 }}>{selected.cat} · {selected.wound}</div>}
        {selected && (
          <button onClick={()=>onSelect(null)}
            style={{ marginTop:6, background:"transparent", border:"none", color:C.muted, fontSize:11, cursor:"pointer", textDecoration:"underline" }}>
            Clear (let AI choose)
          </button>
        )}
      </div>
      {recommendations && recommendations.length > 0 && !open && (
        <div style={{ marginTop:10 }}>
          <div style={{ color:C.muted, fontSize:11, marginBottom:6, letterSpacing:0.5, textTransform:"uppercase" }}>Recommended for your blend</div>
          <div style={{ display:"grid", gap:6 }}>
            {recommendations.map(a=>(
              <ArchetypeRow key={a.id} arch={a} selected={selected && selected.id===a.id} onClick={()=>onSelect(a)}/>
            ))}
          </div>
        </div>
      )}
      {open && (
        <div style={{ marginTop:12 }}>
          <div style={{ display:"flex", flexWrap:"wrap", gap:6, marginBottom:10 }}>
            {cats.map(c=>(
              <Chip key={c} active={filter===c} onClick={()=>setFilter(c)} color={accent}>{c}</Chip>
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
    { id: "publishingStudio", label: "Publishing Studio", icon: "🚀", requiresStory: true },
    { id: "marketIntelligence", label: "Market Intelligence", icon: "📊" }
  ]},
  { group: "system", items: [
    { id: "settings", label: "Settings", icon: "⚙️" }
  ]}
];

function Sidebar({ active, onChange, onNewStory, hasStory, storyTitle, universeCount }) {
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
        <div style={{ fontWeight:600, color:C.amber, marginBottom:3 }}>Private fiction OS</div>
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

function StoryBibleViewer({ bible }) {
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
                     writing, continuing, summarizing, hasBible }) {
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

      {/* Action buttons (no prose yet) */}
      {!prose && (
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

function ChapterCard({ ch, prose, report, summary, editing, onWrite, onContinue, onRegen, onEdit, onSaveEdit, onCancelEdit,
                       onCheck, onSummarize, onExport, onHandoff,
                       onApplyPatch, onAcknowledgePatch, onMarkResolved,
                       writing, continuing, checking, summarizing, hasBible, blocked, blockReason }) {
  const wordCount = prose ? prose.trim().split(/\s+/).filter(Boolean).length : 0;
  const target = ch.targetWordCount || 2500;
  const pct = Math.min(100, Math.round(wordCount / target * 100));
  const atTarget = wordCount >= target * 0.95;

  const [editBuffer, setEditBuffer] = useState(prose||"");
  useEffect(()=>{ if (editing) setEditBuffer(prose||""); }, [editing, prose]);

  // Status badge color
  const statusColor = report ? (report.status==="PASS"?"#2D8B7A":report.status==="WARNING"?"#B07A1F":"#B8342D") : null;

  return (
    <div style={{ padding:18, background:C.card,
                  border:"1px solid "+(blocked ? "#B8342D" : statusColor || C.border),
                  borderRadius:10, marginBottom:14,
                  opacity: blocked ? 0.7 : 1 }}>
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
          <span style={{ padding:"2px 8px", background:C.surface, border:"1px solid "+C.borderLight, borderRadius:10, fontSize:10, color:C.muted, textTransform:"uppercase", letterSpacing:0.5 }}>
            {ch.pov} POV
          </span>
          <span style={{ padding:"2px 8px", background:C.glow, border:"1px solid "+C.gold, borderRadius:10, fontSize:10, color:C.gold }}>
            {ch.arcStage}
          </span>
          {ch.targetWordCount && (
            <span style={{ padding:"2px 8px", background:C.surface, border:"1px solid "+C.borderLight, borderRadius:10, fontSize:10, color:C.muted }}>
              {ch.targetWordCount.toLocaleString()} words
            </span>
          )}
          {report && (
            <span style={{ padding:"2px 8px", background:statusColor+"22", border:"1px solid "+statusColor,
                           borderRadius:10, fontSize:10, color:statusColor, fontWeight:700 }}>
              {report.status}
            </span>
          )}
        </div>
      </div>
      <div style={{ color:C.muted, fontSize:12, marginBottom:5 }}>
        <span style={{ color:C.amber }}>Scene:</span> {ch.scene}
      </div>
      <div style={{ color:C.text, fontSize:13, marginBottom:8, fontStyle:"italic" }}>
        {ch.beat}
      </div>
      {ch.cliffhangerOrTurn && (
        <div style={{ color:C.muted, fontSize:11, marginBottom:4 }}>
          <span style={{ color:C.amber, fontWeight:600 }}>End turn:</span> {ch.cliffhangerOrTurn}
        </div>
      )}
      {ch.continuityNotes && (
        <div style={{ color:C.muted, fontSize:11, marginBottom:12 }}>
          <span style={{ color:C.amber, fontWeight:600 }}>Continuity:</span> {ch.continuityNotes}
        </div>
      )}

      {blocked && (
        <div style={{ marginBottom:12, padding:"10px 14px", background:"#FBE9E7", border:"1px solid #B8342D", borderRadius:6, color:"#B8342D", fontSize:12 }}>
          🛑 Cannot draft until prior chapter is resolved · {blockReason}
        </div>
      )}

      {!prose && (
        <button onClick={onWrite} disabled={writing || blocked}
          style={{ padding:"8px 16px", background:writing?C.faint:(blocked?C.faint:"transparent"), color:writing?C.muted:(blocked?C.muted:C.gold),
                   border:"1px solid "+(blocked?C.faint:C.gold), borderRadius:6, fontSize:12, fontWeight:600,
                   cursor:writing?"wait":(blocked?"not-allowed":"pointer"), fontFamily:"Nunito, sans-serif" }}>
          {writing ? "Writing..." : (hasBible ? "✦ Write this chapter (bible-aware)" : "✦ Write this chapter")}
        </button>
      )}

      {prose && (
        <>
          {/* Word count progress */}
          <div style={{ marginTop:8, marginBottom:8 }}>
            <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4 }}>
              <span style={{ color:C.muted, fontSize:11 }}>
                <span style={{ color: atTarget?"#2D8B7A":C.amber, fontWeight:700 }}>{wordCount.toLocaleString()}</span> / {target.toLocaleString()} words
              </span>
              <span style={{ color:C.muted, fontSize:11 }}>{pct}%</span>
            </div>
            <div style={{ height:5, background:C.bg, border:"1px solid "+C.borderLight, borderRadius:3, overflow:"hidden" }}>
              <div style={{ height:"100%", width:pct+"%", background: atTarget? "linear-gradient(90deg, #2D8B7A, "+C.gold+")" : C.amber, transition:"width 0.4s" }}/>
            </div>
          </div>

          {/* Prose (read or edit) */}
          {!editing && (
            <div style={{ marginTop:8, padding:16, background:C.bg, border:"1px solid "+C.borderLight, borderRadius:8,
                          color:C.text, fontSize:14, lineHeight:1.8, fontFamily:"Cormorant Garamond, serif",
                          whiteSpace:"pre-wrap", maxHeight:500, overflowY:"auto" }}>
              {prose}
            </div>
          )}
          {editing && (
            <div style={{ marginTop:8 }}>
              <textarea value={editBuffer} onChange={e=>setEditBuffer(e.target.value)}
                style={{ width:"100%", minHeight:400, padding:14, background:C.bg, border:"1px solid "+C.amber, borderRadius:8,
                         color:C.text, fontSize:13, lineHeight:1.7, fontFamily:"Cormorant Garamond, serif",
                         resize:"vertical", boxSizing:"border-box" }}/>
              <div style={{ display:"flex", gap:8, marginTop:8 }}>
                <button onClick={()=>onSaveEdit(editBuffer)}
                  style={{ padding:"6px 14px", background:C.amber, color:C.bg, border:"none", borderRadius:6, fontSize:12, fontWeight:700, cursor:"pointer", fontFamily:"Nunito, sans-serif" }}>
                  💾 Save edits
                </button>
                <button onClick={onCancelEdit}
                  style={{ padding:"6px 14px", background:"transparent", color:C.muted, border:"1px solid "+C.borderLight, borderRadius:6, fontSize:12, fontWeight:600, cursor:"pointer", fontFamily:"Nunito, sans-serif" }}>
                  Cancel
                </button>
                <span style={{ color:C.muted, fontSize:11, marginLeft:"auto", alignSelf:"center" }}>
                  Edits will clear the continuity check for this chapter
                </span>
              </div>
            </div>
          )}

          {/* Primary action row */}
          {!editing && (
            <div style={{ marginTop:12, display:"flex", gap:8, flexWrap:"wrap", alignItems:"center" }}>
              {!atTarget && (
                <button onClick={onContinue} disabled={continuing}
                  style={{ padding:"7px 14px", background:continuing?C.faint:C.gold, color:continuing?C.muted:C.bg,
                           border:"none", borderRadius:6, fontSize:12, fontWeight:700,
                           cursor:continuing?"wait":"pointer", fontFamily:"Nunito, sans-serif" }}>
                  {continuing ? "Continuing..." : "✏️ Continue chapter ("+(target-wordCount).toLocaleString()+" words remaining)"}
                </button>
              )}
              {atTarget && hasBible && !report && (
                <button onClick={onCheck} disabled={checking}
                  style={{ padding:"7px 14px", background:checking?C.faint:"transparent", color:checking?C.muted:C.amber,
                           border:"1px solid "+C.amber, borderRadius:6, fontSize:12, fontWeight:600,
                           cursor:checking?"wait":"pointer", fontFamily:"Nunito, sans-serif" }}>
                  {checking ? "Checking continuity..." : "📋 Run Continuity Check"}
                </button>
              )}
              {atTarget && hasBible && !summary && (
                <button onClick={onSummarize} disabled={summarizing}
                  style={{ padding:"7px 14px", background:summarizing?C.faint:"transparent", color:summarizing?C.muted:C.amber,
                           border:"1px solid "+C.amber, borderRadius:6, fontSize:12, fontWeight:600,
                           cursor:summarizing?"wait":"pointer", fontFamily:"Nunito, sans-serif" }}>
                  {summarizing ? "Summarizing..." : "📝 Summarize for Continuity"}
                </button>
              )}
            </div>
          )}

          {/* Utility action row */}
          {!editing && (
            <div style={{ marginTop:10, display:"flex", gap:6, flexWrap:"wrap" }}>
              <button onClick={onEdit}
                style={{ padding:"5px 10px", background:"transparent", color:C.muted, border:"1px solid "+C.borderLight, borderRadius:5, fontSize:10, cursor:"pointer", fontFamily:"Nunito, sans-serif" }}>
                ✎ Edit
              </button>
              <button onClick={onRegen}
                style={{ padding:"5px 10px", background:"transparent", color:C.muted, border:"1px solid "+C.borderLight, borderRadius:5, fontSize:10, cursor:"pointer", fontFamily:"Nunito, sans-serif" }}>
                🔄 Regenerate
              </button>
              <button onClick={onExport}
                style={{ padding:"5px 10px", background:"transparent", color:C.muted, border:"1px solid "+C.borderLight, borderRadius:5, fontSize:10, cursor:"pointer", fontFamily:"Nunito, sans-serif" }}>
                ⬇ Export .md
              </button>
              <button onClick={onHandoff}
                style={{ padding:"5px 10px", background:"transparent", color:C.muted, border:"1px solid "+C.borderLight, borderRadius:5, fontSize:10, cursor:"pointer", fontFamily:"Nunito, sans-serif" }}>
                📦 Claude Handoff
              </button>
            </div>
          )}

          {/* Continuity report */}
          {report && <ContinuityReportCard report={report}
            onApplyPatch={()=>onApplyPatch && onApplyPatch()}
            onAcknowledgePatch={()=>onAcknowledgePatch && onAcknowledgePatch()}
            onMarkResolved={()=>onMarkResolved && onMarkResolved()}
            onRegenerate={onRegen}/>}

          {/* Chapter summary card */}
          {summary && (
            <div style={{ marginTop:10, padding:"12px 14px", background:C.bg, border:"1px solid "+C.borderLight, borderRadius:8 }}>
              <div style={{ color:C.amber, fontSize:10, letterSpacing:1.5, textTransform:"uppercase", fontWeight:700, marginBottom:6 }}>
                📝 Chapter Summary
              </div>
              <div style={{ color:C.text, fontSize:12, lineHeight:1.6, marginBottom:8 }}>
                {summary.summary}
              </div>
              {summary.keyEvents && summary.keyEvents.length > 0 && (
                <div style={{ color:C.muted, fontSize:11, marginBottom:4 }}>
                  <span style={{ color:C.amber, fontWeight:600 }}>Key events:</span> {summary.keyEvents.join("; ")}
                </div>
              )}
              {summary.characterArcs && summary.characterArcs.length > 0 && (
                <div style={{ color:C.muted, fontSize:11, marginBottom:4 }}>
                  <span style={{ color:C.amber, fontWeight:600 }}>Internal arcs:</span> {summary.characterArcs.join("; ")}
                </div>
              )}
              {summary.openThreads && summary.openThreads.length > 0 && (
                <div style={{ color:C.muted, fontSize:11, marginBottom:4 }}>
                  <span style={{ color:"#D06030", fontWeight:600 }}>Open threads:</span> {summary.openThreads.join("; ")}
                </div>
              )}
              {summary.closedThreads && summary.closedThreads.length > 0 && (
                <div style={{ color:C.muted, fontSize:11 }}>
                  <span style={{ color:"#2D8B7A", fontWeight:600 }}>Resolved:</span> {summary.closedThreads.join("; ")}
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ── Publishing Studio Component ──────────────────────────────

function PublishingPanel({ title, icon, children, defaultOpen=false, accent }) {
  const [open, setOpen] = useState(defaultOpen);
  const ac = accent || C.gold;
  return (
    <div style={{ marginBottom:14, background:C.card, border:"1px solid "+C.borderLight, borderRadius:10, overflow:"hidden" }}>
      <button onClick={()=>setOpen(!open)}
        style={{ width:"100%", padding:"14px 18px", background:"transparent", border:"none", textAlign:"left",
                 cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <span style={{ fontSize:16 }}>{icon}</span>
          <span style={{ color:ac, fontSize:12, letterSpacing:1.5, textTransform:"uppercase", fontWeight:700 }}>{title}</span>
        </div>
        <span style={{ color:C.muted, fontSize:20 }}>{open?"−":"+"}</span>
      </button>
      {open && <div style={{ padding:"4px 18px 20px 18px", borderTop:"1px solid "+C.faint }}>{children}</div>}
    </div>
  );
}

function PublishingStudio({ story, outline, bible, packageData, generating, progress, onGenerate, onExport, error }) {
  const pkg = packageData || {};
  const pos = pkg.positioning;
  const titles = pkg.titles || [];
  const rp = pkg.readerPromiseDetail;
  const desc = pkg.descriptions;
  const cov = pkg.coverStrategy;
  const series = pkg.seriesBranding;
  const author = pkg.authorBrand;
  const mkt = pkg.marketingAssets;
  const adapt = pkg.adaptationReadiness;
  const ready = pkg.commercialReadiness;

  const Score = ({ value, max=10 }) => {
    const v = typeof value === "number" ? value : 0;
    const color = v >= 8 ? "#2D8B7A" : v >= 6 ? "#B07A1F" : "#D88830";
    return <span style={{ padding:"1px 7px", background:color+"22", border:"1px solid "+color, borderRadius:8, fontSize:10, color:color, fontWeight:700 }}>{v}/{max}</span>;
  };

  return (
    <div style={{ marginTop:36, padding:"24px 26px", background:C.surface, border:"1px solid "+C.gold, borderRadius:14 }}>
      <div style={{ display:"flex", alignItems:"baseline", justifyContent:"space-between", flexWrap:"wrap", gap:12, marginBottom:20 }}>
        <div>
          <div style={{ color:C.gold, fontSize:11, letterSpacing:2, textTransform:"uppercase", fontWeight:700, marginBottom:4 }}>
            🚀 Publishing Studio
          </div>
          <div style={{ color:C.text, fontFamily:"Cormorant Garamond, serif", fontSize:26, fontWeight:600 }}>
            Book Launch Package
          </div>
          <div style={{ color:C.muted, fontSize:12, marginTop:4 }}>
            Once your manuscript is publication-ready, this packages it for commercial release.
          </div>
        </div>
        <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
          {!packageData && (
            <button onClick={onGenerate} disabled={generating}
              style={{ padding:"10px 20px", background:generating?C.faint:"linear-gradient(135deg, "+C.gold+", "+C.amber+")",
                       color:generating?C.muted:C.bg, border:"none", borderRadius:8, fontWeight:700, fontSize:13,
                       cursor:generating?"wait":"pointer", fontFamily:"Nunito, sans-serif" }}>
              {generating ? (progress || "Generating package...") : "✨ Generate Launch Package"}
            </button>
          )}
          {packageData && (
            <>
              <button onClick={onGenerate} disabled={generating}
                style={{ padding:"8px 14px", background:"transparent", color:C.amber, border:"1px solid "+C.amber, borderRadius:6, fontSize:12, fontWeight:600, cursor:generating?"wait":"pointer", fontFamily:"Nunito, sans-serif" }}>
                {generating ? "Regenerating..." : "🔄 Regenerate"}
              </button>
              <button onClick={onExport}
                style={{ padding:"8px 14px", background:C.gold, color:C.bg, border:"none", borderRadius:6, fontSize:12, fontWeight:700, cursor:"pointer", fontFamily:"Nunito, sans-serif" }}>
                ⬇ Export Full Package
              </button>
            </>
          )}
        </div>
      </div>

      {error && <div style={{ marginBottom:14, padding:"10px 14px", background:"#FBE9E7", border:"1px solid #B8342D", borderRadius:6, color:"#B8342D", fontSize:12 }}>⚠ {error}</div>}

      {generating && !packageData && (
        <div style={{ padding:"14px 18px", background:C.manuscript, borderLeft:"3px solid "+C.gold, borderRadius:4, color:C.amber, fontSize:12, fontStyle:"italic", marginBottom:14 }}>
          {progress || "Generating comprehensive book launch package (3 AI calls)..."}
        </div>
      )}

      {/* Commercial Readiness Summary — top of package */}
      {ready && (
        <div style={{ marginBottom:18, padding:"18px 22px", background:"linear-gradient(135deg, "+C.card+", "+C.surface+")",
                      border:"2px solid "+C.gold, borderRadius:12 }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"baseline", marginBottom:10, flexWrap:"wrap", gap:8 }}>
            <div>
              <div style={{ color:C.gold, fontSize:11, letterSpacing:1.5, textTransform:"uppercase", fontWeight:700 }}>
                Commercial Readiness Score
              </div>
              <div style={{ color:C.muted, fontSize:11, marginTop:2 }}>How ready this book is for market</div>
            </div>
            <div style={{ color:C.gold, fontFamily:"Cormorant Garamond, serif", fontSize:48, fontWeight:700, lineHeight:1 }}>
              {ready.score}<span style={{ color:C.muted, fontSize:24 }}>/10</span>
            </div>
          </div>
          {ready.strengths && ready.strengths.length > 0 && (
            <div style={{ marginBottom:8 }}>
              <div style={{ color:"#2D8B7A", fontSize:10, fontWeight:700, textTransform:"uppercase", letterSpacing:1, marginBottom:4 }}>Strengths</div>
              <ul style={{ margin:0, paddingLeft:20, color:C.text, fontSize:12, lineHeight:1.6 }}>
                {ready.strengths.map((s,i)=><li key={i}>{s}</li>)}
              </ul>
            </div>
          )}
          {ready.concerns && ready.concerns.length > 0 && (
            <div style={{ marginBottom:10 }}>
              <div style={{ color:"#D88830", fontSize:10, fontWeight:700, textTransform:"uppercase", letterSpacing:1, marginBottom:4 }}>Concerns / Polish opportunities</div>
              <ul style={{ margin:0, paddingLeft:20, color:C.text, fontSize:12, lineHeight:1.6 }}>
                {ready.concerns.map((s,i)=><li key={i}>{s}</li>)}
              </ul>
            </div>
          )}
          {ready.publishingRecommendation && (
            <div style={{ padding:"10px 14px", background:C.manuscript, borderLeft:"3px solid "+C.gold, borderRadius:4, color:C.text, fontSize:13, lineHeight:1.6, fontStyle:"italic" }}>
              💡 {ready.publishingRecommendation}
            </div>
          )}
        </div>
      )}

      {/* Positioning */}
      {pos && (
        <PublishingPanel title="Book Positioning" icon="🎯" defaultOpen={true}>
          <div style={{ display:"grid", gap:8, fontSize:13, color:C.text, lineHeight:1.6 }}>
            <div><span style={{ color:C.amber, fontWeight:600 }}>Primary Genre: </span>{pos.primaryGenre}</div>
            <div><span style={{ color:C.amber, fontWeight:600 }}>Secondary Genre: </span>{pos.secondaryGenre}</div>
            <div><span style={{ color:C.amber, fontWeight:600 }}>Reader Audience: </span>{pos.readerAudience}</div>
            <div style={{ padding:"10px 12px", background:C.manuscript, borderLeft:"3px solid "+C.gold, borderRadius:4, fontFamily:"Cormorant Garamond, serif", fontSize:15, fontStyle:"italic" }}>
              "{pos.readerPromise}"
            </div>
            <div style={{ color:C.muted, fontSize:11 }}><span style={{ color:C.amber, fontWeight:600 }}>Category Placement: </span>{pos.categoryPlacement}</div>
            <div style={{ color:C.muted, fontSize:11 }}><span style={{ color:C.amber, fontWeight:600 }}>Market Position: </span>{pos.marketPosition}</div>
          </div>
        </PublishingPanel>
      )}

      {/* Titles */}
      {titles.length > 0 && (
        <PublishingPanel title={"Title Options (" + titles.length + ")"} icon="📖" defaultOpen={true}>
          <div style={{ display:"grid", gap:8 }}>
            {titles.map((t,i)=>(
              <div key={i} style={{ padding:"10px 14px", background:C.bg, border:"1px solid "+C.borderLight, borderRadius:6 }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"baseline", flexWrap:"wrap", gap:6 }}>
                  <div style={{ color:C.text, fontFamily:"Cormorant Garamond, serif", fontSize:18, fontWeight:600 }}>
                    {t.title}
                  </div>
                  <div style={{ display:"flex", gap:5, flexWrap:"wrap" }}>
                    <span style={{ padding:"1px 6px", background:C.surface, border:"1px solid "+C.borderLight, borderRadius:8, fontSize:10, color:C.muted }}>Sales {t.commercialStrength}/10</span>
                    <span style={{ padding:"1px 6px", background:C.surface, border:"1px solid "+C.borderLight, borderRadius:8, fontSize:10, color:C.muted }}>Memorable {t.memorability}/10</span>
                    <span style={{ padding:"1px 6px", background:C.surface, border:"1px solid "+C.borderLight, borderRadius:8, fontSize:10, color:C.muted }}>Genre {t.genreAlignment}/10</span>
                    <span style={{ padding:"1px 6px", background:C.surface, border:"1px solid "+C.borderLight, borderRadius:8, fontSize:10, color:C.muted }}>Series {t.seriesPotential}/10</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </PublishingPanel>
      )}

      {/* Reader Promise */}
      {rp && (
        <PublishingPanel title="Reader Promise" icon="💗">
          <div style={{ display:"grid", gap:10, fontSize:13, color:C.text, lineHeight:1.6 }}>
            {rp.emotionalOutcomes && rp.emotionalOutcomes.length > 0 && (
              <div>
                <div style={{ color:C.amber, fontSize:11, textTransform:"uppercase", letterSpacing:1, fontWeight:700, marginBottom:4 }}>Emotional Outcomes</div>
                <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
                  {rp.emotionalOutcomes.map((e,i)=>(
                    <span key={i} style={{ padding:"4px 10px", background:C.glow, border:"1px solid "+C.gold, borderRadius:14, fontSize:12, color:C.gold, fontWeight:600 }}>
                      {e}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {rp.moodDescription && <div><span style={{ color:C.amber, fontWeight:600 }}>Mood: </span>{rp.moodDescription}</div>}
            {rp.targetEmotionalState && (
              <div style={{ padding:"10px 12px", background:C.manuscript, borderLeft:"3px solid "+C.gold, borderRadius:4, fontStyle:"italic" }}>
                Reader finishes feeling: {rp.targetEmotionalState}
              </div>
            )}
          </div>
        </PublishingPanel>
      )}

      {/* Descriptions */}
      {desc && (
        <PublishingPanel title="Book Descriptions" icon="📝" defaultOpen={true}>
          {desc.oneSentenceHook && (
            <div style={{ marginBottom:14, padding:"12px 16px", background:C.glow, border:"1px solid "+C.gold, borderRadius:8 }}>
              <div style={{ color:C.gold, fontSize:10, fontWeight:700, textTransform:"uppercase", letterSpacing:1, marginBottom:5 }}>One-Sentence Hook</div>
              <div style={{ color:C.text, fontFamily:"Cormorant Garamond, serif", fontSize:17, fontWeight:500, fontStyle:"italic", lineHeight:1.5 }}>
                "{desc.oneSentenceHook}"
              </div>
            </div>
          )}
          {desc.amazonDescription && (
            <div style={{ marginBottom:14 }}>
              <div style={{ color:C.amber, fontSize:11, textTransform:"uppercase", letterSpacing:1, fontWeight:700, marginBottom:6 }}>
                Amazon Description ({desc.amazonDescription.split(/\s+/).filter(Boolean).length} words)
              </div>
              <div style={{ padding:"14px 16px", background:C.bg, border:"1px solid "+C.borderLight, borderRadius:6,
                            color:C.text, fontSize:13, lineHeight:1.7, whiteSpace:"pre-wrap" }}>
                {desc.amazonDescription}
              </div>
            </div>
          )}
          {desc.backCoverCopy && (
            <div style={{ marginBottom:14 }}>
              <div style={{ color:C.amber, fontSize:11, textTransform:"uppercase", letterSpacing:1, fontWeight:700, marginBottom:6 }}>
                Back Cover Copy ({desc.backCoverCopy.split(/\s+/).filter(Boolean).length} words)
              </div>
              <div style={{ padding:"14px 16px", background:C.bg, border:"1px solid "+C.borderLight, borderRadius:6,
                            color:C.text, fontSize:13, lineHeight:1.7, whiteSpace:"pre-wrap" }}>
                {desc.backCoverCopy}
              </div>
            </div>
          )}
          {desc.extendedSalesDescription && (
            <div>
              <div style={{ color:C.amber, fontSize:11, textTransform:"uppercase", letterSpacing:1, fontWeight:700, marginBottom:6 }}>
                Extended Sales Description ({desc.extendedSalesDescription.split(/\s+/).filter(Boolean).length} words)
              </div>
              <div style={{ padding:"14px 16px", background:C.bg, border:"1px solid "+C.borderLight, borderRadius:6,
                            color:C.text, fontSize:13, lineHeight:1.7, whiteSpace:"pre-wrap", maxHeight:360, overflowY:"auto" }}>
                {desc.extendedSalesDescription}
              </div>
            </div>
          )}
        </PublishingPanel>
      )}

      {/* Cover Strategy */}
      {cov && (
        <PublishingPanel title="Cover Strategy" icon="🎨">
          <div style={{ display:"grid", gap:12, fontSize:13, color:C.text, lineHeight:1.6 }}>
            <div><span style={{ color:C.amber, fontWeight:600 }}>Direction: </span>{cov.direction}</div>
            {cov.visualElements && (
              <div>
                <div style={{ color:C.amber, fontSize:11, textTransform:"uppercase", letterSpacing:1, fontWeight:700, marginBottom:6 }}>Visual Elements</div>
                <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(220px, 1fr))", gap:8, fontSize:12 }}>
                  {cov.visualElements.characterAge && <div><span style={{ color:C.muted }}>Character Age: </span>{cov.visualElements.characterAge}</div>}
                  {cov.visualElements.characterStyle && <div><span style={{ color:C.muted }}>Character Style: </span>{cov.visualElements.characterStyle}</div>}
                  {cov.visualElements.mood && <div><span style={{ color:C.muted }}>Mood: </span>{cov.visualElements.mood}</div>}
                  {cov.visualElements.typography && <div><span style={{ color:C.muted }}>Typography: </span>{cov.visualElements.typography}</div>}
                  {cov.visualElements.composition && <div style={{ gridColumn:"1/-1" }}><span style={{ color:C.muted }}>Composition: </span>{cov.visualElements.composition}</div>}
                  {cov.visualElements.colorPalette && cov.visualElements.colorPalette.length > 0 && (
                    <div style={{ gridColumn:"1/-1" }}>
                      <span style={{ color:C.muted }}>Color Palette: </span>
                      {cov.visualElements.colorPalette.map((color,i)=>(
                        <span key={i} style={{ display:"inline-block", marginRight:6, padding:"2px 8px", background:C.surface, border:"1px solid "+C.borderLight, borderRadius:10, fontSize:11 }}>{color}</span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
            {cov.aiCoverPrompts && (
              <div>
                <div style={{ color:C.amber, fontSize:11, textTransform:"uppercase", letterSpacing:1, fontWeight:700, marginBottom:6 }}>AI Cover Prompts</div>
                {cov.aiCoverPrompts.midjourney && (
                  <div style={{ marginBottom:8 }}>
                    <div style={{ color:C.gold, fontSize:10, fontWeight:700, marginBottom:4 }}>Midjourney</div>
                    <div style={{ padding:"10px 14px", background:C.bg, border:"1px solid "+C.borderLight, borderRadius:6, fontSize:12, lineHeight:1.6, fontFamily:"monospace", color:C.text }}>
                      {cov.aiCoverPrompts.midjourney}
                    </div>
                  </div>
                )}
                {cov.aiCoverPrompts.gemini && (
                  <div style={{ marginBottom:8 }}>
                    <div style={{ color:C.gold, fontSize:10, fontWeight:700, marginBottom:4 }}>Gemini / Image Models</div>
                    <div style={{ padding:"10px 14px", background:C.bg, border:"1px solid "+C.borderLight, borderRadius:6, fontSize:12, lineHeight:1.6, fontFamily:"monospace", color:C.text }}>
                      {cov.aiCoverPrompts.gemini}
                    </div>
                  </div>
                )}
                {cov.aiCoverPrompts.canvaDirection && (
                  <div>
                    <div style={{ color:C.gold, fontSize:10, fontWeight:700, marginBottom:4 }}>Canva / Photoshop Direction</div>
                    <div style={{ padding:"10px 14px", background:C.bg, border:"1px solid "+C.borderLight, borderRadius:6, fontSize:12, lineHeight:1.6, color:C.text }}>
                      {cov.aiCoverPrompts.canvaDirection}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </PublishingPanel>
      )}

      {/* Series Branding */}
      {series && (
        <PublishingPanel title="Series Branding" icon="📚">
          <div style={{ display:"grid", gap:10, fontSize:13, color:C.text, lineHeight:1.6 }}>
            <div style={{ padding:"12px 16px", background:C.glow, border:"1px solid "+C.gold, borderRadius:8 }}>
              <div style={{ color:C.gold, fontSize:10, fontWeight:700, textTransform:"uppercase", letterSpacing:1, marginBottom:4 }}>Series Name</div>
              <div style={{ color:C.text, fontFamily:"Cormorant Garamond, serif", fontSize:22, fontWeight:700 }}>{series.seriesName}</div>
              {series.tagline && <div style={{ color:C.muted, fontSize:13, marginTop:4, fontStyle:"italic" }}>"{series.tagline}"</div>}
            </div>
            <div><span style={{ color:C.amber, fontWeight:600 }}>Naming Convention: </span>{series.namingConvention}</div>
            <div><span style={{ color:C.amber, fontWeight:600 }}>Visual Identity: </span>{series.visualIdentity}</div>
            {series.futureBooks && series.futureBooks.length > 0 && (
              <div>
                <div style={{ color:C.amber, fontSize:11, textTransform:"uppercase", letterSpacing:1, fontWeight:700, marginBottom:6 }}>Future Book Recommendations</div>
                <div style={{ display:"grid", gap:6 }}>
                  {series.futureBooks.map((b,i)=>(
                    <div key={i} style={{ padding:"10px 14px", background:C.bg, border:"1px solid "+C.borderLight, borderRadius:6 }}>
                      <div style={{ display:"flex", gap:10, alignItems:"baseline", marginBottom:3 }}>
                        <span style={{ color:C.gold, fontSize:11, fontWeight:700 }}>Book {b.bookNumber}</span>
                        <span style={{ color:C.text, fontFamily:"Cormorant Garamond, serif", fontSize:16, fontWeight:600 }}>{b.proposedTitle}</span>
                      </div>
                      <div style={{ color:C.muted, fontSize:12 }}>{b.concept}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </PublishingPanel>
      )}

      {/* Author Brand */}
      {author && (
        <PublishingPanel title="Author Brand" icon="✍️">
          <div style={{ display:"grid", gap:10, fontSize:13, color:C.text, lineHeight:1.6 }}>
            <div style={{ padding:"12px 16px", background:C.glow, border:"1px solid "+C.gold, borderRadius:8 }}>
              <div style={{ color:C.gold, fontSize:10, fontWeight:700, textTransform:"uppercase", letterSpacing:1, marginBottom:4 }}>Positioning</div>
              <div style={{ color:C.text, fontFamily:"Cormorant Garamond, serif", fontSize:20, fontWeight:700 }}>{author.positioning}</div>
              {author.tagline && <div style={{ color:C.muted, fontSize:13, marginTop:4, fontStyle:"italic" }}>"{author.tagline}"</div>}
            </div>
            <div><span style={{ color:C.amber, fontWeight:600 }}>Subgenre Specialty: </span>{author.subgenreSpecialty}</div>
            <div><span style={{ color:C.amber, fontWeight:600 }}>Audience Promise: </span>{author.audiencePromise}</div>
            <div><span style={{ color:C.amber, fontWeight:600 }}>Comparable Shelf: </span>{author.comparableAuthorShelf}</div>
          </div>
        </PublishingPanel>
      )}

      {/* Marketing Assets */}
      {mkt && (
        <PublishingPanel title="Marketing Assets" icon="📣">
          {mkt.socialMediaPosts && mkt.socialMediaPosts.length > 0 && (
            <div style={{ marginBottom:14 }}>
              <div style={{ color:C.amber, fontSize:11, textTransform:"uppercase", letterSpacing:1, fontWeight:700, marginBottom:6 }}>Social Media Posts ({mkt.socialMediaPosts.length})</div>
              <div style={{ display:"grid", gap:6 }}>
                {mkt.socialMediaPosts.map((p,i)=>(
                  <div key={i} style={{ padding:"10px 14px", background:C.bg, border:"1px solid "+C.borderLight, borderRadius:6, fontSize:12, lineHeight:1.6, whiteSpace:"pre-wrap", color:C.text }}>
                    {p}
                  </div>
                ))}
              </div>
            </div>
          )}
          {mkt.launchPosts && mkt.launchPosts.length > 0 && (
            <div style={{ marginBottom:14 }}>
              <div style={{ color:C.amber, fontSize:11, textTransform:"uppercase", letterSpacing:1, fontWeight:700, marginBottom:6 }}>Launch Posts</div>
              <div style={{ display:"grid", gap:6 }}>
                {mkt.launchPosts.map((p,i)=>(
                  <div key={i} style={{ padding:"10px 14px", background:C.bg, border:"1px solid "+C.borderLight, borderRadius:6, fontSize:12, lineHeight:1.6, whiteSpace:"pre-wrap", color:C.text }}>
                    {p}
                  </div>
                ))}
              </div>
            </div>
          )}
          {mkt.readerMagnet && (
            <div style={{ marginBottom:14 }}>
              <div style={{ color:C.amber, fontSize:11, textTransform:"uppercase", letterSpacing:1, fontWeight:700, marginBottom:6 }}>Reader Magnet</div>
              <div style={{ padding:"10px 14px", background:C.bg, border:"1px solid "+C.borderLight, borderRadius:6, fontSize:12, lineHeight:1.6, color:C.text }}>
                {mkt.readerMagnet}
              </div>
            </div>
          )}
          {mkt.newsletterContent && (
            <div style={{ marginBottom:14 }}>
              <div style={{ color:C.amber, fontSize:11, textTransform:"uppercase", letterSpacing:1, fontWeight:700, marginBottom:6 }}>Newsletter Content</div>
              <div style={{ padding:"10px 14px", background:C.bg, border:"1px solid "+C.borderLight, borderRadius:6, fontSize:12, lineHeight:1.6, whiteSpace:"pre-wrap", color:C.text }}>
                {mkt.newsletterContent}
              </div>
            </div>
          )}
          {mkt.bookClubQuestions && mkt.bookClubQuestions.length > 0 && (
            <div style={{ marginBottom:14 }}>
              <div style={{ color:C.amber, fontSize:11, textTransform:"uppercase", letterSpacing:1, fontWeight:700, marginBottom:6 }}>Book Club Questions</div>
              <ol style={{ margin:0, paddingLeft:20, color:C.text, fontSize:12, lineHeight:1.6 }}>
                {mkt.bookClubQuestions.map((q,i)=><li key={i} style={{ marginBottom:4 }}>{q}</li>)}
              </ol>
            </div>
          )}
          {mkt.characterProfiles && mkt.characterProfiles.length > 0 && (
            <div style={{ marginBottom:14 }}>
              <div style={{ color:C.amber, fontSize:11, textTransform:"uppercase", letterSpacing:1, fontWeight:700, marginBottom:6 }}>Character Profiles</div>
              <div style={{ display:"grid", gap:8 }}>
                {mkt.characterProfiles.map((c,i)=>(
                  <div key={i} style={{ padding:"10px 14px", background:C.bg, border:"1px solid "+C.borderLight, borderRadius:6 }}>
                    <div style={{ color:C.gold, fontSize:13, fontWeight:700, marginBottom:4 }}>{c.name}</div>
                    <div style={{ color:C.text, fontSize:12, lineHeight:1.6 }}>{c.profile}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
          {mkt.pressRelease && (
            <div style={{ marginBottom:14 }}>
              <div style={{ color:C.amber, fontSize:11, textTransform:"uppercase", letterSpacing:1, fontWeight:700, marginBottom:6 }}>Press Release</div>
              <div style={{ padding:"10px 14px", background:C.bg, border:"1px solid "+C.borderLight, borderRadius:6, fontSize:12, lineHeight:1.6, whiteSpace:"pre-wrap", color:C.text, maxHeight:280, overflowY:"auto" }}>
                {mkt.pressRelease}
              </div>
            </div>
          )}
          {mkt.mediaKit && (
            <div>
              <div style={{ color:C.amber, fontSize:11, textTransform:"uppercase", letterSpacing:1, fontWeight:700, marginBottom:6 }}>Media Kit</div>
              <div style={{ padding:"10px 14px", background:C.bg, border:"1px solid "+C.borderLight, borderRadius:6, fontSize:12, lineHeight:1.6, whiteSpace:"pre-wrap", color:C.text }}>
                {mkt.mediaKit}
              </div>
            </div>
          )}
        </PublishingPanel>
      )}

      {/* Adaptation Readiness */}
      {adapt && (
        <PublishingPanel title="Adaptation Readiness" icon="🎬">
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(240px, 1fr))", gap:8, marginBottom:14 }}>
            {["audiobook","podcastSeries","motionComic","youtubeSeries","aiVideoAdaptation","streamingAdaptation"].map(k=>{
              const item = adapt[k];
              if (!item) return null;
              const label = { audiobook:"Audiobook", podcastSeries:"Podcast Series", motionComic:"Motion Comic", youtubeSeries:"YouTube Series", aiVideoAdaptation:"AI Video", streamingAdaptation:"Streaming" }[k];
              return (
                <div key={k} style={{ padding:"10px 14px", background:C.bg, border:"1px solid "+C.borderLight, borderRadius:6 }}>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"baseline", marginBottom:4 }}>
                    <span style={{ color:C.text, fontSize:12, fontWeight:600 }}>{label}</span>
                    <Score value={item.score}/>
                  </div>
                  <div style={{ color:C.muted, fontSize:11, lineHeight:1.5 }}>{item.reason}</div>
                </div>
              );
            })}
          </div>
          {adapt.recommendation && (
            <div style={{ padding:"10px 14px", background:C.glow, borderLeft:"3px solid "+C.gold, borderRadius:4, color:C.text, fontSize:12, lineHeight:1.6, fontStyle:"italic" }}>
              💡 {adapt.recommendation}
            </div>
          )}
        </PublishingPanel>
      )}
    </div>
  );
}

function ChapterBuilder({ story, universe, chapterState }) {
  // Manuscript spec
  const [targetWordCount, setTargetWordCount] = useState(80000);
  const [chapterCount, setChapterCount] = useState(32);
  const [maxWordsPerGen, setMaxWordsPerGen] = useState(2500);
  const avgWordsPerChapter = Math.round(targetWordCount / chapterCount);

  // Persistent chapter/scene data is lifted to App so the active story owns it
  // (enables multi-story persistence). UI/loading flags stay local below.
  const {
    outline, setOutline, bible, setBible,
    chapterProse, setChapterProse, chapterReports, setChapterReports,
    chapterSummaries, setChapterSummaries,
    chapterSceneCards, setChapterSceneCards, sceneProse, setSceneProse,
    sceneSummaries, setSceneSummaries, sceneLocked, setSceneLocked
  } = chapterState;

  const [loadingOutline, setLoadingOutline] = useState(false);
  const [buildingBible, setBuildingBible] = useState(false);
  const [writingCh, setWritingCh] = useState(null);
  const [continuingCh, setContinuingCh] = useState(null);
  const [checkingCh, setCheckingCh] = useState(null);
  const [summarizingCh, setSummarizingCh] = useState(null);
  const [editingCh, setEditingCh] = useState(null);

  // ── Scene Engine UI state (persistent scene data lives in App via chapterState) ──
  const [generatingScenesCh, setGeneratingScenesCh] = useState(null);
  const [writingScene, setWritingScene] = useState(null);     // {ch, sc}
  const [continuingScene, setContinuingScene] = useState(null);
  const [summarizingScene, setSummarizingScene] = useState(null);
  const [editingScene, setEditingScene] = useState(null);     // {ch, sc}
  const [expandedChapter, setExpandedChapter] = useState(null);

  const [err, setErr] = useState("");

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
    } catch(e) { setErr(e.message); }
    finally { setBuildingBible(false); }
  }, [story, outline]);

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

  const continueChapterHandler = useCallback(async (n) => {
    if (!chapterProse[n]) return;
    setContinuingCh(n); setErr("");
    try {
      const ch = outline.chapters[n-1];
      const current = chapterProse[n];
      const currentWordCount = current.trim().split(/\s+/).filter(Boolean).length;
      const extra = await continueChapter(story, outline, n, universe, bible, current, {
        desiredWordCount: ch.targetWordCount || avgWordsPerChapter,
        currentWordCount,
        maxWordsPerGen
      });
      setChapterProse(prev => ({...prev, [n]: prev[n] + "\n\n" + extra}));
      // Clear stale downstream state
      setChapterReports(prev => { const c={...prev}; delete c[n]; return c; });
      setChapterSummaries(prev => { const c={...prev}; delete c[n]; return c; });
    } catch(e) { setErr(e.message); }
    finally { setContinuingCh(null); }
  }, [story, outline, universe, bible, chapterProse, maxWordsPerGen, avgWordsPerChapter]);

  const regenerateChapter = useCallback(async (n) => {
    if (!window.confirm("Regenerate Chapter "+n+"? Current prose will be replaced.")) return;
    // Clear current state for this chapter then run write
    setChapterProse(prev => { const c={...prev}; delete c[n]; return c; });
    setChapterReports(prev => { const c={...prev}; delete c[n]; return c; });
    setChapterSummaries(prev => { const c={...prev}; delete c[n]; return c; });
    // Use setTimeout to let state clear before re-write
    setTimeout(()=>writeChapter(n), 50);
  }, [writeChapter]);

  const saveEdit = useCallback((n, newText) => {
    setChapterProse(prev => ({...prev, [n]:newText}));
    // Edits invalidate continuity check
    setChapterReports(prev => { const c={...prev}; delete c[n]; return c; });
    setChapterSummaries(prev => { const c={...prev}; delete c[n]; return c; });
    setEditingCh(null);
  }, []);

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
  const applyPatch = useCallback((n) => {
    const r = chapterReports[n];
    if (!r || !r.revisionPatch || !r.revisionPatch.revisedText) return;
    // Append the suggested text as an editor note at end of prose; mark as resolved
    const note = "\n\n[EDITOR PATCH APPLIED]: " + r.revisionPatch.revisedText;
    setChapterProse(prev => ({...prev, [n]: (prev[n]||"") + note}));
    setChapterReports(prev => ({...prev, [n]: {...prev[n], resolved:true}}));
  }, [chapterReports]);

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
  }, [story, outline, bible, chapterSceneCards, sceneProse]);

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
        {bible && (
          <div style={{ padding:"6px 12px", background:C.glow, border:"1px solid "+C.gold, borderRadius:6,
                        color:C.gold, fontSize:11, fontWeight:600 }}>
            ✓ Bible active · {(bible.chapters||[]).length}/{outline?outline.chapters.length:0} chapters tracked
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

      {bible && <StoryBibleViewer bible={bible}/>}

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
              <div key={ch.number} style={{ padding:18, background:C.card,
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
                    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10 }}>
                      <div style={{ color:C.amber, fontSize:10, letterSpacing:1.5, textTransform:"uppercase", fontWeight:700 }}>
                        🎬 {scenes.length} Scene Cards
                      </div>
                      <button onClick={()=>setExpandedChapter(expandedChapter===ch.number ? null : ch.number)}
                        style={{ padding:"3px 8px", background:"transparent", color:C.muted, border:"1px solid "+C.borderLight, borderRadius:4, fontSize:10, cursor:"pointer", fontFamily:"Nunito, sans-serif" }}>
                        {expandedChapter===ch.number ? "Collapse" : "Expand"}
                      </button>
                    </div>
                    {expandedChapter===ch.number && (
                      <div>
                        {scenes.map((scene) => {
                          const key = ch.number+"-"+scene.sceneNumber;
                          const status = sceneStatuses[scene.sceneNumber-1];
                          return (
                            <SceneCard key={scene.sceneNumber}
                              scene={scene}
                              chapterNum={ch.number}
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
                              onApplyPatch={()=>applyPatch(ch.number)}
                              onAcknowledgePatch={()=>acknowledgePatch(ch.number)}
                              onMarkResolved={()=>markResolved(ch.number)}
                              onRegenerate={()=>{
                                // Clear and rebuild scenes
                                setChapterSceneCards(prev => { const c={...prev}; delete c[ch.number]; return c; });
                                setSceneProse(prev => { const c={...prev}; delete c[ch.number]; return c; });
                                setSceneSummaries(prev => { const c={...prev}; delete c[ch.number]; return c; });
                                setChapterReports(prev => { const c={...prev}; delete c[ch.number]; return c; });
                              }}/>
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
              </div>
            );
          })}
        </div>
      )}
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

function Blueprint({ story, universes, activeUniverseId, onSaveToUniverse, activeUniverse, activatedPatterns, chapterState }) {
  return (
    <div style={{ marginTop:28 }}>
      <div style={{ padding:"28px 30px", background:"linear-gradient(135deg, "+C.surface+", "+C.card+")",
                    border:"1px solid "+C.gold, borderRadius:14 }}>
        <div style={{ color:C.gold, fontSize:11, letterSpacing:2.5, textTransform:"uppercase", fontWeight:700, marginBottom:8 }}>
          The Blueprint
        </div>
        <div style={{ fontFamily:"Cormorant Garamond, serif", color:C.text, fontSize:38, fontWeight:700, lineHeight:1.15, marginBottom:10 }}>
          {story.title}
        </div>
        <div style={{ color:C.amber, fontFamily:"Cormorant Garamond, serif", fontSize:20, fontStyle:"italic", marginBottom:18 }}>
          {story.tagline}
        </div>
        <InfoBlock label="The Hook">{story.hook}</InfoBlock>
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

      <ActivatedPatternsCard patterns={activatedPatterns}/>
      <MarketDashboard story={story}/>

      <SaveBlueprint story={story} universes={universes} activeUniverseId={activeUniverseId} onSaveToUniverse={onSaveToUniverse}/>
      <ChapterBuilder story={story} universe={activeUniverse} chapterState={chapterState}/>
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

// ── My Stories library (W2) ───────────────────────────────────
function MyStories({ stories, activeStoryId, onOpen, onDuplicate, onDelete, onImport }) {
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
        <div>
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
  const [chapterProse, setChapterProse] = useState({});
  const [chapterReports, setChapterReports] = useState({});
  const [chapterSummaries, setChapterSummaries] = useState({});
  const [chapterSceneCards, setChapterSceneCards] = useState({});
  const [sceneProse, setSceneProse] = useState({});
  const [sceneSummaries, setSceneSummaries] = useState({});
  const [sceneLocked, setSceneLocked] = useState({});
  const chapterState = {
    outline, setOutline, bible, setBible,
    chapterProse, setChapterProse, chapterReports, setChapterReports,
    chapterSummaries, setChapterSummaries,
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
        universe: activeUniverse
      });
      // Attach spice/intensity to the story object so the scene engine can use them
      s.spiceLevel = spiceLevel;
      s.romanceIntensity = romanceIntensity;
      s.eroticRomance = eroticRomance;
      s.streetLitEng = streetLitEng;
      s.suspenseEng = suspenseEng;
      setStory(s);
      // W2: if no story is active yet (first load, or after deleting the active
      // story), auto-create story #1 from the current builder state.
      if (!activeStoryId) {
        const id = newStoryId();
        const rec = freshStoryRecord(id);
        rec.title = s.title || "Untitled Story";
        rec.blueprint = s;
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
    if (id === "newStory" || id === "myStories" || id === "storyBible" || id === "characterStudio" || id === "sceneStudio" || id === "draftManuscript" || id === "editorMode" || id === "publishingStudio" || id === "readerIntelligence") {
      setView("story");
    } else if (id === "worldBuilder") {
      setView("universes");
      setDetailUniverseId(null);
    }
  };

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
    blueprint: story, outline, bible, chapterProse, chapterReports, chapterSummaries,
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
    setStory(null); setOutline(null); setBible(null);
    setChapterProse({}); setChapterReports({}); setChapterSummaries({});
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
    setChapterProse(rec.chapterProse ?? {}); setChapterReports(rec.chapterReports ?? {}); setChapterSummaries(rec.chapterSummaries ?? {});
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
    const t = setTimeout(() => {
      setStories(prev => {
        const idx = prev.findIndex(s => s.id === activeStoryId);
        if (idx === -1) return prev;
        const next = [...prev]; next[idx] = buildRecord(prev[idx]);
        saveStories(next); return next;
      });
    }, 1500);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeStoryId, story, laneVals, tropes, heat, heroineArch, heroArch, heroineWound, heroWound,
      setting, city, family, intensity, externalConflict, relationshipObstacle, familyInfluence,
      spiceLevel, romanceIntensity, eroticRomance, streetLitEng, suspenseEng, outline, bible, chapterProse, chapterReports, chapterSummaries,
      chapterSceneCards, sceneProse, sceneSummaries, sceneLocked, bookPackage]);

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
      <div style={{ display:"flex", minHeight:"100vh" }}>
        <Sidebar
          active={activeSection}
          onChange={goToSection}
          onNewStory={handleNewStory}
          hasStory={!!story}
          storyTitle={activeStoryRec ? activeStoryRec.title : null}
          universeCount={universes.length}/>

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
            {/* PUBLISHING STUDIO routing */}
            {activeSection === "publishingStudio" && story && (
              <PublishingStudio
                story={story}
                outline={null}
                bible={null}
                packageData={bookPackage}
                generating={generatingPackage}
                progress={packageProgress}
                onGenerate={()=>generatePublishingPackage(null, null)}
                onExport={exportPublishingPackage}
                error={packageErr}/>
            )}
            {activeSection === "publishingStudio" && !story && (
              <NeedsStoryEmpty section="Publishing Studio" onGoToBuilder={()=>goToSection("newStory")}/>
            )}

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
            {activeSection === "marketIntelligence" && (
              <ComingSoonSection
                title="Market Intelligence"
                icon="📊"
                description="Live genre trends, comp title performance, KDP category intelligence, and competitive positioning across the Black romance market."
                features={["Current bestseller heatmap", "Genre-pattern market share trends", "Comp title performance data", "KDP category competition", "Pricing intelligence"]}/>
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
              <MyStories
                stories={stories}
                activeStoryId={activeStoryId}
                onOpen={openStory}
                onDuplicate={duplicateStory}
                onDelete={deleteStory}
                onImport={importStoryFromJSON}/>
            )}

            {/* Default story-builder view — activeSection in {newStory, storyBible, characterStudio, sceneStudio, draftManuscript, editorMode} all render the full builder */}
            {!["publishingStudio","dashboard","readerIntelligence","marketIntelligence","settings","myStories"].includes(activeSection) && (
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

        {/* STORY BLEND */}
        <div style={{ padding:"24px 28px", background:C.surface, border:"1px solid "+C.border, borderRadius:14, marginBottom:22 }}>
          <div style={{ color:C.gold, fontSize:11, letterSpacing:2, textTransform:"uppercase", fontWeight:700, marginBottom:4 }}>
            01 · Story Blend Engine
          </div>
          <div style={{ color:C.text, fontFamily:"Cormorant Garamond, serif", fontSize:22, fontWeight:600, marginBottom:14 }}>
            What kind of story is this?
          </div>
          {LANES.map(l => (
            <LaneSlider key={l.id} lane={l} value={laneVals[l.id]} normValue={normalized[l.id]}
              onChange={v => setLaneVals(prev => ({...prev, [l.id]:v}))}/>
          ))}
          <BlendBar vals={laneVals}/>
        </div>

        {/* CHARACTERS */}
        <div style={{ padding:"24px 28px", background:C.surface, border:"1px solid "+C.border, borderRadius:14, marginBottom:22 }}>
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
        <div style={{ padding:"24px 28px", background:C.surface, border:"1px solid "+C.border, borderRadius:14, marginBottom:22 }}>
          <div style={{ color:C.gold, fontSize:11, letterSpacing:2, textTransform:"uppercase", fontWeight:700, marginBottom:4 }}>
            03 · Trope Engine
          </div>
          <div style={{ color:C.text, fontFamily:"Cormorant Garamond, serif", fontSize:22, fontWeight:600, marginBottom:6 }}>
            Stack your hooks
          </div>
          <div style={{ color:C.muted, fontSize:12, marginBottom:14 }}>
            Selected: {tropes.length}/4 recommended for marketing
          </div>
          <div style={{ display:"flex", flexWrap:"wrap", gap:7 }}>
            {TROPES.map(t => (
              <Chip key={t} active={tropes.includes(t)} onClick={()=>toggleTrope(t)}>{t}</Chip>
            ))}
          </div>
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
        <div style={{ marginBottom:22 }}>
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

        {/* PATTERN PREVIEW (live) */}
        {activatedPatterns.length > 0 && (
          <ActivatedPatternsCard
            patterns={activatedPatterns}
            calibration={calibrationForActivatedPatterns(activatedPatterns)}
            currentSpice={spiceLevel}
            currentIntensity={romanceIntensity}
            onApplyCalibration={(cal)=>{
              if (!cal) return;
              setSpiceLevel(cal.spice);
              setRomanceIntensity(cal.intensity);
            }}/>
        )}

        {/* GENERATE */}
        <div style={{ textAlign:"center", marginBottom:22 }}>
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
          {!blendActive && <div style={{ color:C.muted, fontSize:12, marginTop:10 }}>Move at least one Story Blend slider above zero</div>}
          {blendActive && tropes.length===0 && <div style={{ color:C.muted, fontSize:12, marginTop:10 }}>Pick at least one trope</div>}
        </div>

        {err && (
          <div style={{ padding:"14px 18px", background:"#FBE9E7", border:"1px solid #B8342D", borderRadius:8, color:"#B8342D", fontSize:13, marginBottom:20 }}>
            ⚠ Generation failed: {err}
          </div>
        )}

        {story && (
          <Blueprint
            story={story}
            universes={universes}
            activeUniverseId={activeUniverseId}
            activeUniverse={activeUniverse}
            onSaveToUniverse={saveBookToUniverse}
            activatedPatterns={activatedPatterns}
            chapterState={chapterState}/>
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
