# TODO

## Design
- [ ] Créer une favico à partir du logo icône dans le fonds marron

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

## Performance
- [ ] Self-host les Google Fonts (éviter le FOUC / tremblement au chargement)

## Email
- [ ] Configurer SMTP Scaleway Transactional Emails
- [ ] Action Mailer pour mot de passe oublié

## Espace Utilisateur
- [ ] Commenter une cover
- [ ] Lien rapide : supprimer / modifier sa cover (admin peut toujours le faire)
- [ ] Page par défaut après inscription/connexion
- [ ] Mes suggestions
- [ ] Mes votes
- [ ] Mot de passe oublié
- [ ] Changer son mot de passe
- [ ] Supprimer son compte
- [ ] Modifier son profil
- [ ] Créer une playlist (publique, privé ou en collaboration)
- [ ] Gestion de la playlist (ajout/suppression de cover, midifier / supprimer la playlist)

## Espace Admin
- [ ] Suggestions (à modérer | acceptées | refusées)

## Système de Notifications
- [ ] Cloche avec notifications (non lues, mark as read)
- [ ] Réception d'email de notifications
- [ ] L'admin reçoit une notif quand une nouvelle suggestion est ajoutée
- [ ] Le user qui a suggéré reçoit une notif que sa suggestion est en cours de modération
- [ ] Le user reçoit une notif avec le statut et la raison de la modération de sa suggestion
- [ ] Le user reçoit une notif quand quelqu'un vote ou commente sa suggestion
- [ ] Idem pour les interprétations (covers)

## Blog Article Ideas

- [ ] **Traditional Era** - Folk songs with unknown authors, oral tradition, ballads passed down through generations
- [ ] **1960s New York / Greenwich Village** - Dave Van Ronk, Bob Dylan, Joan Baez, Pete Seeger, Phil Ochs, the folk revival movement
- [ ] **British Folk School** - Nick Drake, Donovan, John Martyn, Incredible String Band, Fairport Convention, Pentangle, Bert Jansch
- [ ] **Electric Era** - When folk went electric: Bob Dylan at Newport '65, The Byrds, The Rolling Stones folk influences
- [ ] **Modern Folk** - Bon Iver, Jose Gonzalez, Iron & Wine, Fleet Foxes, Sufjan Stevens, contemporary folk artists
- [ ] **YouTube Folk Artists** - Elle & Toni, Lazy Shark, Chuck Van Dyke, and the new generation of folk musicians on YouTube
