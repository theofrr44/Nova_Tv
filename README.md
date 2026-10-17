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

## 4. Applications

- **YouTube** : lecteur officiel intégré, sans redirection. Sélection de vidéos dans `js/data.js` (`youtube`), bouton « Ajouter un lien ». Pour les tendances et la recherche dans NOVA TV, crée une clé gratuite YouTube Data API v3, mets-la dans `ytApiKey`, et restreins-la à l'adresse de ton site dans la console Google.
- **Spotify** : lecteur officiel intégré. Extraits seulement sans compte Spotify connecté dans le navigateur.
- **Netflix** et **Site YouTube** (écran YouTube) : NOVA TV tente d'afficher le vrai site dans un cadre protégé (sandbox : pas de fenêtre ni d'application externe). Ces sites interdisent très probablement l'intégration : page vide, et rien n'y change. Tab permet d'entrer dans le site, Échap de fermer. Abonnement Netflix requis.
- **Navigateur** : sites favoris et saisie d'une adresse, dans le même onglet.
- **Médias** : « Choisir un dossier » lit les vidéos, musiques et photos d'une clé USB ou d'un dossier, sans rien envoyer sur Internet. Contenus de démonstration marqués « Démo ».
- **Paramètres** : couleur, taille du texte, animations, format de l'heure. Mémorisés dans le navigateur.

Les lecteurs sont enfermés (`sandbox`, pas d'ouverture de fenêtre) pour éviter qu'ils lancent l'application YouTube ou Spotify de l'appareil. Efficacité à vérifier sur ta box.

## 4 bis. Bibliothèque enregistrée (fichier JSON)

À chaque ajout ou suppression de lien, et à chaque dossier de médias choisi, NOVA TV enregistre la bibliothèque (liens YouTube, liens Spotify, noms des médias avec type et taille) dans un fichier `nova-tv-bibliotheque.json` sur ton PC, et la relit quand tu ouvres YouTube, Spotify ou Médias.
- Chrome ou Edge sur PC : dans Paramètres, « Fichier bibliothèque : créer » choisit l'emplacement une fois. Ensuite le même fichier est mis à jour sans nouveau téléchargement, et relu à chaque besoin (tu peux aussi le modifier à la main). À chaque nouvelle session, le navigateur demande l'autorisation d'écrire dedans (une touche ou un clic suffit à la déclencher).
- « Fichier bibliothèque : charger » rouvre un fichier existant, par exemple sur un autre appareil.
- Autres navigateurs (box de télé comprise) : le fichier est téléchargé à chaque enregistrement, et « charger » le relit manuellement. Un navigateur ne peut pas lire un fichier du PC sans ton accord à chaque session.
- Les médias locaux : seuls les noms sont enregistrés. Pour les relire, choisis à nouveau le dossier : une page web ne peut pas rouvrir un fichier de ton PC à partir d'un nom.

## 4 ter. Qualité vidéo YouTube

YouTube ne laisse plus les sites choisir la qualité : son lecteur décide selon la taille du cadre et ta connexion, et commence souvent bas. NOVA TV demande du 1080p (non garanti), agrandit le lecteur en plein écran après 5 s, et la touche F passe le navigateur en plein écran, ce qui aide beaucoup. Pour forcer une qualité, utilise le menu du lecteur (la roue dentée) avec la souris.

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
