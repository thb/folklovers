require "rails_helper"

RSpec.describe "Auth", type: :request do
  describe "POST /auth/register" do
    let(:valid_params) do
      { email: "test@example.com", username: "testuser", password: "password123" }
    end

    context "with valid params" do
      it "creates a new user" do
        expect {
          post "/auth/register", params: valid_params
        }.to change(User, :count).by(1)
      end

      it "returns a JWT token" do
        post "/auth/register", params: valid_params
        expect(response).to have_http_status(:created)
        expect(json_response[:token]).to be_present
      end

      it "returns user data" do
        post "/auth/register", params: valid_params
        expect(json_response[:user][:email]).to eq("test@example.com")
        expect(json_response[:user][:username]).to eq("testuser")
      end
    end

    context "with invalid params" do
      it "returns errors for missing email" do
        post "/auth/register", params: valid_params.merge(email: "")
        expect(response).to have_http_status(:unprocessable_entity)
        expect(json_response[:errors]).to include("Email can't be blank")
      end

      it "returns errors for duplicate email" do
        create(:user, email: "test@example.com")
        post "/auth/register", params: valid_params
        expect(response).to have_http_status(:unprocessable_entity)
        expect(json_response[:errors]).to include("Email has already been taken")
      end

      it "returns errors for short password" do
        post "/auth/register", params: valid_params.merge(password: "short")
        expect(response).to have_http_status(:unprocessable_entity)
      end
    end
  end

  describe "POST /auth/login" do
    let!(:user) { create(:user, email: "test@example.com", password: "password123") }

    context "with valid credentials" do
      it "returns a JWT token" do
        post "/auth/login", params: { email: "test@example.com", password: "password123" }
        expect(response).to have_http_status(:ok)
        expect(json_response[:token]).to be_present
      end

      it "returns user data" do
        post "/auth/login", params: { email: "test@example.com", password: "password123" }
        expect(json_response[:user][:email]).to eq("test@example.com")
      end
    end

    context "with invalid credentials" do
      it "returns unauthorized for wrong password" do
        post "/auth/login", params: { email: "test@example.com", password: "wrongpassword" }
        expect(response).to have_http_status(:unauthorized)
        expect(json_response[:error]).to eq("Invalid email or password")
      end

      it "returns unauthorized for non-existent email" do
        post "/auth/login", params: { email: "nonexistent@example.com", password: "password123" }
        expect(response).to have_http_status(:unauthorized)
      end
    end
  end

  describe "GET /auth/me" do
    let(:user) { create(:user) }

    context "with valid token" do
      it "returns current user data" do
        get "/auth/me", headers: auth_headers(user)
        expect(response).to have_http_status(:ok)
        expect(json_response[:user][:id]).to eq(user.id)
        expect(json_response[:user][:email]).to eq(user.email)
      end
    end

    context "without token" do
      it "returns unauthorized" do
        get "/auth/me"
        expect(response).to have_http_status(:unauthorized)
      end
    end

    context "with invalid token" do
      it "returns unauthorized" do
        get "/auth/me", headers: { "Authorization" => "Bearer invalid_token" }
        expect(response).to have_http_status(:unauthorized)
      end
    end
  end

  describe "POST /auth/google" do
    let(:google_payload) do
      {
        "sub" => "google123456",
        "email" => "googleuser@example.com",
        "email_verified" => true,
        "picture" => "https://lh3.googleusercontent.com/avatar.jpg"
      }
    end

    context "with valid Google token" do
      before do
        allow(GoogleAuth).to receive(:verify).and_return(google_payload)
      end

      it "returns a JWT token" do
        post "/auth/google", params: { credential: "valid_google_token" }
        expect(response).to have_http_status(:ok)
        expect(json_response[:token]).to be_present
      end

      it "returns user data" do
        post "/auth/google", params: { credential: "valid_google_token" }
        expect(json_response[:user][:email]).to eq("googleuser@example.com")
      end

      it "creates a new user if not exists" do
        expect {
          post "/auth/google", params: { credential: "valid_google_token" }
        }.to change(User, :count).by(1)
      end

      it "links existing user by email" do
        existing_user = create(:user, email: "googleuser@example.com")

        expect {
          post "/auth/google", params: { credential: "valid_google_token" }
        }.not_to change(User, :count)

        expect(existing_user.reload.google_id).to eq("google123456")
      end

      it "finds existing user by google_id" do
        existing_user = create(:user, :google_user, google_id: "google123456", email: "other@example.com")

        expect {
          post "/auth/google", params: { credential: "valid_google_token" }
        }.not_to change(User, :count)

        expect(json_response[:user][:id]).to eq(existing_user.id)
      end
    end

    context "with invalid Google token" do
      before do
        allow(GoogleAuth).to receive(:verify).and_return(nil)
      end

      it "returns unauthorized" do
        post "/auth/google", params: { credential: "invalid_token" }
        expect(response).to have_http_status(:unauthorized)
        expect(json_response[:error]).to eq("Invalid Google token")
      end
    end
  end
end
