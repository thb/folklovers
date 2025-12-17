# Plan de Développement MVP — Folk Lovers

## Objectif MVP

Permettre aux utilisateurs de :
1. Découvrir les chansons folk et leurs interprétations
2. S'inscrire (email/password ou Google) et voter (+1/-1) sur les interprétations

**Hors scope MVP** : commentaires, suggestions de chansons/interprétations par les users, modération avancée

> Les chansons et interprétations sont seedées manuellement pour la MVP.

---

## Phase 0 — Setup Projet

### 0.1 Backend Rails API
```bash
rails new backend --api --database=postgresql
```
- Configuration PostgreSQL
- Configuration CORS (rack-cors)
- Structure des dossiers (blueprints/, services/)
- Setup RSpec + FactoryBot

### 0.2 Frontend TanStack Start
```bash
npx create-start@latest frontend
```
- Configuration Tailwind CSS
- Installation shadcn/ui
- Setup du thème vintage (couleurs, fonts)
- Configuration des variables d'environnement

### 0.3 Monorepo
- Script pour lancer backend + frontend ensemble
- Docker Compose (optionnel)

---

## Phase 1 — Modèles & Seeds

### 1.1 Migrations Rails

```ruby
# users
create_table :users do |t|
  t.string :email, null: false, index: { unique: true }
  t.string :username, null: false, index: { unique: true }
  t.string :password_digest          # nullable pour Google OAuth users
  t.string :google_id, index: { unique: true, where: "google_id IS NOT NULL" }
  t.string :avatar_url               # photo Google
  t.timestamps
end

# songs
create_table :songs do |t|
  t.string :title, null: false
  t.string :original_artist, null: false
  t.integer :year
  t.string :youtube_url
  t.text :description
  t.string :slug, null: false, index: { unique: true }
  t.timestamps
end

# interpretations
create_table :interpretations do |t|
  t.references :song, null: false, foreign_key: true
  t.string :artist, null: false
  t.integer :year
  t.string :youtube_url, null: false
  t.text :description
  t.references :submitted_by, foreign_key: { to_table: :users }
  t.integer :votes_score, default: 0, null: false
  t.integer :votes_count, default: 0, null: false
  t.timestamps
end
add_index :interpretations, [:song_id, :votes_score]

# votes
create_table :votes do |t|
  t.references :user, null: false, foreign_key: true
  t.references :interpretation, null: false, foreign_key: true
  t.integer :value, null: false # +1 or -1
  t.timestamps
end
add_index :votes, [:user_id, :interpretation_id], unique: true
```

### 1.2 Modèles Rails

```ruby
# User
has_many :votes
has_many :submitted_interpretations, class_name: 'Interpretation', foreign_key: :submitted_by_id
has_secure_password

# Song
has_many :interpretations, -> { order(votes_score: :desc) }
validates :title, :original_artist, :slug, presence: true

# Interpretation
belongs_to :song, counter_cache: true
belongs_to :submitted_by, class_name: 'User', optional: true
has_many :votes

# Vote
belongs_to :user
belongs_to :interpretation
validates :value, inclusion: { in: [-1, 1] }
validates :user_id, uniqueness: { scope: :interpretation_id }
after_save :update_interpretation_score
after_destroy :update_interpretation_score
```

### 1.3 Seeds
- 10 chansons folk classiques
- 3-5 interprétations par chanson
- Données réelles (vrais artistes, vraies vidéos YouTube)

---

## Phase 2 — API Backend

### 2.1 Authentification JWT + Google OAuth

**Endpoints**
| Method | Route | Description |
|--------|-------|-------------|
| POST | `/api/auth/register` | Inscription email/password |
| POST | `/api/auth/login` | Connexion email/password |
| POST | `/api/auth/google` | Connexion via Google (reçoit le token Google) |
| GET | `/api/auth/me` | User courant |

**Gems**
- `bcrypt` — hash passwords
- `jwt` — token generation
- `google-id-token` — validation du token Google côté backend

**Flow Google OAuth**
1. Frontend : bouton "Sign in with Google" (Google Identity Services)
2. Google renvoie un `credential` (ID token) au frontend
3. Frontend POST `/api/auth/google` avec le token
4. Backend valide le token, crée/trouve le user, renvoie JWT

**Implementation**
- `AuthController` avec actions register/login/google
- `JsonWebToken` service pour encode/decode
- `GoogleAuth` service pour valider le token Google
- `authenticate_user!` concern pour protéger les routes

### 2.2 Songs API

**Endpoints**
| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/songs` | Liste paginée |
| GET | `/api/songs/:slug` | Détail + interprétations |

**Scopes (has_scope)**
- `by_artist` — filtrer par artiste original
- `search` — recherche titre/artiste

**Blueprinter**
```ruby
class SongBlueprint < Blueprinter::Base
  identifier :id
  fields :title, :original_artist, :year, :youtube_url, :slug
  field :interpretations_count

  view :detailed do
    association :interpretations, blueprint: InterpretationBlueprint
  end
