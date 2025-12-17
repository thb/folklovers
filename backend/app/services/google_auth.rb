class GoogleAuth
  GOOGLE_CLIENT_ID = ENV.fetch("GOOGLE_CLIENT_ID", nil)

  def self.verify(token)
    return nil unless GOOGLE_CLIENT_ID

    validator = GoogleIDToken::Validator.new
    payload = validator.check(token, GOOGLE_CLIENT_ID)

    return nil unless payload
    return nil unless payload["email_verified"]

    payload
  rescue GoogleIDToken::ValidationError
    nil
  end
end
