class VotesController < ApplicationController
  before_action :authenticate_user!
  before_action :set_cover

  def create
    existing_vote = @cover.vote_by(current_user)
    value = params[:value].to_i

    if existing_vote
      if existing_vote.value == value
        existing_vote.destroy
        render json: { message: "Vote removed", cover: cover_json }
      else
        existing_vote.update!(value: value)
        render json: { message: "Vote updated", cover: cover_json }
      end
    else
      Vote.create!(user: current_user, cover: @cover, value: value)
      render json: { message: "Vote created", cover: cover_json }, status: :created
    end
  rescue ActiveRecord::RecordInvalid => e
    render json: { errors: e.record.errors.full_messages }, status: :unprocessable_entity
  end

  def destroy
    vote = @cover.vote_by(current_user)

    if vote
      vote.destroy
      render json: { message: "Vote removed", cover: cover_json }
    else
      render json: { error: "No vote found" }, status: :not_found
    end
  end

  private

  def set_cover
    @cover = Cover.find(params[:cover_id])
  rescue ActiveRecord::RecordNotFound
    render json: { error: "Cover not found" }, status: :not_found
  end

  def cover_json
    @cover.reload
    CoverBlueprint.render_as_hash(@cover, view: :with_user_vote, current_user: current_user)
  end
end
