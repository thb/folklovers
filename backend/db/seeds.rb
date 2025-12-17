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
    description: "Écrite en septembre-octobre 1963, cette chanson est devenue un hymne du mouvement des droits civiques et de la contre-culture américaine. Dylan l'a délibérément écrite comme un \"anthem of change\" inspiré par les ballades irlandaises et écossaises.",
    covers: [
      {
        artist: "Nina Simone",
        year: 1969,
        youtube_url: "https://www.youtube.com/watch?v=sXPkmIwwobA",
        description: "Nina transforme cette chanson folk en un cri de rage et d'espoir. Sa version au piano est plus lente, plus intense, presque menaçante. Elle ne chante pas le changement, elle l'exige.",
        votes_score: 247
      },
      {
        artist: "Eddie Vedder",
        year: 2007,
        youtube_url: "https://www.youtube.com/watch?v=PQKQE3OsJqU",
        description: "Eddie ramène la chanson à ses racines folk tout en y insufflant l'énergie du rock. Version dépouillée, voix rauque, juste une guitare acoustique.",
        votes_score: 186
      },
      {
        artist: "Simon & Garfunkel",
        year: 1965,
        youtube_url: "https://www.youtube.com/watch?v=Y_HXpN9VJxE",
        description: "Les harmonies vocales de Paul et Art adoucissent le message sans l'affaiblir. Une version plus accessible qui a introduit beaucoup de gens à Dylan.",
        votes_score: 134
      },
      {
        artist: "The Byrds",
        year: 1965,
        youtube_url: "https://www.youtube.com/watch?v=W4ga_M5Zdn4",
        description: "Le son jingle-jangle de la Rickenbacker 12 cordes transforme cette ballade folk en quelque chose de complètement différent. Les Byrds ont inventé le folk-rock avec des reprises comme celle-ci.",
        votes_score: 67
      }
    ]
  },
  {
    title: "Blowin' in the Wind",
    original_artist: "Bob Dylan",
    year: 1962,
    youtube_url: "https://www.youtube.com/watch?v=vWwgrjjIMXA",
    description: "L'une des chansons les plus emblématiques de Dylan, devenue un hymne du mouvement pour les droits civiques. Les questions rhétoriques posées dans la chanson résonnent encore aujourd'hui.",
    covers: [
      {
        artist: "Peter, Paul and Mary",
        year: 1963,
        youtube_url: "https://www.youtube.com/watch?v=Ld6fAO4idaI",
        description: "C'est cette version qui a fait connaître la chanson au grand public. Les harmonies à trois voix lui donnent une dimension spirituelle, presque gospel.",
        votes_score: 312
      },
      {
        artist: "Stevie Wonder",
        year: 1966,
        youtube_url: "https://www.youtube.com/watch?v=jNO72aCnVr0",
        description: "Stevie Wonder avait seulement 16 ans quand il a enregistré cette version. Il y apporte une sensibilité soul qui enrichit le message de Dylan.",
        votes_score: 198
      },
      {
        artist: "Neil Young",
        year: 1992,
        youtube_url: "https://www.youtube.com/watch?v=7I2ADXzqI_Y",
        description: "Neil Young, fidèle à lui-même, livre une version brute et émotionnelle. Sa voix fragile porte toute la vulnérabilité de la chanson.",
        votes_score: 145
      }
    ]
  },
  {
    title: "Hallelujah",
    original_artist: "Leonard Cohen",
    year: 1984,
    youtube_url: "https://www.youtube.com/watch?v=ttEMYvpoR-k",
    description: "Leonard Cohen a mis cinq ans à écrire cette chanson, produisant des dizaines de couplets. Elle est devenue l'une des chansons les plus reprises de l'histoire de la musique.",
    covers: [
      {
        artist: "Jeff Buckley",
        year: 1994,
        youtube_url: "https://www.youtube.com/watch?v=y8AWFf7EAc4",
        description: "La version définitive pour beaucoup. Jeff Buckley transcende l'original avec une intensité émotionnelle à couper le souffle. Sa voix de fausset sur les derniers couplets est inoubliable.",
        votes_score: 456
      },
      {
        artist: "Rufus Wainwright",
        year: 2001,
        youtube_url: "https://www.youtube.com/watch?v=PBo-n_17XU0",
        description: "Version orchestrale et théâtrale qui a été popularisée par le film Shrek. Rufus apporte une grandeur baroque à la chanson.",
        votes_score: 178
      },
      {
        artist: "k.d. lang",
        year: 2005,
        youtube_url: "https://www.youtube.com/watch?v=P_NpxTWbovE",
        description: "Une interprétation magistrale aux Juno Awards. k.d. lang capture toute la spiritualité et la sensualité de la chanson avec une voix parfaitement maîtrisée.",
        votes_score: 234
      },
      {
        artist: "John Cale",
        year: 1991,
        youtube_url: "https://www.youtube.com/watch?v=vvNvs6dZCC4",
        description: "C'est cette version qui a relancé l'intérêt pour la chanson. John Cale, ancien membre du Velvet Underground, en fait une pièce minimaliste au piano.",
        votes_score: 156
      }
    ]
  },
  {
    title: "Suzanne",
    original_artist: "Leonard Cohen",
    year: 1967,
    youtube_url: "https://www.youtube.com/watch?v=svitEEpI07E",
    description: "Inspirée par Suzanne Verdal, une danseuse de Montréal, cette chanson mêle poésie, spiritualité et désir avec une délicatesse rare. Un chef-d'œuvre du folk littéraire.",
    covers: [
      {
        artist: "Judy Collins",
        year: 1966,
        youtube_url: "https://www.youtube.com/watch?v=7TsvUMgNxgU",
        description: "Judy Collins a en fait enregistré cette chanson avant Cohen lui-même. C'est elle qui l'a fait découvrir au monde avec sa voix cristalline.",
        votes_score: 189
      },
      {
        artist: "Nina Simone",
        year: 1969,
        youtube_url: "https://www.youtube.com/watch?v=4kUOjxeFHyM",
        description: "Nina Simone s'approprie complètement la chanson, la transformant en une méditation jazz hypnotique.",
        votes_score: 167
      },
      {
        artist: "Roberta Flack",
        year: 1969,
        youtube_url: "https://www.youtube.com/watch?v=4f9K5vSAVrk",
        description: "Une version soul et sensuelle qui met en valeur les aspects romantiques de la chanson.",
        votes_score: 98
      }
    ]
  },
  {
    title: "House of the Rising Sun",
    original_artist: "Traditional",
    year: 1930,
    youtube_url: "https://www.youtube.com/watch?v=bwAw9ThDQmk",
    description: "Chanson folk traditionnelle américaine dont les origines remontent au début du 20e siècle, voire avant. Elle raconte l'histoire d'une vie gâchée à La Nouvelle-Orléans.",
    covers: [
      {
        artist: "The Animals",
        year: 1964,
        youtube_url: "https://www.youtube.com/watch?v=4-43lLKaqBQ",
        description: "LA version qui a tout changé. Eric Burdon et les Animals ont transformé cette ballade folk en un monument du rock avec cet orgue Hammond inoubliable.",
        votes_score: 523
      },
      {
        artist: "Bob Dylan",
        year: 1962,
        youtube_url: "https://www.youtube.com/watch?v=wIWlK9MrWOk",
        description: "La version folk traditionnelle de Dylan, enregistrée pour son premier album. Brute, authentique, elle montre ses racines dans le folk revival.",
        votes_score: 234
      },
      {
        artist: "Joan Baez",
        year: 1960,
        youtube_url: "https://www.youtube.com/watch?v=OTvASJ8AJnw",
        description: "Joan Baez livre une interprétation pure et émouvante, sa voix de soprano portant toute la tragédie du texte.",
        votes_score: 187
      }
    ]
  },
  {
    title: "If I Had a Hammer",
    original_artist: "Pete Seeger & Lee Hays",
    year: 1949,
    youtube_url: "https://www.youtube.com/watch?v=5TXML3YgZHA",
    description: "Écrite par Pete Seeger et Lee Hays des Weavers, cette chanson est devenue un hymne du mouvement ouvrier et des droits civiques.",
    covers: [
      {
        artist: "Peter, Paul and Mary",
        year: 1962,
        youtube_url: "https://www.youtube.com/watch?v=Rz9xAByv_pM",
        description: "La version qui a fait de cette chanson un tube mainstream. Leur interprétation joyeuse et énergique a touché des millions de personnes.",
        votes_score: 267
      },
      {
        artist: "Trini Lopez",
        year: 1963,
        youtube_url: "https://www.youtube.com/watch?v=VJ2K1tJQgB8",
        description: "Une version festive et latine qui a cartonné dans les charts. Trini Lopez y apporte un rythme dansant irrésistible.",
        votes_score: 156
      }
    ]
  },
  {
    title: "This Land Is Your Land",
    original_artist: "Woody Guthrie",
    year: 1940,
    youtube_url: "https://www.youtube.com/watch?v=wxiMrvDbq3s",
    description: "Woody Guthrie a écrit cette chanson en réponse à 'God Bless America', qu'il trouvait trop complaisante. Les couplets souvent omis sont une critique sociale acerbe.",
    covers: [
      {
        artist: "Pete Seeger & Bruce Springsteen",
        year: 2009,
        youtube_url: "https://www.youtube.com/watch?v=LJ87gMi3F8c",
        description: "Performance historique à l'inauguration d'Obama. Pete Seeger, alors âgé de 89 ans, chante avec Bruce Springsteen devant le Lincoln Memorial.",
        votes_score: 345
      },
      {
        artist: "Sharon Jones & The Dap-Kings",
        year: 2009,
        youtube_url: "https://www.youtube.com/watch?v=p73-r0cTL9g",
        description: "Sharon Jones transforme ce classique folk en une explosion soul. La puissance de sa voix redonne vie au message de Guthrie.",
        votes_score: 178
      }
    ]
  },
  {
    title: "Where Did You Sleep Last Night",
    original_artist: "Lead Belly",
    year: 1944,
    youtube_url: "https://www.youtube.com/watch?v=PsfcUZBMSSg",
    description: "Aussi connue sous le nom 'In the Pines', cette chanson traditionnelle américaine a été popularisée par Lead Belly. Ses origines remontent aux Appalaches du 19e siècle.",
    covers: [
      {
        artist: "Nirvana",
        year: 1994,
        youtube_url: "https://www.youtube.com/watch?v=gOZKz_sPM6U",
        description: "La performance de Kurt Cobain sur MTV Unplugged est devenue légendaire. Son cri final, les yeux révulsés, reste l'un des moments les plus intenses de l'histoire du rock.",
        votes_score: 489
      },
      {
        artist: "Mark Lanegan",
        year: 1990,
        youtube_url: "https://www.youtube.com/watch?v=V4GEQgeJfP8",
        description: "Mark Lanegan livre une version hantée et atmosphérique. C'est lui qui a fait découvrir cette chanson à Kurt Cobain.",
        votes_score: 156
      }
    ]
  },
  {
    title: "Scarborough Fair",
    original_artist: "Traditional",
    year: 1670,
    youtube_url: "https://www.youtube.com/watch?v=hVc4s15bGpo",
    description: "Ballade traditionnelle anglaise datant du 17e siècle. Elle raconte l'histoire d'un amant qui demande à son ancienne bien-aimée d'accomplir des tâches impossibles.",
    covers: [
      {
        artist: "Simon & Garfunkel",
        year: 1966,
        youtube_url: "https://www.youtube.com/watch?v=-Jj4s9I-53g",
        description: "La version qui a fait connaître cette chanson au monde entier. Leur arrangement en contrepoint avec 'Canticle' est un chef-d'œuvre de production.",
        votes_score: 378
      },
      {
        artist: "Pentangle",
        year: 1968,
        youtube_url: "https://www.youtube.com/watch?v=_qG3Nn3b9uQ",
        description: "Le groupe de folk britannique Pentangle livre une version plus proche des racines traditionnelles, avec des influences jazz et médiévales.",
        votes_score: 123
      },
      {
        artist: "Sarah Brightman",
        year: 2000,
        youtube_url: "https://www.youtube.com/watch?v=SvltUJaeCow",
        description: "Une interprétation éthérée et orchestrale qui met en valeur la dimension mystique de la chanson.",
        votes_score: 89
      }
    ]
  },
  {
    title: "Both Sides Now",
    original_artist: "Joni Mitchell",
    year: 1969,
    youtube_url: "https://www.youtube.com/watch?v=BrBJn17DhAc",
    description: "Joni Mitchell a écrit cette chanson à 23 ans après avoir lu 'Henderson the Rain King' de Saul Bellow. Elle l'a réenregistrée en 2000 avec une perspective transformée par l'âge.",
    covers: [
      {
        artist: "Judy Collins",
        year: 1967,
        youtube_url: "https://www.youtube.com/watch?v=ro0FmvGEtyE",
        description: "Judy Collins a enregistré cette chanson deux ans avant Joni Mitchell elle-même. C'est cette version qui l'a fait connaître au grand public.",
        votes_score: 234
      },
      {
        artist: "Joni Mitchell (2000)",
        year: 2000,
        youtube_url: "https://www.youtube.com/watch?v=Pbn6a0AFfnM",
        description: "Joni revisite sa propre chanson 31 ans plus tard avec un orchestre. Sa voix a changé, sa perspective aussi. Une méditation sur le temps qui passe.",
        votes_score: 312
      },
      {
        artist: "Herbie Hancock",
        year: 2007,
        youtube_url: "https://www.youtube.com/watch?v=3RAqbVr3JHg",
        description: "Version jazz instrumentale avec Joni Mitchell elle-même. Une déconstruction harmonique fascinante de la chanson originale.",
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
