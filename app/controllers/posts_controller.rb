class PostsController < ApplicationController
  before_filter :signed_in_user
  before_filter :correct_user,   only: [:update, :add_tags, :remove_tag, :upload_picture, :delete_picture, :destroy]


  def new
    @post = Post.new
  end

  def create
    @post = current_user.posts.build(post_params)

    if @post.save
      respond_to do |format|
        format.json { render json: @post, location: root_path }
      end
    end

  end

  def show
    # Проверка доступности таска, расшарен или нет, разный состав моделей
    @model = Post.find(params[:id])
    @post = current_user?(@model.user) ? Post._build_my(@model) : Post._build(@model)

    if view = current_user.views.find_by_post_id(@post["id"])
      @post["last_view"] = View.find(view).datetime
    end
    current_user.view!(@model)

    respond_to do |format|
      format.json { render json: @post, location: root_path }
    end
  end

  def index
    @posts = Post.all
  end

  def update
    @post = Post.find(params[:id])

    if (@post.update_attributes(post_params))
        if (post_params[:access] == '1')
          @post.publish
        end

        respond_to do |format|
          format.json { render json: @post, location: root_path }
        end
    end
  end


  # Tags
  def add_tags
    @post = Post.find(params[:id])
    tags = params[:data][:labels]
    tags.each do |i|
      @post.add_tag(Tag.get_tag(i))
    end

    respond_to do |format|
      format.json { render json: Post._build(@post), location: root_path }
    end
  end

  def remove_tag
    @post = Post.find(params[:id])
    @tag = Tag.find(params[:data][:tag_id])
    @post.remove_tag(@tag)

    respond_to do |format|
      format.json { render json: Post._build(@post), location: root_path }
    end

    if (!@tag.posts[0])
      @tag.destroy
    end
  end



  def get_comments
    @post     = Post.find(params[:id])
    @comments = Comment._build_comments(@post.comments.reverse)

    respond_to do |format|
      format.json { render json: @comments, location: root_path }
    end
  end


  def get_likes
    @post  = Post.find(params[:id])
    @users = User._build_users(@post.likes.map{|m| User.find(m.user_id)})

    respond_to do |format|
      format.json { render json: @users, location: root_path }
    end
  end





  # Photo illusration
  def upload_picture
    @post = Post.find(params[:id])
    @post.set_photo(params[:file]);

    respond_to do |format|
      format.json { render json: Post._build(@post), location: root_path }
    end
  end

  def delete_picture
    @post = Post.find(params[:id])
    @post.delete_photo;

    respond_to do |format|
      format.json { render json: Post._build(@post), location: root_path }
    end
  end


  # Get Tags  # Что это здесь делает? Нет контроллера? Создай
  def get_tags  # Поиск тегов из автосаджеста
    sql = "SELECT * FROM tags WHERE name LIKE '" + params[:search] + "%'"
    @tags = Tag.find_by_sql(sql)

    respond_to do |format|
      format.json { render json: @tags, location: root_path }
    end
  end



  def destroy
    @post = Post.find(params[:data][:id])
    @post.archive

    respond_to do |format|
      format.json { render json: @post || true, location: root_path }
    end
  end



  # Getting digest
  def digest
    @posts = Post.build_posts_lite(current_user.digest.split(',').map{|m| Post.find(m)})

    respond_to do |format|
      if @posts
        format.json { render json: @posts, location: root_path }
      end
    end
  end

  def all_new
    @posts = Post.build_posts_lite(Post.all_public)

    respond_to do |format|
      format.json { render json: @posts, location: root_path }
    end
  end


  def find
    # search = Post.search do
    #   fulltext params[:string]
    #   with :deleted, false
    #   with :access, 1
    # end

    searchPosts = Post.__elasticsearch__.search(
        query: {
          query_string: {
            query: "*"+ params[:string] +"* AND deleted:0 AND access: 1",
            fields: ['title^10', 'text']
          }
        }
    )

    sql = "SELECT * FROM tags WHERE name LIKE '" + params[:string] + "%'"
    @tags = Tag.find_by_sql(sql)


        # Post.search params[:string]
    posts  = searchPosts.records.to_a
    @posts = Post.build_posts_lite(posts)

    # @tags = Tag.search do
    #   fulltext params[:string]
    # end

    respond_to do |format|
      format.json { render json: {posts: @posts, tags: @tags}, location: root_path }
    end
  end


  def all_pop
    @posts = Post.build_posts_lite(Post.all_public_pop)
    respond_to do |format|
      format.json { render json: @posts, location: root_path }
    end
  end

  def feed
    @posts = Post.build_posts_lite(current_user.feed)
    respond_to do |format|
      format.json { render json: @posts, location: root_path }
    end
  end

  def bookmarks
    @posts = Post.build_posts_lite(current_user.bookmarks.map{|m| Post.find(m.post_id)})
    respond_to do |format|
      format.json { render json: @posts, location: root_path }
    end
  end


  private
    def as_indexed_json
      self.as_json({
        only: [:title, :text],
        include: {
          author: { only: :name },
          tags:   { only: :name }
        }
      })
    end

    def post_params
      params.require(:data).permit(:title, :text, :access, :deleted, :photo_id)
    end

    def correct_user
      @user = Post.find(params[:id]).user
      redirect_to(root_url) unless current_user?(@user) || current_user.admin?
    end
end
