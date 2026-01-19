class Tag < ApplicationRecord
  include Sluggable
  sluggable_source :name, ensure_unique: false

  has_many :article_tags, dependent: :destroy
  has_many :articles, through: :article_tags
  has_many :cover_tags, dependent: :destroy
  has_many :covers, through: :cover_tags

  validates :name, presence: true, uniqueness: { case_sensitive: false }

  scope :with_published_articles, -> {
    joins(:articles).where.not(articles: { published_at: nil }).distinct
  }
end
