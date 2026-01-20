class TopSongsQuery
  DEFAULT_LIMIT = 50

  def initialize(limit: DEFAULT_LIMIT)
    @limit = limit
  end

  def call
    Song.left_joins(:covers)
        .select("songs.*, SUM(COALESCE(covers.votes_score, 0)) as total_score")
        .group("songs.id")
        .order("total_score DESC")
        .limit(@limit)
  end
end
