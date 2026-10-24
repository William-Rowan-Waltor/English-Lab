// VOCAB LOOKUP LAYER — hover any word that is in your vocab library and it gets an
// era-themed underline; click it to jump to that word's page. Select (highlight) a word
// to get a small action: open it if it is in the library, or offer to import it if not.
// Dispatches: "ielts-open-vocab" {word} and "ielts-import-vocab" {word}. The App handles
// navigation + the focused word page (no Next/Previous; Back returns to the origin page).

// Resolve a surface word to a known library headword, tolerating common inflections so
// "analysed" / "approaches" still match "analyse" / "approach".
function _vlResolveKnown(w, set) {
  if (!w) return null;
  if (set.has(w)) return w;
  const cands = [];
  if (w.endsWith("ies")) cands.push(w.slice(0,-3)+"y");
  if (w.endsWith("ied")) cands.push(w.slice(0,-3)+"y");
  if (w.endsWith("es")) cands.push(w.slice(0,-2));
  if (w.endsWith("s")) cands.push(w.slice(0,-1));
  if (w.endsWith("ing")) cands.push(w.slice(0,-3), w.slice(0,-3)+"e");
  if (w.endsWith("ed")) cands.push(w.slice(0,-2), w.slice(0,-1));
  for (const c of cands) if (set.has(c)) return c;
  return null;
}

