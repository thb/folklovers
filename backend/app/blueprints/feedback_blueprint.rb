class FeedbackBlueprint < Blueprinter::Base
  identifier :id

  fields :category, :message, :status, :created_at, :updated_at

  association :user, blueprint: UserBlueprint
end
