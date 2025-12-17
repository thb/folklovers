FactoryBot.define do
  factory :cover do
    song
    artist { Faker::Music.band }
    year { Faker::Number.between(from: 1960, to: 2023) }
    youtube_url { "https://www.youtube.com/watch?v=#{Faker::Alphanumeric.alphanumeric(number: 11)}" }
    description { Faker::Lorem.paragraph(sentence_count: 2) }
    submitted_by { nil }
    votes_score { 0 }
    votes_count { 0 }

    trait :with_submitter do
      association :submitted_by, factory: :user
    end

    trait :popular do
      votes_score { Faker::Number.between(from: 50, to: 500) }
      votes_count { votes_score }
    end
  end
end
