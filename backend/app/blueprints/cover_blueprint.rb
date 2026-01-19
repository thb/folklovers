class CoverBlueprint < Blueprinter::Base
  identifier :id

  fields :year, :youtube_url, :description, :original, :votes_score, :votes_count, :created_at

  # Use artist_name for backward compatibility (reads from association or legacy field)
  field :artist do |cover|
    cover.artist_name
  end

  field :artist_info do |cover|
    if cover.artist
      { id: cover.artist.id, name: cover.artist.name, slug: cover.artist.slug }
    end
  end

  field :submitted_by do |cover|
    cover.submitted_by ? UserBlueprint.render_as_hash(cover.submitted_by) : nil
  end

  field :tags do |cover|
    cover.tags.map { |tag| { id: tag.id, name: tag.name, slug: tag.slug } }
  end

  view :with_user_vote do
    field :user_vote do |cover, options|
      if options[:current_user]
        vote = cover.vote_by(options[:current_user])
        vote&.value
      end
    end
  end

  view :with_song do
    include_view :with_user_vote

    field :song do |cover|
      { title: cover.song.title, slug: cover.song.slug }
    end
  end
end
