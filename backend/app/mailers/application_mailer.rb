class ApplicationMailer < ActionMailer::Base
  default from: ENV.fetch("MAILER_FROM", "Folk Lovers <hello@folklovers.com>")
  layout "mailer"
end
