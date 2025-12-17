namespace :users do
  desc "Promote a user to admin by email"
  task :make_admin, [ :email ] => :environment do |_t, args|
    email = args[:email]

    if email.blank?
      puts "Usage: rails users:make_admin[email@example.com]"
      exit 1
    end

    user = User.find_by(email: email)

    if user.nil?
      puts "User not found: #{email}"
      exit 1
    end

    if user.admin?
      puts "#{email} is already an admin"
    else
      user.admin!
      puts "#{email} is now an admin"
    end
  end

  desc "Remove admin role from a user by email"
  task :remove_admin, [ :email ] => :environment do |_t, args|
    email = args[:email]

    if email.blank?
      puts "Usage: rails users:remove_admin[email@example.com]"
      exit 1
    end

    user = User.find_by(email: email)

    if user.nil?
      puts "User not found: #{email}"
      exit 1
    end

    if user.user?
      puts "#{email} is not an admin"
    else
      user.user!
      puts "#{email} is no longer an admin"
    end
  end

  desc "List all admins"
  task list_admins: :environment do
    admins = User.admin
    if admins.empty?
      puts "No admins found"
    else
      puts "Admins:"
      admins.each { |u| puts "  - #{u.email} (#{u.username})" }
    end
  end
end
