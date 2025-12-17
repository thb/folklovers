require "rails_helper"

RSpec.describe "Covers", type: :request do
  describe "GET /songs/:song_slug/covers" do
    let!(:song) { create(:song) }
    let!(:covers) do
      [
        create(:cover, song: song, votes_score: 100, created_at: 1.week.ago),
        create(:cover, song: song, votes_score: 50, created_at: 1.day.ago),
        create(:cover, song: song, votes_score: 200, created_at: 3.days.ago)
      ]
    end

    it "returns covers for a song" do
      get "/songs/#{song.slug}/covers"
      expect(response).to have_http_status(:ok)
      expect(json_response[:covers].length).to eq(3)
    end

    it "returns covers sorted by score by default" do
      get "/songs/#{song.slug}/covers"
      scores = json_response[:covers].map { |i| i[:votes_score] }
      expect(scores).to eq([200, 100, 50])
    end

    it "supports sorting by recent" do
      get "/songs/#{song.slug}/covers", params: { sorted_by: "recent" }
      # Most recent first: 1.day.ago, 3.days.ago, 1.week.ago
      ids = json_response[:covers].map { |i| i[:id] }
      expect(ids).to eq([covers[1].id, covers[2].id, covers[0].id])
    end

    it "returns 404 for non-existent song" do
      get "/songs/non-existent/covers"
      expect(response).to have_http_status(:not_found)
    end

    context "with authenticated user" do
      let(:user) { create(:user) }

      before do
        create(:vote, user: user, cover: covers.first, value: -1)
      end

      it "includes user vote" do
        get "/songs/#{song.slug}/covers", headers: auth_headers(user)
        voted_cover = json_response[:covers].find { |i| i[:id] == covers.first.id }
        expect(voted_cover[:user_vote]).to eq(-1)
      end
    end
  end

  describe "GET /covers/top" do
    before do
      @song1 = create(:song)
      @song2 = create(:song)

      @top1 = create(:cover, song: @song1, votes_score: 500)
      @top2 = create(:cover, song: @song2, votes_score: 300)
      @low = create(:cover, song: @song1, votes_score: 10)
    end

    it "returns top covers across all songs" do
      get "/covers/top"
      expect(response).to have_http_status(:ok)
      ids = json_response[:covers].map { |i| i[:id] }
      expect(ids.first).to eq(@top1.id)
      expect(ids.second).to eq(@top2.id)
    end

    it "includes song info with each cover" do
      get "/covers/top"
      first_cover = json_response[:covers].first
      expect(first_cover[:song][:title]).to eq(@song1.title)
      expect(first_cover[:song][:slug]).to eq(@song1.slug)
    end

    it "limits results" do
      get "/covers/top", params: { limit: 2 }
      expect(json_response[:covers].length).to eq(2)
    end
  end
end
