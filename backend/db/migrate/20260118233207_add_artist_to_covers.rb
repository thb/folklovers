class AddArtistToCovers < ActiveRecord::Migration[8.0]
  def up
    # Add artist_id column
    add_reference :covers, :artist, null: true, foreign_key: true

    # Create artists from existing cover artist names and link them
    execute <<-SQL
      INSERT INTO artists (name, slug, created_at, updated_at)
      SELECT DISTINCT
        artist,
        LOWER(REPLACE(REPLACE(REPLACE(artist, ' ', '-'), '''', ''), '&', 'and')),
        NOW(),
        NOW()
      FROM covers
      WHERE artist IS NOT NULL AND artist != ''
      ON CONFLICT (slug) DO NOTHING;
    SQL

    # Link covers to artists
    execute <<-SQL
      UPDATE covers
      SET artist_id = artists.id
      FROM artists
      WHERE LOWER(REPLACE(REPLACE(REPLACE(covers.artist, ' ', '-'), '''', ''), '&', 'and')) = artists.slug;
    SQL

    # Make artist_id required (all covers should now have an artist_id)
    change_column_null :covers, :artist_id, false

    # Make the old artist column nullable (we now use artist_id)
    change_column_null :covers, :artist, true
  end

  def down
    change_column_null :covers, :artist, false
    remove_reference :covers, :artist
  end
end
