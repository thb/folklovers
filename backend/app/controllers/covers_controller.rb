class CoversController < ApplicationController
  before_action :authenticate_user!, only: [ :create ]
  has_scope :sorted_by, default: "score"

  def index
    song = Song.find_by!(slug: params[:song_slug])
    covers = apply_scopes(song.covers).includes(:submitted_by)

    render json: {
      covers: CoverBlueprint.render_as_hash(
        covers,
        view: :with_user_vote,
        current_user: current_user
      )
    }
  rescue ActiveRecord::RecordNotFound
    render json: { error: "Song not found" }, status: :not_found
  end

  def create
    song = Song.find_by!(slug: params[:song_slug])
    cover = song.covers.build(cover_params)
    cover.submitted_by = current_user

    if cover.save
      render json: {
        cover: CoverBlueprint.render_as_hash(cover, view: :with_user_vote, current_user: current_user)
      }, status: :created
    else
      render json: { errors: cover.errors.full_messages }, status: :unprocessable_entity
    end
  rescue ActiveRecord::RecordNotFound
    render json: { error: "Song not found" }, status: :not_found
  end

  def top
    covers = Cover.includes(:song, :submitted_by)
                  .order(votes_score: :desc, created_at: :desc)
                  .limit(params[:limit] || 6)

    render json: {
      covers: covers.map do |cover|
        CoverBlueprint.render_as_hash(cover, view: :with_user_vote, current_user: current_user)
          .merge(song: { title: cover.song.title, slug: cover.song.slug })
      end
    }
  end

  private

  def cover_params
    params.permit(:artist, :year, :youtube_url, :description)
  end
end
