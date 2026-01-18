class CreateArtists < ActiveRecord::Migration[8.0]
  def change
    create_table :artists do |t|
      t.string :name, null: false
      t.string :slug, null: false
      t.text :bio
      t.string :image_url

      t.timestamps
    end
    add_index :artists, :slug, unique: true
    add_index :artists, :name
  end
end
