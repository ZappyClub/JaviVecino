/* Contenido inicial de la web (se usa hasta que se guarde algo desde el panel).
   Solo datos reales aportados por el artista. */
export default {
  version: 1,
  updatedAt: '',
  artist: {
    tagline: '',
    email: '',
    social: [
      ['Instagram', 'https://www.instagram.com/javivecinodj/'],
      ['TikTok', 'https://www.tiktok.com/@javivecinodj'],
      ['YouTube', 'https://www.youtube.com/@JAVIVECINODJ'],
      ['SoundCloud', 'https://soundcloud.com/carmen-vecino-castro'],
      ['Spotify', 'https://open.spotify.com/playlist/0TYhUZ8pQ8tR4TBIHhOgyn?si=f2bcc556f8094f40&nd=1&dlsi=42c86d6097084445']
    ]
  },
  about: {
    intro: 'Me llamo Javi Vecino y soy DJ y productor de A Coruña. Llevo 4 años de experiencia en esta profesión, con muchas ganas de seguir cumpliendo un sueño.',
    estilo: 'Busco crear experiencias sonoras que conecten con el público y mantengan la pista en movimiento de principio a fin.',
    trayectoria: 'He participado en eventos locales y showcases privados, consolidando mi presencia dentro de la escena de A Coruña.',
    residencia: 'Residencia actual en Discoteca Iris (Betanzos). Residencias anteriores en Melide, Carballo y Laracha.',
    verbenas: ['Larin', 'Laracha', 'Arteixo', 'Chamin', 'Melide', 'Carballo', 'Golmar', 'Coruña'],
    salas: [['Discoteca Iris', 'Betanzos'], ['Goat', 'Carballo'], ['A2', 'Laracha'], ['Discoteca Pazos', 'Laracha'], ['Iceberg', 'Melide'], ['Nexus', 'Melide'], ['LaCalle', 'Laracha'], ['Oceanico', 'Coruña'], ['LaCalle', 'Coruña'], ['Gymare', 'Noia']]
  },
  session: { title: 'Bad Bunny Mix · Sesión', url: 'https://www.youtube.com/watch?v=1N5DyPYPGI0', cover: 'assets/img/sesion-yt-1280.jpg' },
  mashups: [],
  events: [],
  packs: [],
  gallery: [
    { id: 'foto-directo', type: 'foto', title: 'En directo', src: 'assets/img/directo-1280.jpg', url: '', published: true },
    { id: 'foto-pantalla-1', type: 'foto', title: 'Frente a la pantalla', src: 'assets/img/pantalla-1-1000.jpg', url: '', published: true },
    { id: 'foto-retrato-bn', type: 'foto', title: 'Retrato en blanco y negro', src: 'assets/img/bn-1000.jpg', url: '', published: true },
    { id: 'foto-cabina', type: 'foto', title: 'Desde la cabina', src: 'assets/img/cabina-1000.jpg', url: '', published: true },
    { id: 'foto-pantalla-2', type: 'foto', title: 'Saludando al público', src: 'assets/img/pantalla-2-1000.jpg', url: '', published: true }
  ]
};
