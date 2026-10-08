# DJ Javi Vecino · web estática

Sin servidor ni base de datos. Se sube a GitHub y Vercel la publica.

## Editar textos (panel oculto)
1. Abre la web → pie de página → **Mantenimiento (Código Privado)**.
2. Código: `javivecinodj` (se cambia en `js/app.js`, constante `CODE`; si usas solo `index.html`, está dentro de ese archivo).
3. Edita textos, enlaces, mashups, agenda, packs y galería. Se guarda un borrador en tu navegador.
4. Pulsa **Descargar content.json** y súbelo a la raíz del repositorio (junto a `index.html`), sustituyendo el anterior.
5. En ~1 minuto la web muestra los cambios.

## Archivos (portadas, audios, carteles)
Súbelos a GitHub (p. ej. `assets/mashups/`) y escribe su ruta en el panel: `assets/mashups/portada.jpg`.

Importante: el código está en el HTML, así que no es seguridad real. El panel solo genera un archivo; nadie puede cambiar la web sin subir ese archivo a tu GitHub.
