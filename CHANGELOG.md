# Changelog

## 2025-12-20

### Added
- CLAUDE.md with project instructions for Claude Code
- `prod:delete` task for removing songs from production
- Blog feature with full article management
  - Articles with markdown content, draft/published status, cover images, and tags
  - Admin article editor with live markdown preview toggle
  - Public blog pages at /blog with tag filtering and pagination
  - First article: "What is Folk Music?"
- Cover image credit field on articles (displays as figcaption)
- Mobile responsive menu (hamburger) in header with navigation, auth links, and user profile
- YouTube thumbnails on song cards in /songs listing
- Auth dialog when voting: unauthenticated users see sign-in dialog, vote executes automatically after login
- Tailwind Typography plugin for proper prose styling

### Improved
- DEPLOY.md updated with GHCR deployment architecture (CI builds images, server pulls)
- Article page typography: proper heading hierarchy, spacing, and reading width
- Google Sign-In button now responsive (adapts to container width, max 400px)
- Utility functions `getYouTubeVideoId()` and `getYouTubeThumbnail()` for thumbnail URLs

### Changed
- Logo icon changed from Music to Guitar across all pages (header, footer, home, login, register)

## 2025-12-18

### Added
- Users can submit new songs via dedicated /songs/new page (requires authentication)
- "Suggest a song" buttons: homepage hero, navbar (authenticated), songs list header
- Users can add covers to existing songs with YouTube URL
- Playable cover cards on homepage (top covers section)
- Admin user management interface (/admin/users) with role editing
- Search and pagination on songs listing page
- Rails tasks for content management (`content:list`, `prod:populate`, `prod:update_song`, `prod:update_cover`)
- YouTube search task (`youtube:search`) for finding video URLs
- Admin dashboard counters (songs, covers, users)
- Filter covers by song in admin panel
- YouTube URL format validation (accepts youtube.com and youtu.be, with or without www)
- Required fields for song submission: year, YouTube URL, description

### Improved
- Inline field-level error handling on song and cover submission forms (Rails-style errors)
- DRY: shared `YoutubeValidatable` concern for backend validation
- DRY: shared `form-utils.ts` for frontend error parsing
- Comprehensive tests for YouTube URL validation (shared examples)

### Changed
- Translated entire site from French to English (UI and seed data)
- Wait for database migrations before starting frontend in deployment

## 2025-12-17

### Improved
- Lighthouse performance: moved Google Fonts from @import to preconnect + link tags
- Lighthouse performance: TanStack Devtools now conditionally loaded only in development
- Lighthouse CLS: added explicit width/height dimensions to YouTube thumbnail images

### Added
- Google OAuth authentication (Sign in with Google)
- Google Sign-In button on login and register pages
- Tests for Google auth endpoint and service
- Documentation for Google OAuth setup in DEPLOY.md

### Fixed
- Votes +1/-1: user vote state now persists after page reload
  - Loader runs server-side without auth, so covers are refetched client-side with token
  - VotingButtons component now syncs state when cover prop changes

### Changed
- Renamed "Folklovers" to "Folk Lovers" everywhere
- Reduced deployment downtime with rolling restart (--no-deps --wait)
