require "rails_helper"

RSpec.describe Notification, type: :model do
  describe "associations" do
    it { should belong_to(:user) }
    it { should belong_to(:notifiable) }
  end

  describe "validations" do
    it { should validate_presence_of(:notification_type) }
    it { should validate_inclusion_of(:notification_type).in_array(Notification::TYPES) }
  end

  describe "scopes" do
    let(:user) { create(:user) }
    let!(:unread_notification) { create(:notification, user: user) }
    let!(:read_notification) { create(:notification, :read, user: user) }

    describe ".unread" do
      it "returns unread notifications" do
        expect(Notification.unread).to include(unread_notification)
        expect(Notification.unread).not_to include(read_notification)
      end
    end

    describe ".read" do
      it "returns read notifications" do
        expect(Notification.read).to include(read_notification)
        expect(Notification.read).not_to include(unread_notification)
      end
    end
  end

  describe "#read?" do
    it "returns true if read_at is present" do
      notification = build(:notification, :read)
      expect(notification.read?).to be true
    end

    it "returns false if read_at is nil" do
      notification = build(:notification)
      expect(notification.read?).to be false
    end
  end

  describe "#mark_as_read!" do
    it "sets read_at to current time" do
      notification = create(:notification)
      expect { notification.mark_as_read! }.to change { notification.read? }.from(false).to(true)
    end

    it "does not update if already read" do
      notification = create(:notification, :read)
      original_read_at = notification.read_at
      notification.mark_as_read!
      expect(notification.read_at).to eq(original_read_at)
    end
  end

  describe ".mark_all_as_read!" do
    it "marks all user notifications as read" do
      user = create(:user)
      create_list(:notification, 3, user: user)

      expect { Notification.mark_all_as_read!(user) }
        .to change { user.notifications.unread.count }.from(3).to(0)
    end
  end
end
