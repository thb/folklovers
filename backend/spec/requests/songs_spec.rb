require "rails_helper"

RSpec.describe "Songs", type: :request do
  describe "GET /songs" do
    let!(:songs) { create_list(:song, 15) }

    it "returns paginated songs" do
      get "/songs"
      expect(response).to have_http_status(:ok)
      expect(json_response[:songs].length).to eq(12) # default pagination
    end

    it "returns pagination metadata" do
      get "/songs"
      expect(json_response[:pagination]).to include(
        current_page: 1,
        total_pages: (Song.count.to_f / 12).ceil,
        total_count: Song.count
      )
    end

    it "supports custom per_page" do
      get "/songs", params: { per_page: 5 }
      expect(json_response[:songs].length).to eq(5)
    end

    describe "scopes" do
      let!(:dylan_song) { create(:song, original_artist: "Bob Dylan") }
      let!(:cohen_song) { create(:song, original_artist: "Leonard Cohen") }

      it "filters by artist" do
        get "/songs", params: { by_artist: "Dylan" }
        slugs = json_response[:songs].map { |s| s[:slug] }
        expect(slugs).to include(dylan_song.slug)
        expect(slugs).not_to include(cohen_song.slug)
      end

      it "searches by title or artist" do
        get "/songs", params: { search: "Cohen" }
        slugs = json_response[:songs].map { |s| s[:slug] }
        expect(slugs).to include(cohen_song.slug)
      end
    end
  end

  describe "GET /songs/top" do
    before do
      @song1 = create(:song)
      @song2 = create(:song)
      @song3 = create(:song)

      create(:cover, song: @song1, votes_score: 100)
      create(:cover, song: @song1, votes_score: 50)
      create(:cover, song: @song2, votes_score: 200)
      create(:cover, song: @song3, votes_score: 10)
    end

    it "returns top songs by total cover votes" do
      get "/songs/top"
      expect(response).to have_http_status(:ok)
      slugs = json_response[:songs].map { |s| s[:slug] }
      # song2 has 200, song1 has 150, song3 has 10
      expect(slugs.first).to eq(@song2.slug)
    end

    it "limits results" do
      get "/songs/top", params: { limit: 2 }
      expect(json_response[:songs].length).to eq(2)
    end
  end

  describe "GET /songs/:slug" do
    let!(:song) { create(:song, :with_covers) }

    it "returns song with covers" do
      get "/songs/#{song.slug}"
      expect(response).to have_http_status(:ok)
      expect(json_response[:song][:slug]).to eq(song.slug)
      expect(json_response[:song][:covers]).to be_present
      expect(json_response[:song][:covers].length).to eq(3)
    end

    it "returns 404 for non-existent song" do
      get "/songs/non-existent-slug"
      expect(response).to have_http_status(:not_found)
      expect(json_response[:error]).to eq("Song not found")
    end

    context "with authenticated user" do
      let(:user) { create(:user) }
      let(:cover) { song.covers.first }

      before do
        create(:vote, user: user, cover: cover, value: 1)
      end

      it "includes user vote on covers" do
        get "/songs/#{song.slug}", headers: auth_headers(user)
        voted_cover = json_response[:song][:covers].find { |c| c[:id] == cover.id }
        expect(voted_cover[:user_vote]).to eq(1)
      end
    end

    context "without authentication" do
      it "returns null for user_vote" do
        get "/songs/#{song.slug}"
        cover = json_response[:song][:covers].first
        expect(cover[:user_vote]).to be_nil
      end
    end
  end
end