// The word (and its on-screen rect) sitting under a viewport point, via caret hit-testing.
function _vlWordAtPoint(x, y) {
  let node, offset;
  if (document.caretRangeFromPoint) {
    const r = document.caretRangeFromPoint(x, y);
    if (!r) return null; node = r.startContainer; offset = r.startOffset;
  } else if (document.caretPositionFromPoint) {
    const p = document.caretPositionFromPoint(x, y);
    if (!p) return null; node = p.offsetNode; offset = p.offset;
  } else return null;
  if (!node || node.nodeType !== 3) return null; // text nodes only
  const text = node.nodeValue || "";
  const isW = c => /[A-Za-z'-]/.test(c);
  let s = offset, e = offset;
  while (s > 0 && isW(text[s-1])) s--;
  while (e < text.length && isW(text[e])) e++;
  if (e <= s) return null;
  const word = text.slice(s,e).toLowerCase().replace(/^[^a-z]+|[^a-z]+$/g,"");
  if (word.length < 2) return null;
  const range = document.createRange();
  range.setStart(node, s); range.setEnd(node, e);
  const rect = range.getBoundingClientRect();
  if (!rect || !rect.width) return null;
  return { word, rect, el: node.parentElement };
}

function _vlBlocked(el) {
  return !el || (el.closest && el.closest("input,textarea,select,button,a,[contenteditable=''],[contenteditable=true],.no-vocab-lookup"));
}

// Translate cache: module-level (not React state, never persisted) so repeat selections of the
// same phrase in one session skip the API call, but nothing bloats state/app-state.json — phrase
// selections are high-cardinality (almost always unique), unlike the bounded vocab word list.
// Key is the EXACT original text (case preserved) since "Bank"/"bank" can translate differently.
const _vlTranslateCache = new Map();
const _VL_TRANSLATE_CACHE_MAX = 50;
function _vlCacheTranslation(key, value) {
  if (_vlTranslateCache.size >= _VL_TRANSLATE_CACHE_MAX) {
    const oldest = _vlTranslateCache.keys().next().value;
    _vlTranslateCache.delete(oldest);
  }
  _vlTranslateCache.set(key, value);
}

function VocabLookupLayer({state, config}) {
  const [pop, setPop] = useState(null); // {x,y,word,known,mode:'word'|'phrase',text}
  const popRef = useRef(null);
  const knownRef = useRef(new Set());
  const hoverRef = useRef({word:"", base:""});
  const downRef = useRef(false);
  const [translating, setTranslating] = useState(false);
  const [translation, setTranslation] = useState(null);
  const [translateError, setTranslateError] = useState(null);
  // Request token: this is the first async state in this file (the other two effects are
  // synchronous DOM manipulation). Guards against a slow/late API response overwriting a popup
  // that was since dismissed or replaced by a new selection.
  const translateTokenRef = useRef(0);

  // Build the library set: AWL headwords + imported (custom) words.
  useEffect(()=>{
    const s = new Set();
    try { (typeof AWL_WORDS!=="undefined"?AWL_WORDS:[]).forEach(x=>{ const w=(x&&x.w)||x; if(w) s.add(String(w).toLowerCase()); }); } catch {}
    try { Object.keys(state.customVocab||{}).forEach(w=>s.add(String(w).toLowerCase())); } catch {}
    knownRef.current = s;
  },[state.customVocab]);

  // Hover underline + click-to-open. The underline is a single imperatively-positioned
  // element (no React re-render on mousemove); era-themed via the .vocab-uline class.
  useEffect(()=>{
    const uline = document.createElement("div");
    uline.className = "vocab-uline";
    uline.style.display = "none";
    document.body.appendChild(uline);
    let raf = 0;
    const hide = () => { uline.style.display="none"; hoverRef.current={word:"",base:""}; document.documentElement.style.cursor=""; };

    const onMove = (e) => {
      if (downRef.current) { hide(); return; }      // don't fight an in-progress selection
      if (raf) return;
      raf = requestAnimationFrame(()=>{
        raf = 0;
        const hit = _vlWordAtPoint(e.clientX, e.clientY);
        if (!hit || _vlBlocked(hit.el)) { hide(); return; }
        const base = _vlResolveKnown(hit.word, knownRef.current);
        if (!base) { hide(); return; }
        uline.style.display = "block";
        uline.style.left = `${hit.rect.left}px`;
        uline.style.top = `${hit.rect.bottom - 1}px`;
        uline.style.width = `${hit.rect.width}px`;
        document.documentElement.style.cursor = "pointer";
        hoverRef.current = { word: hit.word, base };
      });
    };
    const onClick = (e) => {
      const h = hoverRef.current;
      if (!h.base || _vlBlocked(e.target)) return;
      const sel = window.getSelection();
      if (sel && !sel.isCollapsed && String(sel).trim()) return; // a selection click, not a tap
      const hit = _vlWordAtPoint(e.clientX, e.clientY);
      if (!hit || _vlResolveKnown(hit.word, knownRef.current) !== h.base) return;
      e.preventDefault(); e.stopPropagation();
      hide();
      document.dispatchEvent(new CustomEvent("ielts-open-vocab",{detail:{word:h.base}}));
    };
    const onScroll = () => { hide(); setPop(null); };
    const onDown = () => { downRef.current = true; };
    const onUpFlag = () => { downRef.current = false; };

    document.addEventListener("mousemove", onMove, {passive:true});
    document.addEventListener("click", onClick, true); // capture so we can intercept before card handlers
    window.addEventListener("scroll", onScroll, true);
    document.addEventListener("mousedown", onDown, true);
    document.addEventListener("mouseup", onUpFlag, true);
    return ()=>{
      cancelAnimationFrame(raf);
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("click", onClick, true);
      window.removeEventListener("scroll", onScroll, true);
      document.removeEventListener("mousedown", onDown, true);
      document.removeEventListener("mouseup", onUpFlag, true);
      uline.remove();
      document.documentElement.style.cursor = "";
    };
  },[]);

  // Selection → action popup. Single word: resolve against the library (Open/Import), plus a
  // Translate action. Multi-word phrase/sentence: Translate only (no library concept applies).
  useEffect(()=>{
    const onUp = (e) => {
      setTimeout(()=>{
        const sel = window.getSelection();
        const text = sel ? String(sel).trim() : "";
        if (!text) return;
        const anchorEl = sel.anchorNode && (sel.anchorNode.nodeType===3 ? sel.anchorNode.parentElement : sel.anchorNode);
        if (_vlBlocked(anchorEl)) return; // unchanged: still excludes textarea/input/contenteditable
        let rect; try { rect = sel.getRangeAt(0).getBoundingClientRect(); } catch { return; }
        if (!rect || !rect.width) return;
        const isPhrase = /\s/.test(text);
        if (!isPhrase) {
          const norm = text.toLowerCase().replace(/[^a-z'-]/g,"");
          if (norm.length < 2) return;
          const base = _vlResolveKnown(norm, knownRef.current);
          setPop({ x: Math.round(rect.left + rect.width/2), y: Math.round(rect.top), word: base||norm, known: !!base, mode:"word", text });
        } else {
          if (text.length < 2 || text.length > 200) return; // quick-phrase tool, not a passage translator
          setPop({ x: Math.round(rect.left + rect.width/2), y: Math.round(rect.top), known:false, mode:"phrase", text });
        }
      }, 10);
    };
    const onDismiss = (e) => { if (popRef.current && !popRef.current.contains(e.target)) setPop(null); };
    document.addEventListener("mouseup", onUp);
    document.addEventListener("mousedown", onDismiss, true);
    return ()=>{ document.removeEventListener("mouseup", onUp); document.removeEventListener("mousedown", onDismiss, true); };
  },[]);

  // Reset translation state whenever the popup target changes (new selection or dismissed).
  useEffect(()=>{
    translateTokenRef.current++;
    setTranslating(false); setTranslation(null); setTranslateError(null);
  },[pop]);

  const doTranslate = async () => {
    if (!config || !pop || translating) return;
    const text = pop.text;
    const cached = _vlTranslateCache.get(text);
    if (cached) { setTranslation(cached); return; }
    const myToken = translateTokenRef.current;
    setTranslating(true); setTranslateError(null);
    try {
      const raw = await callAPI(config, [{role:"user", content:
        `Translate the following English text to natural Vietnamese. Return ONLY valid JSON: {"vi":"..."}\n\nText: "${text}"`}], 300, 0.1);
      const data = safeJSON(raw);
      const vi = data && typeof data.vi === "string" ? data.vi.trim() : "";
      if (!vi) throw new Error("Empty translation");
      if (translateTokenRef.current !== myToken) return; // popup changed while we were waiting
      _vlCacheTranslation(text, vi);
      setTranslation(vi);
    } catch(e) {
      if (translateTokenRef.current !== myToken) return;
      setTranslateError(e.message || "Translate failed");
    } finally {
      if (translateTokenRef.current === myToken) setTranslating(false);
    }
  };

  if (!pop) return null;
  const clearSel = () => { try { window.getSelection().removeAllRanges(); } catch {} };
  const top = Math.max(8, pop.y - 46);

  const translateBtn = <button className="vlp-btn vlp-translate" onMouseDown={e=>e.preventDefault()}
      disabled={!config} title={!config?"Set up an AI provider in Settings to translate.":""}
      onClick={doTranslate}>
      🌐 Dịch
    </button>;

  let body;
  if (translation) {
    body = <span className="vlp-vi-text">{translation}</span>;
  } else if (translating) {
    body = <span className="vlp-label"><Spinner/> Đang dịch…</span>;
  } else if (translateError) {
    body = <>
      <span className="vlp-error">{translateError}</span>
      {translateBtn}
    </>;
  } else if (pop.mode === "phrase") {
    body = translateBtn;
  } else {
    body = pop.known
      ? <>
          <button className="vlp-btn vlp-go" onMouseDown={e=>e.preventDefault()}
              onClick={()=>{ const w=pop.word; setPop(null); clearSel(); document.dispatchEvent(new CustomEvent("ielts-open-vocab",{detail:{word:w}})); }}>
            Open <strong>{pop.word}</strong> in vocab
          </button>
          {translateBtn}
        </>
      : <>
          <span className="vlp-label">Not in your library</span>
          <button className="vlp-btn vlp-import" onMouseDown={e=>e.preventDefault()}
            onClick={()=>{ const w=pop.word; setPop(null); clearSel(); document.dispatchEvent(new CustomEvent("ielts-import-vocab",{detail:{word:w}})); }}>
            Import &ldquo;{pop.word}&rdquo;
          </button>
          {translateBtn}
        </>;
  }

  return <div ref={popRef} className="vocab-lookup-pop" style={{left:pop.x, top}}>{body}</div>;
}
