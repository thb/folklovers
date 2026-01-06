class SongBlueprint < Blueprinter::Base
  identifier :id

  fields :title, :original_artist, :year, :slug, :created_at

  field :covers_count do |song|
    song.covers.size
  end

  field :thumbnail_url do |song|
    song.thumbnail_url
  end

  field :has_original do |song|
    song.has_original?
  end

  view :with_covers do
    association :covers, blueprint: CoverBlueprint, view: :with_user_vote
  end
end
