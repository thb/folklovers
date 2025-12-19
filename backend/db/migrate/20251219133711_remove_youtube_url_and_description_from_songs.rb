class RemoveYoutubeUrlAndDescriptionFromSongs < ActiveRecord::Migration[8.0]
  def change
    remove_column :songs, :youtube_url, :string
    remove_column :songs, :description, :text
  end
end
