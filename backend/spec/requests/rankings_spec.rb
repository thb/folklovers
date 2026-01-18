require "rails_helper"

RSpec.describe "Rankings API", type: :request do
  describe "GET /rankings/covers" do
    let!(:song) { create(:song, with_original: false) }

    it "returns covers ranked by votes_score" do
      top_cover = create(:cover, song: song, votes_score: 100)
      mid_cover = create(:cover, song: song, votes_score: 50)
      low_cover = create(:cover, song: song, votes_score: 10)

      get "/rankings/covers"

      expect(response).to have_http_status(:ok)
      json = JSON.parse(response.body)
      expect(json["covers"].length).to eq(3)
      expect(json["covers"][0]["rank"]).to eq(1)
      expect(json["covers"][0]["id"]).to eq(top_cover.id)
      expect(json["covers"][1]["id"]).to eq(mid_cover.id)
      expect(json["covers"][2]["id"]).to eq(low_cover.id)
    end

    it "includes song info with each cover" do
      create(:cover, song: song, votes_score: 50)

      get "/rankings/covers"

      json = JSON.parse(response.body)
      expect(json["covers"].first["song"]["title"]).to eq(song.title)
      expect(json["covers"].first["song"]["slug"]).to eq(song.slug)
    end

    it "respects limit parameter" do
      create_list(:cover, 5, song: song)

      get "/rankings/covers", params: { limit: 2 }

      json = JSON.parse(response.body)
      expect(json["covers"].length).to eq(2)
    end
  end

  describe "GET /rankings/songs" do
    it "returns songs ranked by total cover votes" do
      song1 = create(:song, with_original: false)
      song2 = create(:song, with_original: false)

      create(:cover, song: song1, votes_score: 100)
      create(:cover, song: song1, votes_score: 50)
      create(:cover, song: song2, votes_score: 30)

      get "/rankings/songs"

      expect(response).to have_http_status(:ok)
      json = JSON.parse(response.body)
      expect(json["songs"].length).to eq(2)
      expect(json["songs"][0]["rank"]).to eq(1)
      expect(json["songs"][0]["id"]).to eq(song1.id)
      expect(json["songs"][0]["total_score"]).to eq(150)
      expect(json["songs"][1]["id"]).to eq(song2.id)
      expect(json["songs"][1]["total_score"]).to eq(30)
    end

    it "includes songs with no covers at the end" do
      song_with_covers = create(:song, with_original: false)
      song_no_covers = create(:song, with_original: false)

      create(:cover, song: song_with_covers, votes_score: 10)

      get "/rankings/songs"

      json = JSON.parse(response.body)
      expect(json["songs"].length).to eq(2)
      expect(json["songs"][0]["id"]).to eq(song_with_covers.id)
      expect(json["songs"][1]["id"]).to eq(song_no_covers.id)
      expect(json["songs"][1]["total_score"]).to eq(0)
    end
  end

  describe "GET /rankings/contributors" do
    it "returns contributors ranked by total votes on their covers" do
      user1 = create(:user)
      user2 = create(:user)
      song = create(:song, with_original: false)

      create(:cover, song: song, submitted_by: user1, votes_score: 100)
      create(:cover, song: song, submitted_by: user1, votes_score: 50)
      create(:cover, song: song, submitted_by: user2, votes_score: 30)

      get "/rankings/contributors"

      expect(response).to have_http_status(:ok)
      json = JSON.parse(response.body)
      expect(json["contributors"].length).to eq(2)
      expect(json["contributors"][0]["rank"]).to eq(1)
      expect(json["contributors"][0]["id"]).to eq(user1.id)
      expect(json["contributors"][0]["covers_count"]).to eq(2)
      expect(json["contributors"][0]["total_score"]).to eq(150)
      expect(json["contributors"][1]["id"]).to eq(user2.id)
    end

    it "returns contributor info" do
      user = create(:user, username: "folkfan", avatar_url: "https://example.com/avatar.jpg")
      song = create(:song, with_original: false)
      create(:cover, song: song, submitted_by: user, votes_score: 10)

      get "/rankings/contributors"

      json = JSON.parse(response.body)
      expect(json["contributors"].first["username"]).to eq("folkfan")
      expect(json["contributors"].first["avatar_url"]).to eq("https://example.com/avatar.jpg")
    end

    it "excludes users with no covers" do
      create(:user)  # User with no covers
      user_with_covers = create(:user)
      song = create(:song, with_original: false)
      create(:cover, song: song, submitted_by: user_with_covers)

      get "/rankings/contributors"

      json = JSON.parse(response.body)
      expect(json["contributors"].length).to eq(1)
      expect(json["contributors"].first["id"]).to eq(user_with_covers.id)
    end
  end
end
