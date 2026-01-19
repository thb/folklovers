class Cover < ApplicationRecord
  include YoutubeValidatable
  include Taggable

  belongs_to :song, counter_cache: true
  belongs_to :submitted_by, class_name: "User", optional: true
  belongs_to :artist, optional: true
  has_many :votes, dependent: :destroy
  has_many :cover_tags, dependent: :destroy
  has_many :tags, through: :cover_tags

  validates :youtube_url, presence: true
  validate :artist_presence
  validate :only_one_original_per_song, if: :original?

  before_validation :resolve_artist

  # Allow setting artist via string (for backward compatibility with API)
  def artist=(value)
    if value.is_a?(String)
      write_attribute(:artist, value)
    elsif value.is_a?(Artist)
      super
    elsif value.nil?
      super
    end
  end

  scope :original_first, -> { order(original: :desc) }
  scope :sorted_by, ->(sort) {
    case sort
    when "recent"
      reorder(original: :desc, created_at: :desc)
    else
      reorder(original: :desc, votes_score: :desc, created_at: :desc)
    end
  }

  def vote_by(user)
    votes.find_by(user: user)
  end

  def recalculate_votes!
    update!(
      votes_score: votes.sum(:value),
      votes_count: votes.count
    )
  end

  def mark_as_original!
    Cover.transaction do
      song.covers.where(original: true).where.not(id: id).update_all(original: false)
      update!(original: true)
    end
  end

  # For backward compatibility, return artist name from association or legacy field
  def artist_name
    artist&.name || read_attribute(:artist)
  end

  private

  def artist_presence
    if artist_id.blank? && read_attribute(:artist).blank?
      errors.add(:artist, "can't be blank")
    end
  end

  def resolve_artist
    # If we have an artist name (string), find or create the artist
    artist_string = read_attribute(:artist)
    if artist_string.present?
      self.artist = Artist.find_or_create_by_name(artist_string)
    end
  end

  def only_one_original_per_song
    if song && song.covers.where(original: true).where.not(id: id).exists?
      errors.add(:original, "cover already exists for this song")
    end
  end
end
