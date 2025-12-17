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
end

namespace :prod do
  desc "Populate production with songs and covers from JSON (stdin or FILE env)"
  task :populate do
    api_url = ENV["API_URL"] || "https://api.thefolklovers.com"
    email = ENV["ADMIN_EMAIL"] || raise("Set ADMIN_EMAIL env var")
    password = ENV["ADMIN_PASSWORD"] || raise("Set ADMIN_PASSWORD env var")

    # Read JSON input
    json_input = if ENV["FILE"]
      File.read(ENV["FILE"])
    else
      STDIN.read
    end
    data = JSON.parse(json_input)

    # Login
    puts "Logging in to #{api_url}..."
    token = ProdApi.login(api_url, email, password)
    raise "Login failed" unless token
    puts "Authenticated!"

    # Create songs and covers
    data["songs"]&.each do |song_data|
      covers_data = song_data.delete("covers") || []

      # Create song
      puts "Creating song: #{song_data["title"]}..."
      song = ProdApi.post("#{api_url}/admin/songs", song_data, token)

      if song && song["song"]
        song_id = song["song"]["id"]
        puts "  Created song ##{song_id}"

        # Create covers
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

  desc "Update a song's YouTube URL in production: SONG_ID=1 URL=https://..."
  task :update_song do
    api_url = ENV["API_URL"] || "https://api.thefolklovers.com"
    email = ENV["ADMIN_EMAIL"] || raise("Set ADMIN_EMAIL")
    password = ENV["ADMIN_PASSWORD"] || raise("Set ADMIN_PASSWORD")
    song_id = ENV["SONG_ID"] || raise("Set SONG_ID")
    url = ENV["URL"] || raise("Set URL")

    token = ProdApi.login(api_url, email, password)
    result = ProdApi.patch("#{api_url}/admin/songs/#{song_id}", { youtube_url: url }, token)
    puts result["song"] ? "Updated: #{result["song"]["title"]}" : "Error: #{result}"
  end

  desc "Update a cover's YouTube URL in production: COVER_ID=1 URL=https://..."
  task :update_cover do
    api_url = ENV["API_URL"] || "https://api.thefolklovers.com"
    email = ENV["ADMIN_EMAIL"] || raise("Set ADMIN_EMAIL")
    password = ENV["ADMIN_PASSWORD"] || raise("Set ADMIN_PASSWORD")
    cover_id = ENV["COVER_ID"] || raise("Set COVER_ID")
    url = ENV["URL"] || raise("Set URL")

    token = ProdApi.login(api_url, email, password)
    result = ProdApi.patch("#{api_url}/admin/covers/#{cover_id}", { youtube_url: url }, token)
    puts result["cover"] ? "Updated: #{result["cover"]["artist"]}" : "Error: #{result}"
  end

  desc "List songs from production"
  task :list do
    api_url = ENV["API_URL"] || "https://api.thefolklovers.com"
    data = ProdApi.get("#{api_url}/songs")

    data["songs"].each do |song|
      puts "#{song["title"]} (#{song["original_artist"]}, #{song["year"]}) - #{song["covers_count"]} covers"
    end
  end
end
