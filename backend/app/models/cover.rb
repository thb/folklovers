class Cover < ApplicationRecord
  belongs_to :song, counter_cache: true
  belongs_to :submitted_by, class_name: "User", optional: true
  has_many :votes, dependent: :destroy

  validates :artist, presence: true
  validates :youtube_url, presence: true

  scope :sorted_by, ->(sort) {
    case sort
    when "recent"
      reorder(created_at: :desc)
    else
      reorder(votes_score: :desc, created_at: :desc)
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
end
