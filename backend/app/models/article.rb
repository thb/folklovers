class Article < ApplicationRecord
  include Sluggable
  sluggable_source :title

  belongs_to :author, class_name: "User"
  has_many :article_tags, dependent: :destroy
  has_many :tags, through: :article_tags

  validates :title, presence: true
  validates :content, presence: true

  before_save :generate_excerpt, if: -> { excerpt.blank? && content.present? }

  scope :published, -> { where.not(published_at: nil).where("published_at <= ?", Time.current) }
  scope :drafts, -> { where(published_at: nil) }
  scope :by_tag, ->(tag_slug) { joins(:tags).where(tags: { slug: tag_slug }) }
  scope :recent, -> { order(published_at: :desc, created_at: :desc) }
  scope :search, ->(query) { where("title ILIKE :q OR content ILIKE :q", q: "%#{query}%") }

  def published?
    published_at.present? && published_at <= Time.current
  end

  def draft?
    !published?
  end

  private

  def generate_excerpt
    plain_text = content.gsub(/[#*_\[\]()>`~]/, "").gsub(/\n+/, " ").strip
    self.excerpt = plain_text.truncate(160)
  end
end
