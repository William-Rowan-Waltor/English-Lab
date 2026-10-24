import http from 'node:http';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import net from 'node:net';
import dns from 'node:dns/promises';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const port = Number(process.env.PORT || process.argv[2] || 5173);
const storageDir = path.join(root, 'data');
const storageFile = path.join(storageDir, 'app-state.json');

const mime = new Map([
  ['.html', 'text/html; charset=utf-8'],
  ['.css', 'text/css; charset=utf-8'],
  ['.js', 'text/javascript; charset=utf-8'],
  ['.jsx', 'text/javascript; charset=utf-8'],
  ['.json', 'application/json; charset=utf-8'],
  ['.svg', 'image/svg+xml'],
  ['.png', 'image/png'],
  ['.jpg', 'image/jpeg'],
  ['.jpeg', 'image/jpeg'],
  ['.webp', 'image/webp'],
]);

function sendJson(res, status, data) {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(data, null, 2));
}

function readRequestBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.setEncoding('utf8');
    req.on('data', (chunk) => {
      body += chunk;
      if (body.length > 25 * 1024 * 1024) {
        reject(new Error('Request body too large'));
        req.destroy();
      }
    });
    req.on('end', () => resolve(body));
    req.on('error', reject);
  });
}

function decodeHtml(text = '') {
  const named = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", '#39': "'" };
  return String(text)
    .replace(/&(#x?[0-9a-f]+|[a-z]+);/gi, (m, entity) => {
      const key = entity.toLowerCase();
      if (named[key]) return named[key];
      if (key.startsWith('#x')) return String.fromCharCode(parseInt(key.slice(2), 16));
      if (key.startsWith('#')) return String.fromCharCode(parseInt(key.slice(1), 10));
      return m;
    })
    .replace(/\s+/g, ' ')
    .trim();
}

function isDirectAudioUrl(value = '') {
  const url = String(value).trim();
  if (/^(blob:|data:audio\/)/i.test(url)) return true;
  return /^https?:\/\//i.test(url) && /\.(mp3|m4a|mp4|wav|ogg|oga|aac|webm)(\?|#|$)/i.test(url);
}

function formatTime(seconds = 0) {
  const s = Math.max(0, Math.floor(Number(seconds) || 0));
  const mm = String(Math.floor(s / 60)).padStart(2, '0');
  const ss = String(s % 60).padStart(2, '0');
  return `${mm}:${ss}`;
}

function segmentsToTranscript(segments) {
  return segments
    .map((seg) => `[${formatTime(seg.start)}] ${seg.speaker ? `${seg.speaker}: ` : ''}${seg.text}`)
    .join('\n');
}

function listeningImportStatus(code) {
  const statuses = {
    real_audio: {
      code: 'real_audio',
      label: 'Real audio attached',
      message: 'The importer found a playable audio file, but no transcript was fetched automatically.',
      nextAction: 'Paste or import a transcript if you want AI-generated questions.',
      hasRealAudio: true,
      hasTranscript: false,
      canGenerateQuestions: false,
    },
    transcript_only: {
      code: 'transcript_only',
      label: 'Transcript only',
      message: 'The importer fetched captions/transcript text, but did not attach the original audio.',
      nextAction: 'Use browser TTS or Make real audio to practice with audio.',
      hasRealAudio: false,
      hasTranscript: true,
      canGenerateQuestions: true,
    },
    source_link_only: {
      code: 'source_link_only',
      label: 'Source link only',
      message: 'The importer could not attach audio or transcript from this link.',
      nextAction: 'Use a direct audio URL, paste a transcript manually, or download captions with a browser tool.',
      hasRealAudio: false,
      hasTranscript: false,
      canGenerateQuestions: false,
    },
  };
  const mediaStatus = statuses[code] || statuses.source_link_only;
  return {
    importStatus: mediaStatus.code,
    importStatusLabel: mediaStatus.label,
    importStatusMessage: mediaStatus.message,
    importStatusNextAction: mediaStatus.nextAction,
    mediaStatus,
  };
}

function listeningImportError(message, status = 422, code = 'source_link_only') {
  const error = new Error(message);
  error.status = status;
  error.importStatusCode = code;
  return error;
}

async function fetchText(url, timeoutMs = 15000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 IELTS-Writing-Lab local importer',
        'Accept-Language': 'en-US,en;q=0.9',
      },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.text();
  } finally {
    clearTimeout(timer);
  }
}

function extractJsonAfter(text, marker) {
  const start = text.indexOf(marker);
  if (start < 0) return null;
  const braceStart = text.indexOf('{', start + marker.length);
  if (braceStart < 0) return null;
  let depth = 0;
  let inString = false;
  let escaped = false;
  for (let i = braceStart; i < text.length; i++) {
    const ch = text[i];
    if (inString) {
      if (escaped) escaped = false;
      else if (ch === '\\') escaped = true;
      else if (ch === '"') inString = false;
      continue;
    }
    if (ch === '"') inString = true;
    else if (ch === '{') depth++;
    else if (ch === '}') {
      depth--;
      if (depth === 0) return text.slice(braceStart, i + 1);
    }
  }
  return null;
}

function extractYouTubeId(input) {
  let parsed;
  try { parsed = new URL(input); } catch { return ''; }
  const host = parsed.hostname.replace(/^www\./, '');
  if (host === 'youtu.be') return parsed.pathname.split('/').filter(Boolean)[0] || '';
  if (!host.endsWith('youtube.com')) return '';
  if (parsed.searchParams.get('v')) return parsed.searchParams.get('v') || '';
  const parts = parsed.pathname.split('/').filter(Boolean);
  if (['shorts', 'embed', 'live'].includes(parts[0])) return parts[1] || '';
  return '';
}

