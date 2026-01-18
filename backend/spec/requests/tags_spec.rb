require "rails_helper"

RSpec.describe "Tags API", type: :request do
  describe "GET /tags" do
    it "returns all tags ordered by name" do
      Tag.create!(name: "Zydeco", slug: "zydeco")
      Tag.create!(name: "Acoustic", slug: "acoustic")
      Tag.create!(name: "Blues", slug: "blues")

      get "/tags"

      expect(response).to have_http_status(:ok)
      json = JSON.parse(response.body)
      expect(json["tags"].length).to eq(3)
      expect(json["tags"].map { |t| t["name"] }).to eq([ "Acoustic", "Blues", "Zydeco" ])
    end

    it "returns tag id, name, and slug" do
      tag = Tag.create!(name: "Folk", slug: "folk")

      get "/tags"

      expect(response).to have_http_status(:ok)
      json = JSON.parse(response.body)
      expect(json["tags"].first).to include(
        "id" => tag.id,
        "name" => "Folk",
        "slug" => "folk"
      )
    end

    it "returns empty array when no tags exist" do
      get "/tags"

      expect(response).to have_http_status(:ok)
      json = JSON.parse(response.body)
      expect(json["tags"]).to eq([])
    end
  end
end
