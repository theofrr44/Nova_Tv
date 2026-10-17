# NOVA TV 1.0

Interface Smart TV personnelle en HTML, CSS et JavaScript natif. Aucune dépendance, aucun build, aucun abonnement.

## Contenu du dossier

| Fichier | Rôle |
|---|---|
| `index.html` | Page principale |
| `css/style.css` | Apparence (couleurs dans les variables `--accent`, `--ink`) |
| `js/data.js` | Applications, playlists Spotify, vidéos YouTube, clé API : le fichier à modifier |
| `js/app.js` | Navigation, écrans, lecteurs, réglages |
| `vercel.json`, `.nojekyll` | Réglages d'hébergement Vercel et GitHub Pages |
| `nova-tv-autonome.html` | Même interface en un seul fichier (tests rapides) |

## 1. Voir le résultat sur ton PC

Attention : l'aperçu intégré de Claude bloque les liens externes (message « Ce contenu est bloqué »). Télécharge le fichier et ouvre-le dans Chrome ou Edge.

Option simple : double-clique sur `index.html` (ou `nova-tv-autonome.html`), puis F11 pour le plein écran. L'interface, les réglages, la démo et tes fichiers locaux marchent. Les lecteurs YouTube et Spotify ne démarrent pas dans ce mode.

Option complète : ouvre un terminal dans le dossier, lance `py -m http.server 8080`, puis ouvre http://localhost:8080 dans Chrome ou Edge. Tout fonctionne.

## 2. Mettre en ligne sur Vercel

Quel fichier : ni le ZIP, ni le fichier autonome. Décompresse le ZIP et utilise le contenu du dossier `nova-tv`, avec `index.html` à la racine (pas dans un sous-dossier).

Méthode A, via GitHub (sans rien installer) :
1. Crée un dépôt GitHub, puis « Add file » > « Upload files » et envoie tout le contenu du dossier (`index.html`, `css`, `js`, `vercel.json`, `.nojekyll`).
2. Sur vercel.com : « Add New » > « Project », choisis ce dépôt.
3. Framework : « Other ». Laisse vides la commande de build et le dossier de sortie. Clique sur « Deploy ».
4. Vercel te donne une adresse en https. C'est elle que tu ouvriras sur l'appareil branché à la télé.

Méthode B, avec Node.js installé : dans le dossier, lance `npx vercel`, réponds aux questions, puis `npx vercel --prod`.

Alternative GitHub Pages : même dépôt, Settings > Pages > branche principale, dossier racine.

## 3. Utilisation au clavier

- Flèches : déplacer la sélection. Entrée : ouvrir. Échap ou Retour arrière : revenir.
- Lecteur de fichiers locaux : Entrée = pause, gauche et droite = 10 s.
- YouTube : Entrée = pause, gauche et droite = vidéo précédente ou suivante.
- Spotify : Entrée = lecture ou pause (à vérifier).
- Au bout de 5 secondes de lecture, titre et barres disparaissent (grand écran). Toute touche les réaffiche.
- Suppr efface un lien ajouté.
- Volume : Page↑ / Page↓ (aussi + et −), partout, y compris pendant un média local ou une vidéo YouTube intégrée. Réglage mémorisé. Le lecteur Spotify intégré ne permet pas de régler son volume depuis NOVA TV : utilise le volume de l'appareil.
- Écran Spotify : bouton « Retour » en fin de liste. Dans les lecteurs intégrés, un bouton « Retour » est aussi affiché en haut à droite (souris), et Échap ferme au clavier.

## 4. Applications

- **YouTube** : lecteur officiel intégré, sans redirection. Sélection de vidéos dans `js/data.js` (`youtube`), bouton « Ajouter un lien ». Pour les tendances et la recherche dans NOVA TV, crée une clé gratuite YouTube Data API v3, mets-la dans `ytApiKey`, et restreins-la à l'adresse de ton site dans la console Google.
- **Spotify** : lecteur officiel intégré. Extraits seulement sans compte Spotify connecté dans le navigateur.
- **Netflix** : simple lien vers netflix.com, ouvert dans le même onglet (abonnement requis). Retour : Alt + ←.
- **YouTube TV** et **YouTube classique** : le vrai site, proposé uniquement dans NOVA TV Shell (sandbox). Dans un navigateur normal, YouTube reste dans le lecteur intégré protégé.
- **Navigateur** : sites favoris et saisie d'une adresse, dans le même onglet.
- **Médias** : « Importer un dossier » ou « Importer des fichiers » (clé USB, disque, dossier) ajoutent une collection à ta bibliothèque. Chaque import est enregistré dans le fichier JSON (noms, chemins, types, tailles) et l'accès aux fichiers est mémorisé par le navigateur. En revenant dans Médias, ou en choisissant ce JSON dans Paramètres, tes collections réapparaissent et se rouvrent d'un clic (Chrome ou Edge sur PC : une autorisation peut être redemandée). Suppr retire une collection. Contenus de démonstration marqués « Démo ».
- **Paramètres** : couleur, taille du texte, animations, format de l'heure. Mémorisés dans le navigateur.

