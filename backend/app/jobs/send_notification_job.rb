class SendNotificationJob < ApplicationJob
  queue_as :default

  def perform(notification_id)
    notification = Notification.find_by(id: notification_id)
    return unless notification

    case notification.notification_type
    when "vote_received"
      NotificationMailer.vote_received(notification).deliver_now
    when "new_cover_on_song"
      NotificationMailer.new_cover_on_song(notification).deliver_now
    end
  end
end
