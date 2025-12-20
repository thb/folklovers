# Content Management

This document explains how to add songs and covers to the Folk Lovers production database.

## Prerequisites

The `.env` file at the project root must contain:

```
YOUTUBE_API_KEY=your_youtube_api_key
ADMIN_EMAIL=your_admin_email
ADMIN_PASSWORD=your_admin_password
```

These are loaded automatically by `dotenv-rails` via `config/initializers/dotenv.rb`.

## Quick Reference

### Search YouTube for videos

```bash
bin/rails 'youtube:search[Artist Song Title]'
```

### Add a song with covers

1. Create a JSON file in `tmp/`:

```json
{
  "songs": [
    {
      "title": "Song Title",
      "original_artist": "Original Artist",
      "year": 1965,
      "youtube_url": "https://www.youtube.com/watch?v=VIDEO_ID",
      "description": "Brief description of the song.",
      "covers": [
        {
          "artist": "Cover Artist",
          "year": 1970,
          "youtube_url": "https://www.youtube.com/watch?v=VIDEO_ID",
          "description": "Brief description of this cover."
        }
      ]
    }
  ]
}
```

2. Run the populate task:

```bash
bin/rails 'prod:populate[tmp/your_file.json]'
```

### Update a song's YouTube URL

```bash
bin/rails 'prod:update_song[SONG_ID,https://www.youtube.com/watch?v=VIDEO_ID]'
```

### Update a cover's YouTube URL

```bash
bin/rails 'prod:update_cover[COVER_ID,https://www.youtube.com/watch?v=VIDEO_ID]'
```

### List all songs in production

```bash
bin/rails prod:list
```

### Delete a song

```bash
bin/rails 'prod:delete[SONG_ID]'
```

### Check if YouTube videos are still available

```bash
bin/rails youtube:check
```

---

## Workflow Examples

### Example 1: Add a single song with covers

**Request:** "Add the song 'Moonshiner' with covers by Red Bird, Charlie Parr, Bob Dylan, Sam Shackleton"

**Steps:**

1. Search for YouTube videos:

```bash
bin/rails 'youtube:search[Moonshiner traditional folk]'
bin/rails 'youtube:search[Red Bird Moonshiner]'
bin/rails 'youtube:search[Charlie Parr Moonshiner]'
bin/rails 'youtube:search[Bob Dylan Moonshiner]'
bin/rails 'youtube:search[Sam Shackleton Moonshiner]'
```

2. Create `tmp/moonshiner.json` with the results

3. Populate:

```bash
bin/rails 'prod:populate[tmp/moonshiner.json]'
```

### Example 2: Add songs from an album

**Request:** "Add songs from Bob Dylan's 'I'm Not There' soundtrack with original versions and album covers"

**Steps:**

1. Research the album tracklist
2. For each song, search for:
   - The original version (usually Dylan's)
   - The cover from the soundtrack album
3. Create a JSON file with all songs and covers
4. Populate

---

## JSON Schema Reference

```json
{
  "songs": [
    {
      "title": "string (required)",
      "original_artist": "string (required)",
      "year": "integer (required)",
      "youtube_url": "string (required, full YouTube URL)",
      "description": "string (optional)",
      "covers": [
        {
          "artist": "string (required)",
          "year": "integer (optional)",
          "youtube_url": "string (required)",
          "description": "string (optional)"
        }
      ]
    }
  ]
}
```

## Tips

- Use official channels (VEVO, artist channels) when available for better video stability
- Joan Baez often sings "Daddy" instead of "Mama" in Dylan songs - note this in descriptions
- Traditional songs have no single original artist - use "Traditional" and pick a notable early recording
- Always verify YouTube URLs are working before adding
