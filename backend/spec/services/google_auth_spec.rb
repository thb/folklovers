require "rails_helper"

RSpec.describe GoogleAuth do
  let(:client_id) { "test-client-id.apps.googleusercontent.com" }
  let(:valid_payload) do
    {
      "iss" => "https://accounts.google.com",
      "aud" => client_id,
      "sub" => "123456789",
      "email" => "user@example.com",
      "email_verified" => true,
      "exp" => 1.hour.from_now.to_i
    }
  end

  before do
    stub_const("GoogleAuth::GOOGLE_CLIENT_ID", client_id)
  end

  describe ".verify" do
    context "with valid token" do
      let(:token) { JWT.encode(valid_payload, nil, "none") }

      it "returns the payload" do
        result = described_class.verify(token)
        expect(result["email"]).to eq("user@example.com")
        expect(result["sub"]).to eq("123456789")
      end
    end

    context "with expired token" do
      let(:expired_payload) { valid_payload.merge("exp" => 1.hour.ago.to_i) }
      let(:token) { JWT.encode(expired_payload, nil, "none") }

      it "returns nil" do
        expect(described_class.verify(token)).to be_nil
      end
    end

    context "with wrong audience" do
      let(:wrong_aud_payload) { valid_payload.merge("aud" => "wrong-client-id") }
      let(:token) { JWT.encode(wrong_aud_payload, nil, "none") }

      it "returns nil" do
        expect(described_class.verify(token)).to be_nil
      end
    end

    context "with wrong issuer" do
      let(:wrong_iss_payload) { valid_payload.merge("iss" => "https://evil.com") }
      let(:token) { JWT.encode(wrong_iss_payload, nil, "none") }

      it "returns nil" do
        expect(described_class.verify(token)).to be_nil
      end
    end

    context "with unverified email" do
      let(:unverified_payload) { valid_payload.merge("email_verified" => false) }
      let(:token) { JWT.encode(unverified_payload, nil, "none") }

      it "returns nil" do
        expect(described_class.verify(token)).to be_nil
      end
    end

    context "with alternative issuer" do
      let(:alt_issuer_payload) { valid_payload.merge("iss" => "accounts.google.com") }
      let(:token) { JWT.encode(alt_issuer_payload, nil, "none") }

      it "accepts accounts.google.com without https" do
        result = described_class.verify(token)
        expect(result).not_to be_nil
        expect(result["email"]).to eq("user@example.com")
      end
    end

    context "with invalid token format" do
      it "returns nil for malformed token" do
        expect(described_class.verify("not.a.valid.token")).to be_nil
      end

      it "returns nil for empty token" do
        expect(described_class.verify("")).to be_nil
      end
    end

    context "without GOOGLE_CLIENT_ID configured" do
      before do
        stub_const("GoogleAuth::GOOGLE_CLIENT_ID", nil)
      end

      it "returns nil" do
        token = JWT.encode(valid_payload, nil, "none")
        expect(described_class.verify(token)).to be_nil
      end
    end
  end
end
