FactoryBot.define do
  factory :song do
    title { Faker::Music.album }
    original_artist { Faker::Music.band }
    year { Faker::Number.between(from: 1950, to: 2020) }
    slug { nil } # Will be auto-generated

    transient do
      with_original { true }
      original_youtube_url { "https://www.youtube.com/watch?v=#{Faker::Alphanumeric.alphanumeric(number: 11)}" }
      original_description { Faker::Lorem.paragraph(sentence_count: 3) }
    end

    after(:create) do |song, evaluator|
      if evaluator.with_original
        create(:cover, song: song, artist_name: song.original_artist, year: song.year,
               youtube_url: evaluator.original_youtube_url,
               description: evaluator.original_description,
               original: true)
      end
    end

    trait :with_covers do
      transient do
        covers_count { 3 }
      end

      after(:create) do |song, evaluator|
        create_list(:cover, evaluator.covers_count, song: song, original: false)
      end
    end
  end
end
