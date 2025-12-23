RSpec.shared_examples "youtube_validatable" do
  describe "youtube_url format validation" do
    let(:valid_urls) do
      [
        "https://www.youtube.com/watch?v=abc123",
        "https://youtube.com/watch?v=abc123",
        "http://www.youtube.com/watch?v=abc-_123",
        "http://youtube.com/watch?v=abc123",
        "https://youtu.be/abc123",
        "http://youtu.be/abc-_123"
      ]
    end

    let(:invalid_urls) do
      [
        "https://vimeo.com/123456",
        "https://dailymotion.com/video/123",
        "not a url",
        "https://youtube.com/watch?v=",
        "https://youtube.com/",
        "ftp://youtube.com/watch?v=abc123"
      ]
    end

    it "accepts valid YouTube URLs" do
      valid_urls.each do |url|
        subject.youtube_url = url
        subject.valid?
        expect(subject.errors[:youtube_url]).not_to include("must be a valid YouTube URL"),
          "Expected '#{url}' to be valid"
      end
    end

    it "rejects invalid YouTube URLs" do
      invalid_urls.each do |url|
        subject.youtube_url = url
        subject.valid?
        expect(subject.errors[:youtube_url]).to include("must be a valid YouTube URL"),
          "Expected '#{url}' to be invalid"
      end
    end
  end

  describe "youtube_url normalization" do
    it "normalizes youtu.be URLs to standard format" do
      subject.youtube_url = "https://youtu.be/abc123"
      subject.valid?
      expect(subject.youtube_url).to eq("https://www.youtube.com/watch?v=abc123")
    end

    it "strips tracking parameters from youtu.be URLs" do
      subject.youtube_url = "https://youtu.be/abc123?si=tracking-param"
      subject.valid?
      expect(subject.youtube_url).to eq("https://www.youtube.com/watch?v=abc123")
    end

    it "normalizes youtube.com URLs without www" do
      subject.youtube_url = "https://youtube.com/watch?v=abc123"
      subject.valid?
      expect(subject.youtube_url).to eq("https://www.youtube.com/watch?v=abc123")
    end

    it "strips extra parameters from youtube.com URLs" do
      subject.youtube_url = "https://www.youtube.com/watch?v=abc123&feature=share"
      subject.valid?
      expect(subject.youtube_url).to eq("https://www.youtube.com/watch?v=abc123")
    end

    it "does not modify blank URLs" do
      subject.youtube_url = ""
      subject.valid?
      expect(subject.youtube_url).to eq("")
    end
  end
end
