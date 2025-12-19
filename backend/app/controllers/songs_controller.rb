class SongsController < ApplicationController
  before_action :authenticate_user!, only: [ :create ]
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

  def create
    song = Song.new(song_params)
    song.submitted_by = current_user

    Song.transaction do
      if song.save
        # Create the original cover
        original_cover = song.covers.create!(
          artist: song.original_artist,
          year: song.year,
          youtube_url: params[:youtube_url],
          description: params[:description],
          original: true,
          submitted_by: current_user
        )
        render json: { song: SongBlueprint.render_as_hash(song) }, status: :created
      else
        render json: { errors: song.errors.full_messages }, status: :unprocessable_entity
      end
    end
  rescue ActiveRecord::RecordInvalid => e
    render json: { errors: e.record.errors.full_messages }, status: :unprocessable_entity
  end

  private

  def song_params
    params.permit(:title, :original_artist, :year)
  end
end
