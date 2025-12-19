class AddOriginalToCovers < ActiveRecord::Migration[8.0]
  def change
    add_column :covers, :original, :boolean, default: false, null: false
    add_index :covers, [:song_id, :original], unique: true, where: "original = true", name: "index_covers_on_song_id_unique_original"
  end
end
