class NotificationsController < ApplicationController
  before_action :authenticate_user!

  def index
    notifications = current_user.notifications
                               .includes(:notifiable)
                               .recent
                               .limit(50)

    render json: {
      notifications: notifications.map { |n| notification_data(n) },
      unread_count: current_user.notifications.unread.count
    }
  end

  def mark_as_read
    notification = current_user.notifications.find(params[:id])
    notification.mark_as_read!

    render json: { notification: notification_data(notification) }
  rescue ActiveRecord::RecordNotFound
    render json: { error: "Notification not found" }, status: :not_found
  end

  def mark_all_as_read
    Notification.mark_all_as_read!(current_user)

    render json: { message: "All notifications marked as read" }
  end

  private

  def notification_data(notification)
    {
      id: notification.id,
      type: notification.notification_type,
      read: notification.read?,
      created_at: notification.created_at,
      data: notification_content(notification)
    }
  end

  def notification_content(notification)
    case notification.notification_type
    when "vote_received"
      vote = notification.notifiable
      cover = vote&.cover
      song = cover&.song
      {
        vote_value: vote&.value,
        cover_artist: cover&.artist_name,
        song_title: song&.title,
        song_slug: song&.slug
      }
    when "new_cover_on_song"
      cover = notification.notifiable
      song = cover&.song
      {
        cover_artist: cover&.artist_name,
        song_title: song&.title,
        song_slug: song&.slug
      }
    else
      {}
    end
  end
end