Les lecteurs sont enfermés (`sandbox`, pas d'ouverture de fenêtre) pour éviter qu'ils lancent l'application YouTube ou Spotify de l'appareil. Efficacité à vérifier sur ta box.

## 4 bis. Bibliothèque enregistrée (fichier JSON)

À chaque ajout ou suppression de lien, et à chaque dossier de médias choisi, NOVA TV enregistre la bibliothèque (liens YouTube, liens Spotify, noms des médias avec type et taille) dans un fichier `nova-tv-bibliotheque.json` sur ton PC, et la relit quand tu ouvres YouTube, Spotify ou Médias.
- Chrome ou Edge sur PC : dans Paramètres, « Fichier bibliothèque : créer » choisit l'emplacement une fois. Ensuite le même fichier est mis à jour sans nouveau téléchargement, et relu à chaque besoin (tu peux aussi le modifier à la main). À chaque nouvelle session, le navigateur demande l'autorisation d'écrire dedans (une touche ou un clic suffit à la déclencher).
- « Fichier bibliothèque : charger » rouvre un fichier existant, par exemple sur un autre appareil.
- Autres navigateurs (box de télé comprise) : le fichier est téléchargé à chaque enregistrement, et « charger » le relit manuellement. Un navigateur ne peut pas lire un fichier du PC sans ton accord à chaque session.
- Médias : le JSON contient la liste, pas les fichiers eux-mêmes. L'accès aux fichiers est gardé par le navigateur pour une même adresse (`localhost:8080`, Vercel et le Shell sont trois adresses différentes). Sur un autre appareil, navigateur ou adresse, la liste réapparaît mais il faut relier les fichiers en appuyant sur l'un d'eux. Firefox et la plupart des navigateurs de box ne peuvent pas rouvrir les fichiers sans que tu les rechoisisses. Les anciens JSON, où les médias n'avaient pas d'identifiant, sont ignorés pour cette partie.

## 4 ter. Qualité vidéo YouTube

YouTube ne laisse plus les sites choisir la qualité : son lecteur décide selon la taille du cadre et ta connexion, et commence souvent bas. NOVA TV demande du 1080p (non garanti), agrandit le lecteur en plein écran après 5 s, et la touche F passe le navigateur en plein écran, ce qui aide beaucoup. Pour forcer une qualité, utilise le menu du lecteur (la roue dentée) avec la souris.

## 4 quater. Vrais sites (YouTube, Netflix, Spotify) et NOVA TV Shell

Un vrai site ne peut pas être affiché à l'intérieur de NOVA TV : YouTube, Netflix et Spotify interdisent leur intégration dans une page, et la sandbox ne change rien (elle limite ce que le site peut faire, elle ne lève pas ce refus). Je n'ai pas fait de passerelle qui retire ces protections : elle ferait passer tes identifiants par un serveur tiers et enfreint les conditions de ces services.

Ce qui marche :
- **Chrome ou Edge** : Netflix s'ouvre en simple lien dans le même onglet, avec la pleine qualité et le DRM. Retour : Alt + ←, ou mets NOVA TV en page d'accueil du navigateur et utilise Alt + Origine. YouTube reste dans le lecteur intégré (sandbox).
- **NOVA TV Shell** (dossier `shell/`) : petite application Electron avec sandbox obligatoire. Elle ouvre NOVA TV en plein écran, bloque les nouvelles fenêtres et tout lancement d'application externe, et affiche le vrai site dans la même fenêtre. Touche Origine ou F1 : retour à NOVA TV. Alt + F4 : quitter.
  1. Installe Node.js, puis dans le dossier `shell` : `npm install electron --save-dev`
  2. Lance `npm start`. Pour utiliser ton adresse Vercel : `set NOVA_URL=https://ton-adresse.vercel.app` avant `npm start` (Windows).
  3. Limite : Electron standard n'a pas Widevine, donc Netflix et le site complet de Spotify risquent de ne pas lire. YouTube fonctionne. À vérifier sur ton PC.
- Sur Fire TV ou Android TV, le Shell ne s'installe pas (c'est une application de PC, Mac ou Linux, dont Raspberry Pi). Là, le blocage du lancement d'applications dépend du navigateur de la box : à vérifier.

