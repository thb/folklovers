require "rails_helper"

RSpec.describe Cover, type: :model do
  describe "validations" do
    it { should validate_presence_of(:artist) }
    it { should validate_presence_of(:youtube_url) }
  end

  describe "associations" do
    it { should belong_to(:song).counter_cache(true) }
    it { should belong_to(:submitted_by).class_name("User").optional }
    it { should have_many(:votes).dependent(:destroy) }
  end

  describe "scopes" do
    describe ".sorted_by" do
      let(:song) { create(:song) }
      let!(:old_popular) { create(:cover, song: song, votes_score: 100, created_at: 1.week.ago) }
      let!(:new_unpopular) { create(:cover, song: song, votes_score: 10, created_at: 1.day.ago) }
      let!(:mid_score) { create(:cover, song: song, votes_score: 50, created_at: 3.days.ago) }

      context "sorted by score (default)" do
        it "orders by votes_score desc" do
          expect(Cover.sorted_by("score")).to eq([old_popular, mid_score, new_unpopular])
        end
      end

      context "sorted by recent" do
        it "orders by created_at desc" do
          expect(Cover.sorted_by("recent")).to eq([new_unpopular, mid_score, old_popular])
        end
      end
    end
  end

  describe "#vote_by" do
    let(:user) { create(:user) }
    let(:cover) { create(:cover) }

    context "when user has voted" do
      let!(:vote) { create(:vote, user: user, cover: cover, value: 1) }

      it "returns the vote" do
        expect(cover.vote_by(user)).to eq(vote)
      end
    end

    context "when user has not voted" do
      it "returns nil" do
        expect(cover.vote_by(user)).to be_nil
      end
    end
  end

  describe "#recalculate_votes!" do
    let(:cover) { create(:cover, votes_score: 0, votes_count: 0) }
    let(:user1) { create(:user) }
    let(:user2) { create(:user) }
    let(:user3) { create(:user) }

    before do
      # Create votes directly without callbacks to test recalculation
      Vote.insert_all([
        { user_id: user1.id, cover_id: cover.id, value: 1, created_at: Time.current, updated_at: Time.current },
        { user_id: user2.id, cover_id: cover.id, value: 1, created_at: Time.current, updated_at: Time.current },
        { user_id: user3.id, cover_id: cover.id, value: -1, created_at: Time.current, updated_at: Time.current }
      ])
    end

    it "updates votes_score to sum of vote values" do
      cover.recalculate_votes!
      expect(cover.votes_score).to eq(1) # 1 + 1 - 1
    end

    it "updates votes_count to number of votes" do
      cover.recalculate_votes!
      expect(cover.votes_count).to eq(3)
    end
  end

  describe "counter_cache" do
    let(:song) { create(:song) }

    it "increments covers_count when created" do
      expect {
        create(:cover, song: song)
      }.to change { song.reload.covers_count }.by(1)
    end

    it "decrements covers_count when destroyed" do
      cover = create(:cover, song: song)
      expect {
        cover.destroy
      }.to change { song.reload.covers_count }.by(-1)
    end
  end
end
