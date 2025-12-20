class AddCoverImageCreditToArticles < ActiveRecord::Migration[8.0]
  def change
    add_column :articles, :cover_image_credit, :string
  end
end
