// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 07b-vocab-study-modes.jsx — ADVANCED VOCABULARY STUDY SUITE
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// OpenQuiz / Quizlet-grade learning modes:
// 1. Flashcard3DView: 3D GSAP card-flip with FSRS/SM-2 Spaced Repetition engine
// 2. MatchGameView: 12-tile rapid pairing game with timer & GSAP feedback
// 3. LearnModeView: Adaptive multi-choice to spelling progression
// 4. PatchTestView: Randomized patch assessment with distractor breakdown
// 5. PatchManagerModal: Full CRUD + 20-word sub-patch splitter
// 6. VocabPatchSelectorBar: Deck selector with progress badges
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// ─── SPEECH SYNTHESIS HELPER ─────────────────────────────────────────────────
function speakVocabWord(word) {
  if (!window.speechSynthesis || !word) return;
  try {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(word);
    utterance.lang = "en-US";
    utterance.rate = 0.9;
    window.speechSynthesis.speak(utterance);
  } catch (e) {
    console.warn("TTS playback error:", e);
  }
}

// ─── 1. FLASHCARD 3D VIEW (FSRS / SM-2) ──────────────────────────────────────
function Flashcard3DView({ words = [], activePatch, state, setState, onBack }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [showCollocations, setShowCollocations] = useState(false);
  const cardRef = useRef(null);

  const safeWords = useMemo(() => {
    if (words && words.length > 0) return words;
    // Fallback if empty
    return (typeof VN_EXAM_VOCAB !== "undefined" ? VN_EXAM_VOCAB.slice(0, 20) : []);
  }, [words]);

  const currentWord = safeWords[currentIndex] || safeWords[0] || {};
  const wordKey = currentWord.key || currentWord.word || `w-${currentIndex}`;
  const cardStat = state.flashcardStats?.[wordKey] || { reps: 0, interval: 0, ease: 2.5, state: "new" };

  // GSAP 3D Flip effect
  const handleFlip = () => {
    const nextFlipped = !isFlipped;
    setIsFlipped(nextFlipped);
    if (typeof window.gsap !== "undefined" && cardRef.current) {
      window.gsap.to(cardRef.current, {
        rotationY: nextFlipped ? 180 : 0,
        duration: 0.45,
        ease: "power2.out"
      });
    }
  };

  const handleRate = (rating) => {
    const nextStat = calculateNextReview(cardStat, rating);
    const updatedStats = {
      ...(state.flashcardStats || {}),
      [wordKey]: nextStat
    };

    // GSAP slide out animation
    if (typeof window.gsap !== "undefined" && cardRef.current) {
      window.gsap.to(cardRef.current, {
        x: rating >= 3 ? 120 : -120,
        opacity: 0,
        duration: 0.22,
        ease: "power1.in",
        onComplete: () => {
          setState(s => ({ ...s, flashcardStats: updatedStats }));
          setIsFlipped(false);
          setShowCollocations(false);
          if (currentIndex < safeWords.length - 1) {
            setCurrentIndex(i => i + 1);
          } else {
            setCurrentIndex(0);
          }
          window.gsap.fromTo(cardRef.current, 
            { x: rating >= 3 ? -80 : 80, opacity: 0, rotationY: 0 },
            { x: 0, opacity: 1, rotationY: 0, duration: 0.28, ease: "power2.out" }
          );
        }
      });
    } else {
      setState(s => ({ ...s, flashcardStats: updatedStats }));
      setIsFlipped(false);
      setShowCollocations(false);
      if (currentIndex < safeWords.length - 1) {
        setCurrentIndex(i => i + 1);
      } else {
        setCurrentIndex(0);
      }
    }
  };

  // Keyboard Navigation: Space to flip, 1-4 to rate
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") return;
      if (e.code === "Space") {
        e.preventDefault();
        handleFlip();
      } else if (e.key === "1") {
        handleRate(1);
      } else if (e.key === "2") {
        handleRate(2);
      } else if (e.key === "3") {
        handleRate(3);
      } else if (e.key === "4") {
        handleRate(4);
      } else if (e.key === "ArrowRight" && currentIndex < safeWords.length - 1) {
        setCurrentIndex(i => i + 1);
        setIsFlipped(false);
      } else if (e.key === "ArrowLeft" && currentIndex > 0) {
        setCurrentIndex(i => i - 1);
        setIsFlipped(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentIndex, isFlipped, cardStat, wordKey, safeWords]);

  const progressPercent = Math.round(((currentIndex + 1) / safeWords.length) * 100);

  return (
    <div className="canvas fu">
      {/* Top Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <button className="btn bg bsm" onClick={onBack}>← Quay lại Vocab</button>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span className="chip" style={{ background: "var(--surface2)", color: "var(--ink2)", fontSize: 11 }}>
            {activePatch?.name || "Tất cả từ vựng"}
          </span>
          <span style={{ fontFamily: "'Geist Mono',monospace", fontSize: 12, color: "var(--ink3)" }}>
            {currentIndex + 1} / {safeWords.length}
          </span>
        </div>
      </div>

      {/* Progress Bar */}
      <div style={{ width: "100%", height: 5, background: "var(--surface2)", borderRadius: 3, marginBottom: 20, overflow: "hidden" }}>
        <div style={{ width: `${progressPercent}%`, height: "100%", background: "var(--leaf)", transition: "width 0.3s ease" }} />
      </div>

      {/* 3D Flashcard Container */}
      <div className="flashcard-scene" style={{ perspective: 1000, minHeight: 380, display: "flex", justifyContent: "center", marginBottom: 20 }}>
        <div 
          ref={cardRef}
          className={`flashcard-card ${isFlipped ? "flipped" : ""}`}
          onClick={handleFlip}
          style={{
            width: "100%",
            maxWidth: 640,
            minHeight: 360,
            position: "relative",
            transformStyle: "preserve-3d",
            cursor: "pointer",
            borderRadius: 14,
            boxShadow: "0 10px 30px rgba(0,0,0,0.08), 0 1px 3px rgba(0,0,0,0.05)"
          }}
        >
          {/* Card Front */}
          <div 
            className="flashcard-face flashcard-front"
            style={{
              position: "absolute",
              width: "100%",
              height: "100%",
              backfaceVisibility: "hidden",
              WebkitBackfaceVisibility: "hidden",
              background: "var(--surface)",
              border: "1px solid var(--border)",
              borderRadius: 14,
              padding: "28px 24px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              boxSizing: "border-box"
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div style={{ display: "flex", gap: 6 }}>
                {currentWord.cefr && <span className="chip" style={{ background: "color-mix(in srgb, var(--sky) 15%, var(--surface))", color: "var(--sky)", fontWeight: 700 }}>{currentWord.cefr}</span>}
                {currentWord.topic && <span className="chip" style={{ fontSize: 11 }}>{currentWord.topic}</span>}
                {cardStat.state !== "new" && (
                  <span className="chip" style={{ fontSize: 10, color: "var(--ink3)" }}>
                    Lặp: {cardStat.reps} | Cách: {cardStat.interval}d
                  </span>
                )}
              </div>
              <button 
                className="btn bg bsm" 
                onClick={(e) => { e.stopPropagation(); speakVocabWord(currentWord.word || currentWord.hw); }}
                title="Phát âm chuẩn (TTS)"
                style={{ padding: "4px 8px", fontSize: 13 }}
              >
                🔊
              </button>
            </div>

            <div style={{ textAlign: "center", margin: "auto 0" }}>
              <h2 style={{ fontSize: 32, fontFamily: "'Fraunces', serif", fontWeight: 700, color: "var(--ink)", marginBottom: 8, letterSpacing: "-0.01em" }}>
                {currentWord.word || currentWord.hw || "Vocabulary"}
              </h2>
              {currentWord.ipa && (
                <div style={{ fontFamily: "'Geist Mono', monospace", color: "var(--ink3)", fontSize: 15, marginBottom: 12 }}>
                  {currentWord.ipa}
                </div>
              )}
              <div style={{ fontSize: 12, color: "var(--ink3)", display: "inline-block", background: "var(--surface2)", padding: "4px 12px", borderRadius: 20 }}>
                Nhấn Space hoặc chạm thẻ để xem nghĩa & ví dụ ↻
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "var(--ink3)" }}>
              <span>Phím tắt: Space (lật thẻ)</span>
              <span>1: Lại · 2: Khó · 3: Tốt · 4: Dễ</span>
            </div>
          </div>

          {/* Card Back */}
          <div 
            className="flashcard-face flashcard-back"
            style={{
              position: "absolute",
              width: "100%",
              height: "100%",
              backfaceVisibility: "hidden",
              WebkitBackfaceVisibility: "hidden",
              transform: "rotateY(180deg)",
              background: "color-mix(in srgb, var(--leaf) 3%, var(--surface))",
              border: "1px solid color-mix(in srgb, var(--leaf) 30%, var(--border))",
              borderRadius: 14,
              padding: "24px 24px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              boxSizing: "border-box"
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 18, fontWeight: 700, color: "var(--ink)" }}>
                {currentWord.word || currentWord.hw}
              </span>
              <button 
                className="btn bg bsm" 
                onClick={(e) => { e.stopPropagation(); speakVocabWord(currentWord.word || currentWord.hw); }}
                style={{ padding: "4px 8px", fontSize: 13 }}
              >
                🔊
              </button>
            </div>

            <div style={{ margin: "14px 0", flex: 1, overflowY: "auto" }}>
              <div style={{ fontSize: 18, fontWeight: 650, color: "var(--leaf)", marginBottom: 10, lineHeight: 1.4 }}>
                {currentWord.meaning || currentWord.vi || "Đang cập nhật định nghĩa"}
              </div>

              {currentWord.ex && (
                <div style={{ fontSize: 13, color: "var(--ink2)", fontStyle: "italic", background: "var(--surface2)", padding: "10px 14px", borderRadius: 8, marginBottom: 10, lineHeight: 1.5 }}>
                  "{currentWord.ex}"
                </div>
              )}

              {(currentWord.syn || currentWord.opp) && (
                <div style={{ display: "flex", gap: 12, fontSize: 12, marginBottom: 8 }}>
                  {currentWord.syn && <div><strong style={{ color: "var(--leaf)" }}>Đồng nghĩa:</strong> {currentWord.syn}</div>}
                  {currentWord.opp && <div><strong style={{ color: "var(--rose)" }}>Trái nghĩa:</strong> {currentWord.opp}</div>}
                </div>
              )}

              {Array.isArray(currentWord.col) && currentWord.col.length > 0 && (
                <div style={{ marginTop: 8 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "var(--ink3)", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 4 }}>
                    Cụm Collocation Thường Gặp:
                  </div>
                  <div className="chips">
                    {currentWord.col.map((c, i) => (
                      <span key={i} className="chip cl" style={{ fontSize: 11 }}>{c}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div style={{ fontSize: 11, color: "var(--ink3)", textAlign: "center" }}>
              Đánh giá mức độ ghi nhớ của bạn bên dưới:
            </div>
          </div>
        </div>
      </div>

      {/* FSRS / SM-2 Rating Bar */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10, maxWidth: 640, margin: "0 auto" }}>
        <button 
          className="btn bg" 
          onClick={() => handleRate(1)}
          style={{ borderColor: "var(--rose)", color: "var(--rose)", display: "flex", flexDirection: "column", padding: "10px 6px", alignItems: "center" }}
        >
          <span style={{ fontWeight: 700, fontSize: 13 }}>[1] Lại (Again)</span>
          <span style={{ fontSize: 10, opacity: 0.8 }}>1 ngày</span>
        </button>

        <button 
          className="btn bg" 
          onClick={() => handleRate(2)}
          style={{ borderColor: "var(--honey)", color: "var(--honey)", display: "flex", flexDirection: "column", padding: "10px 6px", alignItems: "center" }}
        >
          <span style={{ fontWeight: 700, fontSize: 13 }}>[2] Khó (Hard)</span>
          <span style={{ fontSize: 10, opacity: 0.8 }}>2 ngày</span>
        </button>

        <button 
          className="btn bp" 
          onClick={() => handleRate(3)}
          style={{ display: "flex", flexDirection: "column", padding: "10px 6px", alignItems: "center" }}
        >
          <span style={{ fontWeight: 700, fontSize: 13 }}>[3] Tốt (Good)</span>
          <span style={{ fontSize: 10, opacity: 0.8 }}>{Math.max(3, Math.round((cardStat.interval || 1) * (cardStat.ease || 2.5)))} ngày</span>
        </button>

        <button 
          className="btn bl" 
          onClick={() => handleRate(4)}
          style={{ display: "flex", flexDirection: "column", padding: "10px 6px", alignItems: "center" }}
        >
          <span style={{ fontWeight: 700, fontSize: 13 }}>[4] Dễ (Easy)</span>
          <span style={{ fontSize: 10, opacity: 0.8 }}>{Math.max(4, Math.round((cardStat.interval || 1) * (cardStat.ease || 2.5) * 1.3))} ngày</span>
        </button>
      </div>
    </div>
  );
}

// ─── 2. MATCH GAME VIEW (OpenQuiz / Quizlet Style) ───────────────────────────
function MatchGameView({ words = [], onBack }) {
  const [tiles, setTiles] = useState([]);
  const [selectedFirst, setSelectedFirst] = useState(null);
  const [matchedIds, setMatchedIds] = useState(new Set());
  const [mismatchedIds, setMismatchedIds] = useState([]);
  const [seconds, setSeconds] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);
  const [moves, setMoves] = useState(0);
  const timerRef = useRef(null);

  const initGame = () => {
    const pool = (words && words.length >= 6) 
      ? words 
      : (typeof VN_EXAM_VOCAB !== "undefined" ? VN_EXAM_VOCAB : []);
    
    // Pick 6 random items
    const shuffledPool = [...pool].sort(() => 0.5 - Math.random()).slice(0, 6);
    
    const tileList = [];
    shuffledPool.forEach((item, idx) => {
      const term = item.word || item.hw || `Term ${idx}`;
      const def = item.meaning || item.vi || `Def ${idx}`;
      tileList.push({ id: `term-${idx}`, matchId: idx, text: term, type: "term" });
      tileList.push({ id: `def-${idx}`, matchId: idx, text: def, type: "def" });
    });

    setTiles(tileList.sort(() => 0.5 - Math.random()));
    setSelectedFirst(null);
    setMatchedIds(new Set());
    setMismatchedIds([]);
    setMoves(0);
    setSeconds(0);
    setIsGameOver(false);
  };

  useEffect(() => {
    initGame();
  }, [words]);

  // Game timer
  useEffect(() => {
    if (isGameOver) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }
    timerRef.current = setInterval(() => {
      setSeconds(s => s + 0.1);
    }, 100);
    return () => clearInterval(timerRef.current);
  }, [isGameOver]);

  const handleTileClick = (tile) => {
    if (matchedIds.has(tile.id) || mismatchedIds.includes(tile.id)) return;
    if (selectedFirst && selectedFirst.id === tile.id) {
      setSelectedFirst(null);
      return;
    }

    if (!selectedFirst) {
      setSelectedFirst(tile);
    } else {
      setMoves(m => m + 1);
      // Check if match
      if (selectedFirst.matchId === tile.matchId && selectedFirst.type !== tile.type) {
        // Matched!
        const nextMatched = new Set(matchedIds);
        nextMatched.add(selectedFirst.id);
        nextMatched.add(tile.id);
        setMatchedIds(nextMatched);
        setSelectedFirst(null);

        // Check if finished (all 12 matched)
        if (nextMatched.size === tiles.length) {
          setIsGameOver(true);
        }
      } else {
        // Mismatched
        setMismatchedIds([selectedFirst.id, tile.id]);
        setTimeout(() => {
          setMismatchedIds([]);
          setSelectedFirst(null);
        }, 650);
      }
    }
  };

  return (
    <div className="canvas fu">
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <button className="btn bg bsm" onClick={onBack}>← Thoát game</button>
        <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
          <span style={{ fontFamily: "'Geist Mono',monospace", fontSize: 13, color: "var(--honey)", fontWeight: 700 }}>
            ⏱ {seconds.toFixed(1)}s
          </span>
          <span style={{ fontSize: 12, color: "var(--ink3)" }}>
            Nước đi: {moves}
          </span>
          <button className="btn bs bsm" onClick={initGame}>Chơi lại</button>
        </div>
      </div>

      <div style={{ textAlign: "center", marginBottom: 20 }}>
        <h2 style={{ fontSize: 22, fontFamily: "'Fraunces',serif", fontWeight: 700, color: "var(--ink)", marginBottom: 4 }}>
          Match Game · Nối Từ & Nghĩa
        </h2>
        <p style={{ fontSize: 12, color: "var(--ink3)" }}>
          Chạm vào 1 từ và 1 định nghĩa tương ứng để ghép cặp nhanh nhất có thể.
        </p>
      </div>

      {/* Grid of 12 tiles */}
      <div 
        style={{ 
          display: "grid", 
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", 
          gap: 12, 
          maxWidth: 800, 
          margin: "0 auto" 
        }}
      >
        {tiles.map(tile => {
          const isMatched = matchedIds.has(tile.id);
          const isSelected = selectedFirst?.id === tile.id;
          const isMismatched = mismatchedIds.includes(tile.id);

          let borderColor = "var(--border)";
          let bg = "var(--surface)";
          let textColor = "var(--ink)";

          if (isMatched) {
            borderColor = "transparent";
            bg = "transparent";
            textColor = "transparent";
          } else if (isMismatched) {
            borderColor = "var(--rose)";
            bg = "color-mix(in srgb, var(--rose) 12%, var(--surface))";
            textColor = "var(--rose)";
          } else if (isSelected) {
            borderColor = "var(--sky)";
            bg = "color-mix(in srgb, var(--sky) 15%, var(--surface))";
            textColor = "var(--sky)";
          }

          return (
            <div
              key={tile.id}
              onClick={() => handleTileClick(tile)}
              style={{
                minHeight: 85,
                padding: "12px 14px",
                borderRadius: 10,
                border: `1.5px solid ${borderColor}`,
                background: bg,
                color: textColor,
                cursor: isMatched ? "default" : "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                textAlign: "center",
                fontSize: tile.type === "term" ? 14 : 12.5,
                fontWeight: tile.type === "term" ? 650 : 500,
                transition: "all 0.18s ease",
                transform: isSelected ? "scale(1.03)" : "scale(1)",
                opacity: isMatched ? 0 : 1,
                pointerEvents: isMatched ? "none" : "auto",
                boxShadow: isMatched ? "none" : "0 2px 6px rgba(0,0,0,0.04)"
              }}
            >
              {tile.text}
            </div>
          );
        })}
      </div>

      {/* Game Over Modal */}
      {isGameOver && (
        <div className="card" style={{ maxWidth: 440, margin: "24px auto 0", textAlign: "center", padding: "28px 20px" }}>
          <div style={{ fontSize: 44, marginBottom: 8 }}>🏆</div>
          <h3 style={{ fontSize: 20, fontWeight: 700, color: "var(--ink)", marginBottom: 6 }}>Xuất Sắc! Hoàn Thành!</h3>
          <p style={{ fontSize: 13, color: "var(--ink2)", marginBottom: 14 }}>
            Thời gian: <strong style={{ color: "var(--honey)" }}>{seconds.toFixed(1)} giây</strong> với <strong>{moves} nước đi</strong>.
          </p>
          <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
            <button className="btn bp" onClick={initGame}>Chơi lại ngay</button>
            <button className="btn bg" onClick={onBack}>Về danh mục</button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── 3. LEARN MODE VIEW (OpenQuiz Progression) ──────────────────────────────
function LearnModeView({ words = [], onBack }) {
  const [index, setIndex] = useState(0);
  const [selectedOpt, setSelectedOpt] = useState(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [options, setOptions] = useState([]);

  const currentWord = words[index] || words[0] || {};

  // Build 4 multiple choice options
  useEffect(() => {
    if (!currentWord || !words.length) return;
    const correctDef = currentWord.meaning || currentWord.vi || "Định nghĩa chính xác";
    const distractors = words
      .filter(w => (w.word || w.hw) !== (currentWord.word || currentWord.hw))
      .map(w => w.meaning || w.vi || "Nghĩa khác")
      .filter(Boolean)
      .sort(() => 0.5 - Math.random())
      .slice(0, 3);

    const opts = [
      { text: correctDef, isCorrect: true },
      ...distractors.map(d => ({ text: d, isCorrect: false }))
    ].sort(() => 0.5 - Math.random());

    setOptions(opts);
    setSelectedOpt(null);
    setIsAnswered(false);
  }, [index, words]);

  const handleChoose = (opt) => {
    if (isAnswered) return;
    setSelectedOpt(opt);
    setIsAnswered(true);
    if (opt.isCorrect) {
      setScore(s => s + 1);
    }
  };

  const handleNext = () => {
    if (index < words.length - 1) {
      setIndex(i => i + 1);
    } else {
      setIndex(-1); // End of test
    }
  };

  if (index === -1) {
    return (
      <div className="canvas fu" style={{ textAlign: "center", paddingTop: 40 }}>
        <div style={{ fontSize: 48, marginBottom: 12 }}>🎉</div>
        <h2 style={{ fontSize: 24, fontFamily: "'Fraunces',serif", fontWeight: 700, color: "var(--ink)", marginBottom: 8 }}>
          Hoàn thành lượt Học có hướng dẫn!
        </h2>
        <div style={{ fontSize: 16, color: "var(--ink2)", marginBottom: 20 }}>
          Kết quả: <strong style={{ color: "var(--leaf)" }}>{score} / {words.length}</strong> từ vựng ({Math.round((score / words.length) * 100)}%)
        </div>
        <button className="btn bp" onClick={() => { setIndex(0); setScore(0); }}>Học lại bài này</button>
        <button className="btn bg" style={{ marginLeft: 8 }} onClick={onBack}>Về trang Vocab</button>
      </div>
    );
  }

  return (
    <div className="canvas fu">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <button className="btn bg bsm" onClick={onBack}>← Dừng học</button>
        <span style={{ fontFamily: "'Geist Mono',monospace", fontSize: 12, color: "var(--ink3)" }}>
          Câu {index + 1} / {words.length} · Điểm: {score}
        </span>
      </div>

      <div className="card" style={{ maxWidth: 640, margin: "0 auto", padding: "28px 24px" }}>
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <span className="chip" style={{ fontSize: 11, marginBottom: 8 }}>Chọn định nghĩa tiếng Việt đúng</span>
          <h2 style={{ fontSize: 32, fontFamily: "'Fraunces',serif", fontWeight: 700, color: "var(--ink)", marginTop: 6, marginBottom: 6 }}>
            {currentWord.word || currentWord.hw}
          </h2>
          {currentWord.ipa && (
            <div style={{ fontFamily: "'Geist Mono',monospace", color: "var(--ink3)", fontSize: 14 }}>
              {currentWord.ipa}
            </div>
          )}
        </div>

        {/* Options */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 20 }}>
          {options.map((opt, i) => {
            let border = "1px solid var(--border)";
            let bg = "var(--surface2)";
            let color = "var(--ink)";

            if (isAnswered) {
              if (opt.isCorrect) {
                border = "1.5px solid var(--leaf)";
                bg = "color-mix(in srgb, var(--leaf) 12%, var(--surface))";
                color = "var(--leaf)";
              } else if (selectedOpt === opt) {
                border = "1.5px solid var(--rose)";
                bg = "color-mix(in srgb, var(--rose) 12%, var(--surface))";
                color = "var(--rose)";
              }
            }

            return (
              <button
                key={i}
                onClick={() => handleChoose(opt)}
                disabled={isAnswered}
                style={{
                  padding: "14px 18px",
                  borderRadius: 8,
                  border,
                  background: bg,
                  color,
                  textAlign: "left",
                  fontSize: 14,
                  fontWeight: 500,
                  cursor: isAnswered ? "default" : "pointer",
                  transition: "all 0.15s ease",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center"
                }}
              >
                <span>{String.fromCharCode(65 + i)}. {opt.text}</span>
                {isAnswered && opt.isCorrect && <span style={{ fontWeight: 700 }}>✓ Đúng</span>}
                {isAnswered && !opt.isCorrect && selectedOpt === opt && <span style={{ fontWeight: 700 }}>✗ Sai</span>}
              </button>
            );
          })}
        </div>

        {/* Next Button */}
        {isAnswered && (
          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <button className="btn bp" onClick={handleNext}>
              {index < words.length - 1 ? "Từ tiếp theo →" : "Xem kết quả →"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── 4. PATCH TEST VIEW (Assessment & Distractor Diagnosis) ──────────────────
function PatchTestView({ patch, words = [], onBack }) {
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState({});
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Generate 10 randomized multiple choice questions
  const questions = useMemo(() => {
    const list = [...words].sort(() => 0.5 - Math.random()).slice(0, 10);
    return list.map((item, qIdx) => {
      const prompt = item.ex 
        ? item.ex.replace(new RegExp(`\\b${item.word || item.hw}\\b`, "i"), "_______")
        : `Từ "${item.word || item.hw}" có nghĩa chính xác nhất là:`;

      const correctAns = item.meaning || item.vi || (item.word || item.hw);
      const otherWords = words.filter(w => (w.word || w.hw) !== (item.word || item.hw));
      const distractors = otherWords
        .sort(() => 0.5 - Math.random())
        .slice(0, 3)
        .map(w => w.meaning || w.vi || (w.word || w.hw));

      const choices = [
        { label: correctAns, isCorrect: true, distractorNote: "Đáp án chính xác ngữ cảnh." },
        ...distractors.map((d, dIdx) => ({
          label: d,
          isCorrect: false,
          distractorNote: `Phương án gây nhiễu: nghĩa của từ khác trong bộ từ vựng.`
        }))
      ].sort(() => 0.5 - Math.random());

      return {
        id: qIdx,
        word: item.word || item.hw,
        prompt,
        choices,
        example: item.ex,
        meaning: item.meaning || item.vi
      };
    });
  }, [words]);

  const handleSelectAnswer = (qIdx, choiceIdx) => {
    if (isSubmitted) return;
    setAnswers(prev => ({ ...prev, [qIdx]: choiceIdx }));
  };

  const calculateScore = () => {
    let correctCount = 0;
    questions.forEach((q, idx) => {
      const selected = answers[idx];
      if (selected != null && q.choices[selected]?.isCorrect) {
        correctCount += 1;
      }
    });
    return correctCount;
  };

  const score = calculateScore();

  return (
    <div className="canvas fu">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <button className="btn bg bsm" onClick={onBack}>← Quay lại</button>
        <span style={{ fontSize: 12, color: "var(--ink3)" }}>
          Kiểm tra bài test: <strong>{patch?.name || "Bộ từ vựng"}</strong>
        </span>
      </div>

      {!isSubmitted ? (
        <div className="card" style={{ maxWidth: 680, margin: "0 auto", padding: "24px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
            <span style={{ fontWeight: 700, color: "var(--ink)" }}>Câu hỏi {currentQ + 1} / {questions.length}</span>
            <span style={{ color: "var(--ink3)", fontSize: 11 }}>Đã làm: {Object.keys(answers).length}/{questions.length}</span>
          </div>

          <div style={{ fontSize: 16, fontWeight: 600, color: "var(--ink)", marginBottom: 18, lineHeight: 1.5 }}>
            {questions[currentQ]?.prompt}
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 20 }}>
            {questions[currentQ]?.choices.map((c, i) => (
              <button
                key={i}
                onClick={() => handleSelectAnswer(currentQ, i)}
                style={{
                  padding: "12px 16px",
                  borderRadius: 8,
                  textAlign: "left",
                  border: answers[currentQ] === i ? "1.5px solid var(--sky)" : "1px solid var(--border)",
                  background: answers[currentQ] === i ? "color-mix(in srgb, var(--sky) 12%, var(--surface))" : "var(--surface2)",
                  color: "var(--ink)",
                  cursor: "pointer",
                  fontSize: 13.5
                }}
              >
                {String.fromCharCode(65 + i)}. {c.label}
              </button>
            ))}
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <button 
              className="btn bg bsm" 
              disabled={currentQ === 0} 
              onClick={() => setCurrentQ(q => q - 1)}
            >
              ← Câu trước
            </button>

            {currentQ < questions.length - 1 ? (
              <button 
                className="btn bp bsm" 
                onClick={() => setCurrentQ(q => q + 1)}
              >
                Câu tiếp theo →
              </button>
            ) : (
              <button 
                className="btn bl bsm" 
                onClick={() => setIsSubmitted(true)}
              >
                Nộp bài & Chấm điểm ✓
              </button>
            )}
          </div>
        </div>
      ) : (
        /* Results View with Distractor Breakdown */
        <div className="card" style={{ maxWidth: 720, margin: "0 auto", padding: "28px 24px" }}>
          <div style={{ textAlign: "center", marginBottom: 24 }}>
            <div style={{ fontSize: 44, marginBottom: 6 }}>📊</div>
            <h2 style={{ fontSize: 24, fontWeight: 700, color: "var(--ink)", marginBottom: 4 }}>Kết Quả Bài Kiểm Tra</h2>
            <div style={{ fontSize: 18, color: "var(--leaf)", fontWeight: 700 }}>
              {score} / {questions.length} Câu Đúng ({Math.round((score / questions.length) * 100)}%)
            </div>
          </div>

          <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 14 }}>Chi tiết & Phân tích phương án gây nhiễu (Distractors):</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {questions.map((q, idx) => {
              const userPick = answers[idx];
              const isCorrect = userPick != null && q.choices[userPick]?.isCorrect;
              return (
                <div 
                  key={idx} 
                  style={{ 
                    padding: 14, 
                    borderRadius: 8, 
                    border: `1px solid ${isCorrect ? "var(--border)" : "color-mix(in srgb, var(--rose) 40%, var(--border))"}`,
                    background: isCorrect ? "var(--surface)" : "color-mix(in srgb, var(--rose) 4%, var(--surface))"
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                    <span style={{ fontWeight: 650, fontSize: 13, color: "var(--ink)" }}>Câu {idx + 1}: {q.word}</span>
                    <span style={{ fontSize: 11, fontWeight: 700, color: isCorrect ? "var(--leaf)" : "var(--rose)" }}>
                      {isCorrect ? "✓ Đúng" : "✗ Sai"}
                    </span>
                  </div>
                  <div style={{ fontSize: 13, color: "var(--ink2)", marginBottom: 8 }}>{q.prompt}</div>
                  <div style={{ fontSize: 12, color: "var(--leaf)", marginBottom: 4 }}>
                    <strong>Đáp án đúng:</strong> {q.choices.find(c => c.isCorrect)?.label}
                  </div>
                  {!isCorrect && userPick != null && (
                    <div style={{ fontSize: 11.5, color: "var(--rose)", lineHeight: 1.4 }}>
                      <strong>Bạn đã chọn:</strong> {q.choices[userPick]?.label}
                      <div style={{ color: "var(--ink3)", marginTop: 2 }}>{q.choices[userPick]?.distractorNote}</div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div style={{ marginTop: 20, textAlign: "center" }}>
            <button className="btn bp" onClick={() => { setIsSubmitted(false); setCurrentQ(0); setAnswers({}); }}>Làm lại bài kiểm tra</button>
            <button className="btn bg" style={{ marginLeft: 8 }} onClick={onBack}>Xong</button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── 5. PATCH MANAGER MODAL ──────────────────────────────────────────────────
function PatchManagerModal({ state, setState, onClose }) {
  const [newPatchName, setNewPatchName] = useState("");
  const [newPatchDesc, setNewPatchDesc] = useState("");
  const [examTag, setExamTag] = useState("all");
  const [splitSize, setSplitSize] = useState(20);
  const [msg, setMsg] = useState("");

  const patches = Object.values(state.vocabPatches || {});

  const handleCreate = () => {
    if (!newPatchName.trim()) return;
    const newState = createVocabPatch(state, {
      name: newPatchName.trim(),
      description: newPatchDesc.trim(),
      examTag
    });
    setState(newState);
    setNewPatchName("");
    setNewPatchDesc("");
    setMsg("✓ Đã tạo bộ từ vựng mới thành công!");
  };

  const handleDelete = (patchId) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa bộ từ vựng này không? (Từ vựng đã lưu trong thư viện sẽ không bị mất)")) {
      const newState = deleteVocabPatch(state, patchId, false);
      setState(newState);
    }
  };

  const handleSplit = (patchId) => {
    const newState = splitVocabPatch(state, patchId, Number(splitSize) || 20);
    setState(newState);
    setMsg(`✓ Đã chia nhỏ bộ từ thành các tiểu mục ~${splitSize} từ!`);
  };

  return (
    <div style={{
      position: "fixed",
      inset: 0,
      background: "rgba(0,0,0,0.6)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 9999,
      padding: 16
    }}>
      <div className="card" style={{ width: "100%", maxWidth: 640, maxHeight: "90vh", overflowY: "auto", padding: 24 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>Quản lý Bộ Từ Vựng (Patches & Decks)</h2>
          <button className="btn bg bsm" onClick={onClose}>✕ Đóng</button>
        </div>

        {msg && <div className="alert ag mb14">{msg}</div>}

        {/* Create New Patch */}
        <div style={{ padding: 14, background: "var(--surface2)", borderRadius: 8, marginBottom: 18 }}>
          <div style={{ fontSize: 13, fontWeight: 650, marginBottom: 8 }}>+ Tạo Patch / Deck Mới</div>
          <input
            className="era-input"
            value={newPatchName}
            onChange={e => setNewPatchName(e.target.value)}
            placeholder="Tên bộ từ (Ví dụ: Chuyên Tuyên Quang 2026 Idioms)"
            style={{ width: "100%", marginBottom: 8 }}
          />
          <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
            <select 
              className="era-input" 
              value={examTag} 
              onChange={e => setExamTag(e.target.value)}
              style={{ flex: 1 }}
            >
              <option value="all">Mục đích chung (All)</option>
              <option value="thptqg">Tiếng Anh THPT Quốc Gia</option>
              <option value="vact">V-ACT ĐGNL ĐHQG-HCM</option>
              <option value="ielts">IELTS Academic</option>
            </select>
          </div>
          <button className="btn bp bsm" onClick={handleCreate} disabled={!newPatchName.trim()}>
            Tạo Deck mới
          </button>
        </div>

        {/* List of existing patches */}
        <div style={{ fontSize: 13, fontWeight: 650, marginBottom: 8 }}>Danh sách Decks hiện có ({patches.length}):</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {patches.map(p => (
            <div 
              key={p.id}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "10px 14px",
                border: "1px solid var(--border)",
                borderRadius: 8,
                background: "var(--surface)"
              }}
            >
              <div>
                <div style={{ fontWeight: 650, fontSize: 13, color: "var(--ink)" }}>{p.name}</div>
                <div style={{ fontSize: 11, color: "var(--ink3)" }}>
                  {p.wordIds?.length || 0} từ · Tag: <span style={{ textTransform: "uppercase" }}>{p.examTag || "all"}</span>
                  {p.parentId && <span style={{ marginLeft: 6, color: "var(--sky)" }}>(Tiểu mục con)</span>}
                </div>
              </div>
              <div style={{ display: "flex", gap: 6 }}>
                {(p.wordIds?.length || 0) > 25 && (
                  <button 
                    className="btn bs bsm" 
                    title="Chia nhỏ thành các patch 20-30 từ để dễ học"
                    onClick={() => handleSplit(p.id)}
                    style={{ fontSize: 11 }}
                  >
                    ✂ Chia nhỏ
                  </button>
                )}
                <button 
                  className="btn bg bsm" 
                  onClick={() => handleDelete(p.id)}
                  style={{ color: "var(--rose)", fontSize: 11 }}
                >
                  Xóa
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── 6. VOCAB PATCH DECK SELECTOR BAR ─────────────────────────────────────────
function VocabPatchSelectorBar({ state, setState, onOpenManager, onSelectMode }) {
  const patches = Object.values(state.vocabPatches || {});
  const activePatchId = state.activePatchId || "all";

  return (
    <div className="card mb14" style={{ padding: "14px 18px", border: "1px solid color-mix(in srgb, var(--sky) 25%, var(--border))" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10, marginBottom: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 14, fontWeight: 700, color: "var(--ink)" }}>🗂 Chọn Bộ Từ Vựng Học (Deck / Patch):</span>
          <select
            className="era-input"
            value={activePatchId}
            onChange={e => setState(s => ({ ...s, activePatchId: e.target.value }))}
            style={{ fontSize: 13, padding: "5px 12px", minWidth: 220 }}
          >
            <option value="all">Tất cả từ vựng (AWL + Custom + VN Exam)</option>
            {patches.map(p => (
              <option key={p.id} value={p.id}>
                {p.name} ({p.wordIds?.length || 0} từ) [{p.examTag || "all"}]
              </option>
            ))}
          </select>
        </div>

        <button className="btn bg bsm" onClick={onOpenManager}>
          ⚙ Quản lý & Chia nhỏ Patches
        </button>
      </div>

      {/* 4 Study Mode Action Buttons */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <button 
          className="btn bp bsm" 
          onClick={() => onSelectMode("flashcard")}
          style={{ display: "flex", alignItems: "center", gap: 5 }}
        >
          🎴 Flashcard 3D (FSRS)
        </button>
        <button 
          className="btn bs bsm" 
          onClick={() => onSelectMode("match")}
          style={{ display: "flex", alignItems: "center", gap: 5 }}
        >
          ⚡ Nối Từ (Match Game)
        </button>
        <button 
          className="btn bs bsm" 
          onClick={() => onSelectMode("learn")}
          style={{ display: "flex", alignItems: "center", gap: 5 }}
        >
          🧠 Học Có Hướng Dẫn (Learn)
        </button>
        <button 
          className="btn bs bsm" 
          onClick={() => onSelectMode("test")}
          style={{ display: "flex", alignItems: "center", gap: 5 }}
        >
          📝 Kiểm Tra Patch
        </button>
      </div>
    </div>
  );
}
