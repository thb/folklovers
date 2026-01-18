class RankingsController < ApplicationController
  def covers
    covers = Cover.includes(:song, :submitted_by, :tags)
                  .order(votes_score: :desc, created_at: :desc)
                  .limit(params[:limit] || 50)

    render json: {
      covers: covers.map.with_index do |cover, index|
        CoverBlueprint.render_as_hash(cover, view: :with_user_vote, current_user: current_user)
          .merge(
            rank: index + 1,
            song: { title: cover.song.title, slug: cover.song.slug }
          )
      end
    }
  end

  def songs
    songs = Song.left_joins(:covers)
                .select("songs.*, SUM(COALESCE(covers.votes_score, 0)) as total_score")
                .group("songs.id")
                .order("total_score DESC")
                .limit(params[:limit] || 50)

    render json: {
      songs: songs.map.with_index do |song, index|
        SongBlueprint.render_as_hash(song).merge(
          rank: index + 1,
          total_score: song.total_score.to_i
        )
      end
    }
  end

  def contributors
    users = User.joins(:submitted_covers)
                .select("users.*, COUNT(covers.id) as covers_count, SUM(covers.votes_score) as total_score")
                .group("users.id")
                .having("COUNT(covers.id) > 0")
                .order("total_score DESC, covers_count DESC")
                .limit(params[:limit] || 50)

    render json: {
      contributors: users.map.with_index do |user, index|
        {
          rank: index + 1,
          id: user.id,
          username: user.username,
          avatar_url: user.avatar_url,
          covers_count: user.covers_count.to_i,
          total_score: user.total_score.to_i
        }
      end
    }
  end
end
