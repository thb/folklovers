module Admin
  class SongsController < BaseController
    def index
      songs = Song.includes(:covers).order(created_at: :desc)
      pagy, songs = pagy(songs, items: params[:per_page] || Pagination::ADMIN_PER_PAGE)

      render json: {
        songs: SongBlueprint.render_as_hash(songs),
        pagination: pagy_metadata(pagy)
      }
    end

    def show
      song = Song.find(params[:id])
      render json: { song: SongBlueprint.render_as_hash(song, view: :with_covers) }
    end

    def create
      service = CreateSongWithCoverService.new(
        song_params: song_params,
        cover_params: { youtube_url: params[:youtube_url], description: params[:description] }
      )

      if service.call
        render json: { song: SongBlueprint.render_as_hash(service.song) }, status: :created
      else
        render json: { errors: service.errors }, status: :unprocessable_entity
      end
    end

    def update
      song = Song.find(params[:id])

      if song.update(song_params)
        render json: { song: SongBlueprint.render_as_hash(song) }
      else
        render json: { errors: song.errors.full_messages }, status: :unprocessable_entity
      end
    end

    def destroy
      song = Song.find(params[:id])
      song.destroy
      head :no_content
    end

    private

    def song_params
      params.permit(:title, :original_artist, :year)
    end
  end
end
