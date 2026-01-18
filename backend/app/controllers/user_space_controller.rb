class UserSpaceController < ApplicationController
  before_action :authenticate_user!

  def my_covers
    covers = current_user.submitted_covers
                         .includes(:song, :tags, :artist)
                         .order(created_at: :desc)

    render json: {
      covers: covers.map do |cover|
        CoverBlueprint.render_as_hash(cover, view: :with_user_vote, current_user: current_user)
          .merge(song: { title: cover.song.title, slug: cover.song.slug })
      end
    }
  end

  def my_votes
    votes = current_user.votes.includes(cover: [ :song, :tags, :submitted_by, :artist ])
                        .order(created_at: :desc)

    render json: {
      votes: votes.map do |vote|
        cover = vote.cover
        {
          vote_value: vote.value,
          voted_at: vote.created_at,
          cover: CoverBlueprint.render_as_hash(cover, view: :with_user_vote, current_user: current_user)
                    .merge(song: { title: cover.song.title, slug: cover.song.slug })
        }
      end
    }
  end

  def update_cover
    cover = current_user.submitted_covers.find(params[:id])

    if cover.update(cover_params)
      update_tags(cover) if params[:tag_ids].present?
      render json: {
        cover: CoverBlueprint.render_as_hash(cover.reload, view: :with_user_vote, current_user: current_user)
          .merge(song: { title: cover.song.title, slug: cover.song.slug })
      }
    else
      render json: { errors: cover.errors.full_messages }, status: :unprocessable_entity
    end
  rescue ActiveRecord::RecordNotFound
    render json: { error: "Cover not found or you don't have permission to edit it" }, status: :not_found
  end

  def delete_cover
    cover = current_user.submitted_covers.find(params[:id])
    cover.destroy
    head :no_content
  rescue ActiveRecord::RecordNotFound
    render json: { error: "Cover not found or you don't have permission to delete it" }, status: :not_found
  end

  private

  def cover_params
    params.permit(:artist, :year, :youtube_url, :description)
  end

  def update_tags(cover)
    tag_ids = Array(params[:tag_ids]).map(&:to_i).uniq
    tags = Tag.where(id: tag_ids)
    cover.tags = tags
  end
end
