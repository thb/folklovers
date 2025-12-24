class FeedbacksController < ApplicationController
  before_action :authenticate_user!

  def create
    feedback = current_user.feedbacks.build(feedback_params)

    if feedback.save
      render json: { feedback: FeedbackBlueprint.render_as_hash(feedback) }, status: :created
    else
      render json: { errors: feedback.errors.full_messages }, status: :unprocessable_entity
    end
  end

  private

  def feedback_params
    params.permit(:category, :message)
  end
end
