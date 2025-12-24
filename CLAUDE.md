# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Folk Lovers is a community site for ranking folk song covers. Users can vote on covers (Stack Overflow-style), submit new songs/covers, and discover folk music. Design inspired by 1960s Greenwich Village folk scene.

## Development Commands

```bash
# Start both frontend and backend
foreman start -f Procfile.dev

# Backend only (port 7001)
cd backend && bin/rails server

# Frontend only (port 7000)
cd frontend && npm run dev

# Run backend tests
cd backend && bundle exec rspec

# Run single test file
cd backend && bundle exec rspec spec/models/song_spec.rb

# Run frontend tests
cd frontend && npm run test

# Generate TanStack Router routes
cd frontend && npx @tanstack/router-cli generate
```

## Changelog

**Always document notable changes in `frontend/CHANGELOG.md`.** This file is parsed by the `/changelog` page to show updates to the community. Follow the existing format:

```markdown
## YYYY-MM-DD

### Added
- New feature description

### Changed
- Change description

### Fixed
- Bug fix description

### Improved
- Improvement description
```

## Production Content Management

**Always use `backend/docs/CONTENT.md` procedures for adding/editing content on production.**

```bash
cd backend

# List songs
bin/rails prod:list

# Add songs from JSON
bin/rails 'prod:populate[tmp/file.json]'

# Delete a song
bin/rails 'prod:delete[SONG_ID]'

# Search YouTube
bin/rails 'youtube:search[Artist Song Title]'

# Check video availability
bin/rails youtube:check
```

## Architecture

### Backend (Rails API)
- **Controllers**: Public API (`songs_controller`, `covers_controller`, `votes_controller`, `auth_controller`) and Admin namespace (`admin/`)
- **Blueprints**: JSON serialization with Blueprinter (`app/blueprints/`)
- **Models**: Song has many Covers, Cover has many Votes. Covers have an `original` flag for the original version
- **Auth**: JWT-based with Google OAuth option

### Frontend (TanStack Start)
- **Routes**: File-based routing in `src/routes/` - files define routes automatically
- **Components**: `ui/` (shadcn), `layout/` (Header, Footer), `songs/` (SongCard, VotingButtons), `auth/` (AuthDialog)
- **API**: `src/lib/api.ts` handles all backend communication
- **Auth**: Context in `src/hooks/use-auth.tsx`, token stored in localStorage

### Key Patterns
- Songs have one "original" cover (`original: true`) representing the original recording
- Covers are sorted: original first, then by votes_score descending
- YouTube URLs validated with `YoutubeValidatable` concern
- Votes use value +1/-1 with cached `votes_score` on covers
