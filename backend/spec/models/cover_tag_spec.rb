require "rails_helper"

RSpec.describe CoverTag, type: :model do
  describe "associations" do
    it { should belong_to(:cover) }
    it { should belong_to(:tag) }
  end

  describe "database constraints" do
    it "prevents duplicate cover-tag combinations at database level" do
      song = create(:song, with_original: false)
      cover = create(:cover, song: song)
      tag = Tag.create!(name: "Folk", slug: "folk")

      CoverTag.create!(cover: cover, tag: tag)

      expect {
        CoverTag.create!(cover: cover, tag: tag)
      }.to raise_error(ActiveRecord::RecordNotUnique)
    end
  end
end
