class CreateSongs < ActiveRecord::Migration[8.0]
  def change
    create_table :songs do |t|
      t.string :title, null: false
      t.string :original_artist, null: false
      t.integer :year
      t.string :youtube_url
      t.text :description
      t.string :slug, null: false

      t.timestamps
    end
    add_index :songs, :slug, unique: true
  end
end