## 4 quinquies. Compte YouTube et reconnexion automatique (NOVA TV Shell)

Dans le Shell, l'écran YouTube propose YouTube TV (accueil), YouTube classique (accueil) et Mon compte. Raccourcis au clavier, partout dans le Shell : F2 = accueil YouTube TV, F3 = page du compte, Origine ou F1 = retour à NOVA TV.
- **Lancer** : double-clic sur `lancer-nova-tv.bat` (installe Electron au premier lancement, Node.js requis).
- **Se connecter** : ouvre YouTube TV et choisis « Se connecter ». Utilise de préférence le code à saisir sur youtube.com/activate depuis ton téléphone ou ton PC : ton mot de passe n'est alors jamais tapé dans le Shell. Google peut refuser une connexion par mot de passe dans une application (« navigateur non sécurisé ») : je n'ai pas contourné ce contrôle. À vérifier chez toi.
- **Reconnexion automatique** : la connexion est enregistrée sur le disque dans le dossier de données du Shell (stockage `persist:nova`) et rechargée à chaque lancement. NOVA TV ne stocke jamais de mot de passe. Les réglages de NOVA TV sont aussi conservés, car le Shell utilise toujours la même adresse locale (port 47831).
- **Se déconnecter** : depuis le menu du compte YouTube, ou en supprimant le dossier de données du Shell. Toute personne qui utilise ta session Windows peut utiliser ta connexion.
- **Démarrer avec Windows** : touches Windows + R, tape `shell:startup`, et place-y un raccourci vers `lancer-nova-tv.bat`.
- Dans un navigateur normal, le vrai site YouTube n'est pas proposé (aucune sandbox possible) : YouTube reste dans le lecteur intégré, sans compte.

## 5. Hors ligne ou Internet

- Hors ligne : interface, horloge, réglages, démo, fichiers locaux.
- Nécessite Internet : YouTube, Spotify, Netflix, sites du Navigateur, vignettes YouTube. Hors ligne, un message s'affiche et la démo prend le relais.

## 6. Ta LG 32LS5600 : ce qui est réel

1. La télé seule ne peut pas exécuter NOVA TV : modèle non connecté, sans navigateur. Son lecteur USB lit seulement des fichiers multimédias. Aucune preuve qu'une clé USB puisse y démarrer un système.
2. L'EZCast M2 est un récepteur de cast : il affiche ce qu'un PC ou un téléphone lui envoie. À ma connaissance, il n'a pas de navigateur pour NOVA TV. Je ne recommande pas de modifier son firmware (version 17957001) ni celui de la télé : risque de les rendre inutilisables.
3. Pour te passer du PC, il faut un appareil branché en HDMI qui ouvre l'adresse Vercel de NOVA TV en plein écran :
   - Fire TV Stick ou box Android TV avec navigateur (le plus simple).
   - Chromecast avec Google TV, seulement avec un navigateur installé.
   - Raspberry Pi ou mini-PC avec Chromium en mode kiosque (le plus durable).
4. Sans cet appareil : câble HDMI du PC vers la télé, ou recopie d'écran EZCast (à tester, ce n'est pas du Miracast).
5. Sur une télécommande, la saisie de texte (« Ajouter un lien », recherche) est pénible : ajoute plutôt les liens dans `js/data.js`.
6. Le code est du web standard : réutilisable plus tard sur Android TV, une WebView ou une appli webOS ou Tizen. Les touches Retour LG (461) et Samsung (10009) sont déjà gérées.

## 7. Limites connues

- Les sites complets YouTube, Spotify et Netflix ne peuvent pas s'afficher dans NOVA TV : seuls les lecteurs intégrables officiels le peuvent.
- Les liens ajoutés sont mémorisés par navigateur, pas partagés entre appareils.
- Je n'ai pas pu tester les lecteurs avec ton matériel : vérifie surtout le lancement d'applications sur ta box et la commande de pause Spotify.
