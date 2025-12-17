require "rails_helper"

RSpec.describe "Votes", type: :request do
  let(:user) { create(:user) }
  let(:cover) { create(:cover, votes_score: 0, votes_count: 0) }

  describe "POST /covers/:id/vote" do
    context "without authentication" do
      it "returns unauthorized" do
        post "/covers/#{cover.id}/vote", params: { value: 1 }
        expect(response).to have_http_status(:unauthorized)
      end
    end

    context "with authentication" do
      context "when user has not voted yet" do
        it "creates an upvote" do
          post "/covers/#{cover.id}/vote",
               params: { value: 1 },
               headers: auth_headers(user)

          expect(response).to have_http_status(:created)
          expect(json_response[:message]).to eq("Vote created")
          expect(cover.reload.votes_score).to eq(1)
        end

        it "creates a downvote" do
          post "/covers/#{cover.id}/vote",
               params: { value: -1 },
               headers: auth_headers(user)

          expect(response).to have_http_status(:created)
          expect(cover.reload.votes_score).to eq(-1)
        end

        it "returns updated cover data" do
          post "/covers/#{cover.id}/vote",
               params: { value: 1 },
               headers: auth_headers(user)

          expect(json_response[:cover][:votes_score]).to eq(1)
          expect(json_response[:cover][:user_vote]).to eq(1)
        end
      end

      context "when user has already voted with same value" do
        before do
          create(:vote, user: user, cover: cover, value: 1)
        end

        it "removes the vote (toggle off)" do
          expect {
            post "/covers/#{cover.id}/vote",
                 params: { value: 1 },
                 headers: auth_headers(user)
          }.to change(Vote, :count).by(-1)

          expect(response).to have_http_status(:ok)
          expect(json_response[:message]).to eq("Vote removed")
          expect(cover.reload.votes_score).to eq(0)
        end
      end

      context "when user has voted with different value" do
        before do
          create(:vote, user: user, cover: cover, value: 1)
        end

        it "changes the vote" do
          expect {
            post "/covers/#{cover.id}/vote",
                 params: { value: -1 },
                 headers: auth_headers(user)
          }.not_to change(Vote, :count)

          expect(response).to have_http_status(:ok)
          expect(json_response[:message]).to eq("Vote updated")
          expect(cover.reload.votes_score).to eq(-1)
        end
      end

      context "with invalid value" do
        it "returns error for invalid vote value" do
          post "/covers/#{cover.id}/vote",
               params: { value: 2 },
               headers: auth_headers(user)

          expect(response).to have_http_status(:unprocessable_entity)
        end
      end

      context "with non-existent cover" do
        it "returns not found" do
          post "/covers/999999/vote",
               params: { value: 1 },
               headers: auth_headers(user)

          expect(response).to have_http_status(:not_found)
        end
      end
    end
  end

  describe "DELETE /covers/:id/vote" do
    context "without authentication" do
      it "returns unauthorized" do
        delete "/covers/#{cover.id}/vote"
        expect(response).to have_http_status(:unauthorized)
      end
    end

    context "with authentication" do
      context "when user has voted" do
        before do
          create(:vote, user: user, cover: cover, value: 1)
        end

        it "removes the vote" do
          expect {
            delete "/covers/#{cover.id}/vote",
                   headers: auth_headers(user)
          }.to change(Vote, :count).by(-1)

          expect(response).to have_http_status(:ok)
          expect(json_response[:message]).to eq("Vote removed")
          expect(cover.reload.votes_score).to eq(0)
        end
      end

      context "when user has not voted" do
        it "returns not found" do
          delete "/covers/#{cover.id}/vote",
                 headers: auth_headers(user)

          expect(response).to have_http_status(:not_found)
          expect(json_response[:error]).to eq("No vote found")
        end
      end
    end
  end
end
