class User < ApplicationRecord
  has_secure_password validations: false

  enum :role, { user: 0, admin: 1 }, default: :user

  has_many :votes, dependent: :destroy
  has_many :submitted_covers, class_name: "Cover", foreign_key: :submitted_by_id
  has_many :feedbacks, dependent: :destroy

  validates :email, presence: true, uniqueness: true, format: { with: URI::MailTo::EMAIL_REGEXP }
  validates :username, presence: true, uniqueness: true, length: { minimum: 3, maximum: 30 }
  validates :password, presence: true, length: { minimum: 6 }, if: :password_required?

  def self.find_or_create_from_google(google_payload)
    user = find_by(google_id: google_payload["sub"]) || find_by(email: google_payload["email"])

    if user
      user.update!(google_id: google_payload["sub"]) unless user.google_id
    else
      user = create!(
        email: google_payload["email"],
        username: generate_username(google_payload["email"]),
        google_id: google_payload["sub"],
        avatar_url: google_payload["picture"]
      )
    end

    user
  end

  private

  def password_required?
    google_id.blank? && (new_record? || password_digest_changed?)
  end

  def self.generate_username(email)
    base = email.split("@").first.gsub(/[^a-zA-Z0-9]/, "")
    username = base[0, 20]
    counter = 1

    while exists?(username: username)
      username = "#{base[0, 17]}#{counter}"
      counter += 1
    end

    username
  end
end
