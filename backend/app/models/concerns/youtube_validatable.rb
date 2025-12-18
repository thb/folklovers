module YoutubeValidatable
  extend ActiveSupport::Concern

  YOUTUBE_URL_REGEX = /\Ahttps?:\/\/(www\.)?youtube\.com\/watch\?v=[\w-]+|https?:\/\/youtu\.be\/[\w-]+/

  included do
    validates :youtube_url, format: {
      with: YOUTUBE_URL_REGEX,
      message: "must be a valid YouTube URL"
    }, allow_blank: true
  end
end
