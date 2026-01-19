module Sluggable
  extend ActiveSupport::Concern

  included do
    before_validation :generate_slug, on: :create
    validates :slug, presence: true, uniqueness: true
  end

  class_methods do
    def sluggable_source(*fields, ensure_unique: true)
      @sluggable_fields = fields
      @sluggable_ensure_unique = ensure_unique
    end

    def sluggable_fields
      @sluggable_fields || [:name]
    end

    def sluggable_ensure_unique?
      @sluggable_ensure_unique != false
    end

    def generate_slug_from(value)
      value.to_s.parameterize
    end
  end

  def to_param
    slug
  end

  private

  def generate_slug
    return if slug.present?

    base_slug = build_base_slug
    self.slug = base_slug

    ensure_unique_slug(base_slug) if self.class.sluggable_ensure_unique?
  end

  def build_base_slug
    values = self.class.sluggable_fields.map { |field| send(field) }
    self.class.generate_slug_from(values.compact.join(" "))
  end

  def ensure_unique_slug(base_slug)
    counter = 1
    while self.class.exists?(slug: slug)
      self.slug = "#{base_slug}-#{counter}"
      counter += 1
    end
  end
end
