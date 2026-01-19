class Song < ApplicationRecord
  include Sluggable
  sluggable_source :title, :original_artist

  has_many :covers, -> { order(original: :desc, votes_score: :desc) }, dependent: :destroy
  has_one :original_cover, -> { where(original: true) }, class_name: "Cover"
  belongs_to :submitted_by, class_name: "User", optional: true

  validates :title, presence: true
  validates :original_artist, presence: true
  validates :year, numericality: { only_integer: true }, allow_nil: true

  scope :by_artist, ->(artist) { where("original_artist ILIKE ?", "%#{artist}%") }
  scope :search, ->(query) { where("title ILIKE :q OR original_artist ILIKE :q", q: "%#{query}%") }
  scope :sorted_by, ->(sort) {
    case sort
    when "title_asc" then order(title: :asc)
    when "title_desc" then order(title: :desc)
    when "year_asc" then order(year: :asc)
    when "year_desc" then order(year: :desc)
    when "recent" then order(created_at: :desc)
    when "oldest" then order(created_at: :asc)
    else order(created_at: :desc)
    end
  }

  def thumbnail_url
    cover = original_cover || covers.first
    cover&.youtube_url&.then { |url| extract_youtube_thumbnail(url) }
  end

  def has_original?
    original_cover.present?
  end

  private

  def extract_youtube_thumbnail(url)
    match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&]+)/)
    match ? "https://img.youtube.com/vi/#{match[1]}/mqdefault.jpg" : nil
  end
end
