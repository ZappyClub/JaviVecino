# Guía del panel de DJ Javi Vecino

El panel es una página oculta. Se entra con el botón **Mantenimiento (Código Privado)** del pie de la web (o en `tuweb.com/admin/`). No aparece en el menú ni en Google.
Funciona solo en la web publicada en Vercel (no abriendo el archivo HTML ni en una vista previa).

## Poner el panel en marcha (una sola vez, ~10 minutos)

1. **Sube la carpeta a GitHub** (descomprime el zip y sube todo su contenido a un repositorio).
2. En **vercel.com → Add New → Project**, importa ese repositorio. En *Framework Preset* deja **Other**. Pulsa **Deploy**.
3. En el proyecto de Vercel ve a **Storage → Create → Blob**. Elige acceso **Public**, ponle nombre y conéctalo al proyecto.
   (Esto crea solo la variable `BLOB_READ_WRITE_TOKEN`.)
4. Ve a **Settings → Environment Variables** y crea:
   - `ADMIN_CODE` = el código para entrar al panel.
   - (opcional) `SESSION_SECRET` = cualquier texto largo aleatorio.
5. Ve a **Deployments → … → Redeploy**. Las variables nuevas solo se aplican a un despliegue nuevo.
6. Entra desde la propia web: abajo del todo, junto a «Aviso legal» y «Política de privacidad», pulsa **Mantenimiento (Código Privado)**, escribe el código en el banner y entrarás al panel. (También puedes ir directo a `tuweb.com/admin/`.)

> **Sobre el código:** `JAVIVECINODJ` es igual que el usuario público de Instagram/TikTok, así que es fácil de adivinar.
> Recomendado algo más largo, por ejemplo `JAVIVECINODJ-2026-xK9`. El código **nunca** está en el HTML: solo en Vercel.
> Tras 6 intentos fallidos se bloquea el acceso unos minutos.

## Qué puedes hacer en el panel

| Pestaña | Qué hace |
|---|---|
| **Mashups** | Crear/editar/eliminar, subir portada y audio (hasta 150 MB), BPM, fecha, descripción, descarga, publicar/ocultar, ordenar con ↑ ↓ |
| **Agenda** | Eventos con cartel, fecha, hora, sala, ciudad, enlace de entradas. Pasan solos a «Pasadas» cuando llega la fecha |
| **Packs** | Portada, descripción, lista de tracks, descarga directa y Google Drive |
| **Contenido** | Subir varias fotos o carteles a la vez, añadir vídeos por enlace, título, tipo, orden, ocultar/eliminar |
| **Sobre mí** | Presentación, estilo, trayectoria, verbenas y salas |
| **Ajustes** | Última sesión de YouTube (portada + enlace), frase de portada, email, redes sociales (la red «Spotify» alimenta la playlist) |

- **Publicado / Borrador:** lo que está en borrador no se ve en la web.
- Las imágenes se reducen y optimizan automáticamente al subirlas.
- Si dos personas editan a la vez, el panel avisa para no pisar cambios (recarga y vuelve a guardar).
- Los cambios aparecen en la web en menos de un minuto.

## Probarlo en tu ordenador (opcional)

Necesitas Node 20+. En la carpeta del proyecto:

    ADMIN_CODE=micodigo node dev-server.mjs

Abre http://localhost:3000/panel . Lo que subas queda en la carpeta `.data` (no se sube a GitHub).

## Si algo falla

- *«El panel todavía no está configurado»* → falta `ADMIN_CODE` en Vercel (o falta redesplegar).
- *Franja roja «Falta un paso en Vercel»* → falta conectar **Blob** (paso 3) y redesplegar.
- *«No se pudo conectar con el servidor del panel»* → estás abriendo el HTML suelto o una vista previa; usa la web desplegada.
- *No sube un audio* → comprueba que pesa menos de 150 MB y que tienes conexión; también puedes pegar un enlace directo al audio.
