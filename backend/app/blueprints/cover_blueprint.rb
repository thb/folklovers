class CoverBlueprint < Blueprinter::Base
  identifier :id

  fields :artist, :year, :youtube_url, :description, :votes_score, :votes_count, :created_at

  field :submitted_by do |cover|
    cover.submitted_by ? UserBlueprint.render_as_hash(cover.submitted_by) : nil
  end

  view :with_user_vote do
    field :user_vote do |cover, options|
      if options[:current_user]
        vote = cover.vote_by(options[:current_user])
        vote&.value
      end
    end
  end
end
