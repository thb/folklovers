class Artist < ApplicationRecord
  include Sluggable
  sluggable_source :name, ensure_unique: false

  has_many :covers, dependent: :nullify

  validates :name, presence: true

  def self.find_or_create_by_name(name)
    slug = generate_slug_from(name)
    find_by(slug: slug) || create(name: name, slug: slug)
  end

  def self.generate_slug_from(value)
    value.to_s.downcase.gsub(/[^a-z0-9\s-]/, "").gsub(/\s+/, "-").gsub(/-+/, "-").strip
  end
end
