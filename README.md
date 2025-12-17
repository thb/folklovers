# Folklovers

Community site for ranking the best folk song covers.

## Vision

Folklovers is a platform where folk music enthusiasts can discover, share, and vote for the best covers of classic and contemporary folk songs.

### Design Inspiration

The design draws inspiration from the vintage atmosphere of the **Gaslight Cafe** in Greenwich Village, New York, during the 1960s — the era when Bob Dylan, Dave Van Ronk, and other folk legends shaped the sound of a generation. Think of the ambiance from the Coen Brothers' film *Inside Llewyn Davis*: warm, authentic, slightly worn by time.

**Key visual elements:**
- Warm color palette: sepia, brown, cream, ochre
- Retro typography evoking 1960s concert posters
- Textures reminiscent of wood, aged paper, vinyl sleeves
- Woodcut/linocut-style illustrations and icons

## Features

### Users
- Sign up / Login
- Vote (+1 / -1) on covers
- Comment on covers
- Suggest new songs
- Suggest new covers

### Homepage
- **Top songs**: songs with the most positive votes
- **Top covers**: highest-rated covers across all songs
- Navigation by category/era

### Song Page
1. **Original section**: YouTube video of the original song (or reference version)
2. **Covers list**: ranked by vote score (Stack Overflow style)
   - Each cover displays:
     - Embedded YouTube video
     - Description: "Why this cover?"
     - Vote buttons +1 / -1
     - Total score
     - Comment count
3. **Comments section** for each cover

### UX Specifics
- Stack Overflow-inspired voting and ranking system
- Prominent YouTube videos (visible player, not just a link)
- Space for descriptions accompanying each cover
- Responsive interface prioritizing mobile readability

## Tech Stack

### Backend — Ruby on Rails (API mode)

**Core**
- PostgreSQL
- RESTful JSON API

**Authentication**
- JWT (JSON Web Tokens)
- Email / Password
- Google OAuth 2.0

**Main Gems**
| Gem | Usage |
|-----|-------|
| `jwt` | Token generation and validation |
| `omniauth-google-oauth2` | Google login |
| `bcrypt` | Password hashing |
| `pagy` | High-performance pagination |
| `has_scope` | Query filtering via query params |
| `blueprinter` | JSON serialization of models |

### Frontend — TanStack Start

**Core**
- TanStack Start (React + SSR)
- TanStack Router
- Server Actions for mutations

**UI**
- shadcn/ui (accessible and customizable components)
- Tailwind CSS with custom vintage theme

### Integrations
- **YouTube Data API**: video metadata (title, thumbnail, duration)
- **YouTube IFrame API**: embedded players

## Data Model (simplified)

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
├── original_artist
├── year
├── youtube_url (original/reference version)
├── description
├── covers_count (cached)
└── created_at

Cover
├── id
├── song_id (FK)
├── artist
├── youtube_url
├── description ("Why this cover")
├── submitted_by_user_id (FK)
├── votes_score (cached, sum of +1/-1)
└── created_at

Vote
├── id
├── user_id (FK)
├── votable_type (Song or Cover)
├── votable_id
├── value (+1 or -1)
└── created_at

Comment
├── id
├── user_id (FK)
├── cover_id (FK)
├── content
└── created_at
```

## Project Structure

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
├── docker-compose.yml
└── README.md
```

## Development

### Prerequisites
- Ruby 3.3+
- Node.js 22+
- PostgreSQL 16+

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

### Run the project

```bash
# From root directory
foreman start -f Procfile.dev
```

Backend runs on port 7000, frontend on port 7001.

## Main Pages

| Route | Description |
|-------|-------------|
| `/` | Homepage with top songs and top covers |
| `/songs` | All songs listing |
| `/songs/:slug` | Song page with its covers |
| `/login` | Login |
| `/register` | Sign up |

## Configuration

### Environment Variables

Copy `.env.example` to `.env` and configure:

```bash
# Domains
API_DOMAIN=api.thefolklovers.com
FRONTEND_DOMAIN=thefolklovers.com

# PostgreSQL
POSTGRES_USER=folklovers
POSTGRES_PASSWORD=<generate with: openssl rand -hex 16>
POSTGRES_DB=folklovers_production

# Rails secrets (generate with: openssl rand -hex 64)
SECRET_KEY_BASE=<generated_secret>
JWT_SECRET_KEY=<generated_secret>

# Google OAuth (optional)
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
```

## Deployment

The project is containerized with Docker and uses Traefik as reverse proxy.

See **[DEPLOY.md](DEPLOY.md)** for the complete deployment guide, including:
- Architecture overview
- CI/CD pipeline with GitHub Actions
- Server setup instructions
- Troubleshooting

## Contributing

Song and cover suggestions submitted by users go through moderation before publication.

---

*"I hate a song that makes you think that you are not any good. I hate a song that makes you think that you are just born to lose."* — Woody Guthrie
