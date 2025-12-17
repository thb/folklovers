require "net/http"
require "json"
require "uri"

module YouTubeAPI
  def self.search(query, api_key)
    uri = URI("https://www.googleapis.com/youtube/v3/search")
    params = {
      part: "snippet",
      q: query,
      type: "video",
      maxResults: 5,
      key: api_key
    }
    uri.query = URI.encode_www_form(params)

    http = Net::HTTP.new(uri.host, uri.port)
    http.use_ssl = true
    http.verify_mode = OpenSSL::SSL::VERIFY_NONE
    request = Net::HTTP::Get.new(uri.request_uri)
    response = http.request(request)
    data = JSON.parse(response.body)

    if data["error"]
      puts "API Error: #{data["error"]["message"]}"
      return []
    end

    data["items"]&.map do |item|
      {
        id: item["id"]["videoId"],
        title: item["snippet"]["title"],
        channel: item["snippet"]["channelTitle"],
        url: "https://www.youtube.com/watch?v=#{item["id"]["videoId"]}"
      }
    end || []
  end

  def self.video_exists?(video_id, api_key)
    uri = URI("https://www.googleapis.com/youtube/v3/videos")
    params = {
      part: "status",
      id: video_id,
      key: api_key
    }
    uri.query = URI.encode_www_form(params)

    http = Net::HTTP.new(uri.host, uri.port)
    http.use_ssl = true
    http.verify_mode = OpenSSL::SSL::VERIFY_NONE
    request = Net::HTTP::Get.new(uri.request_uri)
    response = http.request(request)
    data = JSON.parse(response.body)

    data["items"]&.any?
  end

  def self.extract_video_id(url)
    return nil unless url
    url[/(?:v=|youtu\.be\/)([^&\s]+)/, 1]
  end
end

namespace :youtube do
  desc "Search YouTube for a song/cover and show top results"
  task search: :environment do
    api_key = ENV["YOUTUBE_API_KEY"] || raise("Set YOUTUBE_API_KEY")
    query = ENV["Q"] || raise("Set Q='search query'")

    puts "Searching YouTube for: #{query}\n\n"
    results = YouTubeAPI.search(query, api_key)

    results.each_with_index do |video, i|
      puts "#{i + 1}. #{video[:title]}"
      puts "   Channel: #{video[:channel]}"
      puts "   URL: #{video[:url]}"
      puts ""
    end
  end

  desc "Find best YouTube video for each song and cover, update if needed"
  task fix_all: :environment do
    api_key = ENV["YOUTUBE_API_KEY"] || raise("Set YOUTUBE_API_KEY")

    puts "=== Checking Songs ===\n\n"
    Song.order(:title).each do |song|
      check_and_fix_video(song, "song", api_key)
    end

    puts "\n=== Checking Covers ===\n\n"
    Cover.includes(:song).order("songs.title, covers.artist").each do |cover|
      check_and_fix_video(cover, "cover", api_key)
    end
  end

  desc "Check all videos and report broken ones"
  task check: :environment do
    api_key = ENV["YOUTUBE_API_KEY"] || raise("Set YOUTUBE_API_KEY")

    puts "=== Checking Songs ===\n\n"
    Song.order(:title).each do |song|
      video_id = YouTubeAPI.extract_video_id(song.youtube_url)
      status = video_id && YouTubeAPI.video_exists?(video_id, api_key) ? "✓" : "✗ BROKEN"
      puts "#{status} #{song.title} (#{song.original_artist})"
      puts "   #{song.youtube_url}" if status.include?("BROKEN")
    end

    puts "\n=== Checking Covers ===\n\n"
    Cover.includes(:song).order("songs.title, covers.artist").each do |cover|
      video_id = YouTubeAPI.extract_video_id(cover.youtube_url)
      status = video_id && YouTubeAPI.video_exists?(video_id, api_key) ? "✓" : "✗ BROKEN"
      puts "#{status} #{cover.artist} - #{cover.song.title}"
      puts "   #{cover.youtube_url}" if status.include?("BROKEN")
    end
  end

  desc "Auto-fix a specific song: SONG_ID=1"
  task fix_song: :environment do
    api_key = ENV["YOUTUBE_API_KEY"] || raise("Set YOUTUBE_API_KEY")
    song = Song.find(ENV["SONG_ID"] || raise("Set SONG_ID"))

    query = "#{song.title} #{song.original_artist} official"
    puts "Searching: #{query}"

    results = YouTubeAPI.search(query, api_key)
    if results.any?
      best = results.first
      puts "Found: #{best[:title]}"
      puts "URL: #{best[:url]}"
      print "Update? (y/n): "
      if STDIN.gets.chomp.downcase == "y"
        song.update!(youtube_url: best[:url])
        puts "Updated!"
      end
    else
      puts "No results found"
    end
  end

  desc "Auto-fix a specific cover: COVER_ID=1"
  task fix_cover: :environment do
    api_key = ENV["YOUTUBE_API_KEY"] || raise("Set YOUTUBE_API_KEY")
    cover = Cover.find(ENV["COVER_ID"] || raise("Set COVER_ID"))

    query = "#{cover.artist} #{cover.song.title} cover"
    puts "Searching: #{query}"

    results = YouTubeAPI.search(query, api_key)
    if results.any?
      best = results.first
      puts "Found: #{best[:title]}"
      puts "URL: #{best[:url]}"
      print "Update? (y/n): "
      if STDIN.gets.chomp.downcase == "y"
        cover.update!(youtube_url: best[:url])
        puts "Updated!"
      end
    else
      puts "No results found"
    end
  end

  private

  def check_and_fix_video(record, type, api_key)
    video_id = YouTubeAPI.extract_video_id(record.youtube_url)
    exists = video_id && YouTubeAPI.video_exists?(video_id, api_key)

    if exists
      puts "✓ #{record.respond_to?(:title) ? record.title : "#{record.artist} - #{record.song.title}"}"
      return
    end

    name = record.respond_to?(:title) ? record.title : record.artist
    song_title = record.respond_to?(:title) ? record.title : record.song.title
    artist = record.respond_to?(:original_artist) ? record.original_artist : record.artist

    query = type == "song" ? "#{song_title} #{artist} official" : "#{artist} #{song_title} cover"
    puts "✗ #{name} - searching for replacement..."

    results = YouTubeAPI.search(query, api_key)
    if results.any?
      best = results.first
      record.update!(youtube_url: best[:url])
      puts "  → Fixed: #{best[:title]}"
      puts "    #{best[:url]}"
    else
      puts "  → No replacement found"
    end
  end
end
