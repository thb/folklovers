require "rails_helper"

RSpec.describe "Admin::Covers", type: :request do
  let(:admin) { create(:user, role: :admin) }
  let(:user) { create(:user) }
  let(:song) { create(:song, with_original: false) }
  let(:cover) { create(:cover, song: song) }

  def auth_headers(user)
    token = JsonWebToken.encode({ user_id: user.id })
    { "Authorization" => "Bearer #{token}" }
  end

  describe "GET /admin/covers" do
    it "returns covers for admin" do
      cover
      get "/admin/covers", headers: auth_headers(admin)
      expect(response).to have_http_status(:ok)
      expect(json_response["covers"]).to be_an(Array)
    end

    it "filters by song_id" do
      cover
      other_song = create(:song)
      other_cover = create(:cover, song: other_song)

      get "/admin/covers", params: { song_id: song.id }, headers: auth_headers(admin)
      expect(response).to have_http_status(:ok)
      expect(json_response["covers"].length).to eq(1)
      expect(json_response["covers"].first["id"]).to eq(cover.id)
    end

    it "returns 403 for non-admin" do
      get "/admin/covers", headers: auth_headers(user)
      expect(response).to have_http_status(:forbidden)
    end
  end

  describe "POST /admin/covers" do
    let(:valid_params) do
      {
        song_id: song.id,
        artist: "New Artist",
        youtube_url: "https://youtube.com/watch?v=test123"
      }
    end

    it "creates a cover" do
      post "/admin/covers", params: valid_params, headers: auth_headers(admin)
      expect(response).to have_http_status(:created)
      expect(json_response["cover"]["artist"]).to eq("New Artist")
    end
  end

  describe "PATCH /admin/covers/:id" do
    it "updates a cover" do
      patch "/admin/covers/#{cover.id}",
            params: { artist: "Updated Artist" },
            headers: auth_headers(admin)
      expect(response).to have_http_status(:ok)
      expect(json_response["cover"]["artist"]).to eq("Updated Artist")
      expect(cover.reload.artist).to eq("Updated Artist")
    end

    it "updates youtube_url" do
      patch "/admin/covers/#{cover.id}",
            params: { youtube_url: "https://youtube.com/watch?v=newvideo" },
            headers: auth_headers(admin)
      expect(response).to have_http_status(:ok)
      expect(cover.reload.youtube_url).to eq("https://youtube.com/watch?v=newvideo")
    end
  end

  describe "DELETE /admin/covers/:id" do
    it "deletes a cover" do
      cover
      expect {
        delete "/admin/covers/#{cover.id}", headers: auth_headers(admin)
      }.to change(Cover, :count).by(-1)
      expect(response).to have_http_status(:no_content)
    end
  end

  def json_response
    JSON.parse(response.body)
  end
end
