class Notification < ApplicationRecord
  belongs_to :user
  belongs_to :notifiable, polymorphic: true

  # Notification types
  TYPES = %w[vote_received new_cover_on_song].freeze

  validates :notification_type, presence: true, inclusion: { in: TYPES }

  scope :unread, -> { where(read_at: nil) }
  scope :read, -> { where.not(read_at: nil) }
  scope :recent, -> { order(created_at: :desc) }

  def read?
    read_at.present?
  end

  def mark_as_read!
    update!(read_at: Time.current) unless read?
  end

  def self.mark_all_as_read!(user)
    user.notifications.unread.update_all(read_at: Time.current)
  end
end
