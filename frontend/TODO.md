# TODO

## Artists Feature
- [ ] Create Artist model (name, slug, bio, image_url)
- [ ] Link Song.original_artist and Cover.artist to Artist model
- [ ] Artists page (/artists) with list of all artists
- [ ] Artist detail page with originals count and covers count
- [ ] Artist search/autocomplete when adding songs or covers (prevent duplicates)
- [ ] Admin: manage artists (merge duplicates, edit info)

## Duplicate Prevention
- [ ] Songs: detect duplicates by title + artist similarity (fuzzy matching)
- [ ] Covers: prevent same YouTube URL, detect same artist + song combination
- [ ] Artists: normalize names (case, accents, "The" prefix), suggest existing matches
- [ ] Find-or-create pattern for all entities with user confirmation
- [ ] Admin: merge duplicate records tool (songs, covers, artists)

## Navigation & Search
- [ ] Quick search in header with dropdown results (songs, artists, covers)
- [x] Infinite scroll pagination on songs page
- [ ] Infinite scroll pagination on artists page

## Cover Tags
- [ ] Create CoverTag model with fixed list of tags (Traditional, Electric, Bob Dylan, Movie, Live, Acoustic, A Cappella, Instrumental, etc.)
- [ ] Add tags to covers (many-to-many relationship)
- [ ] Tag selection when submitting a cover
- [ ] Tag page listing all covers with a specific tag (/tags/:slug)
- [ ] Tags index page (/tags) showing all tags with cover counts
- [ ] Display tags on cover cards
- [ ] Admin: manage tags (add, edit, delete)

## Rankings & Discovery
- [ ] Covers page with global rankings (/covers)
- [ ] Rankings page with top songs, top covers, trending (/rankings)
- [ ] Community leaderboard: top contributors, top voters, most cover suggestions

## Performance
- [x] Self-host Google Fonts (avoid FOUC / flash of unstyled content)

## Email
- [ ] Configure SMTP with Scaleway Transactional Emails
- [ ] Action Mailer for password reset

## User Space
- [ ] Comment on a cover
- [ ] Quick link: delete / edit own cover (admin can always do it)
- [ ] Default page after sign up / sign in
- [ ] My suggestions
- [ ] My votes
- [ ] Forgot password
- [ ] Change password
- [ ] Delete account
- [ ] Edit profile
- [ ] Create playlist (public, private, or collaborative)
- [ ] Playlist management (add/remove covers, edit/delete playlist)

## Admin Space
- [ ] Suggestions moderation (pending | approved | rejected)

## Notification System
- [ ] Bell icon with notifications (unread, mark as read)
- [ ] Email notifications
- [ ] Admin receives notification when new suggestion is added
- [ ] User who suggested receives notification that suggestion is being moderated
- [ ] User receives notification with moderation status and reason
- [ ] User receives notification when someone votes or comments on their suggestion
- [ ] Same for cover submissions

## Blog Article Ideas

- [ ] **Traditional Era** - Folk songs with unknown authors, oral tradition, ballads passed down through generations
- [ ] **1960s New York / Greenwich Village** - Dave Van Ronk, Bob Dylan, Joan Baez, Pete Seeger, Phil Ochs, the folk revival movement
- [ ] **British Folk School** - Nick Drake, Donovan, John Martyn, Incredible String Band, Fairport Convention, Pentangle, Bert Jansch
- [ ] **Electric Era** - When folk went electric: Bob Dylan at Newport '65, The Byrds, The Rolling Stones folk influences
- [ ] **Modern Folk** - Bon Iver, Jose Gonzalez, Iron & Wine, Fleet Foxes, Sufjan Stevens, contemporary folk artists
- [ ] **YouTube Folk Artists** - Elle & Toni, Lazy Shark, Chuck Van Dyke, and the new generation of folk musicians on YouTube
