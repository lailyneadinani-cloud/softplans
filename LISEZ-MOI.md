# Soft Plans sur GitHub : mode d'emploi

Ce dossier contient tout le site. Il se met en ligne gratuitement avec **GitHub Pages**, et les comptes et les données passent par **Firebase** (gratuit pour deux personnes). Compte une demi-heure, une seule fois.

Contenu du dossier :
- `index.html` : l'application
- `firebase-shim.js` : branche l'application sur Firebase (ne pas modifier)
- `firebase-config.js` : **à remplir** (étape 3)
- `firestore.rules` : règles de sécurité, **à adapter** (étape 4)

---

## 1. Créer le projet Firebase
1. Va sur https://console.firebase.google.com et connecte-toi avec ton compte Google.
2. **Ajouter un projet** → nom : `soft-plans` → tu peux désactiver Google Analytics → **Créer**.

## 2. Activer la connexion Google et la base de données
1. Menu **Authentication** → **Commencer** → onglet **Sign-in method** → **Google** → Activer → choisis ton adresse e-mail d'assistance → **Enregistrer**.
2. Menu **Firestore Database** → **Créer une base de données** → emplacement `eur3 (europe-west)` → **mode production** → **Créer**.

## 3. Récupérer la configuration
1. Roue crantée ⚙ → **Paramètres du projet** → en bas, **Tes applications** → icône web `</>` → nom `soft-plans` → **Enregistrer l'application**.
2. Copie le bloc `firebaseConfig` affiché.
3. Ouvre `firebase-config.js` et remplace chaque `COLLE_ICI…` par tes valeurs. Ces valeurs ne sont pas secrètes : c'est normal qu'elles soient visibles sur le site.

## 4. Verrouiller le site à vous deux
1. Ouvre `firestore.rules` et remplace `TON.ADRESSE@gmail.com` et `ADRESSE.DE.TON.AMIE@gmail.com` par vos deux adresses Google (celles avec lesquelles vous vous connecterez, en minuscules).
2. Dans Firebase : **Firestore Database** → onglet **Règles** → efface tout, colle le contenu de `firestore.rules` → **Publier**.

Ces règles garantissent que :
- seules vos deux adresses peuvent lire ou écrire quoi que ce soit ;
- ton espace personnel n'est lisible que par toi (ton amie ne peut pas le lire, même en bidouillant) ;
- vous ne pouvez être que deux dans le duo.

## 5. Mettre le site en ligne sur GitHub
1. Sur https://github.com : **New repository** → nom `soft-plans` → **Public** (GitHub Pages gratuit) → **Create**.
2. **Add file → Upload files** : glisse tous les fichiers du dossier, **y compris `.nojekyll`** s'il est visible → **Commit**.
3. **Settings → Pages** → Source : **Deploy from a branch** → branche `main`, dossier `/ (root)` → **Save**.
4. Après 1 à 2 minutes, GitHub affiche l'adresse : `https://TON-PSEUDO.github.io/soft-plans/`.

## 6. Autoriser l'adresse dans Firebase
Firebase → **Authentication** → **Settings** → **Authorized domains** → **Ajouter un domaine** → `TON-PSEUDO.github.io`.

## 7. Premier lancement
1. Ouvre l'adresse du site → **Se connecter avec Google** → écris ton prénom → **Entrer dans notre espace**.
2. Envoie l'adresse à ton amie : elle se connecte avec son compte Google, écrit son prénom et entre à son tour.

---

## Bon à savoir
- **Gratuit** : l'offre gratuite de Firebase est très largement suffisante pour deux personnes.
- **Mood board** : les images sont compressées avant d'être enregistrées ; garde un nombre raisonnable de photos.
- **Adresse à vous** (ex. softplans.fr) : possible plus tard, dans Settings → Pages → Custom domain. Pense alors à l'ajouter dans les « Authorized domains » de Firebase.
- **Rien n'est repris depuis la version Claude** : la version GitHub démarre avec une base vide.
- **Un souci ?** Si le site affiche « Cette adresse Google n'est pas autorisée », vérifie l'orthographe des adresses dans les règles (étape 4). Si « L'appli n'est pas encore configurée » s'affiche, `firebase-config.js` n'est pas rempli (étape 3).
