# Suivi Qualité — Ligne Lavage (hébergement cloud)

Ce guide déploie l'application dans le cloud (sur **Render**, gratuit pour ce
volume d'usage) : plus besoin de garder un PC allumé en permanence. Le serveur
et la base de données tournent 24/7 chez Render ; les tablettes s'y connectent
via une adresse internet (https://...), du moment qu'elles ont du Wi-Fi/internet
(Technical Plastic ou tout autre réseau avec accès internet).

On utilise **Render** ici parce que sa mise en place ne demande aucune ligne de
commande (tout se fait dans le navigateur). Railway ou Supabase fonctionnent
aussi avec ce même projet si vous préférez.

---

## Vue d'ensemble

```
[Tablette 1] ─┐
[Tablette 2] ─┼─ Internet (Wi-Fi Technical Plastic) ─→ [Render : App Node.js + PostgreSQL]
[Tablette N] ─┘
```

Il n'y a plus de PC "serveur" à garder allumé — Render héberge tout en continu.

---

## Étape 1 — Mettre le code sur GitHub (sans ligne de commande)

Render déploie à partir d'un dépôt GitHub. On peut y déposer les fichiers
directement depuis le navigateur, sans installer Git.

1. Créez un compte gratuit sur [github.com](https://github.com) si vous n'en avez pas.
2. Cliquez sur **New repository** → nommez-le `suivi-qualite` → **Create repository**.
3. Sur la page du dépôt vide, cliquez **uploading an existing file**.
4. Glissez-déposez tous les fichiers/dossiers de ce projet (`server.js`,
   `package.json`, `db/`, `public/`, etc. — pas besoin du `.env`) puis
   **Commit changes**.

---

## Étape 2 — Créer la base de données PostgreSQL sur Render

1. Créez un compte sur [render.com](https://render.com) (gratuit, connexion possible
   directement avec votre compte GitHub).
2. **New +** → **PostgreSQL**.
3. Donnez un nom (`suivi-qualite-db`), choisissez la région la plus proche
   (Frankfurt pour le Maroc en général), plan **Free**.
4. Une fois créée, ouvrez la base et copiez la valeur **Internal Database URL**
   (ressemble à `postgresql://user:pass@host/dbname`). Gardez-la de côté.

---

## Étape 3 — Créer le service web (l'application)

1. Sur Render : **New +** → **Web Service**.
2. Connectez votre compte GitHub et sélectionnez le dépôt `suivi-qualite`.
3. Configurez :
   - **Name** : `suivi-qualite`
   - **Region** : la même que la base de données
   - **Build Command** : `npm install`
   - **Start Command** : `node server.js`
   - **Plan** : Free
4. Dans **Environment Variables**, ajoutez :
   - `DATABASE_URL` = (collez l'Internal Database URL de l'étape 2)
5. Cliquez **Create Web Service**. Render installe, construit la table
   automatiquement au démarrage, et déploie.

Au bout de quelques minutes, Render affiche une URL du type :

```
https://suivi-qualite.onrender.com
```

C'est l'adresse que toutes les tablettes utiliseront.

---

## Étape 4 — Se connecter depuis une tablette

1. Connectez la tablette à un Wi-Fi avec accès internet (Technical Plastic ou autre).
2. Ouvrez Chrome et allez sur votre URL Render (ex :
   `https://suivi-qualite.onrender.com`).
3. Pour un accès rapide : menu (⋮) → **Ajouter à l'écran d'accueil** — l'icône
   s'ouvre ensuite en plein écran comme une vraie application.

Faites cela sur chaque tablette : toutes partagent le même registre en direct.

---

## À savoir sur le plan gratuit Render

- Le service gratuit **se met en veille après 15 minutes d'inactivité** et met
  ~30-50 secondes à se "réveiller" au premier accès après une pause. Si ça gêne
  l'usage en atelier (premier chargement lent le matin), un plan payant à
  partir de ~7$/mois élimine cette veille — à voir selon votre budget.
- La base PostgreSQL gratuite Render expire au bout de 30 jours (limite du
  plan gratuit) et doit être recréée/migrée. Pour un usage de production
  durable, il vaut mieux passer sur un plan payant de base de données dès que
  possible (quelques dollars/mois), pour ne pas perdre les fiches enregistrées.
- Alternative sans expiration de base de données : **Supabase** (PostgreSQL
  gratuit sans limite de 30 jours) pour la base + Render (ou Railway) pour le
  serveur Node — dites-moi si vous préférez cette combinaison, je peux adapter
  les instructions.

---

## Mettre à jour l'application plus tard

Si vous modifiez le code (ex: ajouter un champ), re-téléversez les fichiers
modifiés sur GitHub (même méthode glisser-déposer) — Render redéploie
automatiquement à chaque mise à jour du dépôt.

---

## Dépannage

| Problème | Solution |
|---|---|
| Le premier chargement de la journée est très lent | Normal sur le plan gratuit (le service "dort") — voir plus haut |
| "Impossible de joindre le serveur" | Vérifiez que le service est bien "Live" dans le tableau de bord Render (pas "Failed") |
| Erreur de connexion à la base au démarrage | Vérifiez que `DATABASE_URL` est bien collée dans les variables d'environnement du Web Service |
| Les fiches ont disparu après ~30 jours | La base gratuite Render a expiré — passez sur un plan payant ou migrez vers Supabase |

---

## Structure du projet

```
suivi-qualite/
├── server.js          # Serveur Express + API REST (auto-crée la table au démarrage)
├── package.json
├── .env.example        # Modèle de configuration (utilisé seulement en local)
├── db/
│   ├── schema.sql      # Définition de la table PostgreSQL
│   └── init.js         # Script de création manuelle de la table (usage local uniquement)
└── public/
    └── index.html      # L'application (frontend) — servie par le serveur
```

## Utiliser un PC local à la place (sans internet)

Si vous changez d'avis et préférez un PC dédié sur le réseau local sans
dépendre d'internet, voir `README-LOCAL.md` — il contient les instructions
Windows + PostgreSQL local + pare-feu, avec la même base de code.
