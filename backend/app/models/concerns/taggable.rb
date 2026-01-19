module Taggable
  extend ActiveSupport::Concern

  included do
    join_table = :"#{model_name.singular}_tags"
    unless reflect_on_association(join_table)
      has_many join_table, dependent: :destroy
      has_many :tags, through: join_table
    end
  end

  def sync_tags_by_ids(tag_ids)
    return if tag_ids.nil?

    ids = Array(tag_ids).map(&:to_i).uniq
    self.tags = Tag.where(id: ids)
  end

  def sync_tags_by_names(tag_names)
    return if tag_names.nil?

    self.tags = tag_names.map do |name|
      Tag.find_or_create_by!(name: name.strip.downcase)
    end
  end
end
