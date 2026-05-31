// Theme constants — color system + Google Fonts import.
// Pure data, no React or side-effect dependencies.

export const FONT_CSS = `@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400;1,600&family=Nunito:wght@300;400;500;600;700&family=Playfair+Display:wght@700&display=swap');`;

export const C = {
  // Base surfaces
  bg:"#FCFCF9", surface:"#FFFFFF", card:"#F8F7F2", cardLight:"#FFFFFF",
  border:"#E8E5DE", borderLight:"#EFEDE7",

  // Text
  text:"#1A1612", muted:"#6B665E", faint:"#F2F0EA",

  // Gold / amber (primary accent)
  gold:"#B8841C", amber:"#C8941F",
  glow:"rgba(184,132,28,0.10)",
  goldDim:"rgba(184,132,28,0.12)",

  // Teal (success / complete)
  teal:"#2D8B7A",
  tealDim:"rgba(45,139,122,0.08)",

  // Semantic
  err:"#B8342D", errBg:"rgba(184,52,45,0.08)",
  warn:"#B07A1F", warnBg:"rgba(176,122,31,0.08)",

  // Legacy aliases (keep for backward compat with existing code)
  manuscript:"#FAF6EC", manuscriptBorder:"#EFE6CF",
  successBg:"#E8F5F0", successText:"#2D8B7A",
  warningBg:"#FAF5E8", warningText:"#B07A1F",
  errorBg:"#FBE9E7", errorText:"#B8342D",
};
