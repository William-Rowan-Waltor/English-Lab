// TRANSLATE WIDGET — standalone floating "🌐 Dịch" button + slide-in drawer, mounted globally
// (src/12-app.jsx, alongside VocabLookupLayer). Free-text paste-to-translate (EN<->VI), persisted
// history, a "translate the open passage/transcript" shortcut. Auto-hides during a real Reading /
// Writing(Full Test) / Listening strict exam so it can't be used to cheat during a timed simulation.
// The FAB can be dragged to any position along the 4 screen edges (position persists in
// state.translateWidgetPos); the drawer always slides in from the right regardless of where the FAB
// currently sits, keeping the panel's own layout simple and predictable.
//
// Deliberately separate from VocabLookupLayer (src/11-vocab-lookup.jsx): that one is an ephemeral
// selection-triggered popup capped at 200 chars with an in-memory-only cache; this is a persistent
// tool for longer free text with saved, user-manageable history — different UI model, different
// state lifetime, kept in its own file rather than forced into one file doing two jobs.

const TRANSLATE_TEXT_MAX = 4000;
const TRANSLATE_HISTORY_MAX = 200;
const TW_FAB_SIZE = 44;
const TW_EDGE_MARGIN = 16;
const TW_DRAG_THRESHOLD = 6; // px of pointer movement before a press counts as a drag, not a click

// Mirrors the exact "real exam in progress" signals already used by each page's own strict-mode UI
// (Reading's auto-submit-at-time-up, Listening's consumed-audio lock, Full Test's timer). Extended
// to Listening for consistency even though only Reading/Writing were explicitly requested — there is
// no defensible reason to allow translate during a strict Listening exam but block it during strict
// Reading/Writing exams.
//
// IMPORTANT: also requires the user to actually be ON the relevant page right now. readingDraft/
// listeningDraft/writingDrafts.fullTest are PERSISTED indefinitely - if a strict-mock test is ever
// abandoned without submitting, {strictMock:true,testData,result:null} sits in state forever. Without
// the page check, that stale leftover would hide the widget on EVERY page, not just during an actual
// in-progress test (found and fixed after the user reported the widget missing on Dashboard while no
// exam was in progress - reproduced by seeding exactly this stale-draft shape into localStorage).
function _twExamModeActive(state, page) {
  const r = state.readingDraft || {};
  const readingExam = page === "reading" && !!(r.strictMock && r.testData && !r.result);
  const ft = state.writingDrafts?.fullTest || {};
  const writingExam = page === "practice" && !!(ft.phase === "test" && ft.strictExamMode && ft.timerRunning);
  const l = state.listeningDraft || {};
  const listeningExam = page === "listening" && !!(l.strictExam && l.testData && !l.result);
  return readingExam || writingExam || listeningExam;
}

// "Translate the thing currently open" shortcut source. Reading: join the active section's passage
// paragraphs. Listening: the flattened full transcript. Returns null (button hidden) if neither has
// data loaded - never throws.
function _twCurrentPassageText(state) {
  const r = state.readingDraft || {};
  const section = r.testData?.sections?.[r.activeSection];
  const paragraphs = section?.passage?.paragraphs;
  if (Array.isArray(paragraphs) && paragraphs.some(Boolean)) {
    return { label: "📖 Dịch bài đang đọc", text: paragraphs.filter(Boolean).join("\n\n") };
  }
  const l = state.listeningDraft || {};
  if (typeof l.testData?.transcript === "string" && l.testData.transcript.trim()) {
    return { label: "🎧 Dịch transcript đang nghe", text: l.testData.transcript };
  }
  return null;
}

// Which of the 4 viewport edges is closest to a drop point.
function _twNearestEdge(x, y, vw, vh) {
  const d = { left: x, right: vw - x, top: y, bottom: vh - y };
  let edge = "left", min = d.left;
  for (const k of ["right","top","bottom"]) if (d[k] < min) { min = d[k]; edge = k; }
  return edge;
}

// Keeps the FAB fully on-screen for a given edge + offset, re-evaluated against the CURRENT
// viewport size on every render (not just at drop time) so a browser resize never leaves it
// stranded off-screen.
function _twClampOffset(edge, offset, vw, vh) {
  const along = (edge === "left" || edge === "right") ? vh : vw;
  return Math.max(TW_EDGE_MARGIN, Math.min(along - TW_EDGE_MARGIN - TW_FAB_SIZE, offset));
}

