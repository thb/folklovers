module Admin
  class UsersController < BaseController
    def index
      users = User.left_joins(:submitted_covers, :votes)
                  .select("users.*, COUNT(DISTINCT covers.id) as covers_count, COUNT(DISTINCT votes.id) as votes_count")
                  .group("users.id")
                  .order(created_at: :desc)

      pagy, users = pagy(users, items: params[:per_page] || 20)

      render json: {
        users: users.map { |u| user_with_stats(u) },
        pagination: pagy_metadata(pagy)
      }
    end

    def show
      user = User.find(params[:id])
      covers = user.submitted_covers.includes(:song, :artist).order(created_at: :desc)

      render json: {
        user: UserBlueprint.render_as_hash(user, view: :with_email),
        contributions: {
          covers_submitted: covers.map { |c| cover_data(c) },
          votes_count: user.votes.count
        }
      }
    end

    private

    def user_with_stats(user)
      {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        avatar_url: user.avatar_url,
        created_at: user.created_at,
        covers_count: user.covers_count.to_i,
        votes_count: user.votes_count.to_i
      }
    end

    def cover_data(cover)
      {
        id: cover.id,
        artist: cover.artist_name,
        song_title: cover.song.title,
        song_slug: cover.song.slug,
        created_at: cover.created_at
      }
    end
  end
end
