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
  get "songs/search", to: "songs#search"
  get "songs", to: "songs#index"
  post "songs", to: "songs#create"
  get "songs/:slug", to: "songs#show"

  # Covers
  get "covers/top", to: "covers#top"
  post "covers", to: "covers#create_with_song"
  get "songs/:song_slug/covers", to: "covers#index"
  post "songs/:song_slug/covers", to: "covers#create"

  # Votes
  post "covers/:cover_id/vote", to: "votes#create"
  delete "covers/:cover_id/vote", to: "votes#destroy"

  # Blog
  get "blog", to: "articles#index"
  get "blog/tags", to: "articles#tags"
  get "blog/:slug", to: "articles#show"

  # Feedbacks
  resources :feedbacks, only: [ :create ]

  # Admin
  namespace :admin do
    resources :songs, only: [ :index, :show, :create, :update, :destroy ]
    resources :covers, only: [ :index, :show, :create, :update, :destroy ] do
      member do
        post :set_original
      end
    end
    resources :users, only: [ :index, :show ]
    resources :articles, only: [ :index, :show, :create, :update, :destroy ] do
      member do
        post :publish
      end
    end
    resources :tags, only: [ :index, :destroy ]
    resources :feedbacks, only: [ :index, :update, :destroy ]
  end
end
