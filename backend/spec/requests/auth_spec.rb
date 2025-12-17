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
end
