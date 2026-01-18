require "rails_helper"

RSpec.describe "Notifications API", type: :request do
  let(:user) { create(:user) }
  let(:other_user) { create(:user) }

  def auth_headers(user)
    token = JsonWebToken.encode({ user_id: user.id })
    { "Authorization" => "Bearer #{token}" }
  end

  describe "GET /notifications" do
    context "without authentication" do
      it "returns unauthorized" do
        get "/notifications"
        expect(response).to have_http_status(:unauthorized)
      end
    end

    context "with authentication" do
      it "returns user notifications" do
        create_list(:notification, 3, user: user)
        create(:notification, user: other_user)

        get "/notifications", headers: auth_headers(user)

        expect(response).to have_http_status(:ok)
        expect(json_response["notifications"].length).to eq(3)
      end

      it "returns unread count" do
        create_list(:notification, 2, user: user)
        create(:notification, :read, user: user)

        get "/notifications", headers: auth_headers(user)

        expect(json_response["unread_count"]).to eq(2)
      end

      it "returns notifications in recent order" do
        old = create(:notification, user: user, created_at: 1.day.ago)
        new = create(:notification, user: user, created_at: 1.hour.ago)

        get "/notifications", headers: auth_headers(user)

        expect(json_response["notifications"].first["id"]).to eq(new.id)
      end
    end
  end

  describe "POST /notifications/:id/read" do
    let!(:notification) { create(:notification, user: user) }

    context "without authentication" do
      it "returns unauthorized" do
        post "/notifications/#{notification.id}/read"
        expect(response).to have_http_status(:unauthorized)
      end
    end

    context "with authentication" do
      it "marks notification as read" do
        post "/notifications/#{notification.id}/read", headers: auth_headers(user)

        expect(response).to have_http_status(:ok)
        expect(notification.reload.read?).to be true
      end

      it "returns not found for other user's notification" do
        other_notification = create(:notification, user: other_user)

        post "/notifications/#{other_notification.id}/read", headers: auth_headers(user)

        expect(response).to have_http_status(:not_found)
      end
    end
  end

  describe "POST /notifications/read_all" do
    context "without authentication" do
      it "returns unauthorized" do
        post "/notifications/read_all"
        expect(response).to have_http_status(:unauthorized)
      end
    end

    context "with authentication" do
      it "marks all notifications as read" do
        create_list(:notification, 3, user: user)

        expect {
          post "/notifications/read_all", headers: auth_headers(user)
        }.to change { user.notifications.unread.count }.from(3).to(0)

        expect(response).to have_http_status(:ok)
      end
    end
  end

  def json_response
    JSON.parse(response.body)
  end
end