function parseYouTubeJson3(raw) {
  const data = JSON.parse(raw);
  return (data.events || [])
    .filter((event) => Array.isArray(event.segs))
    .map((event, index) => {
      const text = decodeHtml(event.segs.map((seg) => seg.utf8 || '').join(''));
      const start = Number(event.tStartMs || 0) / 1000;
      const end = start + (Number(event.dDurationMs || 0) / 1000 || 0);
      return { id: `yt-${index + 1}`, start, end: end > start ? end : null, speaker: '', text };
    })
    .filter((seg) => seg.text);
}

function parseYouTubeXml(raw) {
  const segments = [];
  const re = /<text\b([^>]*)>([\s\S]*?)<\/text>/gi;
  let match;
  while ((match = re.exec(raw))) {
    const attrs = match[1] || '';
    const text = decodeHtml(match[2].replace(/<[^>]+>/g, ''));
    const start = Number((attrs.match(/\bstart="([^"]+)"/) || [])[1]);
    const dur = Number((attrs.match(/\bdur="([^"]+)"/) || [])[1]);
    if (Number.isFinite(start) && text) {
      segments.push({ id: `yt-${segments.length + 1}`, start, end: Number.isFinite(dur) ? start + dur : null, speaker: '', text });
    }
  }
  return segments;
}

async function importYouTubeTranscript(inputUrl) {
  const videoId = extractYouTubeId(inputUrl);
  if (!videoId) throw new Error('Could not read YouTube video id.');
  const watchHtml = await fetchText(`https://www.youtube.com/watch?v=${encodeURIComponent(videoId)}&hl=en`);
  const playerJson = extractJsonAfter(watchHtml, 'ytInitialPlayerResponse');
  if (!playerJson) throw new Error('Could not read YouTube player metadata.');
  const player = JSON.parse(playerJson);
  const tracks = player?.captions?.playerCaptionsTracklistRenderer?.captionTracks || [];
  if (!tracks.length) throw new Error('This YouTube video does not expose captions to the local importer.');
  const track = tracks.find((t) => String(t.languageCode || '').toLowerCase().startsWith('en')) || tracks[0];
  const separator = track.baseUrl.includes('?') ? '&' : '?';
  let captionRaw = await fetchText(`${track.baseUrl}${separator}fmt=json3`);
  let segments = [];
  try {
    segments = parseYouTubeJson3(captionRaw);
  } catch {
    captionRaw = await fetchText(track.baseUrl);
    segments = parseYouTubeXml(captionRaw);
  }
  if (!segments.length) throw new Error('Captions were found, but could not be parsed.');
  return {
    ok: true,
    sourceType: 'youtube',
    ...listeningImportStatus('transcript_only'),
    title: player?.videoDetails?.title || 'YouTube import',
    sourceUrl: inputUrl,
    audioUrl: '',
    transcript: segmentsToTranscript(segments),
    transcriptSegments: segments,
    source: {
      sourceName: 'YouTube',
      license: 'youtube_terms_personal_use',
      usage: 'personal_non_commercial_study',
      commercialUseAllowed: false,
      redistributionAllowed: false,
      attribution: inputUrl,
    },
    warnings: ['Imported captions are for personal local study. Do not redistribute unless you have rights.'],
  };
}

function titleFromHtml(html, fallback) {
  const og = html.match(/<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)["']/i);
  if (og) return decodeHtml(og[1]);
  const title = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  return title ? decodeHtml(title[1].replace(/\s*\|\s*TED.*$/i, '')) : fallback;
}

function collectTedCues(value, out = []) {
  if (!value || typeof value !== 'object') return out;
  if (Array.isArray(value)) {
    value.forEach((item) => collectTedCues(item, out));
    return out;
  }
  const text = value.text || value.content || value.subtitle || value.caption;
  const start = value.startTime ?? value.start_time ?? value.start ?? value.time ?? value.startMs;
  if (typeof text === 'string' && start !== undefined && start !== null) {
    const numeric = Number(start);
    if (Number.isFinite(numeric)) {
      out.push({
        id: `ted-${out.length + 1}`,
        start: numeric > 10000 ? numeric / 1000 : numeric,
        end: null,
        speaker: '',
        text: decodeHtml(text.replace(/<[^>]+>/g, '')),
      });
    }
  }
  Object.values(value).forEach((item) => collectTedCues(item, out));
  return out;
}

async function importTedTranscript(inputUrl) {
  const parsed = new URL(inputUrl);
  const parts = parsed.pathname.split('/').filter(Boolean);
  const talkIndex = parts.indexOf('talks');
  const slug = talkIndex >= 0 ? parts[talkIndex + 1] : '';
  const urls = [];
  if (slug) {
    urls.push(`https://www.ted.com/talks/${slug}/transcript.json?language=en`);
    urls.push(`https://www.ted.com/talks/${slug}/transcript?language=en`);
  }
  urls.push(inputUrl);

  let html = '';
  let title = 'TED import';
  for (const candidate of urls) {
    try {
      const raw = await fetchText(candidate);
      if (candidate.endsWith('.json?language=en') || raw.trim().startsWith('{')) {
        const data = JSON.parse(raw);
        let segments = collectTedCues(data);
        if (segments.length) {
          segments = segments.map((seg, i) => ({ ...seg, end: segments[i + 1]?.start ?? null }));
          return {
            ok: true,
            sourceType: 'ted',
            ...listeningImportStatus('transcript_only'),
            title: data.title || 'TED import',
            sourceUrl: inputUrl,
            audioUrl: '',
            transcript: segmentsToTranscript(segments),
            transcriptSegments: segments,
            source: {
              sourceName: 'TED',
              license: 'CC-BY-NC-ND / TED terms',
              usage: 'personal_non_commercial_study',
              commercialUseAllowed: false,
              redistributionAllowed: false,
              attribution: inputUrl,
            },
            warnings: ['TED content is non-commercial and no-derivatives. Keep imports private/local.'],
          };
        }
      }
      html = raw;
      title = titleFromHtml(html, title);
      const nextData = html.match(/<script[^>]+id=["']__NEXT_DATA__["'][^>]*>([\s\S]*?)<\/script>/i);
      if (nextData) {
        const data = JSON.parse(decodeHtml(nextData[1]));
        let segments = collectTedCues(data);
        if (segments.length) {
          segments = segments.map((seg, i) => ({ ...seg, end: segments[i + 1]?.start ?? null }));
          return {
            ok: true,
            sourceType: 'ted',
            ...listeningImportStatus('transcript_only'),
            title,
            sourceUrl: inputUrl,
            audioUrl: '',
            transcript: segmentsToTranscript(segments),
            transcriptSegments: segments,
            source: {
              sourceName: 'TED',
              license: 'CC-BY-NC-ND / TED terms',
              usage: 'personal_non_commercial_study',
              commercialUseAllowed: false,
              redistributionAllowed: false,
              attribution: inputUrl,
            },
            warnings: ['TED content is non-commercial and no-derivatives. Keep imports private/local.'],
          };
        }
      }
    } catch {
      // Try the next TED URL shape.
    }
  }
  throw new Error('Could not find a readable TED transcript. Open the TED transcript page and paste it manually.');
}

async function importListeningUrl(input) {
  let parsed;
  try { parsed = new URL(String(input || '').trim()); } catch { throw new Error('Enter a valid http(s) URL.'); }
  if (!['http:', 'https:'].includes(parsed.protocol)) throw new Error('Only http(s) URLs are supported.');
  const host = parsed.hostname.replace(/^www\./, '').toLowerCase();
  if (isDirectAudioUrl(parsed.href)) {
    return {
      ok: true,
      sourceType: 'direct_audio',
      ...listeningImportStatus('real_audio'),
      title: path.basename(parsed.pathname) || 'Direct audio import',
      sourceUrl: parsed.href,
      audioUrl: parsed.href,
      transcript: '',
      transcriptSegments: [],
      source: {
        sourceName: 'Direct audio URL',
        license: 'user_provided_personal_use',
        usage: 'personal_non_commercial_study',
        commercialUseAllowed: false,
        redistributionAllowed: false,
        attribution: parsed.href,
      },
      warnings: ['Direct audio was attached. Paste or fetch a transcript separately to generate questions.'],
    };
  }
  if (host === 'youtu.be' || host.endsWith('youtube.com')) return importYouTubeTranscript(parsed.href);
  if (host.endsWith('ted.com')) return importTedTranscript(parsed.href);
  if (host.endsWith('spotify.com')) {
    throw listeningImportError('Spotify transcripts usually require an authenticated browser session. Use the Spotify transcript downloader/extension, then paste the transcript here.');
  }
  throw listeningImportError('Unsupported source. Use YouTube captions, TED transcript pages, direct audio files, or paste the transcript manually.');
}

async function handleListeningImport(req, res) {
  try {
    if (req.method !== 'POST') {
      sendJson(res, 405, { error: 'Method not allowed' });
      return;
    }
    const raw = await readRequestBody(req);
    const body = JSON.parse(raw || '{}');
    const imported = await importListeningUrl(body.url);
    sendJson(res, 200, imported);
  } catch (error) {
    sendJson(res, error.status || 500, { ok: false, error: error.message, ...(error.importStatusCode ? listeningImportStatus(error.importStatusCode) : {}) });
  }
}

// ─── MarkItDown document-to-markdown endpoint ─────────────────────────────────
// POST /api/markitdown — body: JSON { filename: string, data: base64-string }
// Returns: JSON { markdown: string, filename: string }
// Requires the in-project markitdown-venv (run node scripts/setup-markitdown.mjs once).
// Resolved PER REQUEST (not at startup) so the venv can be created after the
// server is already running, without needing a restart.
const MARKITDOWN_SETUP_HINT = 'Create the in-project MarkItDown venv: from the project folder run  node scripts/setup-markitdown.mjs';

function resolveMarkitdownPython() {
  const candidates = [
    // IN-PROJECT first (self-contained — moves with the project): <root>/markitdown-venv
    path.join(root, 'markitdown-venv', 'Scripts', 'python.exe'), // Windows
    path.join(root, 'markitdown-venv', 'bin', 'python'),         // macOS/Linux
    // Legacy/external fallbacks
    path.join('D:', 'Downloads', 'markitdown-venv', 'Scripts', 'python.exe'),
    path.join(os.homedir(), '.venv', 'Scripts', 'python.exe'),
  ];
  return candidates.find(p => { try { return fs.existsSync(p); } catch { return false; } })
    || null;
}

function cleanMarkitdownStderr(stderr = '') {
  return String(stderr)
    .split(/\r?\n/)
    .filter(line => !/RuntimeWarning|warn\(/i.test(line))
    .join('\n')
    .trim();
}

async function runMarkItDownFile(filePath) {
  return new Promise((resolve, reject) => {
    const markitdownPython = resolveMarkitdownPython();
    if (!markitdownPython) {
      reject(new Error(`Cannot find MarkItDown Python. ${MARKITDOWN_SETUP_HINT}.`));
      return;
    }
    const proc = spawn(markitdownPython, ['-m', 'markitdown', filePath]);
    let out = '', err = '';
    proc.stdout.on('data', d => out += d.toString());
    proc.stderr.on('data', d => err += d.toString());
    proc.on('error', e => reject(new Error(`Cannot start markitdown: ${e.message}. ${MARKITDOWN_SETUP_HINT}.`)));
    proc.on('close', code => {
      if (code === 0) resolve(out);
      else {
        const cleaned = cleanMarkitdownStderr(err);
        reject(new Error(`${cleaned || `markitdown exited ${code}`}. ${MARKITDOWN_SETUP_HINT}.`));
      }
    });
  });
}

async function handleMarkItDown(req, res) {
  if (req.method !== 'POST') { sendJson(res, 405, { error: 'Method not allowed' }); return; }
  let tmpPath = null;
  try {
    const body = JSON.parse(await readRequestBody(req));
    const { filename, data } = body;
    if (!filename || !data) { sendJson(res, 400, { error: 'filename and data (base64) required' }); return; }

    // Sanitise filename: keep only the basename + extension, no path traversal.
    const safeName = path.basename(filename).replace(/[^a-zA-Z0-9._-]/g, '_');
    tmpPath = path.join(os.tmpdir(), `mid-${Date.now()}-${safeName}`);
    fs.writeFileSync(tmpPath, Buffer.from(data, 'base64'));

    const markdown = await runMarkItDownFile(tmpPath);

    sendJson(res, 200, { markdown: markdown.trim(), filename: safeName });
  } catch (error) {
    sendJson(res, 500, { error: error.message });
  } finally {
    if (tmpPath) { try { fs.unlinkSync(tmpPath); } catch {} }
  }
}
// ──────────────────────────────────────────────────────────────────────────────

// Reading source fetcher for pasted URLs that browser-side CORS cannot read.
// This intentionally stays lightweight: public http(s) only, capped body, basic robots.txt
// respect, MarkItDown when available, and no authenticated/browser automation.
const READING_SOURCE_MAX_BYTES = 2 * 1024 * 1024;
const READING_SOURCE_TEXT_LIMIT = 30000;
const READING_ROBOTS_MAX_BYTES = 256 * 1024;

function isPrivateIpAddress(value = '') {
  const host = String(value || '').replace(/^\[|\]$/g, '').toLowerCase();
  if (net.isIP(host) === 4) {
    const [a, b] = host.split('.').map(Number);
    return a === 10 || a === 127 || a === 0 ||
      (a === 172 && b >= 16 && b <= 31) ||
      (a === 192 && b === 168) ||
      (a === 169 && b === 254);
  }
  if (net.isIP(host) === 6) {
    return host === '::1' || host.startsWith('fc') || host.startsWith('fd') || host.startsWith('fe80');
  }
  return false;
}

function isBlockedReadingHost(hostname = '') {
  const host = String(hostname || '').replace(/\.$/, '').toLowerCase();
  return !host || host === 'localhost' || host.endsWith('.localhost') ||
    host.endsWith('.local') || isPrivateIpAddress(host);
}

async function assertPublicReadingUrl(target) {
  if (!['http:', 'https:'].includes(target.protocol)) throw new Error('Only http(s) URLs are supported.');
  if (isBlockedReadingHost(target.hostname)) throw new Error('Local/private network URLs are not allowed.');
  const records = await dns.lookup(target.hostname, { all: true, verbatim: true });
  if (!records.length) throw new Error('Could not resolve this URL host.');
  if (records.some(record => isPrivateIpAddress(record.address))) {
    throw new Error('This URL resolves to a local/private network address.');
  }
}

async function fetchTextCapped(url, { timeoutMs = 15000, maxBytes = READING_SOURCE_MAX_BYTES, headers = {} } = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 IELTS-Writing-Lab local source fetcher',
        'Accept-Language': 'en-US,en;q=0.9',
        ...headers,
      },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const contentType = res.headers.get('content-type') || '';
    const reader = res.body?.getReader();
    if (!reader) {
      const text = await res.text();
      if (Buffer.byteLength(text, 'utf8') > maxBytes) throw new Error(`Response exceeds ${maxBytes} bytes.`);
      return { text, contentType };
    }
    const chunks = [];
    let received = 0;
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      received += value.byteLength;
      if (received > maxBytes) throw new Error(`Response exceeds ${maxBytes} bytes.`);
      chunks.push(Buffer.from(value));
    }
    return { text: Buffer.concat(chunks).toString('utf8'), contentType };
  } finally {
    clearTimeout(timer);
  }
}

function robotsPathMatches(rulePath, targetPath) {
  if (!rulePath) return false;
  const cleanRule = rulePath.split('*')[0];
  return targetPath.startsWith(cleanRule || rulePath);
}

function robotsAllows(robotsText, target) {
  const targetPath = `${target.pathname || '/'}${target.search || ''}`;
  const rules = [];
  let applies = false;
  for (const rawLine of String(robotsText || '').split(/\r?\n/)) {
    const line = rawLine.replace(/#.*/, '').trim();
    if (!line) continue;
    const [rawKey, ...rest] = line.split(':');
    const key = rawKey.trim().toLowerCase();
    const value = rest.join(':').trim();
    if (key === 'user-agent') {
      applies = value === '*' || /ielts-writing-lab/i.test(value);
      continue;
    }
    if (!applies || (key !== 'allow' && key !== 'disallow')) continue;
    if (key === 'disallow' && value === '') continue;
    rules.push({ type: key, path: value });
  }
  const matching = rules
    .filter(rule => robotsPathMatches(rule.path, targetPath))
    .sort((a, b) => b.path.length - a.path.length);
  return matching.length ? matching[0].type !== 'disallow' : true;
}

async function readingRobotsStatus(target) {
  const robotsUrl = `${target.origin}/robots.txt`;
  try {
    const { text } = await fetchTextCapped(robotsUrl, { timeoutMs: 5000, maxBytes: READING_ROBOTS_MAX_BYTES });
    return { checked: true, allowed: robotsAllows(text, target), url: robotsUrl };
  } catch {
    return { checked: false, allowed: true, url: robotsUrl };
  }
}

function basicHtmlToReadingText(raw = '') {
  return decodeHtml(String(raw)
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<\/(p|div|section|article|h[1-6]|li|tr)>/gi, '\n')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<[^>]+>/g, ' '));
}

async function extractReadingSourceText(rawText, safeName) {
  const tmpPath = path.join(os.tmpdir(), `reading-source-${Date.now()}-${safeName}`);
  fs.writeFileSync(tmpPath, rawText, 'utf8');
  try {
    const markdown = (await runMarkItDownFile(tmpPath)).trim();
    if (markdown) return { text: markdown, extractor: 'markitdown', warnings: [] };
  } catch (error) {
    const fallback = basicHtmlToReadingText(rawText);
    return {
      text: fallback,
      extractor: 'basic-html',
      warnings: [`MarkItDown unavailable; used basic HTML text cleanup. ${error.message}`],
    };
  } finally {
    try { fs.unlinkSync(tmpPath); } catch {}
  }
  return { text: basicHtmlToReadingText(rawText), extractor: 'basic-html', warnings: ['MarkItDown returned no text; used basic HTML text cleanup.'] };
}

async function handleReadingFetchSource(req, res) {
  if (req.method !== 'POST') { sendJson(res, 405, { error: 'Method not allowed' }); return; }
  try {
    const body = JSON.parse(await readRequestBody(req) || '{}');
    const target = new URL(String(body.url || '').trim());
    await assertPublicReadingUrl(target);
    const robots = await readingRobotsStatus(target);
    if (!robots.allowed) {
      sendJson(res, 451, { ok: false, error: 'robots.txt disallows fetching this URL for automated use.', robots });
      return;
    }
    const fetched = await fetchTextCapped(target.href, {
      timeoutMs: 15000,
      maxBytes: Math.min(Number(body.maxBytes) || READING_SOURCE_MAX_BYTES, READING_SOURCE_MAX_BYTES),
      headers: { Accept: 'text/html,application/xhtml+xml,text/plain;q=0.9,*/*;q=0.5' },
    });
    if (!/(text\/html|text\/plain|application\/xhtml\+xml|application\/xml|text\/xml)/i.test(fetched.contentType)) {
      sendJson(res, 415, { ok: false, error: `Unsupported content type: ${fetched.contentType || 'unknown'}` });
      return;
    }
    const safeName = `${target.hostname}${path.extname(target.pathname) || '.html'}`.replace(/[^a-zA-Z0-9._-]/g, '_');
    const extracted = await extractReadingSourceText(fetched.text, safeName);
    const sourceText = extracted.text.replace(/\n{3,}/g, '\n\n').trim();
    sendJson(res, 200, {
      ok: true,
      sourceType: 'url',
      title: titleFromHtml(fetched.text, target.hostname),
      url: target.href,
      sourceText: sourceText.slice(0, READING_SOURCE_TEXT_LIMIT),
      sourceTextLength: sourceText.length,
      truncated: sourceText.length > READING_SOURCE_TEXT_LIMIT,
      extractor: extracted.extractor,
      robots,
      warnings: extracted.warnings,
      source: {
        sourceName: target.hostname,
        attribution: target.href,
        usage: 'personal_local_study',
        redistributionAllowed: false,
      },
    });
  } catch (error) {
    sendJson(res, 400, { ok: false, error: error.message });
  }
}

async function handleReadingBrowserUseSource(req, res) {
  if (req.method !== 'POST') { sendJson(res, 405, { error: 'Method not allowed' }); return; }
  sendJson(res, 501, {
    ok: false,
    code: 'browser_use_not_installed',
    requiresUserApproval: true,
    package: 'browser-use',
    message: 'Optional browser-use extraction is dormant. Install/use the official browser-use package only after explicit user approval.',
  });
}

async function handleAIProxy(req, res) {
  try {
    if (req.method !== 'POST') {
      sendJson(res, 405, { error: 'Method not allowed' });
      return;
    }
    const raw = await readRequestBody(req);
    const body = JSON.parse(raw || '{}');
    const target = new URL(String(body.url || ''));
    if (!['http:', 'https:'].includes(target.protocol)) throw new Error('Only http(s) provider URLs are allowed.');
    const headers = {};
    const allowed = new Set([
      'content-type',
      'authorization',
      'x-api-key',
      'anthropic-version',
      'anthropic-dangerous-direct-browser-access',
      'anthropic-beta',
      'http-referer',
      'x-title',
    ]);
    for (const [key, value] of Object.entries(body.headers || {})) {
      const lower = key.toLowerCase();
      if (allowed.has(lower)) headers[key] = String(value);
    }
    // Tie the upstream request to the browser connection: when the client aborts (timeout,
    // closed tab, cancelled test), cancel the provider request too instead of letting it run
    // to completion and silently burn the provider's quota.
    const abortCtrl = new AbortController();
    req.on('close', () => { if (!res.writableEnded) abortCtrl.abort(); });
    const upstream = await fetch(target.href, {
      method: body.method || 'POST',
      headers,
      body: typeof body.body === 'string' ? body.body : JSON.stringify(body.body || {}),
      signal: abortCtrl.signal,
    });
    const text = await upstream.text();
    res.writeHead(upstream.status, {
      'Content-Type': upstream.headers.get('content-type') || 'application/json; charset=utf-8',
    });
    res.end(text);
  } catch (error) {
    if (error && error.name === 'AbortError') { try { res.destroy(); } catch {} return; }
    sendJson(res, 500, { error: error.message });
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// DIRECT LOCAL AI BRIDGES (Antigravity & OpenCode)
// ─────────────────────────────────────────────────────────────────────────────
const AGY_CANDIDATE_PATHS = [
  path.join(process.env.LOCALAPPDATA || '', 'agy', 'bin', 'agy.exe'),
  path.join(os.homedir(), 'AppData', 'Local', 'agy', 'bin', 'agy.exe'),
  'agy',
];

const OPENCODE_CANDIDATE_PATHS = [
  path.join(process.env.APPDATA || '', 'npm', 'node_modules', 'opencode-ai', 'bin', 'opencode.exe'),
  path.join(os.homedir(), 'AppData', 'Roaming', 'npm', 'node_modules', 'opencode-ai', 'bin', 'opencode.exe'),
  path.join(process.env.APPDATA || '', 'npm', 'opencode.cmd'),
  'opencode',
];

const OPENCODE_AUTH_PATH = path.join(os.homedir(), '.local', 'share', 'opencode', 'auth.json');

function resolveExecutable(candidates) {
  for (const c of candidates) {
    if (path.isAbsolute(c) && fs.existsSync(c)) return c;
  }
  return candidates[candidates.length - 1];
}

function checkExecutableAvailable(candidates) {
  for (const c of candidates) {
    if (path.isAbsolute(c) && fs.existsSync(c)) return { available: true, path: c };
  }
  return { available: false, path: candidates[0] };
}

function formatMessagesForCLI(messages = []) {
  if (!Array.isArray(messages) || !messages.length) return '';
  const parts = [];
  const sysMsg = messages.find((m) => m && m.role === 'system');
  if (sysMsg && sysMsg.content) {
    parts.push(`[System Context]\n${String(sysMsg.content).trim()}`);
  }
  const nonSys = messages.filter((m) => m && m.role !== 'system');
  if (nonSys.length === 1 && nonSys[0].role === 'user') {
    parts.push(String(nonSys[0].content || '').trim());
  } else {
    for (const m of nonSys) {
      const roleName = m.role === 'assistant' ? 'Assistant' : 'User';
      parts.push(`${roleName}: ${String(m.content || '').trim()}`);
    }
  }
  return parts.filter(Boolean).join('\n\n').trim();
}

function callAntigravityCLI(model, prompt, { timeoutMs = 120000, signal } = {}) {
  return new Promise((resolve, reject) => {
    const agyBin = resolveExecutable(AGY_CANDIDATE_PATHS);
    const targetModel = model || 'gemini-3.8-flash-high';
    const child = spawn(agyBin, ['--model', targetModel, '--output-format', 'json'], {
      windowsHide: true,
      stdio: ['pipe', 'pipe', 'pipe'],
    });

    let stdout = '';
    let stderr = '';
    let settled = false;

    const timer = setTimeout(() => {
      if (settled) return;
      settled = true;
      try { child.kill('SIGKILL'); } catch {}
      reject(new Error(`Antigravity CLI timed out after ${Math.round(timeoutMs / 1000)}s`));
    }, timeoutMs);

    if (signal) {
      signal.addEventListener('abort', () => {
        if (settled) return;
        settled = true;
        clearTimeout(timer);
        try { child.kill('SIGKILL'); } catch {}
        reject(new Error('Aborted by client'));
      });
    }

    child.stdout.on('data', (chunk) => { stdout += chunk; });
    child.stderr.on('data', (chunk) => { stderr += chunk; });

    child.on('error', (err) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      reject(new Error(`Failed to spawn Antigravity CLI (${agyBin}): ${err.message}`));
    });

    child.on('close', (code) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);

      try {
        const parsed = JSON.parse(stdout);
        if (parsed.status === 'SUCCESS' || parsed.response) {
          resolve({
            text: String(parsed.response || '').trim(),
            usage: parsed.usage || {},
            duration: parsed.duration_seconds || 0,
            model: targetModel,
          });
          return;
        }
        if (parsed.error) {
          reject(new Error(`Antigravity error: ${parsed.error}`));
          return;
        }
      } catch {
        if (code === 0 && stdout.trim()) {
          resolve({ text: stdout.trim(), usage: {}, duration: 0, model: targetModel });
          return;
        }
      }

      reject(new Error(`Antigravity process exited with code ${code}: ${stderr.trim() || stdout.trim() || 'No output'}`));
    });

    try {
      child.stdin.write(prompt + '\n');
      child.stdin.end();
    } catch (e) {
      if (!settled) {
        settled = true;
        clearTimeout(timer);
        reject(e);
      }
    }
  });
}

async function callOpenCodeBridge(model, messages, prompt, { maxTokens = 2000, temperature = 0.7, timeoutMs = 120000, signal } = {}) {
  const targetModel = model || 'recursive/flint-v1.0:free';

  // Strategy A: If opencode serve is running on 4096, call it
  try {
    const healthRes = await fetch('http://127.0.0.1:4096/global/health', {
      signal: AbortSignal.timeout(1200),
    });
    if (healthRes.ok) {
      const sesRes = await fetch('http://127.0.0.1:4096/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: 'IELTS Lab Request',
          model: { id: targetModel, providerID: 'openrouter' },
        }),
        signal,
      });
      if (sesRes.ok) {
        const session = await sesRes.json();
        const msgRes = await fetch(`http://127.0.0.1:4096/session/${session.id}/message`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model: { providerID: 'openrouter', modelID: targetModel },
            parts: [{ type: 'text', text: prompt }],
          }),
          signal,
        });
        if (msgRes.ok) {
          const msg = await msgRes.json();
          const text = (msg.parts || [])
            .map((p) => p.text)
            .filter(Boolean)
            .join('\n')
            .trim();
          if (text) {
            return {
              text,
              model: targetModel,
              source: 'opencode-headless-server',
            };
          }
        }
      }
    }
  } catch {
    // 4096 not running; smoothly use Strategy B
  }

  // Strategy B: Use credentials from OpenCode auth file
  let opencodeKey = process.env.OPENROUTER_API_KEY;
  if (!opencodeKey && fs.existsSync(OPENCODE_AUTH_PATH)) {
    try {
      const auth = JSON.parse(fs.readFileSync(OPENCODE_AUTH_PATH, 'utf8'));
      opencodeKey = auth?.openrouter?.key || auth?.openrouter?.apiKey;
    } catch {}
  }

  if (opencodeKey) {
    const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${opencodeKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://opencode.ai/',
        'X-Title': 'opencode',
      },
      body: JSON.stringify({
        model: targetModel,
        messages: Array.isArray(messages) && messages.length ? messages : [{ role: 'user', content: prompt }],
        max_tokens: maxTokens,
        temperature,
      }),
      signal,
    });
    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`OpenCode provider error (${res.status}): ${errText.slice(0, 200)}`);
    }
    const data = await res.json();
    const content = data?.choices?.[0]?.message?.content || '';
    if (!content) throw new Error('OpenCode returned empty message');
    return {
      text: content.trim(),
      model: targetModel,
      source: 'opencode-direct-auth',
      usage: data.usage || {},
    };
  }

  throw new Error('No OpenCode authorization found in ~/.local/share/opencode/auth.json and server on port 4096 not active.');
}