// Drop point -> {edge, offset}. offset is measured from the top (left/right edges) or from the
// left (top/bottom edges), centered on where the pointer actually let go - not snapped to a single
// fixed spot on the edge.
function _twSnapToEdge(x, y, vw, vh) {
  const edge = _twNearestEdge(x, y, vw, vh);
  const rawOffset = (edge === "left" || edge === "right") ? y - TW_FAB_SIZE/2 : x - TW_FAB_SIZE/2;
  return { edge, offset: _twClampOffset(edge, rawOffset, vw, vh) };
}

// {edge,offset} -> CSS position for the FAB. null = default corner (bottom-left, matches v1).
function _twPosStyle(pos, vw, vh) {
  if (!pos) return { left: TW_EDGE_MARGIN, bottom: TW_EDGE_MARGIN };
  const offset = _twClampOffset(pos.edge, pos.offset, vw, vh);
  if (pos.edge === "left") return { left: TW_EDGE_MARGIN, top: offset };
  if (pos.edge === "right") return { right: TW_EDGE_MARGIN, top: offset };
  if (pos.edge === "top") return { top: TW_EDGE_MARGIN, left: offset };
  return { bottom: TW_EDGE_MARGIN, left: offset }; // "bottom"
}

function _twTimeAgo(iso) {
  const min = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (min < 1) return "vừa xong";
  if (min < 60) return `${min} phút trước`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr} giờ trước`;
  return `${Math.floor(hr / 24)} ngày trước`;
}

function TranslateWidget({state, setState, config, page}) {
  const [open, setOpen] = useState(false);
  const [direction, setDirection] = useState("en-vi"); // "en-vi" | "vi-en"
  const [text, setText] = useState("");
  const [translating, setTranslating] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragPos, setDragPos] = useState(null); // {x,y} raw cursor position while actively dragging
  const dragStartRef = useRef(null);
  const draggingRef = useRef(false);
  const [, forceTick] = useState(0); // re-render on resize so clamped position stays correct

  useEffect(() => {
    const onResize = () => forceTick(t => t + 1);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const examModeActive = _twExamModeActive(state, page);
  // If a real exam starts while the drawer happens to be open, force it closed immediately.
  useEffect(()=>{ if (examModeActive && open) setOpen(false); },[examModeActive]);

  if (examModeActive) return null;

  const passageShortcut = _twCurrentPassageText(state);
  const selectDirection = (d) => { setDirection(d); setResult(null); setError(null); };

  const doTranslate = async () => {
    if (!config || !text.trim() || translating) return;
    setTranslating(true); setError(null); setResult(null);
    const targetLang = direction==="en-vi" ? "Vietnamese" : "English";
    const sourceLang = direction==="en-vi" ? "English" : "Vietnamese";
    try {
      const raw = await callAPI(config, [{role:"user", content:
        `Translate the following ${sourceLang} text to natural ${targetLang}. Return ONLY valid JSON: {"result":"..."}\n\nText:\n${text.trim()}`}], 1500, 0.1);
      const data = safeJSON(raw);
      const out = data && typeof data.result === "string" ? data.result.trim() : "";
      if (!out) throw new Error("Empty translation");
      setResult(out);
      const entry = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2,7)}`,
        sourceText: text.trim(), translatedText: out, direction,
        createdAt: new Date().toISOString()
      };
      setState(s => ({...s, translationHistory: [entry, ...(s.translationHistory||[])].slice(0, TRANSLATE_HISTORY_MAX)}));
    } catch(e) {
      setError(e.message || "Translate failed");
    } finally {
      setTranslating(false);
    }
  };

  const loadHistoryEntry = (entry) => {
    setDirection(entry.direction); setText(entry.sourceText); setResult(entry.translatedText); setError(null);
  };
  const deleteHistoryEntry = (id) => {
    setState(s => ({...s, translationHistory: (s.translationHistory||[]).filter(e=>e.id!==id)}));
  };

  const history = state.translationHistory || [];

  // Drag handlers - mirror the Reading split-pane resize handle's Pointer Events pattern exactly
  // (src/11-reading.jsx onSplitDown/onSplitMove/onSplitUp): setPointerCapture unifies mouse/touch/pen.
  const onFabPointerDown = (e) => {
    e.preventDefault();
    dragStartRef.current = { x: e.clientX, y: e.clientY };
    draggingRef.current = false;
    try { e.currentTarget.setPointerCapture(e.pointerId); } catch(_) {}
  };
  const onFabPointerMove = (e) => {
    if (!dragStartRef.current) return;
    const dx = e.clientX - dragStartRef.current.x, dy = e.clientY - dragStartRef.current.y;
    if (!draggingRef.current && Math.hypot(dx, dy) < TW_DRAG_THRESHOLD) return;
    draggingRef.current = true;
    setIsDragging(true);
    setDragPos({ x: e.clientX, y: e.clientY });
  };
  const onFabPointerUp = (e) => {
    try { e.currentTarget.releasePointerCapture(e.pointerId); } catch(_) {}
    const wasDragging = draggingRef.current;
    dragStartRef.current = null;
    draggingRef.current = false;
    setIsDragging(false);
    setDragPos(null);
    if (wasDragging) {
      const snapped = _twSnapToEdge(e.clientX, e.clientY, window.innerWidth, window.innerHeight);
      setState(s => ({...s, translateWidgetPos: snapped}));
    } else {
      setOpen(o => !o);
    }
  };

  const fabStyle = (isDragging && dragPos)
    ? { left: dragPos.x - TW_FAB_SIZE/2, top: dragPos.y - TW_FAB_SIZE/2, right: "auto", bottom: "auto" }
    : _twPosStyle(state.translateWidgetPos, window.innerWidth, window.innerHeight);

  return <>
    <button className={`translate-fab${isDragging ? " dragging" : ""}`} style={fabStyle}
      onPointerDown={onFabPointerDown} onPointerMove={onFabPointerMove}
      onPointerUp={onFabPointerUp} onPointerCancel={onFabPointerUp}
      title="Dịch nhanh · kéo để đổi vị trí">🌐</button>
    {open && <div className="translate-drawer-overlay" onMouseDown={()=>setOpen(false)}>
      <div className="translate-drawer" onMouseDown={e=>e.stopPropagation()}>
        <div className="translate-drawer-head">
          <strong>🌐 Translate</strong>
          <button className="btn bg bsm" onClick={()=>setOpen(false)}>Close</button>
        </div>
        <div className="translate-drawer-body">
          <div className="translate-direction-toggle">
            <button className={direction==="en-vi"?"active":""} onClick={()=>selectDirection("en-vi")}>Anh → Việt</button>
            <button className={direction==="vi-en"?"active":""} onClick={()=>selectDirection("vi-en")}>Việt → Anh</button>
          </div>
          {passageShortcut && <button className="translate-shortcut-chip"
              onClick={()=>{ setText(passageShortcut.text.slice(0,TRANSLATE_TEXT_MAX)); setResult(null); setError(null); }}>
            {passageShortcut.label}
          </button>}
          <div className="translate-field">
            <div className="translate-field-label">Văn bản gốc</div>
            <textarea className="era-input" style={{minHeight:110,resize:"vertical"}} maxLength={TRANSLATE_TEXT_MAX}
              placeholder={direction==="en-vi" ? "Dán văn bản tiếng Anh cần dịch..." : "Dán văn bản tiếng Việt cần dịch..."}
              value={text} onChange={e=>{ setText(e.target.value); setResult(null); setError(null); }}/>
            <div className="translate-char-count">{text.length}/{TRANSLATE_TEXT_MAX}</div>
          </div>
          <button className="btn bp" style={{width:"100%"}} disabled={!config || !text.trim() || translating}
            title={!config ? "Set up an AI provider in Settings to translate." : ""}
            onClick={doTranslate}>
            {translating ? <><Spinner/> Đang dịch...</> : "Dịch"}
          </button>
          {error && <div className="alert ar" style={{marginTop:10}}>{error}</div>}
          {result && <div className="translate-field" style={{marginTop:10}}>
            <div className="translate-field-label">Bản dịch</div>
            <div className="translate-result-block">{result}</div>
          </div>}
          {history.length>0 && <>
            <div className="translate-history-head">Lịch sử ({history.length})</div>
            <div className="translate-history-list">
              {history.slice(0,50).map(h=><div key={h.id} className="translate-history-item">
                <div className="translate-history-row" onClick={()=>loadHistoryEntry(h)} title="Tải lại vào ô dịch">
                  <span className="translate-history-dir">{h.direction==="en-vi"?"EN":"VI"}</span>
                  <span className="translate-history-text">{h.sourceText.slice(0,50)}{h.sourceText.length>50?"…":""}</span>
                  <span className="translate-history-arrow">→</span>
                  <span className="translate-history-text">{h.translatedText.slice(0,50)}{h.translatedText.length>50?"…":""}</span>
                </div>
                <div className="translate-history-meta">
                  <span>{_twTimeAgo(h.createdAt)}</span>
                  <button onClick={()=>deleteHistoryEntry(h.id)}>Xoá</button>
                </div>
              </div>)}
            </div>
          </>}
        </div>
      </div>
    </div>}
  </>;
}
