FactoryBot.define do
  factory :song do
    title { Faker::Music.album }
    original_artist { Faker::Music.band }
    year { Faker::Number.between(from: 1950, to: 2020) }
    youtube_url { "https://www.youtube.com/watch?v=#{Faker::Alphanumeric.alphanumeric(number: 11)}" }
    description { Faker::Lorem.paragraph(sentence_count: 3) }
    slug { nil } # Will be auto-generated

    trait :with_covers do
      transient do
        covers_count { 3 }
      end

      after(:create) do |song, evaluator|
        create_list(:cover, evaluator.covers_count, song: song)
      end
    end
  end
end
