# Agent Recovery Brief - IELTS Writing Lab

Tài liệu này dành cho Claude, Codex, Kimi hoặc bất kỳ AI agent nào vừa mất toàn bộ ngữ cảnh trò chuyện nhưng vẫn cần tiếp tục làm việc với dự án.

Không nhét lại graphify vào đây. Graph đã có sẵn ở `graphify-out/`. Hãy dùng tài liệu này như bản định hướng con người, còn graphify là bản đồ kỹ thuật để tìm đường nhanh.

## 1. Việc phải làm ngay khi vào dự án

Trước khi sửa bất kỳ file nào:

1. Đọc phần cuối của `Conversation.txt`.
2. Báo cáo lại cho user/nhóm biết bối cảnh mới nhất: ai vừa làm gì, scope hiện tại là folder nào, còn TODO nào không.
3. Đọc `graphify-out/GRAPH_REPORT.md` để xác định subsystem liên quan.
4. Nếu cần chi tiết hơn, dùng graphify:

```powershell
graphify explain "QuizMode()"
graphify query "How does Saved work?"
graphify affected "callAPI()"
graphify path "SaveButton()" "SavedPage()"
```

5. Ghi ACK/CLAIM vào `Conversation.txt` trước khi implement.
6. Implement nhỏ, đúng scope.
7. Build/test.
8. Ghi DONE vào `Conversation.txt`.
9. Sau code change ở `v7-split`, chạy:

```powershell
graphify update D:\Downloads\ielts-writing-lab-v7-split
```

Nếu thay đổi documentation/semantic lớn và muốn graph hiểu nội dung mới, dùng full extraction với backend đã cấu hình:

```powershell
graphify extract D:\Downloads\ielts-writing-lab-v7-split
```

## 2. Dự án là gì

IELTS Writing Lab là một web app luyện IELTS Academic chạy local-first trong trình duyệt. Dù tên có chữ Writing, app hiện bao phủ đầy đủ:

- Writing: Task 1, Task 2, full writing test, AI grading, model answer, rewrite drill, mistake journal, calibration.
- Reading: tạo bài, upload bài đọc, giữ nguyên passage/câu hỏi, dataset, strategy trainer, strict answer checking, analytics.
- Listening: tạo bài nghe, import transcript/source, library, dictation, optional local TTS qua Speaking backend.
- Speaking: offline warm-up/minimal pairs, optional FastAPI backend với Whisper transcription, acoustic features, examiner scoring, history.
- Vocabulary: AWL, imported vocab, family words, collocations, idioms, lexis dictionary entries, spaced repetition, quiz, Saved, hover lookup.
- Dashboard: study plan, reminders, progress, heatmap, band history, weakness tracking.
- Settings: AI providers, failover, local Ollama, Speaking backend URL, data import/export, design era.

Triết lý sản phẩm:

- Local-first, desktop-first, single-user.
- Dữ liệu học tập và API key nằm ở máy người dùng, không có hosted account backend.
- Cloud AI vẫn có thể được dùng; khi dùng cloud, request rời khỏi máy người dùng.
- Public release không được chứa personal data, `.env`, database, model/runtime blobs hoặc private notes.

## 3. Folder nào là gì

Các folder quan trọng:

```text
D:\Downloads\ielts-writing-lab-v7-split
D:\Downloads\ielts-writing-lab-public-new
```

`ielts-writing-lab-v7-split` là bản private/working đầy đủ. Nó có:

- `Conversation.txt` để Claude/Codex phối hợp.
- `graphify-out/` để điều hướng codebase.
- Có thể có `.local/`, `markitdown-venv/`, data local, notes riêng.

`ielts-writing-lab-public-new` là bản public/publish-ready. Nó phải sạch:

- Không `Conversation.txt`.
- Không `.local/`.
- Không `.claude/`.
- Không `data/app-state.json`.
- Không `speaking-backend/.env`.
- Không database/audio cache/log/venv/private notes.

Public folder hiện là `ielts-writing-lab-public-new`. Đừng dùng folder public cũ nếu thấy tên `ielts-writing-lab-public`.

