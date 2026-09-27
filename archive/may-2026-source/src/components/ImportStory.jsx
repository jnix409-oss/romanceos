import { useState } from "react";
import { C } from "../constants/theme";

const IMPORT_MODES = [
  {
    id: "concept",
    icon: "💡",
    label: "Story Concept",
    desc: "You have an idea, synopsis, or creative notes. AI builds the full blueprint from your vision.",
    inputLabel: "Paste your story concept, synopsis, character notes, or plot ideas"
  },
  {
    id: "outline",
    icon: "📋",
    label: "Existing Outline",
    desc: "You have a chapter-by-chapter outline in any format. AI converts it to Obsidian chapter cards.",
    inputLabel: "Paste your outline — any format works (numbered list, prose, beat sheet, etc.)"
  },
  {
    id: "prose",
    icon: "📝",
    label: "Written Chapters",
    desc: "You've already written chapters and want to continue. AI reads your work, builds a Story Bible, and outlines the rest.",
    inputLabel: "Paste your written chapters"
  },
  {
    id: "mixed",
    icon: "📚",
    label: "Chapters + Outline",
    desc: "You have written chapters AND an outline for the rest. AI extracts the bible from your prose and converts your outline.",
    inputLabel: "Paste your written chapters first, then your outline"
  }
];

