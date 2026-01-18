FactoryBot.define do
  factory :notification do
    user
    association :notifiable, factory: :vote
    notification_type { "vote_received" }
    read_at { nil }

    trait :read do
      read_at { Time.current }
    end

    trait :vote_received do
      notification_type { "vote_received" }
      association :notifiable, factory: :vote
    end

    trait :new_cover do
      notification_type { "new_cover_on_song" }
      association :notifiable, factory: :cover
    end
  end
end
