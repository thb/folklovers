require "net/http"
require "json"
require "uri"

module ProdApi
  def self.login(api_url, email, password)
    uri = URI("#{api_url}/auth/login")
    http = Net::HTTP.new(uri.host, uri.port)
    http.use_ssl = uri.scheme == "https"
    http.verify_mode = OpenSSL::SSL::VERIFY_NONE if http.use_ssl?

    request = Net::HTTP::Post.new(uri.path)
    request["Content-Type"] = "application/json"
    request.body = { email: email, password: password }.to_json

    response = http.request(request)
    data = JSON.parse(response.body)
    data["token"]
  end

  def self.post(url, params, token)
    uri = URI(url)
    http = Net::HTTP.new(uri.host, uri.port)
    http.use_ssl = uri.scheme == "https"
    http.verify_mode = OpenSSL::SSL::VERIFY_NONE if http.use_ssl?

    request = Net::HTTP::Post.new(uri.path)
    request["Content-Type"] = "application/json"
    request["Authorization"] = "Bearer #{token}"
    request.body = params.to_json

    response = http.request(request)
    JSON.parse(response.body)
  rescue => e
    { "error" => e.message }
  end

  def self.patch(url, params, token)
    uri = URI(url)
    http = Net::HTTP.new(uri.host, uri.port)
    http.use_ssl = uri.scheme == "https"
    http.verify_mode = OpenSSL::SSL::VERIFY_NONE if http.use_ssl?

    request = Net::HTTP::Patch.new(uri.path)
    request["Content-Type"] = "application/json"
    request["Authorization"] = "Bearer #{token}"
    request.body = params.to_json

    response = http.request(request)
    JSON.parse(response.body)
  rescue => e
    { "error" => e.message }
  end

  def self.get(url, token = nil)
    uri = URI(url)
    http = Net::HTTP.new(uri.host, uri.port)
    http.use_ssl = uri.scheme == "https"
    http.verify_mode = OpenSSL::SSL::VERIFY_NONE if http.use_ssl?

    request = Net::HTTP::Get.new(uri.request_uri)
    request["Authorization"] = "Bearer #{token}" if token

    response = http.request(request)
    JSON.parse(response.body)
  end

  def self.credentials
    email = ENV["ADMIN_EMAIL"] || raise("Set ADMIN_EMAIL in .env")
    password = ENV["ADMIN_PASSWORD"] || raise("Set ADMIN_PASSWORD in .env")
    [email, password]
  end

  def self.api_url
    ENV["API_URL"] || "https://api.thefolklovers.com"
  end
end

namespace :prod do
  desc "Populate production from JSON file: bin/rails 'prod:populate[path/to/file.json]'"
  task :populate, [:file] => :environment do |_t, args|
    file_path = args[:file] || raise("Usage: bin/rails 'prod:populate[path/to/file.json]'")
    raise "File not found: #{file_path}" unless File.exist?(file_path)

    api_url = ProdApi.api_url
    email, password = ProdApi.credentials
    data = JSON.parse(File.read(file_path))

    puts "Logging in to #{api_url}..."
    token = ProdApi.login(api_url, email, password)
    raise "Login failed" unless token
    puts "Authenticated!"

    data["songs"]&.each do |song_data|
      covers_data = song_data.delete("covers") || []

      puts "Creating song: #{song_data["title"]}..."
      song = ProdApi.post("#{api_url}/admin/songs", song_data, token)

      if song && song["song"]
        song_id = song["song"]["id"]
        puts "  Created song ##{song_id}"

        covers_data.each do |cover_data|
          cover_data["song_id"] = song_id
          puts "  Creating cover: #{cover_data["artist"]}..."
          result = ProdApi.post("#{api_url}/admin/covers", cover_data, token)
          if result && result["cover"]
            puts "    Created cover ##{result["cover"]["id"]}"
          else
            puts "    Failed: #{result}"
          end
        end
      else
        puts "  Failed: #{song}"
      end
    end

    puts "\nDone!"
  end

  desc "Update song YouTube URL: bin/rails 'prod:update_song[ID,URL]'"
  task :update_song, [:song_id, :url] => :environment do |_t, args|
    song_id = args[:song_id] || raise("Usage: bin/rails 'prod:update_song[ID,URL]'")
    url = args[:url] || raise("Usage: bin/rails 'prod:update_song[ID,URL]'")

    api_url = ProdApi.api_url
    email, password = ProdApi.credentials

    token = ProdApi.login(api_url, email, password)
    result = ProdApi.patch("#{api_url}/admin/songs/#{song_id}", { youtube_url: url }, token)
    puts result["song"] ? "Updated: #{result["song"]["title"]}" : "Error: #{result}"
  end

  desc "Update cover YouTube URL: bin/rails 'prod:update_cover[ID,URL]'"
  task :update_cover, [:cover_id, :url] => :environment do |_t, args|
    cover_id = args[:cover_id] || raise("Usage: bin/rails 'prod:update_cover[ID,URL]'")
    url = args[:url] || raise("Usage: bin/rails 'prod:update_cover[ID,URL]'")

    api_url = ProdApi.api_url
    email, password = ProdApi.credentials

    token = ProdApi.login(api_url, email, password)
    result = ProdApi.patch("#{api_url}/admin/covers/#{cover_id}", { youtube_url: url }, token)
    puts result["cover"] ? "Updated: #{result["cover"]["artist"]}" : "Error: #{result}"
  end

  desc "List songs from production"
  task list: :environment do
    api_url = ProdApi.api_url
    data = ProdApi.get("#{api_url}/songs?per_page=100")

    data["songs"].each do |song|
      puts "#{song["id"]}: #{song["title"]} (#{song["original_artist"]}) - #{song["covers_count"]} covers"
    end
  end

  desc "Check production videos"
  task check: :environment do
    api_key = ENV["YOUTUBE_API_KEY"] || raise("Set YOUTUBE_API_KEY in .env")
    api_url = ProdApi.api_url

    require_relative "youtube.rake"

    songs_data = ProdApi.get("#{api_url}/songs?per_page=100")

    puts "=== Checking Songs ==="
    songs_data["songs"].each do |song|
      video_id = YouTubeAPI.extract_video_id(song["youtube_url"])
      exists = video_id && YouTubeAPI.video_exists?(video_id, api_key)
      status = exists ? "✓" : "✗"
      puts "#{status} #{song["title"]} (#{song["original_artist"]})"
      puts "   #{song["youtube_url"]}" unless exists
    end

    puts "\n=== Checking Covers ==="
    songs_data["songs"].each do |song|
      song_data = ProdApi.get("#{api_url}/songs/#{song["slug"]}")
      song_data["song"]["covers"]&.each do |cover|
        video_id = YouTubeAPI.extract_video_id(cover["youtube_url"])
        exists = video_id && YouTubeAPI.video_exists?(video_id, api_key)
        status = exists ? "✓" : "✗"
        puts "#{status} #{cover["artist"]} - #{song["title"]}"
        puts "   #{cover["youtube_url"]}" unless exists
      end
    end
  end
end
