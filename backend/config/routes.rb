Rails.application.routes.draw do
  # Health check
  get "up" => "rails/health#show", as: :rails_health_check

  # Auth
  post "auth/register", to: "auth#register"
  post "auth/login", to: "auth#login"
  post "auth/google", to: "auth#google"
  get "auth/me", to: "auth#me"

  # Songs
  get "songs/top", to: "songs#top"
  get "songs", to: "songs#index"
  get "songs/:slug", to: "songs#show"

  # Covers
  get "covers/top", to: "covers#top"
  get "songs/:song_slug/covers", to: "covers#index"
  post "songs/:song_slug/covers", to: "covers#create"

  # Votes
  post "covers/:cover_id/vote", to: "votes#create"
  delete "covers/:cover_id/vote", to: "votes#destroy"

  # Admin
  namespace :admin do
    resources :songs, only: [ :index, :show, :create, :update, :destroy ]
    resources :covers, only: [ :index, :show, :create, :update, :destroy ]
    resources :users, only: [ :index, :show ]
  end
end
