class RenameInterpretationsToCovers < ActiveRecord::Migration[8.0]
  def change
    rename_table :interpretations, :covers
    rename_column :votes, :interpretation_id, :cover_id
    rename_column :songs, :interpretations_count, :covers_count
  end
end
