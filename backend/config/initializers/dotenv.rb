# Load .env from parent directory (project root)
if defined?(Dotenv)
  Dotenv.load(Rails.root.join("..", ".env"))
end
