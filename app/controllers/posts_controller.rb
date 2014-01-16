class PostsController < ApplicationController
  before_filter :signed_in_user
  before_filter :correct_user,   only: [:edit, :update]

  def new
    @post = Post.new
  end

  def create
    @post = current_user.posts.build(params[:data])

    if @post.save
      respond_to do |format|
        format.json { render json: @post, location: root_path }
      end
    end
  end

  def show
    @model    = Post.find(params[:id])
    @post     = Post._build(@model)
    @comments = build_comments(@model.comments)

    respond_to do |format|
      format.json { render json: {post: @post, comments: @comments}, location: root_path }
    end
  end

  def index
    @posts = Post.all
  end

  def edit
    @post = Post.find(params[:id])
  end

  def update
    @post = Post.find(params[:id])
    if (@post.update_attributes(params[:data]))
        respond_to do |format|
          format.json { render json: @post, location: root_path }
        end
    end
  end

  def add_tags
    @post = Post.find(params[:id])
    tags = params[:data]
    tags.each do |i|
      @post.add_tag(Tag.get_tag(i))
    end

    respond_to do |format|
      format.json { render json: Post._build(@post), location: root_path }
    end
  end

  def remove_tag
    @post = Post.find(params[:id])
    @tag = Tag.find(params[:data])
    @post.remove_tag(@tag)

    respond_to do |format|
      format.json { render json: Post._build(@post), location: root_path }
    end

    if (!@tag.posts[0])
      @tag.destroy
    end
  end


  def destroy
    @post = Post.find(params[:id])
    @post.destroy

    redirect_to posts_path
  end




  def digest
    sql = "SELECT * FROM posts ORDER BY random() LIMIT 2"
    #results = ActiveRecord::Base.connection.execute(sql)
    @posts = Post.build_posts(Post.find_by_sql(sql))

    respond_to do |format|
      if @posts
        format.json { render json: @posts, location: root_path }
      end
    end
  end

  def all
    @posts = Post.build_posts(Post.all)
    respond_to do |format|
      format.json { render json: @posts, location: root_path }
    end
  end

  def feed
    @posts = Post.build_posts(current_user.feed)
    respond_to do |format|
      format.json { render json: @posts, location: root_path }
    end
  end


  private
    def build_comments(comments)
      @posts = comments.map{|comment| Comment._build(comment)}
    end


    def post_params
      params.require(:post).permit(:title, :text)
    end
    def correct_user
      @user = Post.find(params[:id]).user
      redirect_to(root_url) unless current_user?(@user) || current_user.admin?
    end
end
