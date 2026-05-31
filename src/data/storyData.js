// Consolidated story data + pure helper functions (lanes, presets, tropes,
// archetypes, characters, engines, story elements). No React/JSX/state.

export const LANES = [
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

// ── Genre Presets (Phase 1.5) — quick-start calibration. Lane keys use the
//    actual lane ids (sexyContemp, crimeSaga). "custom" leaves everything alone.
export const GENRE_PRESETS = [
  { id:"power_purpose_romance", label:"Power & Purpose", icon:"💼",
    lanes:{ healing:4, community:1, luxury:4, family:2, urban:0, reinvention:4, suspense:0, faith:0, eroticUrban:0, sexyContemp:0, eroticDrama:0, luxuryErotic:0, streetLit:0, crimeSaga:0 },
    tropes:["Woman in Leadership","Enemies to Lovers","Building an Empire","Reinvention Journey"], heat:3, spiceLevel:3,
    romanceIntensity:{ attractionIntensity:3, emotionalIntimacy:5, physicalAffection:3, relationshipFocus:5 } },
  { id:"black_billionaire_romance", label:"Black Billionaire", icon:"👑",
    lanes:{ healing:2, community:0, luxury:6, family:2, urban:0, reinvention:1, suspense:0, faith:0, eroticUrban:0, sexyContemp:1, eroticDrama:0, luxuryErotic:3, streetLit:0, crimeSaga:0 },
    tropes:["Billionaire Romance","Enemies to Lovers","Forced Proximity","Power Couple Goals"], heat:3, spiceLevel:3,
    romanceIntensity:{ attractionIntensity:4, emotionalIntimacy:4, physicalAffection:3, relationshipFocus:4 } },
  { id:"soft_black_romance", label:"Soft Black Romance", icon:"🌹",
    lanes:{ healing:6, community:4, luxury:0, family:2, urban:0, reinvention:3, suspense:0, faith:0, eroticUrban:0, sexyContemp:2, eroticDrama:0, luxuryErotic:0, streetLit:0, crimeSaga:0 },
    tropes:["Second Chance Romance","Friends to Lovers","Childhood Sweethearts","Grumpy Sunshine"], heat:2, spiceLevel:2,
    romanceIntensity:{ attractionIntensity:3, emotionalIntimacy:5, physicalAffection:2, relationshipFocus:5 } },
  { id:"family_empire_romance", label:"Family Empire Romance", icon:"🏛️",
    lanes:{ healing:2, community:1, luxury:4, family:6, urban:1, reinvention:0, suspense:0, faith:0, eroticUrban:0, sexyContemp:0, eroticDrama:0, luxuryErotic:1, streetLit:0, crimeSaga:2 },
    tropes:["Family Empire","Forbidden Love","Enemies to Lovers","The Next Generation"], heat:3, spiceLevel:3,
    romanceIntensity:{ attractionIntensity:3, emotionalIntimacy:4, physicalAffection:3, relationshipFocus:4 } },
  { id:"sexy_contemporary_black_romance", label:"Sexy Contemporary", icon:"🔥",
    lanes:{ healing:2, community:2, luxury:2, family:1, urban:0, reinvention:1, suspense:0, faith:0, eroticUrban:3, sexyContemp:5, eroticDrama:0, luxuryErotic:1, streetLit:0, crimeSaga:0 },
    tropes:["Friends to Lovers","Second Chance Romance","Workplace Romance","Boss & Employee"], heat:4, spiceLevel:4,
    romanceIntensity:{ attractionIntensity:4, emotionalIntimacy:4, physicalAffection:4, relationshipFocus:5 } },
  { id:"erotic_urban_romance", label:"Erotic Urban Romance", icon:"💋",
    lanes:{ healing:1, community:1, luxury:1, family:1, urban:3, reinvention:0, suspense:0, faith:0, eroticUrban:6, sexyContemp:1, eroticDrama:3, luxuryErotic:0, streetLit:0, crimeSaga:0 },
    tropes:["Possessive Hero","Touch Her and Die","Ride or Die Love","Dangerous Ex Returns"], heat:5, spiceLevel:5,
    romanceIntensity:{ attractionIntensity:5, emotionalIntimacy:4, physicalAffection:5, relationshipFocus:5 } },
  { id:"urban_drama_romance", label:"Urban Drama Romance", icon:"💔",
    lanes:{ healing:1, community:1, luxury:1, family:3, urban:5, reinvention:0, suspense:1, faith:0, eroticUrban:1, sexyContemp:0, eroticDrama:4, luxuryErotic:0, streetLit:1, crimeSaga:0 },
    tropes:["Ride or Die Love","Dangerous Ex Returns","Family Disapproves","Loyalty Test"], heat:4, spiceLevel:4,
    romanceIntensity:{ attractionIntensity:5, emotionalIntimacy:3, physicalAffection:4, relationshipFocus:5 } },
  { id:"street_lit", label:"Street Lit", icon:"🏙️",
    lanes:{ healing:0, community:1, luxury:1, family:2, urban:5, reinvention:0, suspense:2, faith:0, eroticUrban:0, sexyContemp:0, eroticDrama:1, luxuryErotic:0, streetLit:8, crimeSaga:2 },
    tropes:["Street to Legit","Loyalty Betrayal","The Setup","Protect the Family"], heat:3, spiceLevel:3,
    romanceIntensity:{ attractionIntensity:4, emotionalIntimacy:2, physicalAffection:3, relationshipFocus:2 } },
  { id:"crime_family_saga", label:"Crime Family Saga", icon:"💰",
    lanes:{ healing:0, community:0, luxury:2, family:5, urban:4, reinvention:0, suspense:2, faith:0, eroticUrban:0, sexyContemp:0, eroticDrama:0, luxuryErotic:0, streetLit:3, crimeSaga:7 },
    tropes:["Family Empire","Legacy Under Threat","Family Betrayal","The Next Generation"], heat:2, spiceLevel:2,
    romanceIntensity:{ attractionIntensity:3, emotionalIntimacy:2, physicalAffection:2, relationshipFocus:2 } },
  { id:"kingpin_romance", label:"Kingpin Romance", icon:"♠️",
    lanes:{ healing:0, community:0, luxury:2, family:3, urban:5, reinvention:0, suspense:2, faith:0, eroticUrban:3, sexyContemp:0, eroticDrama:3, luxuryErotic:0, streetLit:4, crimeSaga:4 },
    tropes:["Street Legend Returns","Ride or Die Love","Family Empire","The Plug"], heat:5, spiceLevel:5,
    romanceIntensity:{ attractionIntensity:5, emotionalIntimacy:3, physicalAffection:5, relationshipFocus:4 } },
  { id:"romantic_suspense", label:"Romantic Suspense", icon:"🔍",
    lanes:{ healing:2, community:0, luxury:0, family:1, urban:1, reinvention:0, suspense:6, faith:0, eroticUrban:0, sexyContemp:0, eroticDrama:0, luxuryErotic:0, streetLit:0, crimeSaga:0 },
    tropes:["Forced Proximity","Enemies to Lovers","Someone is Watching","Hidden Enemy"], heat:3, spiceLevel:3,
    romanceIntensity:{ attractionIntensity:4, emotionalIntimacy:4, physicalAffection:3, relationshipFocus:4 } },
  { id:"black_mystery", label:"Black Mystery", icon:"🕵🏾",
    lanes:{ healing:1, community:1, luxury:0, family:2, urban:1, reinvention:0, suspense:8, faith:0, eroticUrban:0, sexyContemp:0, eroticDrama:0, luxuryErotic:0, streetLit:0, crimeSaga:1 },
    tropes:["Cold Case","Family Coverup","Family Secret","Small Town Secrets"], heat:1, spiceLevel:1,
    romanceIntensity:{ attractionIntensity:2, emotionalIntimacy:2, physicalAffection:1, relationshipFocus:1 } },
  { id:"political_thriller", label:"Political Thriller", icon:"🏛️",
    lanes:{ healing:0, community:1, luxury:2, family:2, urban:0, reinvention:0, suspense:7, faith:0, eroticUrban:0, sexyContemp:0, eroticDrama:0, luxuryErotic:0, streetLit:0, crimeSaga:1 },
    tropes:["Government Coverup","Conspiracy","Election Scandal","Whistleblower"], heat:1, spiceLevel:1,
    romanceIntensity:{ attractionIntensity:2, emotionalIntimacy:2, physicalAffection:1, relationshipFocus:1 } },
  { id:"corporate_thriller", label:"Corporate Thriller", icon:"🏢",
    lanes:{ healing:1, community:0, luxury:3, family:1, urban:0, reinvention:1, suspense:6, faith:0, eroticUrban:0, sexyContemp:0, eroticDrama:0, luxuryErotic:0, streetLit:0, crimeSaga:0 },
    tropes:["Corporate Espionage","Boardroom Coup","Hidden Enemy","Leadership Crisis"], heat:2, spiceLevel:2,
    romanceIntensity:{ attractionIntensity:2, emotionalIntimacy:3, physicalAffection:1, relationshipFocus:2 } },
  { id:"faith_purpose_romance", label:"Faith & Purpose", icon:"🙏🏾",
    lanes:{ healing:4, community:3, luxury:0, family:2, urban:0, reinvention:3, suspense:0, faith:6, eroticUrban:0, sexyContemp:0, eroticDrama:0, luxuryErotic:0, streetLit:0, crimeSaga:0 },
    tropes:["Redemption Arc","Unexpected Calling","Kingdom Partnership","Purpose Over Popularity"], heat:1, spiceLevel:1,
    romanceIntensity:{ attractionIntensity:2, emotionalIntimacy:5, physicalAffection:1, relationshipFocus:4 } },
  { id:"faith_family_saga", label:"Faith Family Saga", icon:"⛪",
    lanes:{ healing:3, community:4, luxury:0, family:5, urban:0, reinvention:2, suspense:0, faith:5, eroticUrban:0, sexyContemp:0, eroticDrama:0, luxuryErotic:0, streetLit:0, crimeSaga:0 },
    tropes:["Redemption Arc","Prodigal Returns","Family Secret","Family Reunion"], heat:1, spiceLevel:1,
    romanceIntensity:{ attractionIntensity:2, emotionalIntimacy:5, physicalAffection:1, relationshipFocus:3 } },
  { id:"womens_fiction", label:"Women's Fiction", icon:"🌿",
    lanes:{ healing:5, community:3, luxury:0, family:3, urban:0, reinvention:7, suspense:0, faith:0, eroticUrban:0, sexyContemp:0, eroticDrama:0, luxuryErotic:0, streetLit:0, crimeSaga:0 },
    tropes:["Midlife Reinvention","Starting Over","Finding Herself","Family Secret"], heat:2, spiceLevel:2,
    romanceIntensity:{ attractionIntensity:3, emotionalIntimacy:5, physicalAffection:2, relationshipFocus:3 } },
  { id:"custom", label:"Custom", icon:"✦", lanes:null, tropes:null, heat:null, spiceLevel:null, romanceIntensity:null },
];

// ── Reader Archetypes (Story Intelligence Layer) ───────────────
export const READER_ARCHETYPES = [
  { id:"purpose_reader", name:"The Purpose Seeker",
    matchesPresets:["power_purpose_romance","womens_fiction","faith_purpose_romance"],
    wants:["personal growth","healing","strong heroine","purpose","emotional depth"],
    hates:["shallow romance","unearned endings","weak heroines"],
    emotionalDrivers:["hope","inspiration","healing"],
    favoriteTropes:["Finding Herself","Leadership Crisis","Mentor Relationship","Second Chance"],
    requiredPayoff:"Heroine becomes more powerful than she started." },
  { id:"soft_romance_reader", name:"The Comfort Romance Reader",
    matchesPresets:["soft_black_romance"],
    wants:["emotional intimacy","healthy love","community","warmth"],
    hates:["excessive drama","toxic heroes"],
    emotionalDrivers:["comfort","connection","joy"],
    favoriteTropes:["Friends to Lovers","Second Chance","Single Parent","Returning Home"],
    requiredPayoff:"Readers must believe this couple will last." },
  { id:"luxury_romance_reader", name:"The Aspirational Romance Reader",
    matchesPresets:["black_billionaire_romance","luxury_romance"],
    wants:["wealth","success","luxury lifestyle","power couples"],
    hates:["boring settings","small stakes"],
    emotionalDrivers:["fantasy","desire","aspiration"],
    favoriteTropes:["Billionaire","CEO","Private Island","Public Image Crisis"],
    requiredPayoff:"Reader gets both fantasy and emotional satisfaction." },
  { id:"spicy_romance_reader", name:"The Chemistry Chaser",
    matchesPresets:["erotic_urban_romance","sexy_contemporary_black_romance"],
    wants:["chemistry","attraction","tension","relationship progression"],
    hates:["flat chemistry","slow emotional payoff"],
    emotionalDrivers:["desire","anticipation","passion"],
    favoriteTropes:["Forbidden Love","Only One Bed","Secret Relationship","Possessive Hero"],
    requiredPayoff:"The relationship must feel earned and intensely satisfying." },
  { id:"urban_drama_reader", name:"The Drama Addict",
    matchesPresets:["urban_drama_romance"],
    wants:["betrayal","loyalty","conflict","high emotions"],
    hates:["low tension","predictable relationships"],
    emotionalDrivers:["anger","shock","satisfaction"],
    favoriteTropes:["Dangerous Ex","Ride or Die","Loyalty Test","Power Couple"],
    requiredPayoff:"Someone must choose loyalty over selfishness." },
  { id:"street_lit_reader", name:"The Survival Reader",
    matchesPresets:["street_lit","kingpin_romance"],
    wants:["power","money","danger","betrayal","street strategy"],
    hates:["soft conflicts","unrealistic consequences"],
    emotionalDrivers:["fear","revenge","power"],
    favoriteTropes:["The Plug","Street to Legit","Protect the Family","Loyalty Betrayal"],
    requiredPayoff:"Choices must have consequences." },
  { id:"crime_saga_reader", name:"The Empire Builder",
    matchesPresets:["crime_family_saga"],
    wants:["legacy","family politics","succession battles","power structures"],
    hates:["small stakes","weak villains"],
    emotionalDrivers:["power","legacy","control"],
    favoriteTropes:["Family Empire","Succession War","Hidden Heir","Family Betrayal"],
    requiredPayoff:"The family structure must change permanently." },
  { id:"mystery_reader", name:"The Puzzle Solver",
    matchesPresets:["black_mystery"],
    wants:["clues","investigation","twists","satisfying reveals"],
    hates:["plot holes","random endings"],
    emotionalDrivers:["curiosity","suspense","surprise"],
    favoriteTropes:["Cold Case","Missing Person","Hidden Witness","Wrong Suspect"],
    requiredPayoff:"The mystery must be solved fairly." },
  { id:"thriller_reader", name:"The Edge-of-Seat Reader",
    matchesPresets:["political_thriller","corporate_thriller","romantic_suspense"],
    wants:["danger","conspiracies","twists","high stakes"],
    hates:["slow pacing","obvious villains"],
    emotionalDrivers:["fear","urgency","shock"],
    favoriteTropes:["Conspiracy","The Mole","Government Coverup","Whistleblower"],
    requiredPayoff:"Truth must be revealed at a cost." },
  { id:"faith_reader", name:"The Faith-Focused Reader",
    matchesPresets:["faith_purpose_romance","faith_family_saga"],
    wants:["hope","faith growth","redemption","purpose"],
    hates:["cynical endings","performative faith"],
    emotionalDrivers:["hope","peace","inspiration"],
    favoriteTropes:["Redemption Arc","Unexpected Calling","Kingdom Partnership","Waiting on God"],
    requiredPayoff:"Character must experience meaningful spiritual growth." },
  { id:"womens_fiction_reader", name:"The Reinvention Reader",
    matchesPresets:["womens_fiction"],
    wants:["growth","identity","friendship","realistic life transitions"],
    hates:["one-dimensional characters","easy solutions"],
    emotionalDrivers:["hope","reflection","empowerment"],
    favoriteTropes:["Midlife Reinvention","Career Collapse","Starting Over","Finding Herself"],
    requiredPayoff:"Heroine must evolve into a fuller version of herself." },
];

export function detectReaderArchetypes(presetId) {
  const matches = READER_ARCHETYPES.filter(a => a.matchesPresets.includes(presetId || "custom"));
  return { primary: matches[0] || null, secondary: matches[1] || null };
}

export const TROPES_DATABASE = [
  // ── ROMANCE CORE ──
  { name:"Enemies to Lovers", category:"Romance Core", primaryGenre:"Romance", heatLevel:3, conflictLevel:4, romanceLevel:5, dangerLevel:2, seriesFriendly:true, worksWith:["Forced Proximity","Fake Relationship","Forbidden Love"] },
  { name:"Friends to Lovers", category:"Romance Core", primaryGenre:"Romance", heatLevel:2, conflictLevel:2, romanceLevel:5, dangerLevel:1, seriesFriendly:true, worksWith:["Second Chance Romance","Childhood Sweethearts"] },
  { name:"Second Chance Romance", category:"Romance Core", primaryGenre:"Romance", heatLevel:3, conflictLevel:4, romanceLevel:5, dangerLevel:2, seriesFriendly:true, worksWith:["Friends to Lovers","Forbidden Love","Marriage in Trouble"] },
  { name:"Forced Proximity", category:"Romance Core", primaryGenre:"Romance", heatLevel:3, conflictLevel:3, romanceLevel:5, dangerLevel:2, seriesFriendly:false, worksWith:["Enemies to Lovers","Only One Bed","Fake Relationship"] },
  { name:"Opposites Attract", category:"Romance Core", primaryGenre:"Romance", heatLevel:2, conflictLevel:3, romanceLevel:5, dangerLevel:1, seriesFriendly:true, worksWith:["Grumpy Sunshine","Black Cat & Golden Retriever"] },
  { name:"Fake Relationship", category:"Romance Core", primaryGenre:"Romance", heatLevel:3, conflictLevel:3, romanceLevel:5, dangerLevel:1, seriesFriendly:false, worksWith:["Enemies to Lovers","Forced Proximity","Marriage of Convenience"] },
  { name:"Marriage of Convenience", category:"Romance Core", primaryGenre:"Romance", heatLevel:3, conflictLevel:4, romanceLevel:5, dangerLevel:2, seriesFriendly:true, worksWith:["Fake Relationship","Forbidden Love","Enemies to Lovers"] },
  { name:"Forbidden Love", category:"Romance Core", primaryGenre:"Romance", heatLevel:4, conflictLevel:5, romanceLevel:5, dangerLevel:3, seriesFriendly:true, worksWith:["Secret Relationship","Family Disapproves","Enemies to Lovers"] },
  { name:"Secret Relationship", category:"Romance Core", primaryGenre:"Romance", heatLevel:3, conflictLevel:4, romanceLevel:5, dangerLevel:2, seriesFriendly:true, worksWith:["Forbidden Love","Fake Relationship","Boss & Employee"] },
  { name:"Childhood Sweethearts", category:"Romance Core", primaryGenre:"Romance", heatLevel:2, conflictLevel:3, romanceLevel:5, dangerLevel:1, seriesFriendly:true, worksWith:["Second Chance Romance","Friends to Lovers"] },
  { name:"Workplace Romance", category:"Romance Core", primaryGenre:"Romance", heatLevel:3, conflictLevel:4, romanceLevel:5, dangerLevel:1, seriesFriendly:true, worksWith:["Boss & Employee","Enemies to Lovers","Forced Proximity"] },

  // ── ROMANCE HIGH HEAT ──
  { name:"Only One Bed", category:"Romance High Heat", primaryGenre:"Romance", heatLevel:4, conflictLevel:2, romanceLevel:5, dangerLevel:1, seriesFriendly:false, worksWith:["Forced Proximity","Enemies to Lovers","Grumpy Sunshine"] },
  { name:"Touch Her and Die", category:"Romance High Heat", primaryGenre:"Romance", heatLevel:4, conflictLevel:4, romanceLevel:5, dangerLevel:3, seriesFriendly:true, worksWith:["Possessive Hero","Protector Romance","Forbidden Love"] },
  { name:"Possessive Hero", category:"Romance High Heat", primaryGenre:"Romance", heatLevel:4, conflictLevel:4, romanceLevel:5, dangerLevel:3, seriesFriendly:true, worksWith:["Touch Her and Die","Protector Romance","Forbidden Love"] },
  { name:"Protector Romance", category:"Romance High Heat", primaryGenre:"Romance", heatLevel:3, conflictLevel:4, romanceLevel:5, dangerLevel:3, seriesFriendly:true, worksWith:["Touch Her and Die","Possessive Hero","Loyalty Test"] },
  { name:"Reformed Player", category:"Romance High Heat", primaryGenre:"Romance", heatLevel:4, conflictLevel:3, romanceLevel:5, dangerLevel:2, seriesFriendly:true, worksWith:["Second Chance Romance","Enemies to Lovers","Unexpected Pregnancy"] },
  { name:"Age Gap Romance", category:"Romance High Heat", primaryGenre:"Romance", heatLevel:3, conflictLevel:4, romanceLevel:5, dangerLevel:2, seriesFriendly:true, worksWith:["Forbidden Love","Boss & Employee","Family Disapproves"] },
  { name:"Boss & Employee", category:"Romance High Heat", primaryGenre:"Romance", heatLevel:4, conflictLevel:4, romanceLevel:5, dangerLevel:2, seriesFriendly:true, worksWith:["Forbidden Love","Secret Relationship","Enemies to Lovers"] },
  { name:"Grumpy Sunshine", category:"Romance High Heat", primaryGenre:"Romance", heatLevel:3, conflictLevel:3, romanceLevel:5, dangerLevel:1, seriesFriendly:true, worksWith:["Opposites Attract","Only One Bed","Forced Proximity"] },
  { name:"Black Cat & Golden Retriever", category:"Romance High Heat", primaryGenre:"Romance", heatLevel:3, conflictLevel:2, romanceLevel:5, dangerLevel:1, seriesFriendly:true, worksWith:["Opposites Attract","Grumpy Sunshine","Friends to Lovers"] },
  { name:"Unexpected Pregnancy", category:"Romance High Heat", primaryGenre:"Romance", heatLevel:3, conflictLevel:5, romanceLevel:4, dangerLevel:2, seriesFriendly:true, worksWith:["Secret Baby","Reformed Player","Second Chance Romance"] },
  { name:"Marriage in Trouble", category:"Romance High Heat", primaryGenre:"Romance", heatLevel:3, conflictLevel:5, romanceLevel:5, dangerLevel:2, seriesFriendly:true, worksWith:["Second Chance Romance","Divorce Recovery","Secret Relationship"] },

  // ── URBAN ROMANCE ──
  { name:"Ride or Die Love", category:"Urban Romance", primaryGenre:"Urban Romance", heatLevel:4, conflictLevel:5, romanceLevel:5, dangerLevel:4, seriesFriendly:true, worksWith:["Loyalty Test","Power Couple","Protect the Family"] },
  { name:"Hood Meets Corporate", category:"Urban Romance", primaryGenre:"Urban Romance", heatLevel:3, conflictLevel:4, romanceLevel:4, dangerLevel:3, seriesFriendly:true, worksWith:["Street to Legit","Business and Pleasure","Enemies to Lovers"] },
  { name:"Dangerous Ex Returns", category:"Urban Romance", primaryGenre:"Urban Romance", heatLevel:4, conflictLevel:5, romanceLevel:4, dangerLevel:5, seriesFriendly:true, worksWith:["Loyalty Test","Someone is Watching","Blackmail"] },
  { name:"Family Disapproves", category:"Urban Romance", primaryGenre:"Urban Romance", heatLevel:3, conflictLevel:5, romanceLevel:4, dangerLevel:3, seriesFriendly:true, worksWith:["Forbidden Love","Ride or Die Love","Love Across Worlds"] },
  { name:"Power Couple", category:"Urban Romance", primaryGenre:"Urban Romance", heatLevel:4, conflictLevel:3, romanceLevel:5, dangerLevel:2, seriesFriendly:true, worksWith:["Business and Pleasure","Legacy Builder","Building an Empire"] },
  { name:"Street Legend Returns", category:"Urban Romance", primaryGenre:"Urban Romance", heatLevel:4, conflictLevel:5, romanceLevel:4, dangerLevel:4, seriesFriendly:true, worksWith:["Street to Legit","Dangerous Ex Returns","Loyalty Test"] },
  { name:"Love Across Worlds", category:"Urban Romance", primaryGenre:"Urban Romance", heatLevel:3, conflictLevel:4, romanceLevel:5, dangerLevel:3, seriesFriendly:true, worksWith:["Hood Meets Corporate","Forbidden Love","Loyalty Test"] },
  { name:"Secret Baby", category:"Urban Romance", primaryGenre:"Urban Romance", heatLevel:3, conflictLevel:5, romanceLevel:4, dangerLevel:3, seriesFriendly:true, worksWith:["Unexpected Pregnancy","Second Chance Romance","Family Betrayal"] },
  { name:"Loyalty Test", category:"Urban Romance", primaryGenre:"Urban Romance", heatLevel:3, conflictLevel:5, romanceLevel:3, dangerLevel:4, seriesFriendly:true, worksWith:["Ride or Die Love","Snitch in the Circle","Family Loyalty Test"] },
  { name:"Business and Pleasure", category:"Urban Romance", primaryGenre:"Urban Romance", heatLevel:4, conflictLevel:4, romanceLevel:5, dangerLevel:2, seriesFriendly:true, worksWith:["Boss & Employee","Power Couple","Hood Meets Corporate"] },

  // ── STREET LIT ──
  { name:"Street to Legit", category:"Street Lit", primaryGenre:"Street Lit", heatLevel:3, conflictLevel:5, romanceLevel:2, dangerLevel:5, seriesFriendly:true, worksWith:["Double Life","Hood Meets Corporate","Family Business Front"] },
  { name:"The Plug", category:"Street Lit", primaryGenre:"Street Lit", heatLevel:2, conflictLevel:5, romanceLevel:1, dangerLevel:5, seriesFriendly:true, worksWith:["Rival Crew","Hidden Money","The Setup"] },
  { name:"Rival Crew", category:"Street Lit", primaryGenre:"Street Lit", heatLevel:2, conflictLevel:5, romanceLevel:2, dangerLevel:5, seriesFriendly:true, worksWith:["Loyalty Betrayal","The Plug","Revenge Mission"] },
  { name:"Hidden Money", category:"Street Lit", primaryGenre:"Street Lit", heatLevel:2, conflictLevel:5, romanceLevel:1, dangerLevel:4, seriesFriendly:true, worksWith:["Family Business Front","The Setup","Loyalty Betrayal"] },
  { name:"Snitch in the Circle", category:"Street Lit", primaryGenre:"Street Lit", heatLevel:2, conflictLevel:5, romanceLevel:1, dangerLevel:5, seriesFriendly:true, worksWith:["Loyalty Betrayal","The Setup","Protect the Family"] },
  { name:"Revenge Mission", category:"Street Lit", primaryGenre:"Street Lit", heatLevel:3, conflictLevel:5, romanceLevel:2, dangerLevel:5, seriesFriendly:true, worksWith:["Rival Crew","Loyalty Betrayal","Family Betrayal"] },
  { name:"Double Life", category:"Street Lit", primaryGenre:"Street Lit", heatLevel:3, conflictLevel:5, romanceLevel:2, dangerLevel:4, seriesFriendly:true, worksWith:["Street to Legit","Hidden Money","Family Business Front"] },
  { name:"The Setup", category:"Street Lit", primaryGenre:"Street Lit", heatLevel:2, conflictLevel:5, romanceLevel:1, dangerLevel:5, seriesFriendly:true, worksWith:["Snitch in the Circle","Hidden Money","Loyalty Betrayal"] },
  { name:"Loyalty Betrayal", category:"Street Lit", primaryGenre:"Street Lit", heatLevel:2, conflictLevel:5, romanceLevel:2, dangerLevel:5, seriesFriendly:true, worksWith:["Snitch in the Circle","Family Betrayal","Revenge Mission"] },
  { name:"Protect the Family", category:"Street Lit", primaryGenre:"Street Lit", heatLevel:3, conflictLevel:5, romanceLevel:3, dangerLevel:5, seriesFriendly:true, worksWith:["Loyalty Betrayal","Family Loyalty Test","Ride or Die Love"] },

  // ── CRIME FAMILY SAGA ──
  { name:"Family Empire", category:"Crime Family Saga", primaryGenre:"Crime Saga", heatLevel:2, conflictLevel:5, romanceLevel:2, dangerLevel:4, seriesFriendly:true, worksWith:["Hidden Heir","Succession War","Family Betrayal","Forbidden Love"] },
  { name:"Hidden Heir", category:"Crime Family Saga", primaryGenre:"Crime Saga", heatLevel:2, conflictLevel:5, romanceLevel:3, dangerLevel:4, seriesFriendly:true, worksWith:["Family Empire","Secret Bloodline","Succession War"] },
  { name:"Succession War", category:"Crime Family Saga", primaryGenre:"Crime Saga", heatLevel:2, conflictLevel:5, romanceLevel:2, dangerLevel:4, seriesFriendly:true, worksWith:["Family Empire","Hidden Heir","Sibling Rivalry"] },
  { name:"The Black Sheep", category:"Crime Family Saga", primaryGenre:"Crime Saga", heatLevel:2, conflictLevel:4, romanceLevel:3, dangerLevel:3, seriesFriendly:true, worksWith:["Family Betrayal","Succession War","Generational Curse"] },
  { name:"Family Business Front", category:"Crime Family Saga", primaryGenre:"Crime Saga", heatLevel:2, conflictLevel:5, romanceLevel:1, dangerLevel:5, seriesFriendly:true, worksWith:["Double Life","Hidden Money","Family Empire"] },
  { name:"Secret Bloodline", category:"Crime Family Saga", primaryGenre:"Crime Saga", heatLevel:2, conflictLevel:5, romanceLevel:2, dangerLevel:4, seriesFriendly:true, worksWith:["Hidden Heir","Family Betrayal","Adoption Revelation"] },
  { name:"Matriarch Secret", category:"Crime Family Saga", primaryGenre:"Crime Saga", heatLevel:2, conflictLevel:5, romanceLevel:1, dangerLevel:3, seriesFriendly:true, worksWith:["Family Empire","Legacy Under Threat","Family Betrayal"] },
  { name:"Legacy Under Threat", category:"Crime Family Saga", primaryGenre:"Crime Saga", heatLevel:2, conflictLevel:5, romanceLevel:2, dangerLevel:4, seriesFriendly:true, worksWith:["Family Empire","Protect the Family","Succession War"] },
  { name:"Family Betrayal", category:"Crime Family Saga", primaryGenre:"Crime Saga", heatLevel:2, conflictLevel:5, romanceLevel:2, dangerLevel:5, seriesFriendly:true, worksWith:["Loyalty Betrayal","Family Empire","Hidden Heir"] },
  { name:"The Next Generation", category:"Crime Family Saga", primaryGenre:"Crime Saga", heatLevel:2, conflictLevel:4, romanceLevel:3, dangerLevel:3, seriesFriendly:true, worksWith:["Family Empire","Legacy Under Threat","Succession War"] },

  // ── WOMEN'S FICTION ──
  { name:"Midlife Reinvention", category:"Women's Fiction", primaryGenre:"Women's Fiction", heatLevel:1, conflictLevel:3, romanceLevel:3, dangerLevel:1, seriesFriendly:false, worksWith:["Starting Over","Finding Herself","Empty Nest"] },
  { name:"Starting Over", category:"Women's Fiction", primaryGenre:"Women's Fiction", heatLevel:1, conflictLevel:3, romanceLevel:3, dangerLevel:1, seriesFriendly:false, worksWith:["Midlife Reinvention","Divorce Recovery","Empty Nest"] },
  { name:"Career Collapse", category:"Women's Fiction", primaryGenre:"Women's Fiction", heatLevel:1, conflictLevel:4, romanceLevel:2, dangerLevel:1, seriesFriendly:false, worksWith:["Starting Over","Finding Herself","Reinvention Journey"] },
  { name:"Divorce Recovery", category:"Women's Fiction", primaryGenre:"Women's Fiction", heatLevel:1, conflictLevel:4, romanceLevel:3, dangerLevel:1, seriesFriendly:false, worksWith:["Starting Over","Midlife Reinvention","Learning Boundaries"] },
  { name:"Empty Nest", category:"Women's Fiction", primaryGenre:"Women's Fiction", heatLevel:1, conflictLevel:3, romanceLevel:3, dangerLevel:1, seriesFriendly:false, worksWith:["Midlife Reinvention","Finding Herself","Starting Over"] },
  { name:"Friendship Circle", category:"Women's Fiction", primaryGenre:"Women's Fiction", heatLevel:1, conflictLevel:2, romanceLevel:2, dangerLevel:1, seriesFriendly:true, worksWith:["Starting Over","Returning Home","Learning Boundaries"] },
  { name:"Returning Home", category:"Women's Fiction", primaryGenre:"Women's Fiction", heatLevel:1, conflictLevel:3, romanceLevel:3, dangerLevel:1, seriesFriendly:true, worksWith:["Childhood Sweethearts","Family Reunion","Finding Herself"] },
  { name:"Unexpected Inheritance", category:"Women's Fiction", primaryGenre:"Women's Fiction", heatLevel:1, conflictLevel:4, romanceLevel:2, dangerLevel:2, seriesFriendly:true, worksWith:["Returning Home","Family Secret","Starting Over"] },
  { name:"Finding Herself", category:"Women's Fiction", primaryGenre:"Women's Fiction", heatLevel:1, conflictLevel:3, romanceLevel:3, dangerLevel:1, seriesFriendly:false, worksWith:["Midlife Reinvention","Career Collapse","Learning Boundaries"] },
  { name:"Learning Boundaries", category:"Women's Fiction", primaryGenre:"Women's Fiction", heatLevel:1, conflictLevel:3, romanceLevel:3, dangerLevel:1, seriesFriendly:false, worksWith:["Finding Herself","Divorce Recovery","Friendship Circle"] },

  // ── FAITH ROMANCE ──
  { name:"Redemption Arc", category:"Faith Romance", primaryGenre:"Faith", heatLevel:1, conflictLevel:4, romanceLevel:4, dangerLevel:2, seriesFriendly:true, worksWith:["Prodigal Returns","Grace and Forgiveness","Second Chance Romance"] },
  { name:"Prodigal Returns", category:"Faith Romance", primaryGenre:"Faith", heatLevel:1, conflictLevel:4, romanceLevel:4, dangerLevel:2, seriesFriendly:true, worksWith:["Redemption Arc","Grace and Forgiveness","Returning Home"] },
  { name:"Waiting on God", category:"Faith Romance", primaryGenre:"Faith", heatLevel:1, conflictLevel:3, romanceLevel:4, dangerLevel:1, seriesFriendly:false, worksWith:["Faith Tested","Unexpected Calling","Kingdom Partnership"] },
  { name:"Unexpected Calling", category:"Faith Romance", primaryGenre:"Faith", heatLevel:1, conflictLevel:3, romanceLevel:3, dangerLevel:2, seriesFriendly:true, worksWith:["Waiting on God","Kingdom Partnership","Community Impact"] },
  { name:"Kingdom Partnership", category:"Faith Romance", primaryGenre:"Faith", heatLevel:1, conflictLevel:2, romanceLevel:4, dangerLevel:1, seriesFriendly:true, worksWith:["Ministry Partners","Unexpected Calling","Purpose Over Popularity"] },
  { name:"Love After Loss", category:"Faith Romance", primaryGenre:"Faith", heatLevel:2, conflictLevel:4, romanceLevel:5, dangerLevel:2, seriesFriendly:true, worksWith:["Grace and Forgiveness","Redemption Arc","Second Chance Romance"] },
  { name:"Grace and Forgiveness", category:"Faith Romance", primaryGenre:"Faith", heatLevel:1, conflictLevel:4, romanceLevel:4, dangerLevel:1, seriesFriendly:false, worksWith:["Redemption Arc","Prodigal Returns","Love After Loss"] },
  { name:"Faith Tested", category:"Faith Romance", primaryGenre:"Faith", heatLevel:1, conflictLevel:4, romanceLevel:3, dangerLevel:2, seriesFriendly:true, worksWith:["Waiting on God","Redemption Arc","Unexpected Calling"] },
  { name:"Prayer Changes Everything", category:"Faith Romance", primaryGenre:"Faith", heatLevel:1, conflictLevel:3, romanceLevel:3, dangerLevel:1, seriesFriendly:false, worksWith:["Faith Tested","Waiting on God","Grace and Forgiveness"] },
  { name:"Ministry Partners", category:"Faith Romance", primaryGenre:"Faith", heatLevel:1, conflictLevel:2, romanceLevel:4, dangerLevel:1, seriesFriendly:true, worksWith:["Kingdom Partnership","Unexpected Calling","Friends to Lovers"] },

  // ── FAMILY DRAMA ──
  { name:"Family Reunion", category:"Family Drama", primaryGenre:"Drama", heatLevel:1, conflictLevel:4, romanceLevel:2, dangerLevel:2, seriesFriendly:true, worksWith:["Family Secret","Returning Relative","Sibling Rivalry"] },
  { name:"Generational Curse", category:"Family Drama", primaryGenre:"Drama", heatLevel:1, conflictLevel:5, romanceLevel:2, dangerLevel:3, seriesFriendly:true, worksWith:["Family Secret","Succession War","The Black Sheep"] },
  { name:"Sibling Rivalry", category:"Family Drama", primaryGenre:"Drama", heatLevel:1, conflictLevel:4, romanceLevel:2, dangerLevel:3, seriesFriendly:true, worksWith:["Succession War","Family Betrayal","Inheritance Conflict"] },
  { name:"Caregiver Burden", category:"Family Drama", primaryGenre:"Drama", heatLevel:1, conflictLevel:3, romanceLevel:2, dangerLevel:1, seriesFriendly:false, worksWith:["Empty Nest","Family Loyalty Test","Parent Child Estrangement"] },
  { name:"Family Secret", category:"Family Drama", primaryGenre:"Drama", heatLevel:2, conflictLevel:5, romanceLevel:2, dangerLevel:3, seriesFriendly:true, worksWith:["Generational Curse","Adoption Revelation","Family Reunion"] },
  { name:"Parent Child Estrangement", category:"Family Drama", primaryGenre:"Drama", heatLevel:1, conflictLevel:4, romanceLevel:1, dangerLevel:2, seriesFriendly:true, worksWith:["Returning Relative","Grace and Forgiveness","Prodigal Returns"] },
  { name:"Adoption Revelation", category:"Family Drama", primaryGenre:"Drama", heatLevel:2, conflictLevel:5, romanceLevel:2, dangerLevel:3, seriesFriendly:true, worksWith:["Secret Bloodline","Family Secret","Hidden Heir"] },
  { name:"Inheritance Conflict", category:"Family Drama", primaryGenre:"Drama", heatLevel:1, conflictLevel:4, romanceLevel:2, dangerLevel:3, seriesFriendly:true, worksWith:["Sibling Rivalry","Succession War","Family Betrayal"] },
  { name:"Family Loyalty Test", category:"Family Drama", primaryGenre:"Drama", heatLevel:2, conflictLevel:5, romanceLevel:2, dangerLevel:4, seriesFriendly:true, worksWith:["Loyalty Test","Protect the Family","Family Betrayal"] },
  { name:"Returning Relative", category:"Family Drama", primaryGenre:"Drama", heatLevel:2, conflictLevel:4, romanceLevel:2, dangerLevel:3, seriesFriendly:true, worksWith:["Family Reunion","Parent Child Estrangement","Family Secret"] },

  // ── MYSTERY ──
  { name:"Cold Case", category:"Mystery", primaryGenre:"Mystery", heatLevel:1, conflictLevel:4, romanceLevel:2, dangerLevel:3, seriesFriendly:true, worksWith:["Hidden Witness","Family Coverup","Deadly Inheritance"] },
  { name:"Missing Person", category:"Mystery", primaryGenre:"Mystery", heatLevel:1, conflictLevel:4, romanceLevel:2, dangerLevel:4, seriesFriendly:true, worksWith:["Hidden Witness","Countdown Clock","Wrong Suspect"] },
  { name:"Hidden Witness", category:"Mystery", primaryGenre:"Mystery", heatLevel:2, conflictLevel:5, romanceLevel:2, dangerLevel:5, seriesFriendly:true, worksWith:["Blackmail","Someone is Watching","The Witness"] },
  { name:"Small Town Secrets", category:"Mystery", primaryGenre:"Mystery", heatLevel:1, conflictLevel:4, romanceLevel:3, dangerLevel:3, seriesFriendly:true, worksWith:["Family Coverup","Returning Home","Cold Case"] },
  { name:"Murder in Plain Sight", category:"Mystery", primaryGenre:"Mystery", heatLevel:1, conflictLevel:5, romanceLevel:1, dangerLevel:4, seriesFriendly:true, worksWith:["Wrong Suspect","Family Coverup","Deadly Inheritance"] },
  { name:"Wrong Suspect", category:"Mystery", primaryGenre:"Mystery", heatLevel:1, conflictLevel:5, romanceLevel:2, dangerLevel:4, seriesFriendly:true, worksWith:["Hidden Witness","Murder in Plain Sight","The Trap"] },
  { name:"Secret Society", category:"Mystery", primaryGenre:"Mystery", heatLevel:2, conflictLevel:4, romanceLevel:2, dangerLevel:4, seriesFriendly:true, worksWith:["Conspiracy","Government Coverup","Hidden Agenda"] },
  { name:"Family Coverup", category:"Mystery", primaryGenre:"Mystery", heatLevel:1, conflictLevel:5, romanceLevel:1, dangerLevel:4, seriesFriendly:true, worksWith:["Cold Case","Family Secret","Deadly Inheritance"] },
  { name:"Deadly Inheritance", category:"Mystery", primaryGenre:"Mystery", heatLevel:2, conflictLevel:5, romanceLevel:2, dangerLevel:4, seriesFriendly:true, worksWith:["Family Coverup","Hidden Heir","Unexpected Inheritance"] },
  { name:"Hidden Diary", category:"Mystery", primaryGenre:"Mystery", heatLevel:1, conflictLevel:4, romanceLevel:2, dangerLevel:3, seriesFriendly:false, worksWith:["Cold Case","Family Secret","Small Town Secrets"] },

  // ── SUSPENSE ──
  { name:"Someone is Watching", category:"Suspense", primaryGenre:"Suspense", heatLevel:2, conflictLevel:5, romanceLevel:2, dangerLevel:5, seriesFriendly:true, worksWith:["Blackmail","Hidden Enemy","The Trap"] },
  { name:"Blackmail", category:"Suspense", primaryGenre:"Suspense", heatLevel:2, conflictLevel:5, romanceLevel:2, dangerLevel:5, seriesFriendly:true, worksWith:["Hidden Enemy","Someone is Watching","The Setup"] },
  { name:"Deadly Secret", category:"Suspense", primaryGenre:"Suspense", heatLevel:2, conflictLevel:5, romanceLevel:2, dangerLevel:5, seriesFriendly:true, worksWith:["Hidden Enemy","Blackmail","The Witness"] },
  { name:"Hidden Enemy", category:"Suspense", primaryGenre:"Suspense", heatLevel:2, conflictLevel:5, romanceLevel:2, dangerLevel:5, seriesFriendly:true, worksWith:["The Mole","Blackmail","Deadly Secret"] },
  { name:"The Witness", category:"Suspense", primaryGenre:"Suspense", heatLevel:2, conflictLevel:5, romanceLevel:2, dangerLevel:5, seriesFriendly:true, worksWith:["Hidden Witness","Blackmail","The Trap"] },
  { name:"Wrong Place Wrong Time", category:"Suspense", primaryGenre:"Suspense", heatLevel:1, conflictLevel:4, romanceLevel:2, dangerLevel:5, seriesFriendly:false, worksWith:["Anonymous Message","Countdown Clock","The Trap"] },
  { name:"Anonymous Message", category:"Suspense", primaryGenre:"Suspense", heatLevel:1, conflictLevel:4, romanceLevel:1, dangerLevel:4, seriesFriendly:true, worksWith:["Someone is Watching","Blackmail","Hidden Enemy"] },
  { name:"The Missing Night", category:"Suspense", primaryGenre:"Suspense", heatLevel:2, conflictLevel:5, romanceLevel:1, dangerLevel:4, seriesFriendly:false, worksWith:["Deadly Secret","Anonymous Message","Hidden Enemy"] },
  { name:"The Trap", category:"Suspense", primaryGenre:"Suspense", heatLevel:2, conflictLevel:5, romanceLevel:1, dangerLevel:5, seriesFriendly:true, worksWith:["Countdown Clock","Wrong Suspect","Hidden Enemy"] },
  { name:"Countdown Clock", category:"Suspense", primaryGenre:"Suspense", heatLevel:2, conflictLevel:5, romanceLevel:1, dangerLevel:5, seriesFriendly:false, worksWith:["The Trap","Missing Person","Wrong Place Wrong Time"] },

  // ── THRILLER ──
  { name:"Conspiracy", category:"Thriller", primaryGenre:"Thriller", heatLevel:1, conflictLevel:5, romanceLevel:1, dangerLevel:5, seriesFriendly:true, worksWith:["Government Coverup","The Mole","Whistleblower"] },
  { name:"Government Coverup", category:"Thriller", primaryGenre:"Thriller", heatLevel:1, conflictLevel:5, romanceLevel:1, dangerLevel:5, seriesFriendly:true, worksWith:["Conspiracy","Election Scandal","Whistleblower"] },
  { name:"Corporate Espionage", category:"Thriller", primaryGenre:"Thriller", heatLevel:2, conflictLevel:5, romanceLevel:2, dangerLevel:4, seriesFriendly:true, worksWith:["Boardroom Coup","The Mole","Hidden Agenda"] },
  { name:"The Mole", category:"Thriller", primaryGenre:"Thriller", heatLevel:1, conflictLevel:5, romanceLevel:1, dangerLevel:5, seriesFriendly:true, worksWith:["Conspiracy","Snitch in the Circle","Hidden Agenda"] },
  { name:"Boardroom Coup", category:"Thriller", primaryGenre:"Thriller", heatLevel:1, conflictLevel:5, romanceLevel:2, dangerLevel:3, seriesFriendly:true, worksWith:["Corporate Espionage","Election Scandal","Leadership Crisis"] },
  { name:"Election Scandal", category:"Thriller", primaryGenre:"Thriller", heatLevel:1, conflictLevel:5, romanceLevel:1, dangerLevel:4, seriesFriendly:true, worksWith:["Government Coverup","Whistleblower","Leaked Document"] },
  { name:"Whistleblower", category:"Thriller", primaryGenre:"Thriller", heatLevel:1, conflictLevel:5, romanceLevel:2, dangerLevel:5, seriesFriendly:true, worksWith:["Conspiracy","Hidden Witness","Leaked Document"] },
  { name:"Dangerous Truth", category:"Thriller", primaryGenre:"Thriller", heatLevel:2, conflictLevel:5, romanceLevel:1, dangerLevel:5, seriesFriendly:true, worksWith:["Whistleblower","The Mole","Conspiracy"] },
  { name:"Leaked Document", category:"Thriller", primaryGenre:"Thriller", heatLevel:1, conflictLevel:5, romanceLevel:1, dangerLevel:4, seriesFriendly:true, worksWith:["Whistleblower","Election Scandal","Corporate Espionage"] },
  { name:"Hidden Agenda", category:"Thriller", primaryGenre:"Thriller", heatLevel:1, conflictLevel:5, romanceLevel:1, dangerLevel:5, seriesFriendly:true, worksWith:["The Mole","Conspiracy","Boardroom Coup"] },

  // ── POWER & PURPOSE ──
  { name:"Reinvention Journey", category:"Power & Purpose", primaryGenre:"P&P", heatLevel:1, conflictLevel:3, romanceLevel:3, dangerLevel:1, seriesFriendly:false, worksWith:["Finding Herself","Midlife Reinvention","Career Collapse"] },
  { name:"Woman in Leadership", category:"Power & Purpose", primaryGenre:"P&P", heatLevel:2, conflictLevel:4, romanceLevel:3, dangerLevel:2, seriesFriendly:true, worksWith:["Building an Empire","Legacy Builder","Enemies to Lovers"] },
  { name:"Legacy Builder", category:"Power & Purpose", primaryGenre:"P&P", heatLevel:2, conflictLevel:4, romanceLevel:3, dangerLevel:2, seriesFriendly:true, worksWith:["Building an Empire","Power Couple","Woman in Leadership"] },
  { name:"Community Impact", category:"Power & Purpose", primaryGenre:"P&P", heatLevel:1, conflictLevel:3, romanceLevel:3, dangerLevel:1, seriesFriendly:true, worksWith:["Unexpected Calling","Kingdom Partnership","Purpose Over Popularity"] },
  { name:"Purpose Over Popularity", category:"Power & Purpose", primaryGenre:"P&P", heatLevel:1, conflictLevel:3, romanceLevel:3, dangerLevel:1, seriesFriendly:false, worksWith:["Calling vs Comfort","Finding Her Voice","Reinvention Journey"] },
  { name:"Mentor Relationship", category:"Power & Purpose", primaryGenre:"P&P", heatLevel:2, conflictLevel:3, romanceLevel:3, dangerLevel:1, seriesFriendly:true, worksWith:["Woman in Leadership","Unexpected Calling","Purpose Over Popularity"] },
  { name:"Leadership Crisis", category:"Power & Purpose", primaryGenre:"P&P", heatLevel:2, conflictLevel:5, romanceLevel:2, dangerLevel:2, seriesFriendly:true, worksWith:["Building an Empire","Legacy Under Threat","Boardroom Coup"] },
  { name:"Finding Her Voice", category:"Power & Purpose", primaryGenre:"P&P", heatLevel:1, conflictLevel:3, romanceLevel:3, dangerLevel:1, seriesFriendly:false, worksWith:["Reinvention Journey","Purpose Over Popularity","Finding Herself"] },
  { name:"Building an Empire", category:"Power & Purpose", primaryGenre:"P&P", heatLevel:2, conflictLevel:4, romanceLevel:3, dangerLevel:2, seriesFriendly:true, worksWith:["Legacy Builder","Power Couple","Woman in Leadership"] },
  { name:"Calling vs Comfort", category:"Power & Purpose", primaryGenre:"P&P", heatLevel:1, conflictLevel:4, romanceLevel:3, dangerLevel:1, seriesFriendly:false, worksWith:["Purpose Over Popularity","Unexpected Calling","Reinvention Journey"] },

  // ── LUXURY ROMANCE ──
  { name:"Billionaire Romance", category:"Luxury Romance", primaryGenre:"Luxury", heatLevel:4, conflictLevel:4, romanceLevel:5, dangerLevel:2, seriesFriendly:true, worksWith:["Boss & Employee","Enemies to Lovers","Power Couple Goals"] },
  { name:"Celebrity Romance", category:"Luxury Romance", primaryGenre:"Luxury", heatLevel:4, conflictLevel:4, romanceLevel:5, dangerLevel:2, seriesFriendly:true, worksWith:["Public Image Crisis","Secret Relationship","Power Couple Goals"] },
  { name:"Athlete Romance", category:"Luxury Romance", primaryGenre:"Luxury", heatLevel:4, conflictLevel:3, romanceLevel:5, dangerLevel:2, seriesFriendly:true, worksWith:["Billionaire Romance","Power Couple Goals","Forbidden Love"] },
  { name:"Entertainment Mogul", category:"Luxury Romance", primaryGenre:"Luxury", heatLevel:3, conflictLevel:4, romanceLevel:4, dangerLevel:2, seriesFriendly:true, worksWith:["Billionaire Romance","Power Couple Goals","Legacy Builder"] },
  { name:"Private Island Getaway", category:"Luxury Romance", primaryGenre:"Luxury", heatLevel:4, conflictLevel:3, romanceLevel:5, dangerLevel:2, seriesFriendly:false, worksWith:["Forced Proximity","Only One Bed","Billionaire Romance"] },
  { name:"Public Image Crisis", category:"Luxury Romance", primaryGenre:"Luxury", heatLevel:3, conflictLevel:4, romanceLevel:4, dangerLevel:2, seriesFriendly:true, worksWith:["Celebrity Romance","Secret Relationship","High Society Scandal"] },
  { name:"Luxury Lifestyle", category:"Luxury Romance", primaryGenre:"Luxury", heatLevel:3, conflictLevel:3, romanceLevel:4, dangerLevel:1, seriesFriendly:true, worksWith:["Billionaire Romance","Power Couple Goals","High Society Scandal"] },
  { name:"High Society Scandal", category:"Luxury Romance", primaryGenre:"Luxury", heatLevel:3, conflictLevel:5, romanceLevel:4, dangerLevel:3, seriesFriendly:true, worksWith:["Public Image Crisis","Forbidden Love","Secret Relationship"] },
  { name:"Power Couple Goals", category:"Luxury Romance", primaryGenre:"Luxury", heatLevel:4, conflictLevel:3, romanceLevel:5, dangerLevel:2, seriesFriendly:true, worksWith:["Building an Empire","Power Couple","Billionaire Romance"] },
  { name:"Secret Millionaire", category:"Luxury Romance", primaryGenre:"Luxury", heatLevel:3, conflictLevel:4, romanceLevel:5, dangerLevel:2, seriesFriendly:true, worksWith:["Enemies to Lovers","Fake Relationship","Billionaire Romance"] },

  // ── SPECULATIVE / SUPERNATURAL ──
  { name:"Hidden Powers", category:"Speculative", primaryGenre:"Speculative", heatLevel:2, conflictLevel:4, romanceLevel:3, dangerLevel:4, seriesFriendly:true, worksWith:["Chosen One","Family Gift","Supernatural Legacy"] },
  { name:"Chosen One", category:"Speculative", primaryGenre:"Speculative", heatLevel:2, conflictLevel:5, romanceLevel:3, dangerLevel:4, seriesFriendly:true, worksWith:["Hidden Powers","Prophecy","Ancient Secret"] },
  { name:"Family Gift", category:"Speculative", primaryGenre:"Speculative", heatLevel:2, conflictLevel:4, romanceLevel:3, dangerLevel:3, seriesFriendly:true, worksWith:["Hidden Powers","Supernatural Legacy","Generational Curse"] },
  { name:"Parallel Reality", category:"Speculative", primaryGenre:"Speculative", heatLevel:2, conflictLevel:4, romanceLevel:4, dangerLevel:3, seriesFriendly:true, worksWith:["Time Slip","Otherworldly Love","Chosen One"] },
  { name:"Prophecy", category:"Speculative", primaryGenre:"Speculative", heatLevel:2, conflictLevel:5, romanceLevel:3, dangerLevel:4, seriesFriendly:true, worksWith:["Chosen One","Ancient Secret","Hidden Powers"] },
  { name:"Ancient Secret", category:"Speculative", primaryGenre:"Speculative", heatLevel:2, conflictLevel:5, romanceLevel:3, dangerLevel:4, seriesFriendly:true, worksWith:["Secret Society","Prophecy","Supernatural Legacy"] },
  { name:"Supernatural Legacy", category:"Speculative", primaryGenre:"Speculative", heatLevel:2, conflictLevel:4, romanceLevel:3, dangerLevel:4, seriesFriendly:true, worksWith:["Family Gift","Ancient Secret","Generational Curse"] },
  { name:"Time Slip", category:"Speculative", primaryGenre:"Speculative", heatLevel:2, conflictLevel:4, romanceLevel:4, dangerLevel:3, seriesFriendly:true, worksWith:["Parallel Reality","Second Chance Romance","Otherworldly Love"] },
  { name:"Otherworldly Love", category:"Speculative", primaryGenre:"Speculative", heatLevel:3, conflictLevel:4, romanceLevel:5, dangerLevel:3, seriesFriendly:true, worksWith:["Forbidden Love","Time Slip","Parallel Reality"] },
  { name:"The Fifth Frequency", category:"Speculative", primaryGenre:"Speculative", heatLevel:3, conflictLevel:5, romanceLevel:4, dangerLevel:5, seriesFriendly:true, worksWith:["Hidden Powers","Chosen One","Ancient Secret"] },
];

export const TROPE_CATEGORY_ORDER = [
  "Romance Core", "Romance High Heat", "Urban Romance", "Street Lit",
  "Crime Family Saga", "Women's Fiction", "Faith Romance", "Family Drama",
  "Mystery", "Suspense", "Thriller", "Power & Purpose",
  "Luxury Romance", "Speculative"
];

export const TROPE_CATEGORY_COLORS = {
  "Romance Core":     "#D88830",
  "Romance High Heat":"#C83050",
  "Urban Romance":    "#B8342D",
  "Street Lit":       "#4A4A6A",
  "Crime Family Saga":"#6A3A2A",
  "Women's Fiction":  "#2D8B7A",
  "Faith Romance":    "#C8A030",
  "Family Drama":     "#8B6A2A",
  "Mystery":          "#4888C8",
  "Suspense":         "#7A3A8A",
  "Thriller":         "#3A5A3A",
  "Power & Purpose":  "#9F7AEA",
  "Luxury Romance":   "#B8841C",
  "Speculative":      "#3BB8A4",
};

export const PRESET_TROPE_CATEGORIES = {
  power_purpose_romance:           ["Romance Core","Power & Purpose"],
  black_billionaire_romance:       ["Romance Core","Luxury Romance"],
  soft_black_romance:              ["Romance Core","Romance High Heat"],
  family_empire_romance:           ["Romance Core","Crime Family Saga","Family Drama"],
  sexy_contemporary_black_romance: ["Romance Core","Romance High Heat"],
  erotic_urban_romance:            ["Romance High Heat","Urban Romance"],
  urban_drama_romance:             ["Urban Romance"],
  street_lit:                      ["Street Lit","Urban Romance"],
  crime_family_saga:               ["Crime Family Saga","Street Lit"],
  kingpin_romance:                 ["Urban Romance","Street Lit","Crime Family Saga"],
  romantic_suspense:               ["Romance Core","Suspense"],
  black_mystery:                   ["Mystery","Family Drama"],
  political_thriller:              ["Thriller"],
  corporate_thriller:              ["Thriller","Suspense","Power & Purpose"],
  faith_purpose_romance:           ["Faith Romance","Power & Purpose"],
  faith_family_saga:               ["Faith Romance","Family Drama"],
  womens_fiction:                  ["Women's Fiction","Family Drama"],
  custom:                          TROPE_CATEGORY_ORDER,
};

export function getTropesForPreset(presetId) {
  const cats = PRESET_TROPE_CATEGORIES[presetId || "custom"] || TROPE_CATEGORY_ORDER;
  const seen = new Set();
  const result = [];
  cats.forEach(cat => {
    TROPES_DATABASE.filter(t => t.category === cat).forEach(t => {
      if (!seen.has(t.name)) { seen.add(t.name); result.push(t); }
    });
  });
  return result;
}

export function getTropeByName(name) {
  return TROPES_DATABASE.find(t => t.name === name) || null;
}

export const HEAT = [
  { level:1, label:"Sweet",     emoji:"🌸", color:"#2D8B7A", desc:"Tension + emotional intimacy only" },
  { level:2, label:"Moderate",  emoji:"🌹", color:"#C09030", desc:"Kissing, romance, mild sensuality" },
  { level:3, label:"Steamy",    emoji:"🔥", color:"#D06030", desc:"Romantic tension + tasteful scenes" },
  { level:4, label:"High Heat", emoji:"🌶️", color:"#C83050", desc:"Frequent, explicit romantic scenes" },
  { level:5, label:"Very High", emoji:"💥", color:"#A01030", desc:"Explicit throughout" },
];

// ── Spice Level Framework ──────────────────────────────────────
// Controls how much the story emphasizes romantic and physical chemistry.
// Spice level NEVER replaces character development, emotional depth, or plot.
export const SPICE_LEVELS = [
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
export const INTENSITY_DIMENSIONS = [
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

export const DEFAULT_INTENSITY = { attractionIntensity:3, emotionalIntimacy:3, physicalAffection:2, relationshipFocus:3 };

// ── Erotic Romance Engine (W3) ─────────────────────────────────
// A first-class engine, independent of Spice Level. Spice = content/heat
// intensity; Erotic Romance = relationship/desire/chemistry/intimacy dynamics.
// Each dimension 1-5. A story can have high Erotic Romance + low Spice, etc.
export const EROTIC_DIMENSIONS = [
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

export const DEFAULT_EROTIC = { desireIntensity:3, chemistryFrequency:3, fantasyFulfillment:3, emotionalVulnerability:3, relationshipIntensity:3, forbiddenFactor:2, selfDiscovery:3, sensualAtmosphere:3, romanticRisk:3, intimacyAsCharacterGrowth:3 };

// Category calibration profiles — selecting one of these lanes auto-populates
// the engines from these baselines (still manually adjustable afterward).
// Authors are MARKET-PATTERN references only; never imitate or name them.
export const EROTIC_CATEGORIES = {
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
export const EROTIC_LANE_IDS = Object.keys(EROTIC_CATEGORIES);

// ── Street Lit + Suspense engines (W4) ─────────────────────────
export const STREETLIT_DIMENSIONS = [
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
export const DEFAULT_STREETLIT = { survivalPressure:2, empireBuilding:2, betrayalRisk:2, revengeDrive:2, streetInfluence:2, dangerLevel:2, loyaltyIntensity:3, consequenceLevel:2, moralityScale:2, cliffhangerFrequency:3 };

export const SUSPENSE_DIMENSIONS = [
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
export const DEFAULT_SUSPENSE = { mysteryLevel:2, dangerLevel:2, conspiracyLevel:2, psychologicalTension:2, investigationFocus:2, twistIntensity:2 };

// Urban-fiction category profiles. Each lane maps to one; selecting it
// auto-populates whichever engines that category defines. Authors are
// MARKET-PATTERN references only — never imitate or name them.
export const URBAN_CATEGORIES = {
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
export const LANE_TO_URBAN_CATEGORY = { streetLit:"streetLit", crimeSaga:"crimeSaga", suspense:"urbanSuspense", urban:"urbanRomanceDrama", luxury:"luxuryUrban" };

// Highest-weighted lane whose mapped category defines the given engine baseline
export function dominantUrbanEngine(normLanes, engField) {
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
export function dominantUrbanCategory(normLanes) {
  let best = null, bestPct = 0;
  for (const laneId in LANE_TO_URBAN_CATEGORY) {
    const p = normLanes[laneId] || 0;
    if (p > 0 && p > bestPct) { best = { id: LANE_TO_URBAN_CATEGORY[laneId], laneId, pct: p }; bestPct = p; }
  }
  return best;
}
// Street-lit family share of the blend (street lit + crime saga lanes)
export function streetLitShare(normLanes) { return (normLanes.streetLit || 0) + (normLanes.crimeSaga || 0); }

// Compact prompt fragments for scene/prose generation
export function streetLitLine(sl) {
  if (!sl) return "";
  const raised = STREETLIT_DIMENSIONS.filter(d => (sl[d.key]||2) >= 4).map(d => d.label + " " + sl[d.key] + "/5");
  if (!raised.length) return "";
  return "Street Lit engine (loyalty/danger/betrayal/empire stakes): " + raised.join(", ") + ". Keep external stakes, consequences, and cliffhanger pressure high.";
}
export function suspenseLine(sp) {
  if (!sp) return "";
  const raised = SUSPENSE_DIMENSIONS.filter(d => (sp[d.key]||2) >= 4).map(d => d.label + " " + sp[d.key] + "/5");
  if (!raised.length) return "";
  return "Suspense engine: " + raised.join(", ") + ". Sustain dread, danger, and reversals.";
}

// Dominant erotic category in a normalized blend (highest erotic lane > 0), or null
export function dominantEroticCategory(normLanes) {
  let best = null, bestPct = 0;
  for (const id of EROTIC_LANE_IDS) {
    const p = normLanes[id] || 0;
    if (p > 0 && p > bestPct) { best = id; bestPct = p; }
  }
  return best ? { id: best, pct: bestPct } : null;
}

// Compact one-line erotic-engine prompt fragment for scene/prose generation
export function eroticLine(er) {
  if (!er) return "";
  const raised = EROTIC_DIMENSIONS.filter(d => (er[d.key]||3) >= 4).map(d => d.label + " " + er[d.key] + "/5");
  if (!raised.length) return "";
  return "Erotic Romance engine (relationship/desire/chemistry/intimacy dynamics — INDEPENDENT of spice, which controls explicitness): " + raised.join(", ") + ". Drive chemistry, longing, and intimate stakes accordingly; tie intimacy to character growth.";
}

// ── Pattern Database Calibration ───────────────────────────────
// Per genre-pattern defaults — when patterns activate from blended lanes,
// the system suggests these values as starting points. User can override.
export const INTENSITY_CALIBRATION = {
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
export function calibrationForActivatedPatterns(activatedPatterns) {
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


export const INTENSITY = [
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

export const GENRE_PATTERNS = [
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
export const LANE_TO_PATTERNS = {
  healing:     ["soft_black_romance","faith_based"],
  community:   ["soft_black_romance","cozy_black_mystery"],
  luxury:      ["billionaire","power_purpose"],
  family:      ["family_saga","urban_family_empire"],
  urban:       ["urban_romance","urban_fiction"],
  reinvention: ["power_purpose","soft_black_romance"],
  suspense:    ["romantic_suspense","crime_thriller","corporate_mystery"],
  faith:       ["faith_based","southern_black_mystery"],
  // Phase 1.5: extended genre lanes mapped to nearest existing patterns
  eroticUrban:  ["urban_romance","billionaire"],
  sexyContemp:  ["soft_black_romance","urban_romance"],
  eroticDrama:  ["urban_romance","urban_fiction"],
  luxuryErotic: ["billionaire","power_purpose"],
  streetLit:    ["urban_fiction","urban_family_empire"],
  crimeSaga:    ["urban_family_empire","urban_fiction"],
};
// Phase 1.5: which lanes show in Tier 1 (Story Blend) vs Advanced Calibration
export const PRIMARY_LANE_IDS = ["healing","community","luxury","family","urban","reinvention","suspense","faith"];
export const EXTENDED_LANE_IDS = ["eroticUrban","sexyContemp","eroticDrama","luxuryErotic","streetLit","crimeSaga"];

// Compute the top 3 activated patterns weighted by lane percentages
export function getActivatedPatterns(normLanes) {
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
export const HEROES = [
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
export const CONFLICTS = [
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

export const BESTSELLER_CONFLICTS = [
  "Family Business Succession Battle","Returning To Hometown","Job Loss Mid-Career",
  "Professional Competition","Family Secret About To Be Exposed","Saving The Family Legacy",
  "Forced Business Partnership","Ex Returns","Divorce After 20+ Years","Community Redevelopment Battle"
];

// Marketable Conflict Stacks — pre-built wound + conflict combos
export const CONFLICT_STACKS = [
  {id:"st_kennedy", name:"Kennedy Ryan Style",     theme:"Purpose + Love + Impact", woundId:"w_burnout",  conflictId:"c_redev",     desc:"Career Burnout meets Community Redevelopment"},
  {id:"st_wfic",    name:"Women's Fiction",         theme:"Reinvention",             woundId:"w_strong",   conflictId:"c_jobloss",   desc:"Always The Strong One meets Job Loss Mid-Career"},
  {id:"st_luxury",  name:"Luxury Romance",          theme:"Legacy + Power",          woundId:"w_earned",   conflictId:"c_succession",desc:"Love Must Be Earned meets Family Business Succession"},
  {id:"st_urban",   n:"Urban Romance",              theme:"Loyalty",                 woundId:"w_fambetr",  conflictId:"c_dangersecret",desc:"Family Betrayal meets Dangerous Family Secret"},
  {id:"st_susp",    name:"Romantic Suspense",       theme:"Truth + Trust",           woundId:"w_fambetr",  conflictId:"c_corruption",desc:"Trust collapse meets Corporate Corruption"},
];

// ── Relationship Obstacles (50) ───────────────────────────────
export const OBSTACLES = [
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

export const BESTSELLER_OBSTACLES = [
  "One Partner Doesn't Trust Easily","Career Launch Period","Family Doesn't Approve",
  "One Partner Always Appears Strong","One Partner Hides Behind Work","Neither Wants To Need Anyone",
  "One Emotionally Available, Other Isn't","One Doesn't Believe They Deserve Happiness",
  "One Ready To Be Chosen, Other Still Running","Both Are Protecting Old Wounds"
];

// Powerful obstacle pairings
export const OBSTACLE_PAIRINGS = [
  {name:"Vulnerability x Strong One",   hero:"Fears Vulnerability",          heroine:"Always The Strong One",     note:"Both refuse help"},
  {name:"Career First x Burnout",       hero:"Career First",                 heroine:"Rebuilding After Burnout",  note:"Different priorities"},
  {name:"Protective x Independent",     hero:"Protective And Controlling",   heroine:"Values Independence",        note:"Natural tension"},
  {name:"Undeserving x Reassurance",    hero:"Doesn't Believe He Deserves Love", heroine:"Needs Reassurance",     note:"Push-pull dynamic"},
  {name:"Avoid x Direct",               hero:"Avoids Conflict",              heroine:"Demands Direct Communication",note:"Forces growth"},
];


export const HEROINES = [
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
export const WOUNDS = [
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
export const BESTSELLER_WOUNDS = [
  "Parentification","Always The Strong One","Career Burnout","Divorce","Father Abandonment",
  "Cheated On","Poverty Trauma","Family Betrayal","Living Someone Else's Dream",
  "Gave Up Dreams For Family","Believes Love Must Be Earned","Believes They Are Not Enough"
];

// Bestseller wound pairings — pre-built combinations
export const WOUND_PAIRINGS = [
  {name:"Vulnerability x Strong One",   heroId:"w_vuln",    heroineId:"w_strong",   note:"Both refuse help"},
  {name:"Father Wound x Earn Love",     heroId:"w_father",  heroineId:"w_earned",   note:"Trust deficit meets performance"},
  {name:"Workaholism x Burnout",        heroId:"w_workhol", heroineId:"w_burnout",  note:"Achievement-driven collision"},
  {name:"Family Betrayal x Divorce",    heroId:"w_fambetr", heroineId:"w_divorce",  note:"Both rebuilding trust"},
  {name:"Strong One x Parentification", heroId:"w_strong",  heroineId:"w_parent",   note:"Two over-functioners learning to rest"},
];

// ── Settings (50) ────────────────────────────────────────────
export const SETTINGS = [
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

export const CITIES = {
  tier1: ["Atlanta","Charlotte","Houston","Dallas","Washington DC","Chicago"],
  tier2: ["Tampa Bay","Jacksonville","Miami","Nashville","New Orleans","Detroit"],
  tier3: ["Martha's Vineyard","Los Angeles","New York","Oakland","Baltimore","Philadelphia"],
};

// ── Family Structures (40) ────────────────────────────────────
export const FAMILIES = [
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
export function normalize(vals) {
  const total = Object.values(vals).reduce((a,b)=>a+b,0);
  if (!total) return Object.fromEntries(Object.entries(vals).map(([k])=>[k,0]));
  return Object.fromEntries(Object.entries(vals).map(([k,v])=>[k,Math.round((v/total)*100)]));
}

export function scoreForBlend(arch, normLanes) {
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

export function topArchetypes(archetypes, normLanes, n=5) {
  if (!Object.values(normLanes).some(v=>v>0)) return [];
  return [...archetypes].map(a=>({a, s:scoreForBlend(a, normLanes)}))
    .sort((x,y)=>y.s-x.s).slice(0,n).map(x=>x.a);
}

// ── Model routing (sweet-spot per task type) ──────────────────

// Fast Draft model options (surfaced in the Fast Draft controls)

export const UNIVERSE_GENRES = [
  "Black Contemporary Romance","Women's Fiction","Emotional Healing Romance",
  "Power & Purpose Romance","Romantic Suspense","Family Saga",
  "Urban Suspense","Crime Drama","Crime Mystery","Political Thriller",
  "Corporate Mystery","Reinvention Romance","Faith Fiction","Coming of Age",
];

export const UNIVERSE_THEMES = [
  "Power","Legacy","Family Secrets","Loyalty","Purpose","Leadership",
  "Reinvention","Community","Love","Truth","Corruption","Identity",
  "Justice","Faith","Redemption","Healing","Black Excellence",
  "Generational Wealth","Sisterhood","Brotherhood","Forgiveness","Sacrifice",
];

export const DEFAULT_LANE_VALS = { healing:5, community:0, luxury:7, family:0, urban:0, reinvention:0, suspense:0, faith:0, eroticUrban:0, sexyContemp:0, eroticDrama:0, luxuryErotic:0, streetLit:0, crimeSaga:0 };
export const DEFAULT_TROPES = ["Enemies to Lovers","Family Empire"];
