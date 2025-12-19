class MigrateSongYoutubeUrlToOriginalCovers < ActiveRecord::Migration[8.0]
  def up
    execute <<-SQL
      INSERT INTO covers (song_id, artist, year, youtube_url, description, original, created_at, updated_at)
      SELECT
        id,
        original_artist,
        year,
        youtube_url,
        description,
        true,
        NOW(),
        NOW()
      FROM songs
      WHERE youtube_url IS NOT NULL AND youtube_url != ''
    SQL
  end

  def down
    execute <<-SQL
      DELETE FROM covers WHERE original = true
    SQL
  end
end
