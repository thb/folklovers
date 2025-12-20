module Admin
  class TagsController < BaseController
    def index
      tags = Tag.order(:name)

      render json: {
        tags: TagBlueprint.render_as_hash(tags, view: :with_count)
      }
    end

    def destroy
      tag = Tag.find(params[:id])
      tag.destroy
      head :no_content
    end
  end
end
