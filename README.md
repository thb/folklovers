# Folklovers 🎸

Site communautaire de classement des meilleures interprétations de chansons folk.

## Vision

Folklovers est une plateforme où les passionnés de musique folk peuvent découvrir, partager et voter pour les meilleures interprétations de chansons folk classiques et contemporaines.

### Inspiration Design

Le design s'inspire de l'atmosphère vintage du **Gaslight Cafe** à Greenwich Village, New York, dans les années 60 — l'époque où Bob Dylan, Dave Van Ronk et d'autres légendes folk ont façonné le son d'une génération. Pensez à l'ambiance du film *Inside Llewyn Davis* des frères Coen : chaleureux, authentique, un peu usé par le temps.

**Éléments visuels clés :**
- Palette de couleurs chaudes : sépia, brun, crème, ocre
- Typographies rétro évoquant les affiches de concerts des années 60
- Textures rappelant le bois, le papier vieilli, les pochettes de vinyles
- Illustrations ou icônes style woodcut/linogravure

## Fonctionnalités

### Utilisateurs
- Inscription / Connexion
- Voter (+1 / -1) sur les interprétations
- Commenter les interprétations
- Suggérer de nouvelles chansons
- Suggérer de nouvelles interprétations

### Page d'accueil
- **Top chansons** : les chansons avec le plus de votes positifs
- **Top interprétations** : les interprétations les plus votées tous titres confondus
- Navigation vers les catégories/époques

### Page Chanson
1. **Section originale** : vidéo YouTube de la chanson originale (ou version de référence)
2. **Liste des interprétations** : classées par score de votes (style Stack Overflow)
   - Chaque interprétation affiche :
     - Vidéo YouTube embed
     - Texte explicatif : "Pourquoi cette interprétation ?"
     - Boutons de vote +1 / -1
     - Score total
     - Nombre de commentaires
3. **Section commentaires** pour chaque interprétation

### UX Spécificités
- Inspiration Stack Overflow pour le système de vote et le classement
- Mise en valeur des vidéos YouTube (player visible, pas juste un lien)
- Espace pour les textes explicatifs accompagnant chaque interprétation
- Interface responsive privilégiant la lisibilité sur mobile

## Stack Technique

### Backend — Ruby on Rails (API mode)

**Base**
- PostgreSQL
- API RESTful JSON

**Authentification**
- JWT (JSON Web Tokens)
- Email / Password
- Google OAuth 2.0

**Gems principales**
| Gem | Usage |
|-----|-------|
| `jwt` | Génération et validation des tokens |
| `omniauth-google-oauth2` | Connexion via Google |
| `bcrypt` | Hash des mots de passe |
| `pagy` | Pagination performante |
| `has_scope` | Filtrage des requêtes via query params |
| `blueprinter` | Sérialisation JSON des modèles |

### Frontend — TanStack Start

**Core**
- TanStack Start (React + SSR)
- TanStack Router
- Server Actions pour les mutations

**UI**
- shadcn/ui (composants accessibles et customisables)
- Tailwind CSS avec thème vintage custom

### Intégrations
- **YouTube Data API** : métadonnées des vidéos (titre, thumbnail, durée)
- **YouTube IFrame API** : embed des players

## Modèle de Données (simplifié)

```
User
├── id
├── email
├── username
├── password_digest
└── created_at

Song
├── id
├── title
├── artist (artiste original)
├── year
├── youtube_url (version originale/référence)
├── description
├── votes_count (cached)
└── created_at

Interpretation
├── id
├── song_id (FK)
├── artist
├── youtube_url
├── description ("Pourquoi cette interprétation")
├── submitted_by_user_id (FK)
├── votes_score (cached, somme des +1/-1)
└── created_at

Vote
├── id
├── user_id (FK)
├── votable_type (Song ou Interpretation)
├── votable_id
├── value (+1 ou -1)
└── created_at

Comment
├── id
├── user_id (FK)
├── interpretation_id (FK)
├── content
└── created_at
```

## Structure du Projet

```
folklovers/
├── backend/          # Ruby on Rails API
│   ├── app/
│   ├── config/
│   ├── db/
│   └── ...
├── frontend/         # TanStack Start app
│   ├── src/
│   │   ├── routes/
│   │   ├── components/
│   │   └── ...
│   └── ...
└── README.md
```

## Développement

### Prérequis
- Ruby 3.2+
- Node.js 20+
- PostgreSQL 15+

### Installation

```bash
# Backend
cd backend
bundle install
rails db:setup

# Frontend
cd frontend
npm install
```

### Lancer le projet

```bash
# Terminal 1 - Backend
cd backend
rails server -p 3001

# Terminal 2 - Frontend
cd frontend
npm run dev
```

## Pages Principales

| Route | Description |
|-------|-------------|
| `/` | Page d'accueil avec top chansons et top interprétations |
| `/songs/:id` | Page d'une chanson avec ses interprétations |
| `/songs/:id/interpretations/new` | Suggérer une nouvelle interprétation |
| `/songs/new` | Suggérer une nouvelle chanson |
| `/login` | Connexion |
| `/register` | Inscription |
| `/profile` | Profil utilisateur |

## Contribution

Les suggestions de chansons et d'interprétations soumises par les utilisateurs passent par une modération avant publication.

---

*"I hate a song that makes you think that you are not any good. I hate a song that makes you think that you are just born to lose."* — Woody Guthrie