async function handleLocalAIStatus(req, res) {
  if (req.method !== 'GET') { sendJson(res, 405, { error: 'Method not allowed' }); return; }
  const agyInfo = checkExecutableAvailable(AGY_CANDIDATE_PATHS);
  const opencodeInfo = checkExecutableAvailable(OPENCODE_CANDIDATE_PATHS);
  const opencodeAuthExists = fs.existsSync(OPENCODE_AUTH_PATH);

  sendJson(res, 200, {
    ok: true,
    isLocalMachine: true,
    agy: {
      available: agyInfo.available,
      path: agyInfo.path,
      defaultModel: 'gemini-3.8-flash-high',
      models: [
        { id: 'gemini-3.8-flash-high', name: 'Gemini 3.8 Flash High (Recommended)', badge: 'Fast · 1M Context · Direct' },
        { id: 'gemini-3.8-flash-medium', name: 'Gemini 3.8 Flash Medium', badge: 'Balanced' },
        { id: 'gemini-3.8-flash-low', name: 'Gemini 3.8 Flash Low', badge: 'Ultra Fast' },
        { id: 'claude-sonnet-4-6', name: 'Claude Sonnet 4.6 (Thinking)', badge: 'High Precision' },
        { id: 'claude-opus-4-6-thinking', name: 'Claude Opus 4.6 (Thinking)', badge: 'Deep Reasoning' },
        { id: 'gpt-oss-120b-medium', name: 'GPT-OSS 120B Medium', badge: 'Open Model' },
      ],
    },
    opencode: {
      available: opencodeInfo.available || opencodeAuthExists,
      path: opencodeInfo.path,
      authExists: opencodeAuthExists,
      defaultModel: 'recursive/flint-v1.0:free',
      models: [
        { id: 'recursive/flint-v1.0:free', name: 'Flint v1.0 (Free)', badge: 'Zero Cost' },
        { id: 'opencode/glm-5.3-flash-free', name: 'GLM 5.3 Flash (Free)', badge: 'Free' },
        { id: 'opencode/deepseek-v4.1-flash-free', name: 'DeepSeek V4.1 Flash (Free)', badge: 'Free' },
        { id: 'opencode/nemotron-3-ultra-free', name: 'Nemotron 3 Ultra (Free)', badge: 'Free' },
        { id: 'google/gemini-2.5-flash', name: 'Gemini 2.5 Flash', badge: 'OpenRouter Auth' },
      ],
    },
  });
}

