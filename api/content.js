import { readContent } from './_store.js';
import { publicView } from './_schema.js';
import { isAuthed, json } from './_lib.js';

/* GET /api/content           -> contenido público (solo lo publicado)
   GET /api/content?admin=1   -> todo el contenido (requiere sesión del panel) */
export async function GET(request) {
  try {
    const content = await readContent();
    if (new URL(request.url).searchParams.get('admin') === '1') {
      if (!isAuthed(request)) return json({ error: 'No autorizado' }, 401);
      return json({ content });
    }
    return Response.json({ content: publicView(content) }, { headers: { 'Cache-Control': 'public, s-maxage=15, stale-while-revalidate=60' } });
  } catch (e) {
    return json({ error: 'No se pudo leer el contenido' }, 500);
  }
}
