class NotificationService
  class << self
    def notify_vote_received(vote)
      cover = vote.cover
      submitter = cover.submitted_by

      # Don't notify if:
      # - No submitter (anonymous cover)
      # - User voted on their own cover
      return if submitter.nil? || submitter == vote.user

      notification = Notification.create!(
        user: submitter,
        notifiable: vote,
        notification_type: "vote_received"
      )

      SendNotificationJob.perform_later(notification.id)
    end

    def notify_new_cover(cover)
      song = cover.song

      # Find users who have voted on this song's covers
      user_ids = Vote.joins(:cover)
                     .where(covers: { song_id: song.id })
                     .where.not(user_id: cover.submitted_by_id)
                     .distinct
                     .pluck(:user_id)

      user_ids.each do |user_id|
        notification = Notification.create!(
          user_id: user_id,
          notifiable: cover,
          notification_type: "new_cover_on_song"
        )

        SendNotificationJob.perform_later(notification.id)
      end
    end
  end
end
