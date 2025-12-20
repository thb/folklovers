# Folk Lovers - Claude Code Instructions

## Production Content Management

When adding, updating, or deleting songs and covers on production, always follow the procedures documented in `backend/docs/CONTENT.md`.

Key tasks:
- `bin/rails prod:list` - List all songs
- `bin/rails 'prod:populate[file.json]'` - Add songs from JSON
- `bin/rails 'prod:delete[SONG_ID]'` - Delete a song
- `bin/rails 'youtube:search[query]'` - Search YouTube for videos
