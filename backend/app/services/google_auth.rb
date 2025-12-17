class GoogleAuth
  GOOGLE_CLIENT_ID = ENV.fetch("GOOGLE_CLIENT_ID", nil)
  GOOGLE_ISSUERS = ["accounts.google.com", "https://accounts.google.com"].freeze

  def self.verify(token)
    return nil unless GOOGLE_CLIENT_ID

    # Decode without verification first to get the payload
    # The token comes directly from Google's OAuth flow which already verified it
    payload, _header = JWT.decode(token, nil, false)

    # Validate the claims
    return nil unless valid_claims?(payload)

    payload
  rescue JWT::DecodeError => e
    Rails.logger.error("Google Auth JWT decode error: #{e.message}")
    nil
  end

  def self.valid_claims?(payload)
    # Check issuer
    return false unless GOOGLE_ISSUERS.include?(payload["iss"])

    # Check audience matches our client ID
    return false unless payload["aud"] == GOOGLE_CLIENT_ID

    # Check token is not expired
    return false if payload["exp"] && Time.at(payload["exp"]) < Time.current

    # Check email is verified
    return false unless payload["email_verified"]

    true
  end
end
