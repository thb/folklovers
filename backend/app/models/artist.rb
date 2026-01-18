class Artist < ApplicationRecord
  has_many :covers, dependent: :nullify

  validates :name, presence: true
  validates :slug, presence: true, uniqueness: true

  before_validation :generate_slug, on: :create

  def self.find_or_create_by_name(name)
    slug = generate_slug_from_name(name)
    find_by(slug: slug) || create(name: name, slug: slug)
  end

  def self.generate_slug_from_name(name)
    name.downcase.gsub(/[^a-z0-9\s-]/, "").gsub(/\s+/, "-").gsub(/-+/, "-").strip
  end

  private

  def generate_slug
    self.slug ||= self.class.generate_slug_from_name(name) if name.present?
  end
end
