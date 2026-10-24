// SAVED — one place for anything the user bookmarks across the app: reading/listening
// questions, vocabulary, grammar notes, exercises, or free-form notes. Fully token-themed
// so it re-skins automatically across every Design Era. Data lives in state.saved; the
// reusable <SaveButton/> (05-common) writes here via toggleSavedItem.

// Per-type accent token (consistent with the app's palette; one accent per type).
const _SAVED_TYPE_ACCENT = {
  question:"var(--sky)", vocab:"var(--leaf)", grammar:"var(--orchid)",
  exercise:"var(--honey)", note:"var(--ink3)"
};
function _savedTypeLabel(id){ return (SAVED_TYPES.find(t=>t.id===id)||{}).label || "Note"; }

function SavedTypeBadge({type}){
  const accent = _SAVED_TYPE_ACCENT[type] || "var(--ink3)";
  return <span style={{
    display:"inline-flex",alignItems:"center",fontSize:9.5,fontWeight:600,letterSpacing:.4,
    textTransform:"uppercase",padding:"2px 7px",borderRadius:5,
    color:accent,background:`color-mix(in srgb, ${accent} 14%, var(--surface2))`,
    border:`1px solid color-mix(in srgb, ${accent} 30%, var(--border))`
  }}>{_savedTypeLabel(type)}</span>;
}

function SavedItemCard({item, onRemove, onEdit}){
  const [open,setOpen] = useState(false);
  const [editing,setEditing] = useState(false);
  const [eTitle,setETitle] = useState(item.title||"");
  const [eBody,setEBody] = useState(String(item.body||""));
  const body = String(item.body||"");
  const long = body.length > 240;
  const shown = open || !long ? body : body.slice(0,240).trimEnd()+"…";
  const accent = _SAVED_TYPE_ACCENT[item.type] || "var(--ink3)";
  let when = "";
  try { when = new Date(item.savedAt).toLocaleDateString(undefined,{day:"numeric",month:"short",year:"numeric"}); } catch {}
  const speakable = item.type==="vocab" || item.type==="question";
  const startEdit = () => { setETitle(item.title||""); setEBody(String(item.body||"")); setEditing(true); };
  const saveEdit = () => { onEdit && onEdit(item.id, {title:eTitle, body:eBody}); setEditing(false); };

  return <div style={{padding:"12px 13px",borderRadius:9,background:"var(--surface2)",
    border:"1px solid var(--border)",borderLeft:`3px solid ${accent}`,marginBottom:9}}>
    <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:6,flexWrap:"wrap"}}>
      <SavedTypeBadge type={item.type}/>
      {!editing && <div style={{flex:1,minWidth:0,fontSize:13,fontWeight:600,color:"var(--ink)",overflow:"hidden",textOverflow:"ellipsis"}}>{item.title}</div>}
      {editing && <span style={{flex:1}}/>}
      {!editing && speakable && body && <SpeakButton text={`${item.title}. ${body}`} size="sm"/>}
      {!editing && onEdit && <button onClick={startEdit} title="Edit"
        style={{display:"inline-flex",alignItems:"center",justifyContent:"center",width:24,height:24,
          borderRadius:6,border:"1px solid var(--border2)",background:"var(--surface)",
          color:"var(--ink3)",cursor:"pointer",fontSize:12,padding:0,transition:"all .14s"}}>✎</button>}
      <button onClick={()=>onRemove(item.id)} title="Remove from Saved"
        style={{display:"inline-flex",alignItems:"center",justifyContent:"center",width:24,height:24,
          borderRadius:6,border:"1px solid var(--border2)",background:"var(--surface)",
          color:"var(--ink3)",cursor:"pointer",fontSize:13,padding:0,transition:"all .14s"}}>✕</button>
    </div>
    {editing
      ? <div style={{display:"flex",flexDirection:"column",gap:8}}>
          <input className="era-input" value={eTitle} onChange={e=>setETitle(e.target.value)} placeholder="Title"
            style={{width:"100%",fontSize:12.5,padding:"7px 9px",boxSizing:"border-box"}}/>
          <textarea className="era-input" value={eBody} onChange={e=>setEBody(e.target.value)} placeholder="Details, definition, example, or note…" rows={4}
            style={{width:"100%",fontSize:12,padding:"7px 9px",resize:"vertical",lineHeight:1.5,boxSizing:"border-box"}}/>
          <div style={{display:"flex",gap:8,alignItems:"center"}}>
            <button className="btn bp bsm" onClick={saveEdit} disabled={!eTitle.trim()&&!eBody.trim()}>Save</button>
            <button className="btn bg bsm" onClick={()=>setEditing(false)}>Cancel</button>
          </div>
        </div>
      : <>
          {body && <div style={{fontSize:12,lineHeight:1.6,color:"var(--ink2)",whiteSpace:"pre-wrap",wordBreak:"break-word"}}>{shown}</div>}
          <div style={{display:"flex",alignItems:"center",gap:10,marginTop:body?8:0}}>
            {long && <button onClick={()=>setOpen(o=>!o)} style={{background:"none",border:"none",padding:0,
              color:accent,cursor:"pointer",fontSize:11,fontWeight:500}}>{open?"Show less":"Show more"}</button>}
            <span style={{flex:1}}/>
            {item.source && <span style={{fontSize:10,color:"var(--ink3)"}}>{item.source}</span>}
            {when && <span style={{fontSize:10,color:"var(--ink3)",fontFamily:"'Geist Mono',monospace"}}>{when}</span>}
          </div>
        </>}
  </div>;
}

