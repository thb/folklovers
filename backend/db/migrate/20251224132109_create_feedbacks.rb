class CreateFeedbacks < ActiveRecord::Migration[8.0]
  def change
    create_table :feedbacks do |t|
      t.references :user, null: false, foreign_key: true
      t.integer :category, null: false
      t.text :message, null: false
      t.integer :status, null: false, default: 0

      t.timestamps
    end

    add_index :feedbacks, :status
    add_index :feedbacks, :category
  end
end
