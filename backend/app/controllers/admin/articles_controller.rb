module Admin
  class ArticlesController < BaseController
    has_scope :search

    def index
      articles = apply_scopes(Article).includes(:author, :tags).order(created_at: :desc)
      pagy, articles = pagy(articles, items: params[:per_page] || Pagination::ADMIN_PER_PAGE)

      render json: {
        articles: ArticleBlueprint.render_as_hash(articles, view: :admin),
        pagination: pagy_metadata(pagy)
      }
    end

    def show
      article = Article.includes(:author, :tags).find(params[:id])

      render json: {
        article: ArticleBlueprint.render_as_hash(article, view: :admin)
      }
    end

    def create
      article = Article.new(article_params)
      article.author = current_user

      Article.transaction do
        article.save!
        sync_tags(article, params[:tag_names]) if params[:tag_names].present?
      end

      render json: { article: ArticleBlueprint.render_as_hash(article.reload, view: :admin) }, status: :created
    rescue ActiveRecord::RecordInvalid => e
      render json: { errors: e.record.errors.full_messages }, status: :unprocessable_entity
    end

    def update
      article = Article.find(params[:id])

      Article.transaction do
        article.update!(article_params)
        sync_tags(article, params[:tag_names]) if params.key?(:tag_names)
      end

      render json: { article: ArticleBlueprint.render_as_hash(article.reload, view: :admin) }
    rescue ActiveRecord::RecordInvalid => e
      render json: { errors: e.record.errors.full_messages }, status: :unprocessable_entity
    end

    def destroy
      article = Article.find(params[:id])
      article.destroy
      head :no_content
    end

    def publish
      article = Article.find(params[:id])

      if article.published?
        article.update!(published_at: nil)
      else
        article.update!(published_at: Time.current)
      end

      render json: { article: ArticleBlueprint.render_as_hash(article, view: :admin) }
    end

    private

    def article_params
      params.permit(:title, :content, :excerpt, :cover_image_url, :cover_image_credit, :published_at)
    end

    def sync_tags(article, tag_names)
      article.sync_tags_by_names(tag_names)
    end
  end
end
