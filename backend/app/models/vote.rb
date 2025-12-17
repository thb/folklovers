class Vote < ApplicationRecord
  belongs_to :user
  belongs_to :cover

  validates :value, presence: true, inclusion: { in: [-1, 1] }
  validates :user_id, uniqueness: { scope: :cover_id, message: "has already voted on this cover" }

  after_save :update_cover_score
  after_destroy :update_cover_score

  private

  def update_cover_score
    cover.recalculate_votes!
  end
end
