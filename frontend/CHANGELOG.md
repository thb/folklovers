# Changelog

## 2026-01-18

### Changed
- Redesigned homepage with two new sections: "Recently added" and "Popular covers"
- Recently added section shows newest contributions with date and contributor info
- Popular section highlights top-voted covers by the community
- Removed the "Popular songs" section in favor of cover-focused content

### Improved
- Self-hosted fonts for faster loading and no flash of unstyled content (FOUC)

## 2026-01-06

### Added
- Mark cover as original: users can now indicate if a cover is the original recording when submitting
- Admin can change which cover is marked as original for any song
- Visual indicator (star badge) for original recordings on song pages

### Improved
- Song thumbnails now fallback to the first cover when no original is set
- Original recording checkbox only visible when appropriate (no existing original or admin user)

## 2025-12-24

### Added
- Custom favicon with guitar icon on brown background (PWA-ready with all sizes)
- New "Add a cover" flow: search existing songs or create new ones in a single form
- Song search autocomplete for faster song selection
- Matomo analytics tracking (privacy-friendly)
- Community dropdown in header with What's New, Roadmap, and Feedback links
- Public Roadmap page showing planned features (/roadmap)
- Feedback page for bug reports and feature requests (/feedback)
- Database-backed feedback system: users must be authenticated, feedbacks stored in database
- Admin feedback management: view, filter by status, update status, delete feedbacks

### Fixed
- YouTube URL normalization: youtu.be links and tracking parameters now handled correctly
- Delete actions in admin panel no longer show false errors

### Changed
- Year is now optional when creating songs (useful for traditional folk songs)
- "Suggest song" button renamed to "Add a cover" with simplified flow
- Renamed "Blog" to "Articles" throughout the site (route changed from /blog to /articles)

## 2025-12-20

### Added
- Song sorting: alphabetical (A-Z, Z-A), by year, by date added
- Admin tables now sortable by clicking column headers (songs, covers, users)
- CLAUDE.md with project instructions for Claude Code
- `prod:delete` task for removing songs from production
- `prod:create_article` task for publishing articles to production
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
- Clearer sort labels: "Recently added" vs "Year (newest)" to avoid confusion
- DEPLOY.md updated with GHCR deployment architecture (CI builds images, server pulls)
- Article page typography: proper heading hierarchy, spacing, and reading width
- Google Sign-In button now responsive (adapts to container width, max 400px)
- Utility functions `getYouTubeVideoId()` and `getYouTubeThumbnail()` for thumbnail URLs

### Changed
- Logo icon changed from Music to Guitar across all pages (header, footer, home, login, register)

## 2025-12-19

### Added
- Persistent audio player bar (plays across page navigation, like France Inter)
- Play queue with add-to-queue functionality on covers
- Original version now displayed as first "cover" with distinctive amber badge
- Custom 404 page with vinyl record illustration
- Custom 500 error page with scratched record theme
- Changelog page (/changelog)

### Changed
- Unified data model: original song version is now a cover with original flag
- Song detail page renamed "Covers" section to "Versions"
- Thumbnails now served directly from API instead of client-side extraction

### Improved
- Cover cards now show play/pause state and queue controls on hover
- Original versions always appear first, regardless of vote count
- Faster deployments: images built in CI, server just pulls (~30s vs ~5min)

## 2025-12-18

### Added
- Users can submit new songs via /songs/new form (requires authentication)
- Users can add covers to existing songs with YouTube URL
- Playable cover cards on homepage (top covers section)
- Admin user management interface (/admin/users) with role editing
- Search and pagination on songs listing page
- Admin dashboard counters (songs, covers, users)
- Filter covers by song in admin panel

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

### Fixed
- Votes +1/-1: user vote state now persists after page reload

### Changed
- Renamed "Folklovers" to "Folk Lovers" everywhere
- Reduced deployment downtime with rolling restart

## 2025-12-17 - Initial Release

### Added
- Folk Lovers website launch
- Browse and discover folk song covers
- Vote on covers (upvote/downvote, Stack Overflow-style)
- Song pages with embedded YouTube players
- Cover rankings by community votes
- User authentication (email/password registration and login)
- Responsive design inspired by 1960s Greenwich Village folk scene
- Admin panel for content management (songs, covers)
- Docker-based deployment with Traefik reverse proxy
- CI/CD pipeline with GitHub Actions
