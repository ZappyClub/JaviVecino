import { handleUpload } from '@vercel/blob/client';
import { mode } from './_store.js';
import { guard, json } from './_lib.js';

/* POST /api/upload  -> token para subir audio grande directamente a Vercel Blob (solo con sesión del panel) */
export async function POST(request) {
  if (mode() !== 'blob') return json({ error: 'No disponible' }, 404);
  try {
    const body = await request.json();
    const res = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async () => {
        if (!guard(request)) throw new Error('No autorizado');
        return {
          allowedContentTypes: ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/x-wav', 'audio/mp4', 'audio/x-m4a', 'audio/aac', 'audio/ogg', 'audio/flac'],
          maximumSizeInBytes: 150 * 1024 * 1024,
          addRandomSuffix: true
        };
      },
      onUploadCompleted: async () => {}
    });
    return Response.json(res);
  } catch (e) {
    return Response.json({ error: e.message }, { status: 400 });
  }
}
