class Tag < ApplicationRecord
  has_many :article_tags, dependent: :destroy
  has_many :articles, through: :article_tags

  validates :name, presence: true, uniqueness: { case_sensitive: false }
  validates :slug, presence: true, uniqueness: true

  before_validation :generate_slug, on: :create

  scope :with_published_articles, -> {
    joins(:articles).where.not(articles: { published_at: nil }).distinct
  }

  private

  def generate_slug
    return if slug.present?
    self.slug = name.parameterize
  end
end
