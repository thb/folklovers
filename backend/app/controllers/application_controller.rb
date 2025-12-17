class ApplicationController < ActionController::API
  include Pagy::Backend
  include HasScope

  private

  def current_user
    return @current_user if defined?(@current_user)

    header = request.headers["Authorization"]
    return nil unless header

    token = header.split(" ").last
    decoded = JsonWebToken.decode(token)
    return nil unless decoded

    @current_user = User.find_by(id: decoded[:user_id])
  end

  def authenticate_user!
    render json: { error: "Unauthorized" }, status: :unauthorized unless current_user
  end

  def authenticate_admin!
    authenticate_user!
    return if performed?

    render json: { error: "Forbidden" }, status: :forbidden unless current_user.admin?
  end

  def pagy_metadata(pagy)
    {
      current_page: pagy.page,
      total_pages: pagy.pages,
      total_count: pagy.count,
      per_page: pagy.items
    }
  end
end
