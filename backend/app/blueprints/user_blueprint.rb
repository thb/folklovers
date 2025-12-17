class UserBlueprint < Blueprinter::Base
  identifier :id

  fields :username, :avatar_url, :created_at

  view :with_email do
    field :email
  end
end
