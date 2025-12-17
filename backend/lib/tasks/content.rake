namespace :content do
  desc "Populate songs and covers from JSON input (stdin or file)"
  task populate: :environment do
    # Read JSON from stdin or file
    json_input = if ENV["FILE"]
      File.read(ENV["FILE"])
    else
      STDIN.read
    end

    data = JSON.parse(json_input)
    admin_user = User.find_by(role: "admin") || User.first

    data["songs"]&.each do |song_data|
      covers_data = song_data.delete("covers") || []

      song = Song.find_by(title: song_data["title"])
      if song
        song.update!(song_data)
        puts "Updated song: #{song.title}"
      else
        song = Song.create!(song_data)
        puts "Created song: #{song.title}"
      end

      covers_data.each do |cover_data|
        cover = song.covers.find_by(artist: cover_data["artist"])
        if cover
          cover.update!(cover_data)
          puts "  Updated cover: #{cover.artist}"
        else
          cover = song.covers.create!(
            **cover_data.symbolize_keys,
            submitted_by: admin_user,
            votes_score: cover_data["votes_score"] || rand(50..200),
            votes_count: cover_data["votes_count"] || cover_data["votes_score"] || rand(50..200)
          )
          puts "  Created cover: #{cover.artist}"
        end
      end
    end

    puts "\nDone! #{Song.count} songs, #{Cover.count} covers total."
  end

  desc "Translate all content to English using AI (placeholder for manual review)"
  task translate: :environment do
    puts "Songs with French descriptions:"
    Song.all.each do |song|
      if song.description&.match?(/[àâäéèêëïîôùûüç]|qu'|d'|l'|c'est/i)
        puts "  #{song.id}: #{song.title}"
        puts "    #{song.description[0..100]}..."
      end
    end

    puts "\nCovers with French descriptions:"
    Cover.all.each do |cover|
      if cover.description&.match?(/[àâäéèêëïîôùûüç]|qu'|d'|l'|c'est/i)
        puts "  #{cover.id}: #{cover.artist} (#{cover.song.title})"
        puts "    #{cover.description[0..100]}..."
      end
    end
  end

  desc "Export all content to JSON"
  task export: :environment do
    data = {
      songs: Song.includes(:covers).order(:title).map do |song|
        {
          title: song.title,
          original_artist: song.original_artist,
          year: song.year,
          youtube_url: song.youtube_url,
          description: song.description,
          covers: song.covers.order(:artist).map do |cover|
            {
              artist: cover.artist,
              year: cover.year,
              youtube_url: cover.youtube_url,
              description: cover.description,
              votes_score: cover.votes_score
            }
          end
        }
      end
    }
    puts JSON.pretty_generate(data)
  end

  desc "List all songs with cover counts"
  task list: :environment do
    Song.includes(:covers).order(:title).each do |song|
      puts "#{song.title} (#{song.original_artist}, #{song.year}) - #{song.covers.count} covers"
    end
  end
end
