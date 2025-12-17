# Seeds for Folk Lovers
# Real folk songs and covers

puts "Seeding database..."

# Clear existing data
Vote.destroy_all
Cover.destroy_all
Song.destroy_all
User.destroy_all

# Create some demo users
demo_user = User.create!(
  email: "demo@folklovers.com",
  username: "folkfan42",
  password: "password123"
)

# Songs data
songs_data = [
  {
    title: "The Times They Are A-Changin'",
    original_artist: "Bob Dylan",
    year: 1964,
    youtube_url: "https://www.youtube.com/watch?v=90WD_ats6eE",
    description: "Written in September-October 1963, this song became an anthem for the civil rights movement and American counterculture. Dylan deliberately wrote it as an 'anthem of change' inspired by Irish and Scottish ballads.",
    covers: [
      {
        artist: "Nina Simone",
        year: 1969,
        youtube_url: "https://www.youtube.com/watch?v=sXPkmIwwobA",
        description: "Nina transforms this folk song into a cry of rage and hope. Her piano version is slower, more intense, almost threatening. She doesn't sing about change, she demands it.",
        votes_score: 247
      },
      {
        artist: "Eddie Vedder",
        year: 2007,
        youtube_url: "https://www.youtube.com/watch?v=PQKQE3OsJqU",
        description: "Eddie brings the song back to its folk roots while infusing it with rock energy. A stripped-down version, raw voice, just an acoustic guitar.",
        votes_score: 186
      },
      {
        artist: "Simon & Garfunkel",
        year: 1965,
        youtube_url: "https://www.youtube.com/watch?v=Y_HXpN9VJxE",
        description: "Paul and Art's vocal harmonies soften the message without weakening it. A more accessible version that introduced many people to Dylan.",
        votes_score: 134
      },
      {
        artist: "The Byrds",
        year: 1965,
        youtube_url: "https://www.youtube.com/watch?v=W4ga_M5Zdn4",
        description: "The jingle-jangle sound of the 12-string Rickenbacker transforms this folk ballad into something completely different. The Byrds invented folk-rock with covers like this one.",
        votes_score: 67
      }
    ]
  },
  {
    title: "Blowin' in the Wind",
    original_artist: "Bob Dylan",
    year: 1962,
    youtube_url: "https://www.youtube.com/watch?v=vWwgrjjIMXA",
    description: "One of Dylan's most iconic songs, it became an anthem for the civil rights movement. The rhetorical questions posed in the song still resonate today.",
    covers: [
      {
        artist: "Peter, Paul and Mary",
        year: 1963,
        youtube_url: "https://www.youtube.com/watch?v=Ld6fAO4idaI",
        description: "This is the version that introduced the song to the general public. The three-part harmonies give it a spiritual, almost gospel dimension.",
        votes_score: 312
      },
      {
        artist: "Stevie Wonder",
        year: 1966,
        youtube_url: "https://www.youtube.com/watch?v=jNO72aCnVr0",
        description: "Stevie Wonder was only 16 when he recorded this version. He brings a soul sensibility that enriches Dylan's message.",
        votes_score: 198
      },
      {
        artist: "Neil Young",
        year: 1992,
        youtube_url: "https://www.youtube.com/watch?v=7I2ADXzqI_Y",
        description: "Neil Young, true to form, delivers a raw and emotional version. His fragile voice carries all the vulnerability of the song.",
        votes_score: 145
      }
    ]
  },
  {
    title: "Hallelujah",
    original_artist: "Leonard Cohen",
    year: 1984,
    youtube_url: "https://www.youtube.com/watch?v=ttEMYvpoR-k",
    description: "Leonard Cohen spent five years writing this song, producing dozens of verses. It has become one of the most covered songs in music history.",
    covers: [
      {
        artist: "Jeff Buckley",
        year: 1994,
        youtube_url: "https://www.youtube.com/watch?v=y8AWFf7EAc4",
        description: "The definitive version for many. Jeff Buckley transcends the original with breathtaking emotional intensity. His falsetto on the final verses is unforgettable.",
        votes_score: 456
      },
      {
        artist: "Rufus Wainwright",
        year: 2001,
        youtube_url: "https://www.youtube.com/watch?v=PBo-n_17XU0",
        description: "An orchestral and theatrical version popularized by the movie Shrek. Rufus brings a baroque grandeur to the song.",
        votes_score: 178
      },
      {
        artist: "k.d. lang",
        year: 2005,
        youtube_url: "https://www.youtube.com/watch?v=P_NpxTWbovE",
        description: "A masterful performance at the Juno Awards. k.d. lang captures all the spirituality and sensuality of the song with a perfectly controlled voice.",
        votes_score: 234
      },
      {
        artist: "John Cale",
        year: 1991,
        youtube_url: "https://www.youtube.com/watch?v=vvNvs6dZCC4",
        description: "This is the version that reignited interest in the song. John Cale, former Velvet Underground member, turns it into a minimalist piano piece.",
        votes_score: 156
      }
    ]
  },
  {
    title: "Suzanne",
    original_artist: "Leonard Cohen",
    year: 1967,
    youtube_url: "https://www.youtube.com/watch?v=svitEEpI07E",
    description: "Inspired by Suzanne Verdal, a Montreal dancer, this song blends poetry, spirituality, and desire with rare delicacy. A masterpiece of literary folk.",
    covers: [
      {
        artist: "Judy Collins",
        year: 1966,
        youtube_url: "https://www.youtube.com/watch?v=7TsvUMgNxgU",
        description: "Judy Collins actually recorded this song before Cohen himself. She introduced it to the world with her crystalline voice.",
        votes_score: 189
      },
      {
        artist: "Nina Simone",
        year: 1969,
        youtube_url: "https://www.youtube.com/watch?v=4kUOjxeFHyM",
        description: "Nina Simone completely takes ownership of the song, transforming it into a hypnotic jazz meditation.",
        votes_score: 167
      },
      {
        artist: "Roberta Flack",
        year: 1969,
        youtube_url: "https://www.youtube.com/watch?v=4f9K5vSAVrk",
        description: "A soulful and sensual version that highlights the romantic aspects of the song.",
        votes_score: 98
      }
    ]
  },
  {
    title: "House of the Rising Sun",
    original_artist: "Traditional",
    year: 1930,
    youtube_url: "https://www.youtube.com/watch?v=bwAw9ThDQmk",
    description: "Traditional American folk song with origins dating back to the early 20th century, possibly earlier. It tells the story of a life ruined in New Orleans.",
    covers: [
      {
        artist: "The Animals",
        year: 1964,
        youtube_url: "https://www.youtube.com/watch?v=4-43lLKaqBQ",
        description: "THE version that changed everything. Eric Burdon and the Animals transformed this folk ballad into a rock monument with that unforgettable Hammond organ.",
        votes_score: 523
      },
      {
        artist: "Bob Dylan",
        year: 1962,
        youtube_url: "https://www.youtube.com/watch?v=wIWlK9MrWOk",
        description: "Dylan's traditional folk version, recorded for his first album. Raw, authentic, it shows his roots in the folk revival.",
        votes_score: 234
      },
      {
        artist: "Joan Baez",
        year: 1960,
        youtube_url: "https://www.youtube.com/watch?v=OTvASJ8AJnw",
        description: "Joan Baez delivers a pure and moving interpretation, her soprano voice carrying all the tragedy of the lyrics.",
        votes_score: 187
      }
    ]
  },
  {
    title: "If I Had a Hammer",
    original_artist: "Pete Seeger & Lee Hays",
    year: 1949,
    youtube_url: "https://www.youtube.com/watch?v=5TXML3YgZHA",
    description: "Written by Pete Seeger and Lee Hays of the Weavers, this song became an anthem for the labor movement and civil rights.",
    covers: [
      {
        artist: "Peter, Paul and Mary",
        year: 1962,
        youtube_url: "https://www.youtube.com/watch?v=Rz9xAByv_pM",
        description: "The version that made this song a mainstream hit. Their joyful and energetic interpretation touched millions of people.",
        votes_score: 267
      },
      {
        artist: "Trini Lopez",
        year: 1963,
        youtube_url: "https://www.youtube.com/watch?v=VJ2K1tJQgB8",
        description: "A festive Latin version that topped the charts. Trini Lopez brings an irresistible dancing rhythm to it.",
        votes_score: 156
      }
    ]
  },
  {
    title: "This Land Is Your Land",
    original_artist: "Woody Guthrie",
    year: 1940,
    youtube_url: "https://www.youtube.com/watch?v=wxiMrvDbq3s",
    description: "Woody Guthrie wrote this song in response to 'God Bless America', which he found too complacent. The often-omitted verses contain sharp social criticism.",
    covers: [
      {
        artist: "Pete Seeger & Bruce Springsteen",
        year: 2009,
        youtube_url: "https://www.youtube.com/watch?v=LJ87gMi3F8c",
        description: "Historic performance at Obama's inauguration. Pete Seeger, then 89 years old, sings with Bruce Springsteen in front of the Lincoln Memorial.",
        votes_score: 345
      },
      {
        artist: "Sharon Jones & The Dap-Kings",
        year: 2009,
        youtube_url: "https://www.youtube.com/watch?v=p73-r0cTL9g",
        description: "Sharon Jones transforms this folk classic into a soul explosion. The power of her voice brings Guthrie's message back to life.",
        votes_score: 178
      }
    ]
  },
  {
    title: "Where Did You Sleep Last Night",
    original_artist: "Lead Belly",
    year: 1944,
    youtube_url: "https://www.youtube.com/watch?v=PsfcUZBMSSg",
    description: "Also known as 'In the Pines', this traditional American song was popularized by Lead Belly. Its origins trace back to the 19th-century Appalachians.",
    covers: [
      {
        artist: "Nirvana",
        year: 1994,
        youtube_url: "https://www.youtube.com/watch?v=gOZKz_sPM6U",
        description: "Kurt Cobain's performance on MTV Unplugged became legendary. His final scream, eyes rolling back, remains one of the most intense moments in rock history.",
        votes_score: 489
      },
      {
        artist: "Mark Lanegan",
        year: 1990,
        youtube_url: "https://www.youtube.com/watch?v=V4GEQgeJfP8",
        description: "Mark Lanegan delivers a haunted and atmospheric version. He's the one who introduced this song to Kurt Cobain.",
        votes_score: 156
      }
    ]
  },
  {
    title: "Scarborough Fair",
    original_artist: "Traditional",
    year: 1670,
    youtube_url: "https://www.youtube.com/watch?v=hVc4s15bGpo",
    description: "Traditional English ballad dating from the 17th century. It tells the story of a lover asking his former beloved to perform impossible tasks.",
    covers: [
      {
        artist: "Simon & Garfunkel",
        year: 1966,
        youtube_url: "https://www.youtube.com/watch?v=-Jj4s9I-53g",
        description: "The version that introduced this song to the world. Their counterpoint arrangement with 'Canticle' is a production masterpiece.",
        votes_score: 378
      },
      {
        artist: "Pentangle",
        year: 1968,
        youtube_url: "https://www.youtube.com/watch?v=_qG3Nn3b9uQ",
        description: "British folk group Pentangle delivers a version closer to traditional roots, with jazz and medieval influences.",
        votes_score: 123
      },
      {
        artist: "Sarah Brightman",
        year: 2000,
        youtube_url: "https://www.youtube.com/watch?v=SvltUJaeCow",
        description: "An ethereal and orchestral interpretation that highlights the mystical dimension of the song.",
        votes_score: 89
      }
    ]
  },
  {
    title: "Both Sides Now",
    original_artist: "Joni Mitchell",
    year: 1969,
    youtube_url: "https://www.youtube.com/watch?v=BrBJn17DhAc",
    description: "Joni Mitchell wrote this song at age 23 after reading Saul Bellow's 'Henderson the Rain King'. She re-recorded it in 2000 with a perspective transformed by age.",
    covers: [
      {
        artist: "Judy Collins",
        year: 1967,
        youtube_url: "https://www.youtube.com/watch?v=ro0FmvGEtyE",
        description: "Judy Collins recorded this song two years before Joni Mitchell herself. This version introduced it to the general public.",
        votes_score: 234
      },
      {
        artist: "Joni Mitchell (2000)",
        year: 2000,
        youtube_url: "https://www.youtube.com/watch?v=Pbn6a0AFfnM",
        description: "Joni revisits her own song 31 years later with an orchestra. Her voice has changed, so has her perspective. A meditation on the passage of time.",
        votes_score: 312
      },
      {
        artist: "Herbie Hancock",
        year: 2007,
        youtube_url: "https://www.youtube.com/watch?v=3RAqbVr3JHg",
        description: "Instrumental jazz version with Joni Mitchell herself. A fascinating harmonic deconstruction of the original song.",
        votes_score: 145
      }
    ]
  }
]

# Create songs and covers
songs_data.each do |song_data|
  covers_data = song_data.delete(:covers)

  song = Song.create!(song_data)
  puts "Created song: #{song.title}"

  covers_data.each do |cover_data|
    cover = song.covers.create!(
      artist: cover_data[:artist],
      year: cover_data[:year],
      youtube_url: cover_data[:youtube_url],
      description: cover_data[:description],
      votes_score: cover_data[:votes_score],
      votes_count: cover_data[:votes_score].abs,
      submitted_by: demo_user
    )
    puts "  - Added cover by #{cover.artist}"
  end
end

puts "\nSeeding complete!"
puts "Created #{Song.count} songs with #{Cover.count} covers"
puts "Demo user: demo@folklovers.com / password123"
