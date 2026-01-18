class NotificationMailer < ApplicationMailer
  def vote_received(notification)
    @notification = notification
    @user = notification.user
    @vote = notification.notifiable
    @cover = @vote.cover
    @song = @cover.song

    mail(
      to: @user.email,
      subject: "Someone voted on your cover of #{@song.title}"
    )
  end

  def new_cover_on_song(notification)
    @notification = notification
    @user = notification.user
    @cover = notification.notifiable
    @song = @cover.song

    mail(
      to: @user.email,
      subject: "New cover added: #{@cover.artist_name} - #{@song.title}"
    )
  end
end
