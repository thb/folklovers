module Admin
  class CoversController < BaseController
    def index
      covers = Cover.includes(:song, :submitted_by).order(created_at: :desc)
      pagy, covers = pagy(covers, items: params[:per_page] || 20)

      render json: {
        covers: covers.map do |cover|
          CoverBlueprint.render_as_hash(cover).merge(
            song: { id: cover.song.id, title: cover.song.title, slug: cover.song.slug }
          )
        end,
        pagination: pagy_metadata(pagy)
      }
    end

    def show
      cover = Cover.includes(:song).find(params[:id])
      render json: {
        cover: CoverBlueprint.render_as_hash(cover).merge(
          song: { id: cover.song.id, title: cover.song.title, slug: cover.song.slug }
        )
      }
    end

    def create
      cover = Cover.new(cover_params)

      if cover.save
        render json: { cover: CoverBlueprint.render_as_hash(cover) }, status: :created
      else
        render json: { errors: cover.errors.full_messages }, status: :unprocessable_entity
      end
    end

    def update
      cover = Cover.find(params[:id])

      if cover.update(cover_params)
        render json: { cover: CoverBlueprint.render_as_hash(cover) }
      else
        render json: { errors: cover.errors.full_messages }, status: :unprocessable_entity
      end
    end

    def destroy
      cover = Cover.find(params[:id])
      cover.destroy
      head :no_content
    end

    private

    def cover_params
      params.permit(:song_id, :artist, :year, :youtube_url, :description)
    end
  end
end
