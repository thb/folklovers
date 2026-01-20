class TopContributorsQuery
  DEFAULT_LIMIT = 50

  def initialize(limit: DEFAULT_LIMIT)
    @limit = limit
  end

  def call
    User.joins(:submitted_covers)
        .select("users.*, COUNT(covers.id) as covers_count, SUM(covers.votes_score) as total_score")
        .group("users.id")
        .having("COUNT(covers.id) > 0")
        .order("total_score DESC, covers_count DESC")
        .limit(@limit)
  end
end
