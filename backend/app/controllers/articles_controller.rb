class ArticlesController < ApplicationController
  has_scope :by_tag
  has_scope :search

  def index
    articles = apply_scopes(Article).published.recent.includes(:author, :tags)
    pagy, articles = pagy(articles, items: params[:per_page] || 10)

    render json: {
      articles: ArticleBlueprint.render_as_hash(articles),
      pagination: pagy_metadata(pagy)
    }
  end

  def show
    article = Article.published.includes(:author, :tags).find_by!(slug: params[:slug])

    render json: {
      article: ArticleBlueprint.render_as_hash(article, view: :full)
    }
  rescue ActiveRecord::RecordNotFound
    render json: { error: "Article not found" }, status: :not_found
  end

  def tags
    tags = Tag.with_published_articles.order(:name)

    render json: {
      tags: TagBlueprint.render_as_hash(tags, view: :with_count)
    }
  end
end
