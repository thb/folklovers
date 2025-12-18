require "rails_helper"

RSpec.describe Song, type: :model do
  describe "validations" do
    subject { build(:song) }

    it { should validate_presence_of(:title) }
    it { should validate_presence_of(:original_artist) }
    it { should validate_presence_of(:year) }
    it { should validate_presence_of(:youtube_url) }
    it { should validate_presence_of(:description) }

    it_behaves_like "youtube_validatable"

    # slug is auto-generated, so we test uniqueness differently
    it "enforces slug uniqueness at database level" do
      song1 = create(:song)
      song2 = build(:song, slug: song1.slug)
      expect { song2.save!(validate: false) }.to raise_error(ActiveRecord::RecordNotUnique)
    end
  end

  describe "associations" do
    it { should have_many(:covers).dependent(:destroy) }
  end

  describe "slug generation" do
    it "auto-generates slug from title and artist on create" do
      song = create(:song, title: "The Times They Are A-Changin'", original_artist: "Bob Dylan", slug: nil)
      expect(song.slug).to eq("the-times-they-are-a-changin-bob-dylan")
    end

    it "handles duplicate slugs by adding counter" do
      create(:song, title: "Test Song", original_artist: "Test Artist")
      song2 = create(:song, title: "Test Song", original_artist: "Test Artist", slug: nil)
      expect(song2.slug).to eq("test-song-test-artist-1")
    end

    it "does not override existing slug" do
      song = create(:song, slug: "custom-slug")
      expect(song.slug).to eq("custom-slug")
    end
  end

  describe "scopes" do
    describe ".by_artist" do
      let!(:dylan_song) { create(:song, original_artist: "Bob Dylan") }
      let!(:cohen_song) { create(:song, original_artist: "Leonard Cohen") }

      it "filters songs by artist (case insensitive)" do
        expect(Song.by_artist("bob")).to include(dylan_song)
        expect(Song.by_artist("bob")).not_to include(cohen_song)
      end
    end

    describe ".search" do
      let!(:song1) { create(:song, title: "Blowin' in the Wind", original_artist: "Bob Dylan") }
      let!(:song2) { create(:song, title: "Hallelujah", original_artist: "Leonard Cohen") }

      it "searches by title" do
        expect(Song.search("blowin")).to include(song1)
        expect(Song.search("blowin")).not_to include(song2)
      end

      it "searches by artist" do
        expect(Song.search("cohen")).to include(song2)
        expect(Song.search("cohen")).not_to include(song1)
      end
    end
  end

  describe "#to_param" do
    it "returns the slug" do
      song = create(:song, slug: "test-slug")
      expect(song.to_param).to eq("test-slug")
    end
  end

  describe "covers ordering" do
    it "orders covers by votes_score desc by default" do
      song = create(:song)
      low_score = create(:cover, song: song, votes_score: 10)
      high_score = create(:cover, song: song, votes_score: 100)
      mid_score = create(:cover, song: song, votes_score: 50)

      expect(song.covers).to eq([high_score, mid_score, low_score])
    end
  end
end
