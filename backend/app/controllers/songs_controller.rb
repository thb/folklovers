class SongsController < ApplicationController
  before_action :authenticate_user!, only: [ :create ]
  has_scope :by_artist
  has_scope :search
  has_scope :sorted_by, default: "recent"

  def index
    songs = apply_scopes(Song).includes(:covers)
    pagy, songs = pagy(songs, items: params[:per_page] || Pagination::SONGS_PER_PAGE)

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
                .limit(params[:limit] || Pagination::HOMEPAGE_LIMIT)

    render json: { songs: SongBlueprint.render_as_hash(songs) }
  end

  def search
    return render json: { songs: [] } if params[:q].blank? || params[:q].length < 2

    songs = Song.includes(:original_cover).search(params[:q]).limit(Pagination::SEARCH_LIMIT)
    render json: {
      songs: songs.map { |s| { id: s.id, title: s.title, original_artist: s.original_artist, slug: s.slug, has_original: s.has_original? } }
    }
  end

  def create
    service = CreateSongWithCoverService.new(
      song_params: song_params,
      cover_params: { youtube_url: params[:youtube_url], description: params[:description] },
      submitted_by: current_user
    )

    if service.call
      render json: { song: SongBlueprint.render_as_hash(service.song) }, status: :created
    else
      render json: { errors: service.errors }, status: :unprocessable_entity
    end
  end

  private

  def song_params
    params.permit(:title, :original_artist, :year)
  end
end
