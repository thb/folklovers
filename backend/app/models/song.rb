class Song < ApplicationRecord
  has_many :covers, -> { order(votes_score: :desc) }, dependent: :destroy

  validates :title, presence: true
  validates :original_artist, presence: true
  validates :slug, presence: true, uniqueness: true

  before_validation :generate_slug, on: :create

  scope :by_artist, ->(artist) { where("original_artist ILIKE ?", "%#{artist}%") }
  scope :search, ->(query) { where("title ILIKE :q OR original_artist ILIKE :q", q: "%#{query}%") }

  def to_param
    slug
  end

  private

  def generate_slug
    return if slug.present?
    base_slug = "#{title} #{original_artist}".parameterize
    self.slug = base_slug
    counter = 1

    while Song.exists?(slug: slug)
      self.slug = "#{base_slug}-#{counter}"
      counter += 1
    end
  end
end
