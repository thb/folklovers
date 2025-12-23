module YoutubeValidatable
  extend ActiveSupport::Concern

  YOUTUBE_URL_REGEX = /\Ahttps?:\/\/(www\.)?youtube\.com\/watch\?v=[\w-]+|https?:\/\/youtu\.be\/[\w-]+/

  included do
    before_validation :normalize_youtube_url

    validates :youtube_url, format: {
      with: YOUTUBE_URL_REGEX,
      message: "must be a valid YouTube URL"
    }, allow_blank: true
  end

  private

  def normalize_youtube_url
    return if youtube_url.blank?

    video_id = extract_youtube_video_id(youtube_url)
    self.youtube_url = "https://www.youtube.com/watch?v=#{video_id}" if video_id
  end

  def extract_youtube_video_id(url)
    uri = URI.parse(url)
    return nil unless %w[http https].include?(uri.scheme)

    case uri.host&.gsub(/\Awww\./, "")
    when "youtube.com"
      params = URI.decode_www_form(uri.query || "").to_h
      params["v"]
    when "youtu.be"
      uri.path[1..]  # Remove leading slash
    end
  rescue URI::InvalidURIError
    nil
  end
end
