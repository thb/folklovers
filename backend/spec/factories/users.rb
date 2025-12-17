FactoryBot.define do
  factory :user do
    email { Faker::Internet.unique.email }
    username { Faker::Internet.unique.username(specifier: 5..20) }
    password { "password123" }

    trait :google_user do
      google_id { Faker::Alphanumeric.alphanumeric(number: 21) }
      avatar_url { Faker::Avatar.image }
      password { nil }
    end
  end
end
