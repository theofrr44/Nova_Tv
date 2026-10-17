/* NOVA TV - données modifiables : applications, sites, contenus de démonstration */
window.NOVA = {
  version: '1.0',
  apps: [
    { id: 'youtube', name: 'YouTube', d: 'Lecteur intégré', c: '#E5384B', screen: 'youtube',
      icon: '<rect x="4" y="8" width="24" height="16" rx="5"/><path d="M14 12.500l6 3.500-6 3.500z" fill="currentColor"/>' },
    { id: 'spotify', name: 'Spotify', d: 'Lecteur intégré', c: '#1FB66A', screen: 'spotify',
      icon: '<circle cx="16" cy="16" r="12"/><path d="M9 12.500c5-1.500 11-1 15 1.500M10 17c4-1 8.500-.700 12 1.300M11 21.200c3-.700 6-.400 8.500.900"/>' },
    { id: 'netflix', name: 'Netflix', d: 'Films et séries', c: '#D81F26', url: 'https://www.netflix.com',
      icon: '<path d="M10 26V6l12 20V6"/>' },
    { id: 'browser', name: 'Navigateur', d: 'Sites favoris', c: '#3B82F6', screen: 'browser',
      icon: '<circle cx="16" cy="16" r="12"/><ellipse cx="16" cy="16" rx="5" ry="12"/><path d="M4 16h24"/>' },
    { id: 'media', name: 'Médias', d: 'Clé USB et démo', c: '#A855F7', screen: 'media',
      icon: '<rect x="4" y="6" width="24" height="20" rx="3"/><path d="M13 11.500l8 4.500-8 4.500z" fill="currentColor"/>' },
    { id: 'settings', name: 'Paramètres', d: 'Apparence', c: '#F59E0B', screen: 'settings',
      icon: '<path d="M5 9h22M5 16h22M5 23h22"/><circle cx="12" cy="9" r="2.500" fill="#0b1030"/><circle cx="21" cy="16" r="2.500" fill="#0b1030"/><circle cx="10" cy="23" r="2.500" fill="#0b1030"/>' }
  ],
  sites: [
    { n: 'Wikipédia', u: 'https://fr.wikipedia.org', c: '#64748B' },
    { n: 'OpenStreetMap', u: 'https://www.openstreetmap.org', c: '#16A34A' },
    { n: 'Arte', u: 'https://www.arte.tv/fr/', c: '#EA580C' },
    { n: 'Radio France', u: 'https://www.radiofrance.fr', c: '#2563EB' }
  ],
  /* Liens prédéfinis (modifiables). Ajoute { n: 'Nom', u: 'https://www.youtube.com/watch?v=...' } */
  ytApiKey: '', /* optionnel : clé gratuite YouTube Data API v3 pour les tendances et la recherche dans NOVA TV */
  youtube: [
    { n: 'Big Buck Bunny', t: 'Film libre Blender', u: 'https://www.youtube.com/watch?v=aqz-KE-bpKQ' },
    { n: 'Sintel', t: 'Film libre Blender', u: 'https://www.youtube.com/watch?v=eRsGyueVLvQ' },
    { n: 'Tears of Steel', t: 'Film libre Blender', u: 'https://www.youtube.com/watch?v=R6MlUcmOul8' }
  ],
  spotify: [
    { n: 'Top hits', u: 'https://open.spotify.com/playlist/37i9dQZF1DXcBWIGoYBM5M' },
    { n: 'Piano au calme', u: 'https://open.spotify.com/playlist/37i9dQZF1DX4sWSpwq3LiO' },
    { n: 'RapCaviar', u: 'https://open.spotify.com/playlist/37i9dQZF1DX0XUsuxWHRQd' }
  ],
  demo: [
    { t: 'Horizons de Bretagne', s: 'Documentaire, 52 min', g: ['#0f766e', '#1e3a8a'] },
    { t: 'Nuit électrique', s: 'Concert, 1 h 18', g: ['#7c3aed', '#be185d'] },
    { t: 'Sillage', s: 'Série, saison 1', g: ['#0369a1', '#0f172a'] },
    { t: 'Atelier 7', s: 'Court métrage, 14 min', g: ['#b45309', '#7f1d1d'] },
    { t: 'Marées', s: 'Playlist calme, 2 h', g: ['#047857', '#155e75'] }
  ]
};
