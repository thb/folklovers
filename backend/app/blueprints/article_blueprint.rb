class ArticleBlueprint < Blueprinter::Base
  identifier :id

  fields :title, :slug, :excerpt, :cover_image_url, :cover_image_credit, :published_at, :created_at, :updated_at

  field :is_published do |article|
    article.published?
  end

  association :author, blueprint: UserBlueprint
  association :tags, blueprint: TagBlueprint

  view :full do
    field :content
  end

  view :admin do
    field :content
  end
end
