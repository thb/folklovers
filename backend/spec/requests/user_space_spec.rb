require "rails_helper"

RSpec.describe "User Space API", type: :request do
  let(:user) { create(:user) }
  let(:other_user) { create(:user) }
  let!(:song) { create(:song, with_original: false) }

  describe "GET /me/covers" do
    it "requires authentication" do
      get "/me/covers"
      expect(response).to have_http_status(:unauthorized)
    end

    it "returns covers submitted by current user" do
      my_cover = create(:cover, song: song, submitted_by: user)
      other_cover = create(:cover, song: song, submitted_by: other_user)

      get "/me/covers", headers: auth_headers(user)

      expect(response).to have_http_status(:ok)
      json = JSON.parse(response.body)
      expect(json["covers"].length).to eq(1)
      expect(json["covers"].first["id"]).to eq(my_cover.id)
    end

    it "includes song info with each cover" do
      create(:cover, song: song, submitted_by: user)

      get "/me/covers", headers: auth_headers(user)

      json = JSON.parse(response.body)
      expect(json["covers"].first["song"]["title"]).to eq(song.title)
      expect(json["covers"].first["song"]["slug"]).to eq(song.slug)
    end

    it "returns covers in reverse chronological order" do
      old_cover = create(:cover, song: song, submitted_by: user, created_at: 1.week.ago)
      new_cover = create(:cover, song: song, submitted_by: user, created_at: 1.day.ago)

      get "/me/covers", headers: auth_headers(user)

      json = JSON.parse(response.body)
      expect(json["covers"].first["id"]).to eq(new_cover.id)
    end
  end

  describe "GET /me/votes" do
    it "requires authentication" do
      get "/me/votes"
      expect(response).to have_http_status(:unauthorized)
    end

    it "returns votes by current user" do
      cover1 = create(:cover, song: song)
      cover2 = create(:cover, song: song)
      create(:vote, user: user, cover: cover1, value: 1)
      create(:vote, user: user, cover: cover2, value: -1)
      create(:vote, user: other_user, cover: cover1, value: 1)

      get "/me/votes", headers: auth_headers(user)

      expect(response).to have_http_status(:ok)
      json = JSON.parse(response.body)
      expect(json["votes"].length).to eq(2)
    end

    it "includes vote value and cover info" do
      cover = create(:cover, song: song, artist: "Test Artist")
      create(:vote, user: user, cover: cover, value: 1)

      get "/me/votes", headers: auth_headers(user)

      json = JSON.parse(response.body)
      vote = json["votes"].first
      expect(vote["vote_value"]).to eq(1)
      expect(vote["cover"]["artist"]).to eq("Test Artist")
      expect(vote["cover"]["song"]["title"]).to eq(song.title)
    end
  end

  describe "PATCH /me/covers/:id" do
    let!(:my_cover) { create(:cover, song: song, submitted_by: user, artist: "Original Artist") }

    it "requires authentication" do
      patch "/me/covers/#{my_cover.id}", params: { artist: "New Artist" }
      expect(response).to have_http_status(:unauthorized)
    end

    it "updates user's own cover" do
      patch "/me/covers/#{my_cover.id}",
            params: { artist: "Updated Artist", year: 2020 },
            headers: auth_headers(user)

      expect(response).to have_http_status(:ok)
      json = JSON.parse(response.body)
      expect(json["cover"]["artist"]).to eq("Updated Artist")
      expect(json["cover"]["year"]).to eq(2020)
    end

    it "returns 404 for other user's cover" do
      other_cover = create(:cover, song: song, submitted_by: other_user)

      patch "/me/covers/#{other_cover.id}",
            params: { artist: "Hacked" },
            headers: auth_headers(user)

      expect(response).to have_http_status(:not_found)
    end

    it "updates cover tags" do
      tag1 = Tag.create!(name: "Folk", slug: "folk")
      tag2 = Tag.create!(name: "Blues", slug: "blues")

      patch "/me/covers/#{my_cover.id}",
            params: { tag_ids: [ tag1.id, tag2.id ] },
            headers: auth_headers(user)

      expect(response).to have_http_status(:ok)
      json = JSON.parse(response.body)
      expect(json["cover"]["tags"].map { |t| t["name"] }).to contain_exactly("Folk", "Blues")
    end
  end

  describe "DELETE /me/covers/:id" do
    let!(:my_cover) { create(:cover, song: song, submitted_by: user) }

    it "requires authentication" do
      delete "/me/covers/#{my_cover.id}"
      expect(response).to have_http_status(:unauthorized)
    end

    it "deletes user's own cover" do
      expect {
        delete "/me/covers/#{my_cover.id}", headers: auth_headers(user)
      }.to change(Cover, :count).by(-1)

      expect(response).to have_http_status(:no_content)
    end

    it "returns 404 for other user's cover" do
      other_cover = create(:cover, song: song, submitted_by: other_user)

      delete "/me/covers/#{other_cover.id}", headers: auth_headers(user)

      expect(response).to have_http_status(:not_found)
      expect(Cover.exists?(other_cover.id)).to be true
    end
  end
end
