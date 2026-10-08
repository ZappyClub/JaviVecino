/* Servidor local para probar la web y el panel sin Vercel:  ADMIN_CODE=tucodigo node dev-server.mjs
   Guarda el contenido y los archivos en la carpeta .data (no se sube a GitHub). */
import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';

process.env.DEV_LOCAL = '1';
const ROOT = process.cwd();
const PORT = Number(process.env.PORT || 3000);
const TYPES = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.mjs': 'text/javascript', '.json': 'application/json', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.webp': 'image/webp', '.svg': 'image/svg+xml', '.mp3': 'audio/mpeg', '.wav': 'audio/wav', '.m4a': 'audio/mp4', '.ico': 'image/x-icon', '.txt': 'text/plain' };

async function readBody(req) { const c = []; for await (const x of req) c.push(x); return Buffer.concat(c); }

async function api(req, res, url) {
  const name = url.pathname.replace(/^\/api\//, '').replace(/\/$/, '');
  if (!/^[a-z0-9-]+$/.test(name) || name.startsWith('_')) { res.writeHead(404); return res.end('{}'); }
  let mod;
  try { mod = await import(`./api/${name}.js`); } catch (e) { res.writeHead(404); return res.end(JSON.stringify({ error: 'No existe ' + name + ': ' + e.message })); }
  const fn = mod[req.method];
  if (!fn) { res.writeHead(405); return res.end('{}'); }
  const body = ['GET', 'HEAD'].includes(req.method) ? undefined : await readBody(req);
  const request = new Request(`http://${req.headers.host}${req.url}`, { method: req.method, headers: req.headers, body });
  const r = await fn(request);
  const headers = {};
  r.headers.forEach((v, k) => { if (k !== 'set-cookie') headers[k] = v; });
  const cookies = r.headers.getSetCookie ? r.headers.getSetCookie() : [];
  if (cookies.length) headers['set-cookie'] = cookies;
  res.writeHead(r.status, headers);
  res.end(Buffer.from(await r.arrayBuffer()));
}

http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, `http://${req.headers.host}`);
    if (url.pathname.startsWith('/api/')) return await api(req, res, url);
    let p = decodeURIComponent(url.pathname);
    let base = ROOT;
    if (p === '/panel' || p === '/panel/' || p === '/admin' || p === '/admin/') p = '/admin/index.html';
    else if (p.startsWith('/uploads/')) { base = path.join(ROOT, '.data'); }
    else if (p === '/') p = '/index.html';
    const file = path.normalize(path.join(base, p));
    if (!file.startsWith(base) || file.includes(`${path.sep}.data${path.sep}content`) || file.includes('node_modules')) { res.writeHead(403); return res.end(); }
    const data = await fs.readFile(file);
    res.writeHead(200, { 'Content-Type': TYPES[path.extname(file).toLowerCase()] || 'application/octet-stream', 'Cache-Control': 'no-store' });
    res.end(data);
  } catch (e) {
    res.writeHead(e.code === 'ENOENT' ? 404 : 500); res.end(e.code === 'ENOENT' ? 'No encontrado' : 'Error');
  }
}).listen(PORT, () => console.log(`Web: http://localhost:${PORT}   Panel: http://localhost:${PORT}/panel   (código = variable ADMIN_CODE)`));
