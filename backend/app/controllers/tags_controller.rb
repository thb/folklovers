class TagsController < ApplicationController
  def index
    tags = Tag.order(:name)

    render json: {
      tags: tags.map { |tag| { id: tag.id, name: tag.name, slug: tag.slug } }
    }
  end
end