end
```

### 2.3 Interpretations API

**Endpoints**
| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/songs/:song_slug/interpretations` | Liste triée par score |

**Scopes**
- `sorted_by` — score (default) ou recent

> POST pour créer des interprétations = post-MVP

### 2.4 Votes API

**Endpoints**
| Method | Route | Description |
|--------|-------|-------------|
| POST | `/api/interpretations/:id/vote` | Voter +1 ou -1 |
| DELETE | `/api/interpretations/:id/vote` | Supprimer son vote |

**Logic**
- Un user = un vote par interprétation
- Si vote existe et même valeur → supprimer (toggle)
- Si vote existe et valeur différente → update
- Recalculer `votes_score` sur l'interprétation

---

## Phase 3 — Frontend Pages

### 3.1 Layout & Composants de Base

**Layout**
- `Header` — logo, nav, bouton connexion/user menu
- `Footer` — liens, credits
- Thème vintage appliqué globalement

**Composants shadcn customisés**
- `Button` — style vintage
- `Input` — style vintage
- `Card` — pour les interprétations
- `Dialog` — pour modales connexion/inscription
- `Avatar` — pour users

### 3.2 Page d'Accueil `/`

**Sections**
1. Hero avec tagline
2. Top chansons (6 cards)
3. Top interprétations récentes (6 items)

**Data fetching**
- Server action : `getTopSongs()`
- Server action : `getTopInterpretations()`

### 3.3 Page Chanson `/songs/:slug`

**Sections**
1. Header chanson (titre, artiste, meta)
2. Video originale
3. Liste interprétations avec voting

**Data fetching**
- Server action : `getSong(slug)` avec interprétations
- Server action : `vote(interpretationId, value)` (mutation)

**Composants**
- `SongHeader`
- `OriginalVideo`
- `InterpretationCard` — video, description, voting
- `VotingButtons` — +1/-1 avec état

### 3.4 Auth `/login` & `/register`

**Composants**
- `LoginForm`
- `RegisterForm`
- Gestion du token JWT (localStorage ou cookie)
- Context/Store pour l'état auth

---

## Phase 4 — Intégrations & Polish

### 4.1 YouTube
- Extraction du video ID depuis l'URL
- Embed player responsive
- Fallback si video indisponible

### 4.2 Validation & Erreurs
- Validation côté client (formulaires)
- Gestion des erreurs API
- Toast notifications

### 4.3 SEO & Performance
- Meta tags dynamiques (TanStack Start SSR)
- Open Graph pour partage
- Lazy loading des videos

### 4.4 Mobile
- Responsive design
- Touch-friendly voting

---

## Backlog Post-MVP

| Feature | Priorité |
|---------|----------|
| Formulaire soumission interprétations | P1 |
| Formulaire suggestion chansons | P1 |
| Commentaires sur interprétations | P1 |
| Modération (admin) | P1 |
| Profil utilisateur public | P2 |
| Recherche avancée | P2 |
| Notifications | P3 |
| Playlists personnelles | P3 |

---

## Stack Résumé

| Layer | Tech |
|-------|------|
| Base de données | PostgreSQL |
| Backend | Rails 7 API, JWT, pagy, has_scope, blueprinter |
| Frontend | TanStack Start, Server Actions, shadcn/ui, Tailwind |
| Hosting | Render / Fly.io (backend) + Vercel (frontend) |

---

## Structure Fichiers Clés

```
folklovers/
├── backend/
│   ├── app/
│   │   ├── controllers/
│   │   │   └── api/
│   │   │       ├── auth_controller.rb
│   │   │       ├── songs_controller.rb
│   │   │       ├── interpretations_controller.rb
│   │   │       └── votes_controller.rb
│   │   ├── models/
│   │   │   ├── user.rb
│   │   │   ├── song.rb
│   │   │   ├── interpretation.rb
│   │   │   └── vote.rb
│   │   ├── blueprints/
│   │   │   ├── song_blueprint.rb
│   │   │   └── interpretation_blueprint.rb
│   │   └── services/
│   │       ├── json_web_token.rb
│   │       └── google_auth.rb
│   └── config/
│       └── routes.rb
│
└── frontend/
    └── src/
        ├── routes/
        │   ├── index.tsx
        │   ├── login.tsx
        │   ├── register.tsx
        │   └── songs/
        │       └── $slug.tsx
        ├── components/
        │   ├── layout/
        │   ├── songs/
        │   └── ui/ (shadcn)
        ├── lib/
        │   ├── api.ts
        │   └── auth.ts
        └── styles/
            └── theme.css
```
