class CreateSongWithCoverService
  attr_reader :song, :cover, :errors

  def initialize(song_params:, cover_params:, submitted_by: nil)
    @song_params = song_params
    @cover_params = cover_params
    @submitted_by = submitted_by
    @errors = []
  end

  def call
    Song.transaction do
      create_song
      create_original_cover if @song.persisted?

      raise ActiveRecord::Rollback if @errors.any?
    end

    success?
  end

  def success?
    @errors.empty? && @song&.persisted? && @cover&.persisted?
  end

  private

  def create_song
    @song = Song.new(@song_params)
    @song.submitted_by = @submitted_by

    unless @song.save
      @errors.concat(@song.errors.full_messages)
    end
  end

  def create_original_cover
    @cover = @song.covers.build(
      artist: @cover_params[:artist] || @song.original_artist,
      year: @cover_params[:year] || @song.year,
      youtube_url: @cover_params[:youtube_url],
      description: @cover_params[:description],
      original: true,
      submitted_by: @submitted_by
    )

    unless @cover.save
      @errors.concat(@cover.errors.full_messages)
    end
  end
end