async function handleAgyChat(req, res) {
  if (req.method !== 'POST') { sendJson(res, 405, { error: 'Method not allowed' }); return; }
  try {
    const raw = await readRequestBody(req);
    const body = JSON.parse(raw || '{}');
    const model = String(body.model || 'gemini-3.8-flash-high').replace(/^agy:/, '');
    const prompt = body.prompt || formatMessagesForCLI(body.messages);
    if (!prompt) {
      sendJson(res, 400, { error: 'No prompt or messages provided' });
      return;
    }

    const abortCtrl = new AbortController();
    req.on('close', () => { if (!res.writableEnded) abortCtrl.abort(); });

    const result = await callAntigravityCLI(model, prompt, {
      timeoutMs: Number(body.timeoutMs) || 120000,
      signal: abortCtrl.signal,
    });

    sendJson(res, 200, {
      id: `agy-${Date.now()}`,
      object: 'chat.completion',
      created: Math.floor(Date.now() / 1000),
      model: result.model,
      choices: [
        {
          index: 0,
          message: {
            role: 'assistant',
            content: result.text,
          },
          finish_reason: 'stop',
        },
      ],
      usage: result.usage,
      duration: result.duration,
    });
  } catch (error) {
    if (error && error.name === 'AbortError') { try { res.destroy(); } catch {} return; }
    sendJson(res, 500, { error: error.message });
  }
}

