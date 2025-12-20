class TagBlueprint < Blueprinter::Base
  identifier :id

  fields :name, :slug

  view :with_count do
    field :articles_count do |tag|
      tag.articles.published.count
    end
  end
end
