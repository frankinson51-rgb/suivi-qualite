# Suivi Qualité — Ligne Lavage

Application de suivi des fiches de défaut/réparation, avec base de données partagée
PostgreSQL, accessible depuis plusieurs tablettes sur le réseau Wi-Fi **Technical Plastic**.

## Architecture

```
[Tablette 1] ─┐
[Tablette 2] ─┼─ Wi-Fi "Technical Plastic" ─→ [PC Windows: Node.js + PostgreSQL]
[Tablette N] ─┘
```

Le PC Windows joue le rôle de serveur central. Toutes les tablettes se connectent
à son adresse IP locale via leur navigateur. Les données sont stockées dans PostgreSQL
sur ce PC, donc toutes les fiches sont visibles par tout le monde en quasi temps réel
(rafraîchissement automatique toutes les 5 secondes).

---

## 1. Préparer le PC serveur (Windows)

Vous avez déjà installé Node.js et PostgreSQL — parfait, il reste 4 étapes.

### 1.1 Connecter le PC au Wi-Fi "Technical Plastic"

Assurez-vous que ce PC est connecté au même réseau Wi-Fi que les tablettes
(**Technical Plastic**), pas à un autre réseau ou à l'Ethernet d'un autre VLAN.

### 1.2 Créer la base de données PostgreSQL

Ouvrez **pgAdmin** (installé avec PostgreSQL) ou l'invite de commande `psql`, et créez
la base :

```sql
CREATE DATABASE suivi_qualite;
```

### 1.3 Copier le projet et configurer

1. Copiez le dossier `suivi-qualite` sur le PC (par ex. dans `C:\suivi-qualite`).
2. Dans ce dossier, copiez `.env.example` en `.env` :
   ```
   copy .env.example .env
   ```
3. Ouvrez `.env` avec le Bloc-notes et renseignez le mot de passe PostgreSQL que vous
   avez choisi à l'installation :
   ```
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=suivi_qualite
   DB_USER=postgres
   DB_PASSWORD=VOTRE_MOT_DE_PASSE
   PORT=3000
   ```

### 1.4 Installer les dépendances et créer la table

Ouvrez une invite de commande (**cmd**) dans le dossier `suivi-qualite` :

```
npm install
npm run initdb
```

Vous devriez voir : `✔ Base de données prête : la table "fiches" existe.`

### 1.5 Démarrer le serveur

```
npm start
```

Vous devriez voir :
```
✔ Serveur Suivi Qualité démarré sur le port 3000
  Accès local : http://localhost:3000
  Accès réseau (tablettes) : http://<IP-DE-CE-PC>:3000
```

Laissez cette fenêtre ouverte — c'est le serveur qui tourne. Ne la fermez pas.

---

## 2. Trouver l'adresse IP du PC sur le Wi-Fi

Dans l'invite de commande, tapez :

```
ipconfig
```

Cherchez la section **Carte réseau sans fil Wi-Fi** et notez l'**Adresse IPv4**
(par ex. `192.168.1.42`). C'est l'adresse que les tablettes utiliseront.

⚠️ Cette adresse peut changer si le PC redémarre. Pour éviter ça, réservez une IP fixe
pour ce PC dans les paramètres du routeur/point d'accès Wi-Fi (DHCP reservation), ou
configurez une IP statique dans Windows.

---

## 3. Autoriser le port dans le pare-feu Windows

Par défaut, le Pare-feu Windows bloque les connexions entrantes. Il faut l'autoriser
une fois :

1. Ouvrez **Pare-feu Windows Defender avec fonctions avancées de sécurité**.
2. **Règles de trafic entrant** → **Nouvelle règle** → **Port**.
3. TCP, port **3000** → **Autoriser la connexion** → cochez tous les profils
   (Domaine/Privé/Public, ou au minimum le profil correspondant au Wi-Fi Technical
   Plastic) → nommez-la `Suivi Qualite 3000`.

---

## 4. Se connecter depuis une tablette

1. Connectez la tablette au Wi-Fi **Technical Plastic**.
2. Ouvrez le navigateur (Chrome de préférence) et allez à :
   ```
   http://<IP-DE-CE-PC>:3000
   ```
   par exemple `http://192.168.1.42:3000`.
3. Pour un accès rapide type "application" :
   - Chrome → menu (⋮) → **Ajouter à l'écran d'accueil**.
   - L'icône s'ouvre ensuite en plein écran, sans barre d'adresse, comme une vraie app.

Faites ceci sur chaque tablette. Toutes verront et modifieront le même registre.

---

## 5. Garder le serveur actif en continu (recommandé)

Pour que le serveur tourne même si personne n'est connecté sur le PC, ou redémarre
automatiquement en cas de coupure :

1. Installez PM2 (gestionnaire de process) :
   ```
   npm install -g pm2
   npm install -g pm2-windows-startup
   pm2-startup install
   ```
2. Démarrez l'app avec PM2 au lieu de `npm start` :
   ```
   pm2 start server.js --name suivi-qualite
   pm2 save
   ```
   Le serveur redémarrera automatiquement à chaque démarrage de Windows.

---

## Dépannage

| Problème | Solution |
|---|---|
| La tablette ne charge pas la page | Vérifiez qu'elle est bien sur le Wi-Fi Technical Plastic et que l'IP du PC n'a pas changé (`ipconfig`) |
| "Impossible de joindre le serveur" dans l'app | Le serveur Node (`npm start`) n'est peut-être plus lancé sur le PC |
| Erreur de connexion à PostgreSQL au démarrage | Vérifiez le mot de passe dans `.env` et que le service PostgreSQL tourne (Services Windows → `postgresql-x64-...`) |
| Le port 3000 est déjà utilisé | Changez `PORT=3001` dans `.env` et relancez |

## Structure du projet

```
suivi-qualite/
├── server.js          # Serveur Express + API REST
├── package.json
├── .env               # Configuration (créé à partir de .env.example)
├── db/
│   ├── schema.sql     # Définition de la table PostgreSQL
│   └── init.js        # Script de création automatique de la table
└── public/
    └── index.html     # L'application (frontend) — servie par le serveur
```