Khi user giao việc:

- Nếu nói rõ `public-new`, chỉ sửa public-new và báo cáo vào Conversation của v7-split.
- Nếu là feature/app behavior chung, thường phải sửa cả `v7-split` và `public-new`, giữ source byte-identical nếu Conversation/Claude đang yêu cầu dual-folder.
- Nếu không chắc scope, hỏi ngắn hoặc chọn an toàn: đọc Conversation mới nhất trước, vì trong đó thường ghi rõ folder target.

## 4. Kiến trúc kỹ thuật nhanh

Frontend là React chạy trong browser, không dùng bundler hiện đại. Build script tự ghép source.

Source chính:

```text
src/
|-- 00-data.js
|-- 01-awl-card-data.js
|-- 02-api.js
|-- 02-reading-strategy-data.js
|-- 03-vocab-utils.js
|-- 04-state.js
|-- 04-design-eras.jsx
|-- 05-common-components.jsx
|-- 06-dashboard.jsx
|-- 07-vocab.jsx
|-- 08-theory.jsx
|-- 09-*.jsx/js
|-- 10-practice.jsx
|-- 11-*.jsx
`-- 12-app.jsx
```

Generated files:

```text
dist/app.jsx
index.html
```

Không sửa tay `dist/app.jsx` hoặc `index.html` trừ khi đang xử lý generated artifact rất có chủ đích. Bình thường sửa `src/`, rồi build:

```powershell
node scripts/build.mjs
```

Local app server:

```powershell
node scripts/serve.mjs
```

Server mở ở:

```text
http://localhost:5173
```

Các browser dependency nằm trong `vendor/`, có CDN fallback trong generated `index.html`.

## 5. State, storage, privacy

State chính nằm trong `src/04-state.js`.

Các vùng lưu trữ quan trọng:

- `localStorage` key `ielts_writing_lab_v1`: app state, progress, essays, tests, vocab, saved items.
- `localStorage` key `ielts_lab_configs`: AI provider configs/API keys.
- `localStorage` key `ielts_lab_active`: active provider id.
- `data/app-state.json`: optional folder mirror khi chạy `node scripts/serve.mjs`; không commit.
- `speaking-backend/data/`: SQLite Speaking data; không commit.
- `.local/`: project-local Ollama runtime/model/logs; không commit.
- `markitdown-venv/`: local document conversion environment; không commit.

Không đưa những thứ này vào public hoặc commit:

```text
.local/
.claude/
Conversation.txt
tut.txt
users.md
data/app-state*.json
markitdown-venv/
speaking-backend/.env
speaking-backend/.venv/
speaking-backend/data/
speaking-backend/audio_cache/
server.log
server.err
speaking-server.log
speaking-server.err
```

API key trong app là plaintext trong browser localStorage. Không được hardcode key vào source, README, screenshot, workflow hoặc test.

## 6. AI provider, local AI, backend

AI layer chủ yếu ở `src/02-api.js`.

Nó xử lý:

- provider configs;
- OpenAI-compatible APIs;
- Gemini;
- Anthropic;
- local Ollama;
- failover;
- timeout/retry;
- AI proxy qua `scripts/serve.mjs`;
- OCR/vision image-to-text;
- lexis entry lookup;
- Reading/model switching on request-too-large.

Các điểm dễ sai:

- Failover hiện an toàn hơn: spare keys không tự bị dùng nếu chưa bật Backup, trừ một số heavy action explicit dùng `allProviders:true`.
- Provider test chờ lâu hơn cho large model và dùng `noRetry`.
- Browser abort phải truyền được tới proxy/upstream để tránh đốt quota.
- Vision OCR cần provider có vision capability; Groq text-only sẽ fallback.

Local AI:

```powershell
.\setup-local-ai.bat
.\start-local-ai.bat
.\stop-local-ai.bat
```

Local Ollama API:

```text
http://localhost:11434
```

Default app model alias:

```text
ielts-fighter
```

Speaking backend:

```powershell
.\setup-speaking-backend-local.bat
.\start-speaking-backend.bat
```

Default backend:

```text
http://localhost:8000
```

Backend source:

```text
speaking-backend/src/main.py
speaking-backend/src/db.py
speaking-backend/src/examiner.py
speaking-backend/src/transcriber.py
```

## 7. Các subsystem chính và file nên xem trước

Use graphify first, then inspect files. Typical entry points:

| Work area | Start here |
|---|---|
| App shell/nav/global events | `src/12-app.jsx` |
| State/storage/import/export | `src/04-state.js` |
| Shared UI, SaveButton, WordCard, QuizMode, uploaders | `src/05-common-components.jsx` |
| Vocab, dictionary, import, lexis, study/quiz flow | `src/07-vocab.jsx`, `src/03-vocab-utils.js` |
| Saved page/bookmarks | `src/11-saved.jsx`, `src/04-state.js`, `src/05-common-components.jsx` |
| Hover/click vocab lookup | `src/11-vocab-lookup.jsx`, `src/12-app.jsx`, `src/07-vocab.jsx` |
| Reading | `src/11-reading.jsx`, `src/02-reading-strategy-data.js`, `src/04b-reading-strategies.js` |
| Listening | `src/11-listening.jsx` |
| Speaking UI | `src/11-speaking.jsx` |
| Speaking backend | `speaking-backend/src/*.py` |
| Writing Task 1/2/full test | `src/10-practice.jsx`, `src/11-task2.jsx`, `src/11-full-test.jsx` |
| Writing grading/mistakes | `src/09-writing-examiner.jsx`, `src/09-writing-suite.jsx` |
| AI/provider/failover/OCR | `src/02-api.js`, `scripts/serve.mjs` |
| Design eras/theme | `src/04-design-eras.jsx`, `styles.css` |
| Build | `scripts/build.mjs` |

## 8. Recent important work from Conversation

Recent work matters because old assumptions will be wrong:

- Saved system exists across app: `state.saved`, `SaveButton`, `SavedPage`.
- Saved items are editable.
- Saved identity uses stable `key` where possible; body changes should not break unsave for new items.
- Reading questions have Saved integration.
- Vocab word card has Saved integration.
- Vocab Quiz and Family words got Saved support in `public-new`; verify whether this has been mirrored into `v7-split` before editing related code.
- Vocab hover/selection lookup exists and can navigate to focused vocab cards.
- Vocab lookup Back was fixed to return to the true previous page.
- Vocab Quiz can resume in-progress at phase boundary.
- Writing textareas accept pasted images and OCR to text.
- Image OCR is vision-first; MarkItDown is fallback.
- Provider failover is opt-in for spares by default.
- Provider tests use longer timeout/noRetry.
- Reading upload can use all providers on 413/request-too-large.
- Collocations/idioms now behave like dictionary entries, with full lexis card support.
- Vocab lexis import/extraction was fixed for missing meanings and short phrases.

Before changing any of these areas, search Conversation for the exact feature name and read the latest DONE/FIX block.

## 9. Cách giao việc cho AI agents

User nên giao việc theo mẫu này để agent không đoán bừa:

```text
Target folder: v7-split / public-new / both
Goal:
User-visible behavior:
Files or feature area:
Must preserve:
Verification expected:
Report to Conversation: yes
Graph update: yes/no
```

Ví dụ:

```text
Target folder: both
Goal: Add Saved button to Writing micro-drill cards.
User-visible behavior: Button saves the prompt + expected answer as exercise.
Files or feature area: Writing practice, Saved.
Must preserve: existing grading flow, no API calls.
Verification expected: build + browser click save/unsave.
Report to Conversation: yes
Graph update: yes
```

Nếu nhiều agent cùng làm:

- Một agent claim một phạm vi nhỏ.
- Không claim chung chung kiểu “fix Vocab”.
- Ghi rõ file dự kiến chạm.
- Nếu phát hiện file đã được agent khác sửa trong cùng khu vực, đọc kỹ và làm tiếp trên thay đổi đó, không revert.
- Nếu task bị user đổi scope giữa chừng, ghi “Scope update” trong Conversation.

## 10. Cách trò chuyện giữa agents

Conversation.txt là bảng điều phối. Mỗi agent nên dùng format này.

ACK/CLAIM:

```text
================================================================
Agent ACK/CLAIM: short task name. Timestamp: YYYY-MM-DD +07:00

User request:
- ...

Context read:
- Conversation tail read.
- Graph communities checked: ...

Scope:
- Folder(s):
- Files likely touched:
- Explicit non-goals:

Safety:
- No secrets/personal data.
- Generated files only via build.
================================================================
```

DONE:

```text
================================================================
Agent DONE: short task name. Timestamp: YYYY-MM-DD +07:00

Changed:
- ...

Files touched:
- ...

Verification:
- build command/result
- browser/test result
- graphify update result if applicable

Notes:
- limitations
- follow-up needed
================================================================
```

Nói chuyện với user:

- Báo ngắn gọn đang đọc gì và học được gì.
- Trước khi sửa file, nói rõ sẽ sửa phần nào.
- Nếu task kéo dài, cập nhật khoảng mỗi 30 giây.
- Final answer nói file đã sửa, test đã chạy, còn gì chưa làm.

## 11. Quy tắc phân việc theo subsystem

Nên chia theo ranh giới sản phẩm, không chia theo “ai rảnh file nào”:

- App State + storage: một agent.
- Vocab/Saved/Dictionary: một agent.
- Reading generation/upload/test UI: một agent.
- Listening import/generation/TTS: một agent.
- Speaking backend/UI: một agent.
- Writing grading/editor/full test: một agent.
- Provider/API/proxy/quota/OCR: một agent, vì dễ gây side effect toàn app.
- README/screenshots/public packaging: một agent.

Không nên để hai agent cùng sửa:

- `src/02-api.js`;
- `src/04-state.js`;
- `src/05-common-components.jsx`;
- `src/07-vocab.jsx`;
- `src/11-reading.jsx`;
- `src/12-app.jsx`;
- `scripts/serve.mjs`;

trừ khi có handoff rõ trong Conversation.

## 12. Build và verification tối thiểu

Sau sửa frontend:

```powershell
node scripts/build.mjs
```

Sau sửa server:

```powershell
node --check scripts/serve.mjs
```

Sau sửa Python backend:

```powershell
cd speaking-backend
python -m compileall src
```

Browser verification nên dùng Playwright hoặc agent-browser nếu có. Kiểm tra tối thiểu:

- app render được;
- tab/feature liên quan mở được;
- console không có runtime error mới;
- thao tác chính hoạt động;
- state lưu đúng nếu feature có lưu state.

Babel inline size note là cảnh báo quen thuộc, không phải lỗi app.

## 13. Public release checklist

Trước khi publish public-new:

- `node scripts/build.mjs`.
- Kiểm tra không có private artifacts.
- Kiểm tra README image links.
- Kiểm tra `.gitignore`.
- Không commit runtime/model blobs.
- Không commit API keys.
- Không commit personal `data/app-state.json`.
- Không commit `Conversation.txt`.
- Không commit `users.md` hoặc `tut.txt`.

GitHub Pages chỉ chạy frontend tĩnh. Nó không chạy:

- `scripts/serve.mjs`;
- FastAPI Speaking backend;
- Ollama;
- MarkItDown;
- `/api/storage`;
- `/api/ai-proxy`.

Các tính năng đó là local runtime của user.

## 14. Nếu bị mất trí nhớ hoàn toàn, đọc theo thứ tự này

1. `Conversation.txt` tail 200-400 dòng.
2. `AGENT_RECOVERY_BRIEF.md`.
3. `graphify-out/GRAPH_REPORT.md`.
4. `README.md`.
5. File source theo subsystem trong bảng ở trên.
6. Dùng `rg` trước khi mở nhiều file.
7. Claim trong Conversation.
8. Làm việc nhỏ, build/test, DONE.

Nếu chỉ nhớ một câu: đừng sửa theo linh cảm; đọc Conversation để biết lịch sử, dùng graphify để tìm đúng subsystem, rồi chỉ chạm phần nhỏ nhất cần chạm.
