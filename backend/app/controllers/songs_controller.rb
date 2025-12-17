class SongsController < ApplicationController
  has_scope :by_artist
  has_scope :search

  def index
    songs = apply_scopes(Song).includes(:covers)
    pagy, songs = pagy(songs, items: params[:per_page] || 12)

    render json: {
      songs: SongBlueprint.render_as_hash(songs),
      pagination: pagy_metadata(pagy)
    }
  end

  def show
    song = Song.includes(covers: :submitted_by).find_by!(slug: params[:slug])

    render json: {
      song: SongBlueprint.render_as_hash(song, view: :with_covers, current_user: current_user)
    }
  rescue ActiveRecord::RecordNotFound
    render json: { error: "Song not found" }, status: :not_found
  end

  def top
    songs = Song.joins(:covers)
                .group("songs.id")
                .order("SUM(covers.votes_score) DESC")
                .limit(params[:limit] || 6)

    render json: { songs: SongBlueprint.render_as_hash(songs) }
  end
end
