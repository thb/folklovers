require "rails_helper"

RSpec.describe "Admin::Users", type: :request do
  let(:admin) { create(:user, role: :admin) }
  let(:user) { create(:user) }
  let(:song) { create(:song) }

  def auth_headers(user)
    token = JsonWebToken.encode({ user_id: user.id })
    { "Authorization" => "Bearer #{token}" }
  end

  describe "GET /admin/users" do
    it "returns users for admin" do
      user
      get "/admin/users", headers: auth_headers(admin)
      expect(response).to have_http_status(:ok)
      expect(json_response["users"]).to be_an(Array)
      expect(json_response["pagination"]).to include("total_count", "current_page", "total_pages")
    end

    it "includes contribution counts" do
      cover = create(:cover, song: song, submitted_by: user)
      create(:vote, user: user, cover: cover)

      get "/admin/users", headers: auth_headers(admin)
      expect(response).to have_http_status(:ok)

      user_data = json_response["users"].find { |u| u["id"] == user.id }
      expect(user_data["covers_count"]).to eq(1)
      expect(user_data["votes_count"]).to eq(1)
    end

    it "returns 403 for non-admin" do
      get "/admin/users", headers: auth_headers(user)
      expect(response).to have_http_status(:forbidden)
    end

    it "returns 401 without auth" do
      get "/admin/users"
      expect(response).to have_http_status(:unauthorized)
    end
  end

  describe "GET /admin/users/:id" do
    it "returns user details with contributions" do
      cover = create(:cover, song: song, submitted_by: user)
      create(:vote, user: user, cover: cover)

      get "/admin/users/#{user.id}", headers: auth_headers(admin)
      expect(response).to have_http_status(:ok)
      expect(json_response["user"]["id"]).to eq(user.id)
      expect(json_response["user"]["email"]).to eq(user.email)
      expect(json_response["contributions"]["covers_submitted"]).to be_an(Array)
      expect(json_response["contributions"]["covers_submitted"].length).to eq(1)
      expect(json_response["contributions"]["votes_count"]).to eq(1)
    end

    it "includes song info in submitted covers" do
      cover = create(:cover, song: song, submitted_by: user)

      get "/admin/users/#{user.id}", headers: auth_headers(admin)
      expect(response).to have_http_status(:ok)

      cover_data = json_response["contributions"]["covers_submitted"].first
      expect(cover_data["artist"]).to eq(cover.artist_name)
      expect(cover_data["song_title"]).to eq(song.title)
      expect(cover_data["song_slug"]).to eq(song.slug)
    end

    it "returns 403 for non-admin" do
      get "/admin/users/#{user.id}", headers: auth_headers(user)
      expect(response).to have_http_status(:forbidden)
    end

    it "returns 404 for non-existent user" do
      get "/admin/users/999999", headers: auth_headers(admin)
      expect(response).to have_http_status(:not_found)
    end
  end

  def json_response
    JSON.parse(response.body)
  end
end
