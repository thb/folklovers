class CreateInterpretations < ActiveRecord::Migration[8.0]
  def change
    create_table :interpretations do |t|
      t.references :song, null: false, foreign_key: true
      t.string :artist, null: false
      t.integer :year
      t.string :youtube_url, null: false
      t.text :description
      t.references :submitted_by, foreign_key: { to_table: :users }
      t.integer :votes_score, default: 0, null: false
      t.integer :votes_count, default: 0, null: false

      t.timestamps
    end
    add_index :interpretations, [:song_id, :votes_score]
  end
end
