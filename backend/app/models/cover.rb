class Cover < ApplicationRecord
  include YoutubeValidatable

  belongs_to :song, counter_cache: true
  belongs_to :submitted_by, class_name: "User", optional: true
  has_many :votes, dependent: :destroy

  validates :artist, presence: true
  validates :youtube_url, presence: true
  validate :only_one_original_per_song, if: :original?

  scope :original_first, -> { order(original: :desc) }
  scope :sorted_by, ->(sort) {
    case sort
    when "recent"
      reorder(original: :desc, created_at: :desc)
    else
      reorder(original: :desc, votes_score: :desc, created_at: :desc)
    end
  }

  def vote_by(user)
    votes.find_by(user: user)
  end

  def recalculate_votes!
    update!(
      votes_score: votes.sum(:value),
      votes_count: votes.count
    )
  end

  private

  def only_one_original_per_song
    if song && song.covers.where(original: true).where.not(id: id).exists?
      errors.add(:original, "cover already exists for this song")
    end
  end
end