export default function ImportStoryFlow({
  onImportComplete, onCancel, universes, activeUniverseId,
  genrePresets, defaultLaneVals, defaultIntensity,
  onGenerateBlueprint, onGenerateOutlineFromImport,
  onGenerateBibleFromProse, onGenerateContinuationOutline,
  onLoadGlobalRegistry, onRegisterStoryEntities, onSaveGlobalRegistry,
}) {
  const [step, setStep] = useState(1);           // 1=choose mode, 2=enter content, 3=configure, 4=processing
  const [mode, setMode] = useState(null);
  const [mainText, setMainText] = useState("");  // prose or outline text
  const [outlineText, setOutlineText] = useState(""); // only for "mixed" mode
  const [storyTitle, setStoryTitle] = useState("");
  const [selectedPresetId, setSelectedPresetId] = useState("custom");
  const [chaptersWritten, setChaptersWritten] = useState(0);
  const [totalChapters, setTotalChapters] = useState(24);
  const [targetWordCount, setTargetWordCount] = useState(80000);
  const [loading, setLoading] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState("");
  const [err, setErr] = useState("");

  // File upload handler
  const handleFileUpload = (e, setter) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setter(ev.target.result || "");
    reader.readAsText(file);
  };

  const wordCount = (text) => text.trim().split(/\s+/).filter(Boolean).length;

  const handleImport = async () => {
    if (!storyTitle.trim()) {
      setErr("Please enter a story title."); return;
    }
    if (!mainText.trim()) {
      setErr("Please provide your story content."); return;
    }

    setLoading(true); setErr(""); setStep(4);

    try {
      let story = null;
      let outline = null;
      let bible = null;
      let importedChapterProse = {};

      if (mode === "concept") {
        // Concept → full blueprint generation
        setLoadingMsg("Building blueprint from your concept...");
        story = await onGenerateBlueprint({
          laneVals: genrePresets.find(p=>p.id===selectedPresetId)?.lanes ||
            { ...defaultLaneVals },
          tropes: genrePresets.find(p=>p.id===selectedPresetId)?.tropes || [],
          heat: genrePresets.find(p=>p.id===selectedPresetId)?.heat || 3,
          heroineArch: null, heroArch: null,
          heroineWound: null, heroWound: null,
          setting: null, city: null, family: null, intensity: 3,
          externalConflict: null, relationshipObstacle: null, familyInfluence: 6,
          spiceLevel: genrePresets.find(p=>p.id===selectedPresetId)?.spiceLevel || 2,
          romanceIntensity: genrePresets.find(p=>p.id===selectedPresetId)?.romanceIntensity || defaultIntensity,
          universe: null,
          selectedPresetId,
          userConcept: mainText,
        });
        story.spiceLevel = genrePresets.find(p=>p.id===selectedPresetId)?.spiceLevel || 2;
        story.romanceIntensity = genrePresets.find(p=>p.id===selectedPresetId)?.romanceIntensity || defaultIntensity;
        story.title = storyTitle || story.title;

      } else if (mode === "outline") {
        // Outline → minimal blueprint + chapter cards
        setLoadingMsg("Reading your outline...");
        // Create a minimal stub blueprint first
        story = {
          title: storyTitle,
          tagline: "Imported story",
          hook: "(Generated from imported outline)",
          readerPromise: "",
          heroine: { name:"(TBD)", age:"TBD", occupation:"TBD", wound:"TBD", externalGoal:"TBD" },
          hero: { name:"(TBD)", age:"TBD", occupation:"TBD", wound:"TBD", externalGoal:"TBD" },
          supporting:[], relationshipArc:[], wordCountTarget: targetWordCount + " words",
          scores:{}, spiceLevel:3, romanceIntensity:defaultIntensity,
          _importedOutline: true
        };
        setLoadingMsg("Converting your outline to chapter cards...");
        outline = await onGenerateOutlineFromImport(mainText, story, targetWordCount, totalChapters);

      } else if (mode === "prose") {
        // Prose → blueprint stub + bible + continuation outline
        setLoadingMsg("Reading your chapters...");
        // Minimal blueprint stub
        story = {
          title: storyTitle,
          tagline: "Imported story",
          hook: "(Extracted from imported chapters)",
          readerPromise: "",
          heroine: { name:"(extracting...)", age:"TBD", occupation:"TBD", wound:"TBD", externalGoal:"TBD" },
          hero: { name:"(extracting...)", age:"TBD", occupation:"TBD", wound:"TBD", externalGoal:"TBD" },
          supporting:[], relationshipArc:[], wordCountTarget: targetWordCount + " words",
          scores:{}, spiceLevel:3, romanceIntensity:defaultIntensity,
          _importedProse: true
        };
        setLoadingMsg("Extracting Story Bible from your chapters...");
        bible = await onGenerateBibleFromProse(mainText, story, chaptersWritten);

        // Update story stub with extracted character info
        if (bible.characters) {
          const heroine = bible.characters.find(c => c.role === "heroine");
          const hero = bible.characters.find(c => c.role === "hero");
          if (heroine) story.heroine = { name:heroine.name, age:heroine.age, occupation:heroine.occupation, wound:heroine.wound, externalGoal:heroine.goals };
          if (hero) story.hero = { name:hero.name, age:hero.age, occupation:hero.occupation, wound:hero.wound, externalGoal:hero.goals };
        }
        story.storyDNA = {
          genreBlend: bible.world?.genre || "",
          tone: bible.world?.tone || "",
          heat: 3
        };

        setLoadingMsg("Generating continuation outline for remaining chapters...");
        const continuationResult = await onGenerateContinuationOutline(
          story, bible, chaptersWritten, totalChapters, targetWordCount
        );

        // Build the full outline: placeholder entries for written chapters
        // + real cards for continuation
        const writtenPlaceholders = Array.from({length: chaptersWritten}, (_, i) => ({
          number: i + 1,
          title: "Chapter " + (i + 1) + " (imported)",
          pov: "heroine",
          scene: "(already written)",
          beat: "(already written)",
          arcStage: "Imported",
          targetWordCount: Math.round(targetWordCount / totalChapters),
          cliffhangerOrTurn: "",
          continuityNotes: "Chapter imported from author's existing manuscript",
        }));
        const continuationChapters = (continuationResult.chapters || []).map(ch => ({
          ...ch,
          number: ch.number || (chaptersWritten + continuationResult.chapters.indexOf(ch) + 1)
        }));
        outline = { chapters: [...writtenPlaceholders, ...continuationChapters] };

        // Store imported prose in chapterProse keyed by chapter number
        // Split by common chapter markers if possible
        const chapterBlocks = mainText.split(/\n(?=chapter\s+\d+|\bch[.]\s*\d+)/i);
        if (chapterBlocks.length > 1) {
          chapterBlocks.forEach((block, idx) => {
            if (block.trim()) importedChapterProse[idx + 1] = block.trim();
          });
        } else {
          // Can't split — store all as chapter 1
          importedChapterProse[1] = mainText;
        }

      } else if (mode === "mixed") {
        // Prose + outline → bible from prose + convert outline for remainder
        setLoadingMsg("Extracting Story Bible from your chapters...");
        story = {
          title: storyTitle,
          tagline: "Imported story",
          hook: "(Imported)",
          readerPromise: "",
          heroine: { name:"(extracting...)", age:"TBD", occupation:"TBD", wound:"TBD", externalGoal:"TBD" },
          hero: { name:"(extracting...)", age:"TBD", occupation:"TBD", wound:"TBD", externalGoal:"TBD" },
          supporting:[], relationshipArc:[], wordCountTarget: targetWordCount + " words",
          scores:{}, spiceLevel:3, romanceIntensity:defaultIntensity,
        };
        bible = await onGenerateBibleFromProse(mainText, story, chaptersWritten);
        if (bible.characters) {
          const heroine = bible.characters.find(c => c.role === "heroine");
          const hero = bible.characters.find(c => c.role === "hero");
          if (heroine) story.heroine = { name:heroine.name, age:heroine.age, occupation:heroine.occupation, wound:heroine.wound, externalGoal:heroine.goals };
          if (hero) story.hero = { name:hero.name, age:hero.age, occupation:hero.occupation, wound:hero.wound, externalGoal:hero.goals };
        }
        setLoadingMsg("Converting your outline for remaining chapters...");
        const convertedOutline = await onGenerateOutlineFromImport(
          outlineText, story, targetWordCount, totalChapters - chaptersWritten
        );
        const writtenPlaceholders = Array.from({length: chaptersWritten}, (_, i) => ({
          number: i + 1, title:"Chapter "+(i+1)+" (imported)", pov:"heroine",
          scene:"(already written)", beat:"(already written)", arcStage:"Imported",
          targetWordCount: Math.round(targetWordCount/totalChapters),
          cliffhangerOrTurn:"", continuityNotes:"Imported from author's manuscript",
        }));
        outline = { chapters: [...writtenPlaceholders, ...(convertedOutline.chapters||[])] };

        const chapterBlocks = mainText.split(/\n(?=chapter\s+\d+|\bch[.]\s*\d+)/i);
        if (chapterBlocks.length > 1) {
          chapterBlocks.forEach((block, idx) => {
            if (block.trim()) importedChapterProse[idx + 1] = block.trim();
          });
        } else {
          importedChapterProse[1] = mainText;
        }
      }

      // Register story entities in global registry
      const reg = onLoadGlobalRegistry();
      const newReg = onRegisterStoryEntities(reg, story);
      onSaveGlobalRegistry(newReg);

      // Call the import complete handler with all extracted data
      onImportComplete({
        story,
        outline: outline || null,
        bible: bible || null,
        chapterProse: importedChapterProse,
        bibleLocked: !!bible,
        storyDNALocked: !!story.storyDNA,
      });

    } catch(e) {
      setErr(e.message);
      setLoading(false);
      setStep(3);
    }
  };

  // ── STEP 1: Choose mode ──
  if (step === 1) return (
    <div style={{ padding:"28px 30px", background:C.surface,
                  border:"1px solid "+C.gold, borderRadius:14 }}>
      <div style={{ color:C.gold, fontSize:11, letterSpacing:2,
                    textTransform:"uppercase", fontWeight:700,
                    marginBottom:4 }}>
        Import Existing Work
      </div>
      <div style={{ color:C.text, fontFamily:"Cormorant Garamond, serif",
                    fontSize:26, fontWeight:600, marginBottom:6 }}>
        What are you bringing in?
      </div>
      <div style={{ color:C.muted, fontSize:13, marginBottom:22 }}>
        Bring your existing work into Obsidian Story OS.
        The tool will meet you wherever you are.
      </div>
      <div style={{ display:"grid", gap:10 }}>
        {IMPORT_MODES.map(m => (
          <button key={m.id} onClick={() => { setMode(m.id); setStep(2); }}
            style={{ textAlign:"left", padding:"16px 18px",
                     background: mode===m.id ? C.glow : "transparent",
                     border:"1px solid "+(mode===m.id ? C.gold : C.borderLight),
                     borderRadius:10, cursor:"pointer", transition:"all 0.15s" }}>
            <div style={{ display:"flex", alignItems:"baseline", gap:10,
                          marginBottom:5 }}>
              <span style={{ fontSize:18 }}>{m.icon}</span>
              <span style={{ color:C.text, fontWeight:600,
                             fontSize:15 }}>{m.label}</span>
            </div>
            <div style={{ color:C.muted, fontSize:12,
                          lineHeight:1.5 }}>{m.desc}</div>
          </button>
        ))}
      </div>
      <button onClick={onCancel}
        style={{ marginTop:16, background:"transparent", border:"none",
                 color:C.muted, fontSize:12, cursor:"pointer",
                 textDecoration:"underline" }}>
        Cancel
      </button>
    </div>
  );

  // ── STEP 2: Enter content ──
  if (step === 2) {
    const modeConfig = IMPORT_MODES.find(m => m.id === mode);
    return (
      <div style={{ padding:"28px 30px", background:C.surface,
                    border:"1px solid "+C.gold, borderRadius:14 }}>
        <button onClick={() => setStep(1)}
          style={{ background:"transparent", border:"none",
                   color:C.muted, fontSize:12, cursor:"pointer",
                   marginBottom:18, textDecoration:"underline" }}>
          ← Back
        </button>
        <div style={{ color:C.gold, fontSize:11, letterSpacing:2,
                      textTransform:"uppercase", fontWeight:700,
                      marginBottom:4 }}>
          {modeConfig.icon} {modeConfig.label}
        </div>

        {/* Story title */}
        <div style={{ marginBottom:18 }}>
          <label style={{ display:"block", color:C.amber, fontSize:11,
                          letterSpacing:1, textTransform:"uppercase",
                          marginBottom:6, fontWeight:600 }}>
            Story Title
          </label>
          <input value={storyTitle}
            onChange={e => setStoryTitle(e.target.value)}
            placeholder="Your story's title..."
            style={{ width:"100%", padding:"10px 12px", background:C.card,
                     color:C.text, border:"1px solid "+C.border,
                     borderRadius:8, fontSize:14, fontFamily:"Nunito, sans-serif",
                     boxSizing:"border-box" }}/>
        </div>

        {/* Main text input */}
        <div style={{ marginBottom:14 }}>
          <div style={{ display:"flex", justifyContent:"space-between",
                        alignItems:"baseline", marginBottom:6 }}>
            <label style={{ color:C.amber, fontSize:11, letterSpacing:1,
                            textTransform:"uppercase", fontWeight:600 }}>
              {modeConfig.inputLabel}
            </label>
            <label style={{ padding:"4px 10px", background:C.card,
                            border:"1px solid "+C.borderLight,
                            borderRadius:5, fontSize:10, color:C.muted,
                            cursor:"pointer" }}>
              📎 Upload .txt or .md
              <input type="file" accept=".txt,.md"
                onChange={e => handleFileUpload(e, setMainText)}
                style={{ display:"none" }}/>
            </label>
          </div>
          <textarea value={mainText} onChange={e => setMainText(e.target.value)}
            rows={12}
            placeholder={mode==="concept"
              ? "Describe your story idea in your own words. Characters, premise, conflict, setting, tone — whatever you have..."
              : mode==="outline"
              ? "Chapter 1: ...\nChapter 2: ...\n\n(Any format works — numbered lists, prose beats, bullet points, etc.)"
              : mode==="prose" || mode==="mixed"
              ? "Paste your written chapters here. Chapter breaks don't need to be specially formatted..."
              : ""}
            style={{ width:"100%", padding:"12px 14px", background:C.card,
                     color:C.text, border:"1px solid "+C.border,
                     borderRadius:8, fontSize:12, lineHeight:1.7,
                     fontFamily: mode==="prose"||mode==="mixed"
                       ? "Cormorant Garamond, serif" : "Nunito, sans-serif",
                     resize:"vertical", boxSizing:"border-box" }}/>
          <div style={{ color:C.muted, fontSize:11, marginTop:4 }}>
            {wordCount(mainText).toLocaleString()} words pasted
          </div>
        </div>

        {/* Second input for "mixed" mode */}
        {mode === "mixed" && (
          <div style={{ marginBottom:14 }}>
            <div style={{ display:"flex", justifyContent:"space-between",
                          alignItems:"baseline", marginBottom:6 }}>
              <label style={{ color:C.amber, fontSize:11, letterSpacing:1,
                              textTransform:"uppercase", fontWeight:600 }}>
                Your Outline for Remaining Chapters
              </label>
              <label style={{ padding:"4px 10px", background:C.card,
                              border:"1px solid "+C.borderLight,
                              borderRadius:5, fontSize:10, color:C.muted,
                              cursor:"pointer" }}>
                📎 Upload
                <input type="file" accept=".txt,.md"
                  onChange={e => handleFileUpload(e, setOutlineText)}
                  style={{ display:"none" }}/>
              </label>
            </div>
            <textarea value={outlineText}
              onChange={e => setOutlineText(e.target.value)}
              rows={8}
              placeholder="Paste your outline for chapters you HAVEN'T written yet..."
              style={{ width:"100%", padding:"12px 14px", background:C.card,
                       color:C.text, border:"1px solid "+C.border,
                       borderRadius:8, fontSize:12, lineHeight:1.7,
                       fontFamily:"Nunito, sans-serif", resize:"vertical",
                       boxSizing:"border-box" }}/>
          </div>
        )}

        <button onClick={() => setStep(3)} disabled={!mainText.trim()||!storyTitle.trim()}
          style={{ padding:"10px 20px",
                   background:mainText.trim()&&storyTitle.trim() ? C.gold : C.faint,
                   color:mainText.trim()&&storyTitle.trim() ? C.bg : C.muted,
                   border:"none", borderRadius:8, fontWeight:700, fontSize:13,
                   cursor:mainText.trim()&&storyTitle.trim()?"pointer":"not-allowed",
                   fontFamily:"Nunito, sans-serif" }}>
          Continue →
        </button>
      </div>
    );
  }

  // ── STEP 3: Configure ──
  if (step === 3) return (
    <div style={{ padding:"28px 30px", background:C.surface,
                  border:"1px solid "+C.gold, borderRadius:14 }}>
      <button onClick={() => setStep(2)}
        style={{ background:"transparent", border:"none",
                 color:C.muted, fontSize:12, cursor:"pointer",
                 marginBottom:18, textDecoration:"underline" }}>
        ← Back
      </button>
      <div style={{ color:C.gold, fontSize:11, letterSpacing:2,
                    textTransform:"uppercase", fontWeight:700,
                    marginBottom:14 }}>
        Configure Import
      </div>

      {err && (
        <div style={{ padding:"10px 14px", background:"#FBE9E7",
                      border:"1px solid #B8342D", borderRadius:6,
                      color:"#B8342D", fontSize:12, marginBottom:14 }}>
          ⚠ {err}
        </div>
      )}

      {/* Genre preset */}
      <div style={{ marginBottom:18 }}>
        <label style={{ display:"block", color:C.amber, fontSize:11,
                        letterSpacing:1, textTransform:"uppercase",
                        marginBottom:8, fontWeight:600 }}>
          Genre (for market positioning)
        </label>
        <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
          {genrePresets.map(p => (
            <button key={p.id} onClick={() => setSelectedPresetId(p.id)}
              style={{ padding:"6px 12px", borderRadius:16,
                       background:selectedPresetId===p.id ? C.gold : "transparent",
                       color:selectedPresetId===p.id ? C.bg : C.text,
                       border:"1px solid "+(selectedPresetId===p.id
                         ? C.gold : C.borderLight),
                       fontSize:12, cursor:"pointer",
                       fontFamily:"Nunito, sans-serif" }}>
              {p.icon} {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Chapters written (prose/mixed modes) */}
      {(mode==="prose" || mode==="mixed") && (
        <div style={{ marginBottom:18 }}>
          <label style={{ display:"block", color:C.amber, fontSize:11,
                          letterSpacing:1, textTransform:"uppercase",
                          marginBottom:6, fontWeight:600 }}>
            How many chapters have you written?
          </label>
          <input type="number" min={1} max={100}
            value={chaptersWritten}
            onChange={e => setChaptersWritten(Math.max(1, +e.target.value))}
            style={{ width:80, padding:"8px 10px", background:C.card,
                     color:C.text, border:"1px solid "+C.border,
                     borderRadius:6, fontSize:14,
                     fontFamily:"Nunito, sans-serif" }}/>
        </div>
      )}

      {/* Total chapters */}
      <div style={{ marginBottom:18 }}>
        <label style={{ display:"block", color:C.amber, fontSize:11,
                        letterSpacing:1, textTransform:"uppercase",
                        marginBottom:6, fontWeight:600 }}>
          Total chapters planned
        </label>
        <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
          {[18, 24, 30, 36, 42].map(n => (
            <button key={n} onClick={() => setTotalChapters(n)}
              style={{ padding:"6px 12px", borderRadius:14,
                       background:totalChapters===n ? C.amber : "transparent",
                       color:totalChapters===n ? C.bg : C.text,
                       border:"1px solid "+(totalChapters===n
                         ? C.amber : C.borderLight),
                       fontSize:12, cursor:"pointer",
                       fontFamily:"Nunito, sans-serif" }}>
              {n}
            </button>
          ))}
        </div>
      </div>

      {/* Target word count */}
      <div style={{ marginBottom:22 }}>
        <label style={{ display:"block", color:C.amber, fontSize:11,
                        letterSpacing:1, textTransform:"uppercase",
                        marginBottom:6, fontWeight:600 }}>
          Target word count
        </label>
        <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
          {[60000, 80000, 90000, 100000].map(n => (
            <button key={n} onClick={() => setTargetWordCount(n)}
              style={{ padding:"6px 12px", borderRadius:14,
                       background:targetWordCount===n ? C.amber : "transparent",
                       color:targetWordCount===n ? C.bg : C.text,
                       border:"1px solid "+(targetWordCount===n
                         ? C.amber : C.borderLight),
                       fontSize:12, cursor:"pointer",
                       fontFamily:"Nunito, sans-serif" }}>
              {(n/1000)+"K"}
            </button>
          ))}
        </div>
      </div>

      <div style={{ display:"flex", gap:10 }}>
        <button onClick={handleImport}
          style={{ padding:"12px 24px",
                   background:"linear-gradient(135deg,"+C.gold+","+C.amber+")",
                   color:C.bg, border:"none", borderRadius:8, fontWeight:700,
                   fontSize:14, cursor:"pointer",
                   fontFamily:"Nunito, sans-serif" }}>
          {mode==="concept" ? "⚡ Build Blueprint from Concept"
           : mode==="outline" ? "📋 Import & Convert Outline"
           : mode==="prose" ? "📝 Import Chapters & Continue"
           : "📚 Import Everything"}
        </button>
        <button onClick={onCancel}
          style={{ padding:"12px 18px", background:"transparent",
                   color:C.muted, border:"1px solid "+C.borderLight,
                   borderRadius:8, fontWeight:600, fontSize:13,
                   cursor:"pointer", fontFamily:"Nunito, sans-serif" }}>
          Cancel
        </button>
      </div>
    </div>
  );

  // ── STEP 4: Loading ──
  return (
    <div style={{ padding:"40px 30px", background:C.surface,
                  border:"1px solid "+C.gold, borderRadius:14,
                  textAlign:"center" }}>
      <div style={{ fontSize:40, marginBottom:16 }}>
        {mode==="concept"?"💡":mode==="outline"?"📋":mode==="prose"?"📝":"📚"}
      </div>
      <div style={{ color:C.gold, fontFamily:"Cormorant Garamond, serif",
                    fontSize:22, fontWeight:600, marginBottom:8 }}>
        {loadingMsg || "Importing your work..."}
      </div>
      <div style={{ color:C.muted, fontSize:12 }}>
        This may take 30-60 seconds
      </div>
    </div>
  );
}
