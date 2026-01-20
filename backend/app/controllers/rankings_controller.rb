class RankingsController < ApplicationController
  DEFAULT_LIMIT = 50

  def covers
    covers = Cover.includes(:song, :submitted_by, :tags, :artist)
                  .order(votes_score: :desc, created_at: :desc)
                  .limit(limit)

    render json: {
      covers: covers.map.with_index do |cover, index|
        CoverBlueprint.render_as_hash(cover, view: :with_song, current_user: current_user)
          .merge(rank: index + 1)
      end
    }
  end

  def songs
    songs = TopSongsQuery.new(limit: limit).call

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
    users = TopContributorsQuery.new(limit: limit).call

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

  private

  def limit
    params[:limit] || DEFAULT_LIMIT
  end
end
