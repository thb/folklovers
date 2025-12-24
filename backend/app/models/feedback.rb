class Feedback < ApplicationRecord
  belongs_to :user

  enum :category, { bug: 0, feature: 1, general: 2 }
  enum :status, { pending: 0, reviewed: 1, resolved: 2 }

  validates :message, presence: true
  validates :category, presence: true
end
