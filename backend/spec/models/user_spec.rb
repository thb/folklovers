require "rails_helper"

RSpec.describe User, type: :model do
  describe "validations" do
    subject { build(:user) }

    it { should validate_presence_of(:email) }
    it { should validate_uniqueness_of(:email) }
    it { should validate_presence_of(:username) }
    it { should validate_uniqueness_of(:username) }
    it { should validate_length_of(:username).is_at_least(3).is_at_most(30) }

    context "with email/password auth" do
      it "validates password presence on create" do
        user = build(:user, password: nil)
        expect(user).not_to be_valid
        expect(user.errors[:password]).to include("can't be blank")
      end

      it "validates password minimum length" do
        user = build(:user, password: "short")
        expect(user).not_to be_valid
      end
    end

    context "with Google OAuth" do
      it "allows blank password for Google users" do
        user = build(:user, :google_user)
        expect(user).to be_valid
      end
    end

    it "validates email format" do
      user = build(:user, email: "invalid-email")
      expect(user).not_to be_valid
    end
  end

  describe "associations" do
    it { should have_many(:votes).dependent(:destroy) }
    it { should have_many(:submitted_covers) }
  end

  describe ".find_or_create_from_google" do
    let(:google_payload) do
      {
        "sub" => "google123",
        "email" => "test@example.com",
        "picture" => "https://example.com/avatar.jpg",
        "email_verified" => true
      }
    end

    context "when user does not exist" do
      it "creates a new user" do
        expect {
          User.find_or_create_from_google(google_payload)
        }.to change(User, :count).by(1)
      end

      it "sets google_id and avatar_url" do
        user = User.find_or_create_from_google(google_payload)
        expect(user.google_id).to eq("google123")
        expect(user.avatar_url).to eq("https://example.com/avatar.jpg")
      end

      it "generates a username from email" do
        user = User.find_or_create_from_google(google_payload)
        expect(user.username).to eq("test")
      end
    end

    context "when user exists with same google_id" do
      let!(:existing_user) { create(:user, :google_user, google_id: "google123") }

      it "returns the existing user" do
        user = User.find_or_create_from_google(google_payload)
        expect(user).to eq(existing_user)
      end

      it "does not create a new user" do
        expect {
          User.find_or_create_from_google(google_payload)
        }.not_to change(User, :count)
      end
    end

    context "when user exists with same email but no google_id" do
      let!(:existing_user) { create(:user, email: "test@example.com", google_id: nil) }

      it "links google_id to existing user" do
        user = User.find_or_create_from_google(google_payload)
        expect(user).to eq(existing_user)
        expect(user.reload.google_id).to eq("google123")
      end
    end
  end

  describe "has_secure_password" do
    it "authenticates with correct password" do
      user = create(:user, password: "password123")
      expect(user.authenticate("password123")).to eq(user)
    end

    it "does not authenticate with wrong password" do
      user = create(:user, password: "password123")
      expect(user.authenticate("wrongpassword")).to be_falsey
    end
  end
end
