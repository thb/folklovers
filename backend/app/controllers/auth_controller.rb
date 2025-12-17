class AuthController < ApplicationController
  def register
    user = User.new(register_params)

    if user.save
      token = JsonWebToken.encode({ user_id: user.id })
      render json: { token: token, user: UserBlueprint.render_as_hash(user, view: :with_email) }, status: :created
    else
      render json: { errors: user.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def login
    user = User.find_by(email: params[:email])

    if user&.authenticate(params[:password])
      token = JsonWebToken.encode({ user_id: user.id })
      render json: { token: token, user: UserBlueprint.render_as_hash(user, view: :with_email) }
    else
      render json: { error: "Invalid email or password" }, status: :unauthorized
    end
  end

  def google
    payload = GoogleAuth.verify(params[:credential])

    if payload.nil?
      render json: { error: "Invalid Google token" }, status: :unauthorized
      return
    end

    user = User.find_or_create_from_google(payload)
    token = JsonWebToken.encode({ user_id: user.id })
    render json: { token: token, user: UserBlueprint.render_as_hash(user, view: :with_email) }
  rescue ActiveRecord::RecordInvalid => e
    render json: { errors: e.record.errors.full_messages }, status: :unprocessable_entity
  end

  def me
    if current_user
      render json: { user: UserBlueprint.render_as_hash(current_user, view: :with_email) }
    else
      render json: { error: "Unauthorized" }, status: :unauthorized
    end
  end

  private

  def register_params
    params.permit(:email, :username, :password)
  end
end
