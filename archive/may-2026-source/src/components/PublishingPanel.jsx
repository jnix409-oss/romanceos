import { useState } from "react";
import { C } from "../constants/theme";

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

export default function PublishingStudio({ story, outline, bible, packageData, generating, progress, onGenerate, onExport, error }) {
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
