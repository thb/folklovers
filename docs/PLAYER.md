# Persistent Player - Folk Lovers

Player audio/vidéo persistant style France Inter : la lecture continue entre les changements de page.

## Architecture

```
src/
  lib/
    player-context.tsx      # État global du player (React Context)
  components/
    player/
      Player.tsx            # Barre fixe en bas de page
      PlayerControls.tsx    # Play/Pause/Prev/Next
      PlayerProgress.tsx    # Barre de progression cliquable
      PlayerQueue.tsx       # Liste des morceaux à suivre
      YouTubeEmbed.tsx      # Wrapper API YouTube IFrame
```

## État Global (Context)

```typescript
interface PlayerState {
  currentTrack: Track | null
  queue: Track[]
  isPlaying: boolean
  progress: number        // 0-100
  duration: number        // secondes
  volume: number          // 0-100
  isMinimized: boolean
}

interface Track {
  id: number              // cover.id
  title: string           // song.title
  artist: string          // cover.artist
  youtubeUrl: string
  thumbnailUrl: string
}

interface PlayerActions {
  play: (track: Track) => void
  pause: () => void
  resume: () => void
  next: () => void
  previous: () => void
  addToQueue: (track: Track) => void
  removeFromQueue: (index: number) => void
  clearQueue: () => void
  seek: (percent: number) => void
  setVolume: (percent: number) => void
  toggleMinimize: () => void
}
```

## Intégration YouTube IFrame API

```typescript
// Charger l'API YouTube
const loadYouTubeAPI = () => {
  const tag = document.createElement('script')
  tag.src = 'https://www.youtube.com/iframe_api'
  document.body.appendChild(tag)
}

// Créer le player
const player = new YT.Player('youtube-player', {
  videoId: 'VIDEO_ID',
  playerVars: {
    autoplay: 1,
    controls: 0,        // On fait nos propres contrôles
    modestbranding: 1,
    rel: 0,
  },
  events: {
    onReady: onPlayerReady,
    onStateChange: onPlayerStateChange,
    onError: onPlayerError,
  }
})
```

## Composant Player

Position fixe en bas, dans `__root.tsx` pour persister entre les pages.

```tsx
// Dans __root.tsx
<PlayerProvider>
  <Header />
  <main>{children}</main>
  <Footer />
  <Player />  {/* Toujours monté, se cache si rien ne joue */}
</PlayerProvider>
```

### États visuels

1. **Caché** : Aucun track en cours
2. **Mini** : Barre compacte (thumbnail, titre, play/pause, progress)
3. **Expanded** : Barre étendue avec queue visible

## Phases d'implémentation

### Phase 1 : MVP
- [x] Player Context avec état de base
- [ ] Composant Player fixe en bas
- [ ] Lecture d'une cover (clic = play)
- [ ] Play/Pause
- [ ] Barre de progression (affichage)
- [ ] Persist entre les pages

### Phase 2 : Contrôles
- [ ] Barre de progression cliquable (seek)
- [ ] Contrôle du volume
- [ ] Bouton minimize/expand
- [ ] Affichage durée/temps actuel

### Phase 3 : Queue
- [ ] Bouton "Add to queue" sur les covers
- [ ] Affichage de la queue
- [ ] Previous/Next
- [ ] Réordonner la queue (drag & drop)
- [ ] Clear queue

### Phase 4 : Polish
- [ ] Animations smooth
- [ ] Keyboard shortcuts (espace = play/pause, etc.)
- [ ] Media Session API (contrôles OS/lockscreen)
- [ ] Persistence de la queue (localStorage)
- [ ] Mini player sur mobile

## Challenges techniques

### YouTube IFrame vs Audio
- YouTube ne permet pas d'extraire l'audio
- L'iframe doit rester montée (display: none si minimisé, mais pas unmount)
- Utiliser `visibility: hidden` ou position off-screen plutôt que `display: none`

### Changement de page
- Le Context dans `__root.tsx` persiste
- L'iframe YouTube doit rester dans le DOM
- Ne pas re-render le player au changement de route

### Mobile
- Autoplay bloqué sans interaction user
- Considérer une UX différente (tap to play first)

## API du Context

```tsx
// Utilisation dans un composant
const { play, addToQueue, isPlaying, currentTrack } = usePlayer()

// Sur une CoverCard
<Button onClick={() => play(track)}>
  <Play />
</Button>

<Button onClick={() => addToQueue(track)}>
  <ListPlus />
</Button>
```

## Inspiration

- France Inter : barre fixe en bas, continue entre pages
- Spotify Web : queue, contrôles complets
- SoundCloud : waveform progress, simple et efficace