async function handleOpenCodeChat(req, res) {
  if (req.method !== 'POST') { sendJson(res, 405, { error: 'Method not allowed' }); return; }
  try {
    const raw = await readRequestBody(req);
    const body = JSON.parse(raw || '{}');
    const model = String(body.model || 'recursive/flint-v1.0:free').replace(/^opencode:/, '');
    const prompt = body.prompt || formatMessagesForCLI(body.messages);
    if (!prompt) {
      sendJson(res, 400, { error: 'No prompt or messages provided' });
      return;
    }

    const abortCtrl = new AbortController();
    req.on('close', () => { if (!res.writableEnded) abortCtrl.abort(); });

    const result = await callOpenCodeBridge(model, body.messages, prompt, {
      maxTokens: Number(body.max_tokens || body.maxTokens) || 2000,
      temperature: Number(body.temperature) || 0.7,
      timeoutMs: Number(body.timeoutMs) || 120000,
      signal: abortCtrl.signal,
    });

    sendJson(res, 200, {
      id: `opencode-${Date.now()}`,
      object: 'chat.completion',
      created: Math.floor(Date.now() / 1000),
      model: result.model,
      choices: [
        {
          index: 0,
          message: {
            role: 'assistant',
            content: result.text,
          },
          finish_reason: 'stop',
        },
      ],
      usage: result.usage || {},
      source: result.source,
    });
  } catch (error) {
    if (error && error.name === 'AbortError') { try { res.destroy(); } catch {} return; }
    sendJson(res, 500, { error: error.message });
  }
}

