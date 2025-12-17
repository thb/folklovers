require "rails_helper"

RSpec.describe Vote, type: :model do
  describe "validations" do
    subject { build(:vote) }

    it { should validate_presence_of(:value) }
    it { should validate_inclusion_of(:value).in_array([-1, 1]) }

    it "validates uniqueness of user_id scoped to cover_id" do
      existing_vote = create(:vote)
      duplicate_vote = build(:vote, user: existing_vote.user, cover: existing_vote.cover)
      expect(duplicate_vote).not_to be_valid
    end
  end

  describe "associations" do
    it { should belong_to(:user) }
    it { should belong_to(:cover) }
  end

  describe "callbacks" do
    describe "after_save" do
      let(:cover) { create(:cover, votes_score: 0, votes_count: 0) }
      let(:user) { create(:user) }

      it "updates cover score on create" do
        create(:vote, user: user, cover: cover, value: 1)
        expect(cover.reload.votes_score).to eq(1)
        expect(cover.votes_count).to eq(1)
      end

      it "updates cover score on update" do
        vote = create(:vote, user: user, cover: cover, value: 1)
        expect(cover.reload.votes_score).to eq(1)

        vote.update!(value: -1)
        expect(cover.reload.votes_score).to eq(-1)
      end
    end

    describe "after_destroy" do
      let(:cover) { create(:cover, votes_score: 0, votes_count: 0) }
      let(:user) { create(:user) }

      it "updates cover score on destroy" do
        vote = create(:vote, user: user, cover: cover, value: 1)
        expect(cover.reload.votes_score).to eq(1)

        vote.destroy
        expect(cover.reload.votes_score).to eq(0)
        expect(cover.votes_count).to eq(0)
      end
    end
  end

  describe "uniqueness constraint" do
    let(:user) { create(:user) }
    let(:cover) { create(:cover) }

    before { create(:vote, user: user, cover: cover) }

    it "prevents duplicate votes from same user on same cover" do
      duplicate_vote = build(:vote, user: user, cover: cover)
      expect(duplicate_vote).not_to be_valid
      expect(duplicate_vote.errors[:user_id]).to include("has already voted on this cover")
    end

    it "allows same user to vote on different covers" do
      other_cover = create(:cover)
      vote = build(:vote, user: user, cover: other_cover)
      expect(vote).to be_valid
    end

    it "allows different users to vote on same cover" do
      other_user = create(:user)
      vote = build(:vote, user: other_user, cover: cover)
      expect(vote).to be_valid
    end
  end
end
