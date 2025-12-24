module Admin
  class FeedbacksController < BaseController
    def index
      feedbacks = Feedback.includes(:user).order(created_at: :desc)
      feedbacks = feedbacks.where(status: params[:status]) if params[:status].present?
      pagy, feedbacks = pagy(feedbacks, items: params[:per_page] || 20)

      render json: {
        feedbacks: FeedbackBlueprint.render_as_hash(feedbacks),
        pagination: pagy_metadata(pagy)
      }
    end

    def update
      feedback = Feedback.find(params[:id])
      feedback.update!(feedback_params)

      render json: { feedback: FeedbackBlueprint.render_as_hash(feedback) }
    rescue ActiveRecord::RecordInvalid => e
      render json: { errors: e.record.errors.full_messages }, status: :unprocessable_entity
    end

    def destroy
      Feedback.find(params[:id]).destroy
      head :no_content
    end

    private

    def feedback_params
      params.permit(:status)
    end
  end
end
