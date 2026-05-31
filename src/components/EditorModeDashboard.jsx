import { C } from "../constants/theme";
import PlotThreadTracker from "./PlotThreadTracker";

export default function EditorModeDashboard({ story, outline, bible, chapterProse,
                               chapterSummaries, report, analyzing,
                               timestamp, error, onRunAnalysis,
                               onAddManualThread }) {

  const writtenCount = Object.values(chapterProse).filter(Boolean).length;
  const scoreColor = (s) => s >= 8 ? "#2D8B7A" : s >= 6 ? "#B07A1F" : "#B8342D";

  const ScoreDimension = ({ label, value }) => (
    <div style={{ marginBottom:8 }}>
      <div style={{ display:"flex", justifyContent:"space-between", marginBottom:3 }}>
        <span style={{ color:C.muted, fontSize:11 }}>{label}</span>
        <span style={{ color:scoreColor(value), fontWeight:700, fontSize:12 }}>{value}/10</span>
      </div>
      <div style={{ height:5, background:C.faint, borderRadius:3, overflow:"hidden" }}>
        <div style={{ width:(value/10*100)+"%", height:"100%", background:scoreColor(value), borderRadius:3, transition:"width 0.5s" }}/>
      </div>
    </div>
  );

  return (
    <div>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", flexWrap:"wrap", gap:14, marginBottom:24 }}>
        <div>
          <div style={{ color:C.gold, fontSize:11, letterSpacing:2, textTransform:"uppercase", fontWeight:700, marginBottom:4 }}>
            Editor Mode · Story Analysis
          </div>
          <div style={{ color:C.text, fontFamily:"Cormorant Garamond, serif", fontSize:26, fontWeight:600 }}>
            {story?.title}
          </div>
          {timestamp && (
            <div style={{ color:C.muted, fontSize:11, marginTop:4 }}>
              Last analyzed: {new Date(timestamp).toLocaleString()}
            </div>
          )}
        </div>
        <button onClick={onRunAnalysis} disabled={analyzing || writtenCount < 1}
          style={{ padding:"10px 20px",
                   background: analyzing||writtenCount<1 ? C.faint : "linear-gradient(135deg,"+C.gold+","+C.amber+")",
                   color: analyzing||writtenCount<1 ? C.muted : C.bg,
                   border:"none", borderRadius:8, fontWeight:700, fontSize:13,
                   cursor: analyzing||writtenCount<1 ? "not-allowed" : "pointer", fontFamily:"Nunito, sans-serif" }}>
          {analyzing ? `Analyzing ${writtenCount} chapters...` : report ? "↺ Re-run Analysis" : "⚡ Run Full Story Analysis"}
        </button>
      </div>

      {error && (
        <div style={{ padding:"10px 14px", background:"#FBE9E7", border:"1px solid #B8342D", borderRadius:6, color:"#B8342D", fontSize:12, marginBottom:14 }}>
          ⚠ {error}
        </div>
      )}

      {!report && !analyzing && (
        <div style={{ padding:"24px 28px", background:C.card, border:"1px dashed "+C.borderLight, borderRadius:12, marginBottom:22 }}>
          <div style={{ color:C.text, fontFamily:"Cormorant Garamond, serif", fontSize:20, fontWeight:600, marginBottom:8 }}>
            Writer's Room Analysis
          </div>
          <div style={{ color:C.muted, fontSize:13, lineHeight:1.7, marginBottom:14 }}>
            When you run the analysis across your {writtenCount} written chapter{writtenCount===1?"":"s"}, you'll get:
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))", gap:8 }}>
            {[
              ["📉","Story Sag Map","Where momentum dies"],
              ["🚪","Dropout Risk","Where readers quit"],
              ["👤","Character Audit","Who's underdeveloped"],
              ["🧵","Subplot Rankings","What's working"],
              ["📖","Promise Fulfillment","Are you on track"],
              ["🎯","Archetype Alignment","Serving your reader"],
              ["📊","Readability Score","By 6 dimensions"],
              ["✏️","5 Editor Notes","Prioritized fixes"],
            ].map(([icon, label, desc]) => (
              <div key={label} style={{ padding:"10px 12px", background:C.bg, border:"1px solid "+C.borderLight, borderRadius:6 }}>
                <div style={{ fontSize:18, marginBottom:4 }}>{icon}</div>
                <div style={{ color:C.text, fontSize:12, fontWeight:600 }}>{label}</div>
                <div style={{ color:C.muted, fontSize:10 }}>{desc}</div>
              </div>
            ))}
          </div>
          {writtenCount < 3 && (
            <div style={{ marginTop:14, color:C.amber, fontSize:11 }}>
              ⚡ Write at least 3 chapters for a meaningful analysis. Currently: {writtenCount} written.
            </div>
          )}
        </div>
      )}

      {report && (
        <div style={{ display:"grid", gap:16 }}>

          {/* A — STORY HEALTH */}
          <div style={{ padding:"22px 26px", background:"linear-gradient(135deg,"+C.surface+","+C.card+")", border:"2px solid "+scoreColor(report.overallHealth?.score||0), borderRadius:12 }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"baseline", flexWrap:"wrap", gap:12 }}>
              <div>
                <div style={{ color:C.gold, fontSize:11, letterSpacing:1.5, textTransform:"uppercase", fontWeight:700, marginBottom:4 }}>Story Health</div>
                <div style={{ color:C.text, fontFamily:"Cormorant Garamond, serif", fontSize:18, fontWeight:600 }}>{report.overallHealth?.verdict}</div>
                <div style={{ color:C.muted, fontSize:12, marginTop:4, maxWidth:420 }}>{report.overallHealth?.summary}</div>
              </div>
              <div style={{ fontFamily:"Cormorant Garamond, serif", fontSize:64, fontWeight:700, lineHeight:1, color:scoreColor(report.overallHealth?.score||0) }}>
                {report.overallHealth?.score}<span style={{ fontSize:24, color:C.muted }}>/10</span>
              </div>
            </div>
          </div>

          {/* B — READABILITY */}
          <div style={{ padding:"20px 22px", background:C.card, border:"1px solid "+C.borderLight, borderRadius:10 }}>
            <div style={{ color:C.amber, fontSize:11, letterSpacing:1.5, textTransform:"uppercase", fontWeight:700, marginBottom:14 }}>📊 Readability Analysis</div>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))", gap:"12px 28px" }}>
              {[
                ["Overall",report.readabilityAnalysis?.overallScore],
                ["Pacing",report.readabilityAnalysis?.pacing],
                ["Dialogue",report.readabilityAnalysis?.dialogue],
                ["Interiority",report.readabilityAnalysis?.interiority],
                ["Tension",report.readabilityAnalysis?.tension],
                ["Voice Consistency",report.readabilityAnalysis?.voiceConsistency],
              ].map(([label,val]) => ( val != null ? <ScoreDimension key={label} label={label} value={val}/> : null ))}
            </div>
            {report.readabilityAnalysis?.archetypeReadabilityNotes && (
              <div style={{ marginTop:10, padding:"8px 12px", background:C.manuscript, borderLeft:"3px solid "+C.gold, borderRadius:4, color:C.text, fontSize:12, fontStyle:"italic" }}>
                {report.readabilityAnalysis.archetypeReadabilityNotes}
              </div>
            )}
          </div>

          {/* C — READER ARCHETYPE ALIGNMENT */}
          {report.readerArchetypeAlignment && (
            <div style={{ padding:"18px 22px", background:C.card, border:"1px solid "+C.borderLight, borderRadius:10 }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"baseline", marginBottom:12 }}>
                <div style={{ color:C.amber, fontSize:11, letterSpacing:1.5, textTransform:"uppercase", fontWeight:700 }}>
                  🎯 Reader Archetype Alignment
                  {story?.primaryReader && (<span style={{ color:C.muted, textTransform:"none", letterSpacing:0, fontWeight:400, marginLeft:6 }}>· {story.primaryReader.archetypeName}</span>)}
                </div>
                <span style={{ fontFamily:"Cormorant Garamond, serif", fontSize:24, fontWeight:700, color:scoreColor(report.readerArchetypeAlignment.score) }}>{report.readerArchetypeAlignment.score}/10</span>
              </div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
                <div>
                  <div style={{ color:"#2D8B7A", fontSize:10, fontWeight:700, textTransform:"uppercase", letterSpacing:1, marginBottom:6 }}>Strengths</div>
                  {(report.readerArchetypeAlignment.strengths||[]).map((s,i) => (
                    <div key={i} style={{ padding:"4px 8px", background:"rgba(45,139,122,0.10)", border:"1px solid rgba(45,139,122,0.30)", borderRadius:5, fontSize:11, color:"#2D8B7A", marginBottom:4 }}>✓ {s}</div>
                  ))}
                </div>
                <div>
                  <div style={{ color:"#B8342D", fontSize:10, fontWeight:700, textTransform:"uppercase", letterSpacing:1, marginBottom:6 }}>Risks</div>
                  {(report.readerArchetypeAlignment.risks||[]).map((r,i) => (
                    <div key={i} style={{ padding:"4px 8px", background:"rgba(184,52,45,0.08)", border:"1px solid rgba(184,52,45,0.30)", borderRadius:5, fontSize:11, color:"#B8342D", marginBottom:4 }}>⚠ {r}</div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* D — PROMISE FULFILLMENT */}
          {report.promiseFulfillment && (
            <div style={{ padding:"18px 22px", background:C.card, border:"1px solid "+C.borderLight, borderRadius:10 }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"baseline", marginBottom:10 }}>
                <div style={{ color:C.amber, fontSize:11, letterSpacing:1.5, textTransform:"uppercase", fontWeight:700 }}>📖 Promise Fulfillment</div>
                <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                  <span style={{ padding:"2px 8px", background: report.promiseFulfillment.onTrack ? "rgba(45,139,122,0.15)" : "rgba(184,52,45,0.10)", border:"1px solid " + (report.promiseFulfillment.onTrack ? "#2D8B7A" : "#B8342D"), borderRadius:10, fontSize:10, fontWeight:700, color: report.promiseFulfillment.onTrack ? "#2D8B7A" : "#B8342D" }}>
                    {report.promiseFulfillment.onTrack ? "ON TRACK" : "AT RISK"}
                  </span>
                  <span style={{ fontFamily:"Cormorant Garamond, serif", fontSize:22, fontWeight:700, color:scoreColor(report.promiseFulfillment.score) }}>{report.promiseFulfillment.score}/10</span>
                </div>
              </div>
              {(report.promiseFulfillment.gaps||[]).map((g,i) => (
                <div key={i} style={{ padding:"5px 10px", marginBottom:5, background:C.warningBg, border:"1px solid #B07A1F", borderRadius:5, fontSize:11, color:C.warningText }}>⚠ {g}</div>
              ))}
            </div>
          )}

          {/* E — SAG POINTS MAP */}
          {report.sagPoints && (
            <div style={{ padding:"18px 22px", background:C.card, border:"1px solid "+C.borderLight, borderRadius:10 }}>
              <div style={{ color:C.amber, fontSize:11, letterSpacing:1.5, textTransform:"uppercase", fontWeight:700, marginBottom:12 }}>📉 Story Sag Points</div>
              <div style={{ display:"flex", flexWrap:"wrap", gap:4, marginBottom:14 }}>
                {(outline?.chapters||[]).map(ch => {
                  const isSag = (report.sagPoints||[]).some(s => (s.chapters||[]).includes(ch.number));
                  const sagItem = isSag ? (report.sagPoints||[]).find(s => (s.chapters||[]).includes(ch.number)) : null;
                  const hasProse = !!chapterProse[ch.number];
                  return (
                    <div key={ch.number} title={sagItem ? sagItem.issue : ch.title}
                      style={{ width:28, height:28, borderRadius:5, background: isSag ? (sagItem?.severity==="high"?"#B8342D":"#B07A1F") : hasProse ? "#2D8B7A" : C.faint, display:"flex", alignItems:"center", justifyContent:"center", fontSize:9, color: isSag||hasProse ? C.bg : C.muted, fontWeight:700, cursor:isSag?"help":"default" }}>
                      {ch.number}
                    </div>
                  );
                })}
              </div>
              <div style={{ display:"flex", gap:10, marginBottom:12, fontSize:10, color:C.muted }}>
                <span><span style={{ display:"inline-block", width:10, height:10, background:"#2D8B7A", borderRadius:2, marginRight:4 }}/>Written</span>
                <span><span style={{ display:"inline-block", width:10, height:10, background:"#B07A1F", borderRadius:2, marginRight:4 }}/>Sag (medium)</span>
                <span><span style={{ display:"inline-block", width:10, height:10, background:"#B8342D", borderRadius:2, marginRight:4 }}/>Sag (high)</span>
              </div>
              {(report.sagPoints||[]).map((s,i) => (
                <div key={i} style={{ padding:"8px 12px", marginBottom:6, background:C.bg, border:"1px solid "+(s.severity==="high"?"#B8342D":"#B07A1F"), borderRadius:6 }}>
                  <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4 }}>
                    <span style={{ color:C.text, fontSize:12, fontWeight:600 }}>Ch {(s.chapters||[]).join(", ")}</span>
                    <span style={{ padding:"1px 6px", background:(s.severity==="high"?"#B8342D":"#B07A1F")+"22", border:"1px solid "+(s.severity==="high"?"#B8342D":"#B07A1F"), borderRadius:8, fontSize:9, color:s.severity==="high"?"#B8342D":"#B07A1F", fontWeight:700, textTransform:"uppercase" }}>{s.severity}</span>
                  </div>
                  <div style={{ color:C.muted, fontSize:11, marginBottom:3 }}>{s.issue}</div>
                  <div style={{ color:C.gold, fontSize:11 }}>Fix: {s.fix}</div>
                </div>
              ))}
              {(!report.sagPoints || report.sagPoints.length===0) && (<div style={{ color:"#2D8B7A", fontSize:12, fontStyle:"italic" }}>✓ No significant sag points detected.</div>)}
            </div>
          )}

          {/* F — DROPOUT RISK */}
          {report.dropoutRisk && report.dropoutRisk.length > 0 && (
            <div style={{ padding:"18px 22px", background:C.card, border:"1px solid "+C.borderLight, borderRadius:10 }}>
              <div style={{ color:C.amber, fontSize:11, letterSpacing:1.5, textTransform:"uppercase", fontWeight:700, marginBottom:10 }}>🚪 Dropout Risk</div>
              {report.dropoutRisk.map((d,i) => {
                const rColor = d.riskLevel==="high" ? "#B8342D" : d.riskLevel==="medium" ? "#B07A1F" : "#2D8B7A";
                return (
                  <div key={i} style={{ display:"flex", gap:12, alignItems:"flex-start", padding:"8px 0", borderBottom:i<report.dropoutRisk.length-1 ? "1px solid "+C.faint : "none" }}>
                    <div style={{ minWidth:60, padding:"3px 8px", background:rColor+"22", border:"1px solid "+rColor, borderRadius:6, fontSize:10, color:rColor, fontWeight:700, textAlign:"center" }}>Ch {d.afterChapter}</div>
                    <div style={{ flex:1 }}>
                      <div style={{ color:C.text, fontSize:12, marginBottom:3 }}>{d.reason}</div>
                      <div style={{ color:C.gold, fontSize:11 }}>Fix: {d.fix}</div>
                    </div>
                    <span style={{ padding:"1px 6px", background:rColor+"22", border:"1px solid "+rColor, borderRadius:8, fontSize:9, color:rColor, fontWeight:700, textTransform:"uppercase", flexShrink:0 }}>{d.riskLevel}</span>
                  </div>
                );
              })}
            </div>
          )}

          {/* G — CHARACTER AUDIT */}
          {report.characterAudit && report.characterAudit.length > 0 && (
            <div style={{ padding:"18px 22px", background:C.card, border:"1px solid "+C.borderLight, borderRadius:10 }}>
              <div style={{ color:C.amber, fontSize:11, letterSpacing:1.5, textTransform:"uppercase", fontWeight:700, marginBottom:12 }}>👤 Character Development Audit</div>
              <div style={{ display:"grid", gap:8 }}>
                {[...report.characterAudit].sort((a,b) => a.developmentScore - b.developmentScore).map((c,i) => (
                  <div key={i} style={{ padding:"10px 14px", background:C.bg, border:"1px solid "+C.borderLight, borderRadius:6 }}>
                    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"baseline", marginBottom:6 }}>
                      <div>
                        <span style={{ color:C.text, fontWeight:600, fontSize:13 }}>{c.name}</span>
                        <span style={{ color:C.muted, fontSize:10, marginLeft:6, textTransform:"uppercase", letterSpacing:0.5 }}>{c.role}</span>
                      </div>
                      <span style={{ fontFamily:"Cormorant Garamond, serif", fontSize:18, fontWeight:700, color:scoreColor(c.developmentScore) }}>{c.developmentScore}/10</span>
                    </div>
                    <div style={{ height:4, background:C.faint, borderRadius:2, overflow:"hidden", marginBottom:8 }}>
                      <div style={{ width:(c.developmentScore/10*100)+"%", height:"100%", background:scoreColor(c.developmentScore), borderRadius:2 }}/>
                    </div>
                    {c.issue && (<div style={{ color:C.muted, fontSize:11, marginBottom:3 }}>⚠ {c.issue}</div>)}
                    {c.suggestion && (<div style={{ color:C.gold, fontSize:11 }}>Fix: {c.suggestion}</div>)}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* H — SUBPLOT RANKING */}
          {report.subplotRanking && report.subplotRanking.length > 0 && (
            <div style={{ padding:"18px 22px", background:C.card, border:"1px solid "+C.borderLight, borderRadius:10 }}>
              <div style={{ color:C.amber, fontSize:11, letterSpacing:1.5, textTransform:"uppercase", fontWeight:700, marginBottom:10 }}>🧵 Subplot Ranking</div>
              {[...report.subplotRanking].sort((a,b) => b.strength - a.strength).map((s,i) => {
                const mColor = s.momentum==="building"?"#2D8B7A":s.momentum==="resolved"?"#6B665E":s.momentum==="dormant"?"#B8342D":"#B07A1F";
                return (
                  <div key={i} style={{ display:"flex", alignItems:"center", gap:10, padding:"7px 0", borderBottom:i<report.subplotRanking.length-1?"1px solid "+C.faint:"none" }}>
                    <span style={{ color:C.muted, fontSize:10, minWidth:14 }}>#{i+1}</span>
                    <span style={{ flex:1, color:C.text, fontSize:12 }}>{s.subplot}</span>
                    <span style={{ padding:"1px 7px", background:mColor+"22", border:"1px solid "+mColor, borderRadius:8, fontSize:9, color:mColor, fontWeight:700, textTransform:"uppercase" }}>{s.momentum}</span>
                    <span style={{ color:scoreColor(s.strength), fontWeight:700, fontSize:12, minWidth:32, textAlign:"right" }}>{s.strength}/10</span>
                  </div>
                );
              })}
            </div>
          )}

          {/* I — EDITOR NOTES */}
          {report.editorNotes && report.editorNotes.length > 0 && (
            <div style={{ padding:"18px 22px", background:C.card, border:"1px solid "+C.borderLight, borderRadius:10 }}>
              <div style={{ color:C.amber, fontSize:11, letterSpacing:1.5, textTransform:"uppercase", fontWeight:700, marginBottom:12 }}>✏️ Editor Notes · Prioritized</div>
              {[...report.editorNotes].sort((a,b) => a.priority.localeCompare(b.priority)).map((n,i) => {
                const pColor = n.priority==="P1"?"#B8342D":n.priority==="P2"?C.amber:"#6B665E";
                return (
                  <div key={i} style={{ display:"flex", gap:10, alignItems:"flex-start", padding:"8px 0", borderBottom:i<report.editorNotes.length-1?"1px solid "+C.faint:"none" }}>
                    <span style={{ padding:"2px 8px", background:pColor+"22", border:"1px solid "+pColor, borderRadius:6, fontSize:10, color:pColor, fontWeight:700, flexShrink:0 }}>{n.priority}</span>
                    <div style={{ flex:1 }}>
                      <span style={{ color:C.text, fontSize:12 }}>{n.chapter ? `Ch ${n.chapter} — ` : "Story-wide — "}{n.note}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* J — PLOT THREAD TRACKER */}
          <div style={{ padding:"18px 22px", background:C.card, border:"1px solid "+C.borderLight, borderRadius:10 }}>
            <div style={{ color:C.amber, fontSize:11, letterSpacing:1.5, textTransform:"uppercase", fontWeight:700, marginBottom:4 }}>🧵 Plot Thread Tracker</div>
            <PlotThreadTracker bible={bible} currentChapterCount={Object.keys(chapterProse).filter(k=>chapterProse[k]).length} onAddManualThread={onAddManualThread}/>
          </div>

        </div>
      )}

      {!report && bible && (
        <div style={{ padding:"18px 22px", background:C.card, border:"1px solid "+C.borderLight, borderRadius:10, marginTop:14 }}>
          <div style={{ color:C.amber, fontSize:11, letterSpacing:1.5, textTransform:"uppercase", fontWeight:700, marginBottom:4 }}>🧵 Plot Thread Tracker</div>
          <PlotThreadTracker bible={bible} currentChapterCount={Object.keys(chapterProse).filter(k=>chapterProse[k]).length} onAddManualThread={onAddManualThread}/>
        </div>
      )}
    </div>
  );
}

// ── My Stories library (W2) ───────────────────────────────────
// ── Story Concept input (New Story flow) ──────────────────────
