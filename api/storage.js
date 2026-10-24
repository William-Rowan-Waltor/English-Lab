// api/storage.js — High-Performance Vercel Serverless Endpoint for User Dataset Persistence
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');
const crypto = require('crypto');

const TMP_FILE = path.join('/tmp', 'app-state.json');
const ROOT_FILE = path.join(process.cwd(), 'data', 'app-state.json');

function sendOptimized(req, res, raw) {
  const hash = crypto.createHash('md5').update(raw).digest('hex');
  res.setHeader('ETag', `"${hash}"`);
  if (req.headers['if-none-match'] === `"${hash}"`) {
    return res.status(304).end();
  }

  const acceptEncoding = req.headers['accept-encoding'] || '';
  if (acceptEncoding.includes('gzip')) {
    const compressed = zlib.gzipSync(raw);
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.setHeader('Content-Encoding', 'gzip');
    return res.status(200).send(compressed);
  }

  return res.status(200).setHeader('Content-Type', 'application/json; charset=utf-8').send(raw);
}

module.exports = async (req, res) => {
  // CORS & Cache control
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, If-None-Match');
  res.setHeader('Cache-Control', 'private, no-cache');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // ─── GET /api/storage ────────────────────────────────────────────────────────
  if (req.method === 'GET') {
    try {
      // 1. Check warm container /tmp first (has latest writes)
      if (fs.existsSync(TMP_FILE)) {
        const raw = fs.readFileSync(TMP_FILE, 'utf8');
        return sendOptimized(req, res, raw);
      }

      // 2. Check Vercel KV / Upstash if configured
      if (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
        try {
          const kvRes = await fetch(`${process.env.KV_REST_API_URL}/get/app-state`, {
            headers: { Authorization: `Bearer ${process.env.KV_REST_API_TOKEN}` }
          });
          const kvData = await kvRes.json();
          if (kvData && kvData.result) {
            const raw = typeof kvData.result === 'string' ? kvData.result : JSON.stringify(kvData.result);
            return sendOptimized(req, res, raw);
          }
        } catch (kvErr) {
          console.warn('Vercel KV get error:', kvErr);
        }
      }

      // 3. Check bundled repo file data/app-state.json
      if (fs.existsSync(ROOT_FILE)) {
        const raw = fs.readFileSync(ROOT_FILE, 'utf8');
        return sendOptimized(req, res, raw);
      }

      return res.status(200).json({ exists: false, path: 'data/app-state.json' });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  // ─── POST /api/storage ───────────────────────────────────────────────────────
  if (req.method === 'POST') {
    try {
      let data = req.body;
      if (typeof data === 'string') {
        try { data = JSON.parse(data); } catch {}
      }

      const payload = {
        ...(data || {}),
        exists: true,
        savedAt: new Date().toISOString(),
        path: 'data/app-state.json'
      };
      const jsonStr = JSON.stringify(payload, null, 2);

      // 1. Always cache in /tmp for warm container requests
      try {
        fs.writeFileSync(TMP_FILE, jsonStr, 'utf8');
      } catch (tmpErr) {
        console.warn('Could not write /tmp:', tmpErr);
      }

      // 2. Persist to Vercel KV if configured
      if (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
        try {
          await fetch(`${process.env.KV_REST_API_URL}/set/app-state`, {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${process.env.KV_REST_API_TOKEN}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(jsonStr)
          });
        } catch (kvErr) {
          console.warn('Vercel KV set error:', kvErr);
        }
      }

      // 3. Persist back to GitHub repository if GITHUB_TOKEN is available
      const ghToken = process.env.GITHUB_TOKEN || process.env.GH_TOKEN;
      const ghRepo = process.env.GITHUB_REPO || 'William-Rowan-Waltor/English-Lab';
      if (ghToken && ghRepo) {
        try {
          const fileUrl = `https://api.github.com/repos/${ghRepo}/contents/data/app-state.json`;
          const getRes = await fetch(fileUrl, {
            headers: {
              Authorization: `Bearer ${ghToken}`,
              'User-Agent': 'English-Lab-Storage-Worker',
              Accept: 'application/vnd.github.v3+json'
            }
          });
          let sha = null;
          if (getRes.ok) {
            const fileData = await getRes.json();
            sha = fileData.sha;
          }

          const contentBase64 = Buffer.from(jsonStr, 'utf8').toString('base64');
          const commitRes = await fetch(fileUrl, {
            method: 'PUT',
            headers: {
              Authorization: `Bearer ${ghToken}`,
              'User-Agent': 'English-Lab-Storage-Worker',
              'Content-Type': 'application/json',
              Accept: 'application/vnd.github.v3+json'
            },
            body: JSON.stringify({
              message: `chore(data): auto-sync user state [skip ci]`,
              content: contentBase64,
              sha: sha || undefined,
              branch: 'main'
            })
          });

          if (!commitRes.ok) {
            const errBody = await commitRes.text();
            console.warn('GitHub sync failed:', errBody);
          }
        } catch (ghErr) {
          console.warn('GitHub persist error:', ghErr);
        }
      }

      return res.status(200).json({ ok: true, savedAt: payload.savedAt });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
};
