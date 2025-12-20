# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# This file is the source Rails uses to define your schema when running `bin/rails
# db:schema:load`. When creating a new database, `bin/rails db:schema:load` tends to
# be faster and is potentially less error prone than running all of your
# migrations from scratch. Old migrations may fail to apply correctly if those
# migrations use external dependencies or application code.
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema[8.0].define(version: 2025_12_20_215722) do
  # These are extensions that must be enabled in order to support this database
  enable_extension "pg_catalog.plpgsql"

  create_table "article_tags", force: :cascade do |t|
    t.bigint "article_id", null: false
    t.bigint "tag_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["article_id", "tag_id"], name: "index_article_tags_on_article_id_and_tag_id", unique: true
    t.index ["article_id"], name: "index_article_tags_on_article_id"
    t.index ["tag_id"], name: "index_article_tags_on_tag_id"
  end

  create_table "articles", force: :cascade do |t|
    t.string "title", null: false
    t.string "slug", null: false
    t.text "content", null: false
    t.text "excerpt"
    t.string "cover_image_url"
    t.datetime "published_at"
    t.bigint "author_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.string "cover_image_credit"
    t.index ["author_id"], name: "index_articles_on_author_id"
    t.index ["published_at"], name: "index_articles_on_published_at"
    t.index ["slug"], name: "index_articles_on_slug", unique: true
  end

  create_table "covers", force: :cascade do |t|
    t.bigint "song_id", null: false
    t.string "artist", null: false
    t.integer "year"
    t.string "youtube_url", null: false
    t.text "description"
    t.bigint "submitted_by_id"
    t.integer "votes_score", default: 0, null: false
    t.integer "votes_count", default: 0, null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.boolean "original", default: false, null: false
    t.index ["song_id", "original"], name: "index_covers_on_song_id_unique_original", unique: true, where: "(original = true)"
    t.index ["song_id", "votes_score"], name: "index_covers_on_song_id_and_votes_score"
    t.index ["song_id"], name: "index_covers_on_song_id"
    t.index ["submitted_by_id"], name: "index_covers_on_submitted_by_id"
  end

  create_table "songs", force: :cascade do |t|
    t.string "title", null: false
    t.string "original_artist", null: false
    t.integer "year"
    t.string "slug", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.integer "covers_count", default: 0, null: false
    t.bigint "submitted_by_id"
    t.index ["slug"], name: "index_songs_on_slug", unique: true
    t.index ["submitted_by_id"], name: "index_songs_on_submitted_by_id"
  end

  create_table "tags", force: :cascade do |t|
    t.string "name", null: false
    t.string "slug", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["name"], name: "index_tags_on_name", unique: true
    t.index ["slug"], name: "index_tags_on_slug", unique: true
  end

  create_table "users", force: :cascade do |t|
    t.string "email", null: false
    t.string "username", null: false
    t.string "password_digest"
    t.string "google_id"
    t.string "avatar_url"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.integer "role", default: 0, null: false
    t.index ["email"], name: "index_users_on_email", unique: true
    t.index ["google_id"], name: "index_users_on_google_id", unique: true, where: "(google_id IS NOT NULL)"
    t.index ["username"], name: "index_users_on_username", unique: true
  end

  create_table "votes", force: :cascade do |t|
    t.bigint "user_id", null: false
    t.bigint "cover_id", null: false
    t.integer "value", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["cover_id"], name: "index_votes_on_cover_id"
    t.index ["user_id", "cover_id"], name: "index_votes_on_user_id_and_cover_id", unique: true
    t.index ["user_id"], name: "index_votes_on_user_id"
  end

  add_foreign_key "article_tags", "articles"
  add_foreign_key "article_tags", "tags"
  add_foreign_key "articles", "users", column: "author_id"
  add_foreign_key "covers", "songs"
  add_foreign_key "covers", "users", column: "submitted_by_id"
  add_foreign_key "songs", "users", column: "submitted_by_id"
  add_foreign_key "votes", "covers"
  add_foreign_key "votes", "users"
end