async function handleLocalAIUnified(req, res) {
  if (req.method !== 'POST') { sendJson(res, 405, { error: 'Method not allowed' }); return; }
  try {
    const raw = await readRequestBody(req);
    const body = JSON.parse(raw || '{}');
    const model = String(body.model || '').toLowerCase();
    if (model.startsWith('agy') || model.startsWith('gemini-3.8') || model.startsWith('claude-') || model.startsWith('gpt-oss')) {
      // Route to Antigravity
      const abortCtrl = new AbortController();
      req.on('close', () => { if (!res.writableEnded) abortCtrl.abort(); });
      const prompt = body.prompt || formatMessagesForCLI(body.messages);
      const cleanModel = body.model.replace(/^agy:/, '');
      const result = await callAntigravityCLI(cleanModel, prompt, {
        timeoutMs: Number(body.timeoutMs) || 120000,
        signal: abortCtrl.signal,
      });
      sendJson(res, 200, {
        id: `local-ai-${Date.now()}`,
        object: 'chat.completion',
        created: Math.floor(Date.now() / 1000),
        model: result.model,
        choices: [{ index: 0, message: { role: 'assistant', content: result.text }, finish_reason: 'stop' }],
        usage: result.usage,
      });
    } else {
      // Route to OpenCode
      const abortCtrl = new AbortController();
      req.on('close', () => { if (!res.writableEnded) abortCtrl.abort(); });
      const prompt = body.prompt || formatMessagesForCLI(body.messages);
      const cleanModel = body.model.replace(/^opencode:/, '');
      const result = await callOpenCodeBridge(cleanModel, body.messages, prompt, {
        maxTokens: Number(body.max_tokens || body.maxTokens) || 2000,
        temperature: Number(body.temperature) || 0.7,
        timeoutMs: Number(body.timeoutMs) || 120000,
        signal: abortCtrl.signal,
      });
      sendJson(res, 200, {
        id: `local-ai-${Date.now()}`,
        object: 'chat.completion',
        created: Math.floor(Date.now() / 1000),
        model: result.model,
        choices: [{ index: 0, message: { role: 'assistant', content: result.text }, finish_reason: 'stop' }],
        usage: result.usage || {},
      });
    }
  } catch (error) {
    if (error && error.name === 'AbortError') { try { res.destroy(); } catch {} return; }
    sendJson(res, 500, { error: error.message });
  }
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url || '/', `http://localhost:${port}`);

  if (url.pathname === '/api/markitdown') {
    await handleMarkItDown(req, res);
    return;
  }

  if (url.pathname === '/api/local-ai/status') {
    await handleLocalAIStatus(req, res);
    return;
  }

  if (url.pathname === '/api/agy/chat') {
    await handleAgyChat(req, res);
    return;
  }

  if (url.pathname === '/api/opencode/chat') {
    await handleOpenCodeChat(req, res);
    return;
  }

  if (url.pathname === '/api/local-ai/v1/chat/completions') {
    await handleLocalAIUnified(req, res);
    return;
  }

  if (url.pathname === '/api/ai-proxy') {
    await handleAIProxy(req, res);
    return;
  }

  if (url.pathname === '/api/listening/import-url') {
    await handleListeningImport(req, res);
    return;
  }

  if (url.pathname === '/api/reading/fetch-source') {
    await handleReadingFetchSource(req, res);
    return;
  }

  if (url.pathname === '/api/reading/browser-use-source') {
    await handleReadingBrowserUseSource(req, res);
    return;
  }

  if (url.pathname === '/api/storage') {
    try {
      if (req.method === 'GET') {
        if (!fs.existsSync(storageFile)) {
          sendJson(res, 200, { exists: false, path: 'data/app-state.json' });
          return;
        }
        const raw = fs.readFileSync(storageFile, 'utf8');
        res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(raw);
        return;
      }

      if (req.method === 'POST') {
        const raw = await readRequestBody(req);
        const data = JSON.parse(raw || '{}');
        const payload = {
          ...data,
          exists: true,
          savedAt: new Date().toISOString(),
          path: 'data/app-state.json',
        };
        fs.mkdirSync(storageDir, { recursive: true });
        const tmpFile = `${storageFile}.tmp`;
        fs.writeFileSync(tmpFile, JSON.stringify(payload, null, 2), 'utf8');
        fs.renameSync(tmpFile, storageFile);
        sendJson(res, 200, { ok: true, path: 'data/app-state.json', savedAt: payload.savedAt });
        return;
      }

      sendJson(res, 405, { error: 'Method not allowed' });
    } catch (error) {
      sendJson(res, 500, { error: error.message });
    }
    return;
  }

  let requested;
  try {
    requested = url.pathname === '/' ? '/index.html' : decodeURIComponent(url.pathname);
  } catch {
    res.writeHead(400, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Bad request');
    return;
  }
  const filePath = path.resolve(root, `.${requested}`);

  const relativePath = path.relative(root, filePath);
  if (relativePath.startsWith('..') || path.isAbsolute(relativePath)) {
    res.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Forbidden');
    return;
  }

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('Not found');
      return;
    }

    res.writeHead(200, {
      'Content-Type': mime.get(path.extname(filePath)) || 'application/octet-stream',
      // Local dev server: never serve a stale build. Force revalidation each load.
      'Cache-Control': 'no-cache, no-store, must-revalidate',
    });
    res.end(data);
  });
});

server.listen(port, () => {
  console.log(`IELTS Writing Lab running at http://localhost:${port}`);
  console.log(`Folder storage: ${storageFile}`);
});
