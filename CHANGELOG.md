# Changelog

## 2025-12-17

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
