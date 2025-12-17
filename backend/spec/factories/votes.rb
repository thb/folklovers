FactoryBot.define do
  factory :vote do
    user
    cover
    value { 1 }

    trait :upvote do
      value { 1 }
    end

    trait :downvote do
      value { -1 }
    end
  end
end
