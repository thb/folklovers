class CoversController < ApplicationController
  before_action :authenticate_user!, only: [ :create, :create_with_song ]
  has_scope :sorted_by, default: "score"

  def index
    song = Song.find_by!(slug: params[:song_slug])
    covers = apply_scopes(song.covers).includes(:submitted_by, :tags, :artist)

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

    handle_original_flag(cover, song)

    if cover.save
      assign_tags(cover)
      render json: {
        cover: CoverBlueprint.render_as_hash(cover.reload, view: :with_user_vote, current_user: current_user)
      }, status: :created
    else
      render json: { errors: cover.errors.full_messages }, status: :unprocessable_entity
    end
  rescue ActiveRecord::RecordNotFound
    render json: { error: "Song not found" }, status: :not_found
  end

  def create_with_song
    @cover_errors = nil

    Cover.transaction do
      if params[:song_id].present?
        @song = Song.find(params[:song_id])
      else
        @song = Song.new(
          title: params[:song_title],
          original_artist: params[:original_artist],
          year: params[:song_year],
          submitted_by: current_user
        )
        unless @song.save
          return render json: { errors: @song.errors.full_messages }, status: :unprocessable_entity
        end
      end

      @cover = @song.covers.build(cover_params)
      @cover.submitted_by = current_user

      handle_original_flag(@cover, @song)

      if @cover.save
        assign_tags(@cover)
        return render json: {
          cover: CoverBlueprint.render_as_hash(@cover.reload, view: :with_user_vote, current_user: current_user),
          song: SongBlueprint.render_as_hash(@song)
        }, status: :created
      else
        @cover_errors = @cover.errors.full_messages
        raise ActiveRecord::Rollback
      end
    end

    render json: { errors: @cover_errors }, status: :unprocessable_entity if @cover_errors
  rescue ActiveRecord::RecordNotFound
    render json: { error: "Song not found" }, status: :not_found
  end

  def top
    covers = Cover.includes(:song, :submitted_by, :tags, :artist)
                  .order(votes_score: :desc, created_at: :desc)
                  .limit(params[:limit] || 6)

    render json: {
      covers: CoverBlueprint.render_as_hash(covers, view: :with_song, current_user: current_user)
    }
  end

  def recent
    covers = Cover.includes(:song, :submitted_by, :tags, :artist)
                  .order(created_at: :desc)
                  .limit(params[:limit] || 6)

    render json: {
      covers: CoverBlueprint.render_as_hash(covers, view: :with_song, current_user: current_user)
    }
  end

  private

  def cover_params
    params.permit(:artist, :year, :youtube_url, :description)
  end

  def assign_tags(cover)
    return unless params[:tag_ids].present?

    tag_ids = Array(params[:tag_ids]).map(&:to_i).uniq
    tags = Tag.where(id: tag_ids)
    cover.tags = tags
  end

  def handle_original_flag(cover, song)
    return unless params[:original] == true || params[:original] == "true"

    if current_user&.admin?
      # Admin can always set original, remove existing one if needed
      song.covers.where(original: true).update_all(original: false) if song.has_original?
      cover.original = true
    elsif !song.has_original?
      # User can only set original if song doesn't have one
      cover.original = true
    end
    # If user tries to set original but song already has one, silently ignore
  end
end
