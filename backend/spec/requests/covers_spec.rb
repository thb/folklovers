require "rails_helper"

RSpec.describe "Covers", type: :request do
  describe "GET /songs/:song_slug/covers" do
    let!(:song) { create(:song, with_original: false) }
    let!(:original) { create(:cover, song: song, original: true, votes_score: 0, created_at: 2.weeks.ago) }
    let!(:covers) do
      [
        create(:cover, song: song, votes_score: 100, created_at: 1.week.ago),
        create(:cover, song: song, votes_score: 50, created_at: 1.day.ago),
        create(:cover, song: song, votes_score: 200, created_at: 3.days.ago)
      ]
    end

    it "returns covers for a song including original" do
      get "/songs/#{song.slug}/covers"
      expect(response).to have_http_status(:ok)
      expect(json_response[:covers].length).to eq(4) # 1 original + 3 covers
    end

    it "returns original first, then sorted by score" do
      get "/songs/#{song.slug}/covers"
      scores = json_response[:covers].map { |i| i[:votes_score] }
      expect(scores).to eq([0, 200, 100, 50]) # original first with 0 score
      expect(json_response[:covers].first[:original]).to be true
    end

    it "supports sorting by recent with original first" do
      get "/songs/#{song.slug}/covers", params: { sorted_by: "recent" }
      # Original first, then most recent: 1.day.ago, 3.days.ago, 1.week.ago
      ids = json_response[:covers].map { |i| i[:id] }
      expect(ids).to eq([original.id, covers[1].id, covers[2].id, covers[0].id])
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

  describe "POST /songs/:song_slug/covers" do
    let(:song) { create(:song, with_original: false) }
    let(:user) { create(:user) }
    let(:valid_params) do
      {
        artist: "Johnny Cash",
        youtube_url: "https://www.youtube.com/watch?v=abc123",
        year: 2003,
        description: "A great cover"
      }
    end

    context "without authentication" do
      it "returns unauthorized" do
        post "/songs/#{song.slug}/covers", params: valid_params
        expect(response).to have_http_status(:unauthorized)
      end
    end

    context "with authentication" do
      it "creates a cover" do
        expect {
          post "/songs/#{song.slug}/covers", params: valid_params, headers: auth_headers(user)
        }.to change(Cover, :count).by(1)

        expect(response).to have_http_status(:created)
      end

      it "associates the cover with the current user" do
        post "/songs/#{song.slug}/covers", params: valid_params, headers: auth_headers(user)

        cover = Cover.last
        expect(cover.submitted_by).to eq(user)
      end

      it "associates the cover with the song" do
        post "/songs/#{song.slug}/covers", params: valid_params, headers: auth_headers(user)

        cover = Cover.last
        expect(cover.song).to eq(song)
      end

      it "returns the created cover" do
        post "/songs/#{song.slug}/covers", params: valid_params, headers: auth_headers(user)

        expect(json_response[:cover][:artist]).to eq("Johnny Cash")
        expect(json_response[:cover][:youtube_url]).to eq("https://www.youtube.com/watch?v=abc123")
        expect(json_response[:cover][:year]).to eq(2003)
        expect(json_response[:cover][:submitted_by][:username]).to eq(user.username)
      end

      it "returns errors for invalid params" do
        post "/songs/#{song.slug}/covers", params: { artist: "" }, headers: auth_headers(user)

        expect(response).to have_http_status(:unprocessable_entity)
        expect(json_response[:errors]).to include("Artist can't be blank")
        expect(json_response[:errors]).to include("Youtube url can't be blank")
      end

      it "returns 404 for non-existent song" do
        post "/songs/non-existent/covers", params: valid_params, headers: auth_headers(user)

        expect(response).to have_http_status(:not_found)
      end

      context "with original parameter" do
        context "when song has no original" do
          it "allows user to mark cover as original" do
            post "/songs/#{song.slug}/covers", params: valid_params.merge(original: true), headers: auth_headers(user)

            expect(response).to have_http_status(:created)
            expect(json_response[:cover][:original]).to be true
          end
        end

        context "when song already has an original" do
          before { create(:cover, song: song, original: true) }

          it "ignores original flag for regular user" do
            post "/songs/#{song.slug}/covers", params: valid_params.merge(original: true), headers: auth_headers(user)

            expect(response).to have_http_status(:created)
            expect(json_response[:cover][:original]).to be false
          end

          context "with admin user" do
            let(:admin) { create(:user, role: :admin) }

            it "allows admin to set original and removes existing" do
              post "/songs/#{song.slug}/covers", params: valid_params.merge(original: true), headers: auth_headers(admin)

              expect(response).to have_http_status(:created)
              expect(json_response[:cover][:original]).to be true
              expect(song.reload.covers.where(original: true).count).to eq(1)
            end
          end
        end
      end
    end
  end

  describe "POST /covers (create_with_song)" do
    let(:user) { create(:user) }
    let!(:existing_song) { create(:song, with_original: false) }

    context "without authentication" do
      it "returns unauthorized" do
        post "/covers", params: { song_id: existing_song.id, artist: "Test", youtube_url: "https://youtube.com/watch?v=abc" }
        expect(response).to have_http_status(:unauthorized)
      end
    end

    context "with existing song" do
      let(:valid_params) do
        {
          song_id: existing_song.id,
          artist: "Johnny Cash",
          youtube_url: "https://www.youtube.com/watch?v=abc123",
          year: 2003
        }
      end

      it "creates a cover for the existing song" do
        expect {
          post "/covers", params: valid_params, headers: auth_headers(user)
        }.to change(Cover, :count).by(1).and change(Song, :count).by(0)

        expect(response).to have_http_status(:created)
        expect(json_response[:cover][:artist]).to eq("Johnny Cash")
        expect(json_response[:song][:id]).to eq(existing_song.id)
      end

      it "returns 404 for non-existent song_id" do
        post "/covers", params: valid_params.merge(song_id: 99999), headers: auth_headers(user)
        expect(response).to have_http_status(:not_found)
      end
    end

    context "with new song" do
      let(:valid_params) do
        {
          song_title: "New Folk Song",
          original_artist: "Traditional",
          song_year: 1960,
          artist: "Cover Artist",
          youtube_url: "https://www.youtube.com/watch?v=xyz789",
          year: 2020
        }
      end

      it "creates both song and cover" do
        expect {
          post "/covers", params: valid_params, headers: auth_headers(user)
        }.to change(Song, :count).by(1).and change(Cover, :count).by(1)

        expect(response).to have_http_status(:created)
        expect(json_response[:song][:title]).to eq("New Folk Song")
        expect(json_response[:cover][:artist]).to eq("Cover Artist")
      end

      it "creates song without year when not provided" do
        params = valid_params.except(:song_year)
        post "/covers", params: params, headers: auth_headers(user)

        expect(response).to have_http_status(:created)
        expect(json_response[:song][:year]).to be_nil
      end

      it "rolls back song if cover fails" do
        params = valid_params.merge(youtube_url: "invalid-url")

        expect {
          post "/covers", params: params, headers: auth_headers(user)
        }.to change(Song, :count).by(0).and change(Cover, :count).by(0)

        expect(response).to have_http_status(:unprocessable_entity)
      end

      it "returns errors for missing song fields" do
        post "/covers", params: { artist: "Test", youtube_url: "https://youtube.com/watch?v=abc" }, headers: auth_headers(user)

        expect(response).to have_http_status(:unprocessable_entity)
        expect(json_response[:errors]).to include("Title can't be blank")
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