function SavedPage({state, setState}){
  const saved = Array.isArray(state.saved) ? state.saved : [];
  const [filter,setFilter] = useState("all");
  const [query,setQuery] = useState("");
  const [adding,setAdding] = useState(false);
  const [form,setForm] = useState({type:"note", title:"", body:""});
  const [addMsg,setAddMsg] = useState("");

  const counts = useMemo(()=>{
    const c = {all:saved.length};
    SAVED_TYPES.forEach(t=>{ c[t.id] = saved.filter(s=>s.type===t.id).length; });
    return c;
  },[saved]);

  const visible = useMemo(()=>{
    const q = query.trim().toLowerCase();
    return saved.filter(s=>{
      if (filter!=="all" && s.type!==filter) return false;
      if (!q) return true;
      return (s.title||"").toLowerCase().includes(q) || (s.body||"").toLowerCase().includes(q);
    });
  },[saved,filter,query]);

  const removeItem = (id) => setState(s=>({...s, saved: removeSavedById(s.saved, id)}));
  const editItem = (id, patch) => setState(s=>({...s, saved: updateSavedItem(s.saved, id, patch)}));

  const submitAdd = () => {
    const title = form.title.trim();
    const body = form.body.trim();
    if (!title && !body) { setAddMsg("Type a title or some content first."); return; }
    const item = {type:form.type, title:title||body.slice(0,60), body, source:"Added manually"};
    if (isItemSaved(state, item)) { setAddMsg("That item is already in your Saved list."); return; }
    setState(s=>({...s, saved:[makeSavedItem(item), ...(Array.isArray(s.saved)?s.saved:[])]}));
    setForm({type:form.type, title:"", body:""});
    setAddMsg("Saved.");
  };

  const tabs = [{id:"all",label:"All"}, ...SAVED_TYPES];

  return <div>
    <div className="card mb14">
      <div className="card-h"><div className="cdot"/>Saved
        <span style={{marginLeft:"auto",fontSize:11,color:"var(--ink3)",fontWeight:400}}>{saved.length} item{saved.length===1?"":"s"}</span>
      </div>
      <p style={{fontSize:12,color:"var(--ink2)",lineHeight:1.6,margin:"0 0 12px"}}>
        Bookmark any question, word, grammar point, or exercise from across the app, or add your own below. Look for the bookmark button beside items elsewhere.
      </p>

      <div style={{display:"flex",gap:8,alignItems:"center",flexWrap:"wrap",marginBottom:12}}>
        <input className="era-input" value={query} onChange={e=>setQuery(e.target.value)}
          placeholder="Search saved items..." style={{flex:1,minWidth:160}}/>
        <button className="btn bp bsm" onClick={()=>{setAdding(a=>!a); setAddMsg("");}}>{adding?"Close":"+ Add item"}</button>
      </div>

      {adding && <div style={{padding:"12px 13px",borderRadius:9,background:"var(--surface2)",border:"1px solid var(--border)",marginBottom:12}}>
        <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:8}}>
          <select className="era-input" value={form.type} onChange={e=>setForm(f=>({...f,type:e.target.value}))} style={{width:140}}>
            {SAVED_TYPES.map(t=><option key={t.id} value={t.id}>{t.label}</option>)}
          </select>
          <input className="era-input" value={form.title} onChange={e=>setForm(f=>({...f,title:e.target.value}))}
            placeholder="Title (e.g. the word, the question, the rule)" style={{flex:1,minWidth:180}}/>
        </div>
        <textarea className="era-input" value={form.body} onChange={e=>setForm(f=>({...f,body:e.target.value}))}
          placeholder="Details, definition, example, or the full exercise..." rows={3}
          style={{width:"100%",resize:"vertical",lineHeight:1.5}}/>
        <div style={{display:"flex",alignItems:"center",gap:10,marginTop:8}}>
          <button className="btn bp bsm" onClick={submitAdd}>Add to Saved</button>
          {addMsg && <span style={{fontSize:11,color:addMsg==="Saved."?"var(--leaf)":"var(--honey)"}}>{addMsg}</span>}
        </div>
      </div>}

      <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
        {tabs.map(t=>{
          const active = filter===t.id;
          const n = counts[t.id]||0;
          return <button key={t.id} onClick={()=>setFilter(t.id)}
            style={{padding:"5px 11px",borderRadius:7,fontSize:11.5,fontWeight:500,cursor:"pointer",
              border:`1px solid ${active?"color-mix(in srgb, var(--leaf) 45%, var(--border))":"var(--border2)"}`,
              background:active?"color-mix(in srgb, var(--leaf) 12%, var(--surface2))":"var(--surface2)",
              color:active?"var(--leaf)":"var(--ink2)",transition:"all .14s"}}>
            {t.label}{n?<span style={{marginLeft:5,opacity:.7}}>{n}</span>:null}
          </button>;
        })}
      </div>
    </div>

    <div className="card">
      {visible.length===0
        ? <div className="empty" style={{padding:"40px 24px",textAlign:"center"}}>
            <div className="empty-icon" style={{fontSize:30,marginBottom:8}}>🔖</div>
            <div style={{fontSize:13,color:"var(--ink2)",fontWeight:500,marginBottom:4}}>
              {saved.length===0 ? "Nothing saved yet" : "No items match your filter"}
            </div>
            <div style={{fontSize:11.5,color:"var(--ink3)",lineHeight:1.6,maxWidth:340,margin:"0 auto"}}>
              {saved.length===0
                ? "Tap the bookmark button on a question, word, or exercise anywhere in the app, or use + Add item above."
                : "Try a different type or clear the search."}
            </div>
          </div>
        : <div>
            <div style={{fontSize:11,color:"var(--ink3)",marginBottom:10}}>
              {visible.length} item{visible.length===1?"":"s"}{filter!=="all"?` in ${_savedTypeLabel(filter)}`:""}{query?` matching "${query}"`:""}
            </div>
            {visible.map(item=><SavedItemCard key={item.id} item={item} onRemove={removeItem} onEdit={editItem}/>)}
          </div>}
    </div>
  </div>;
}
