class SongBlueprint < Blueprinter::Base
  identifier :id

  fields :title, :original_artist, :year, :youtube_url, :description, :slug, :created_at

  field :covers_count do |song|
    song.covers.size
  end

  view :with_covers do
    association :covers, blueprint: CoverBlueprint, view: :with_user_vote
  end
end
