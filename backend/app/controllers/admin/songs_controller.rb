module Admin
  class SongsController < BaseController
    def index
      songs = Song.includes(:covers).order(created_at: :desc)
      pagy, songs = pagy(songs, items: params[:per_page] || 20)

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
      song = Song.new(song_params)

      Song.transaction do
        if song.save
          # Create the original cover
          song.covers.create!(
            artist: song.original_artist,
            year: song.year,
            youtube_url: params[:youtube_url],
            description: params[:description],
            original: true
          )
          render json: { song: SongBlueprint.render_as_hash(song) }, status: :created
        else
          render json: { errors: song.errors.full_messages }, status: :unprocessable_entity
        end
      end
    rescue ActiveRecord::RecordInvalid => e
      render json: { errors: e.record.errors.full_messages }, status: :unprocessable_entity
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
