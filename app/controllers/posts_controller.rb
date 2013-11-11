class PostsController < ApplicationController
  before_filter :signed_in_user, only: [:create, :destroy, :edit, :update]
  before_filter :correct_user,   only: [:edit, :update]

  def new
    @post = Post.new
  end

  def create
    @post = current_user.posts.build(params[:post])
    @tags = :new_tag

    if @post.save
      flash[:success] = @tags
      redirect_to current_user
    else
      render 'new'
    end
  end

  def show
    @post = Post.find(params[:id])
  end

  def index
    @posts = Post.all
  end

  def edit
    @post = Post.find(params[:id])
  end

  def update
    @post = Post.find(params[:id])
    tags = params[:new_tag].split(",")

    tags.each do |i|
      tag = i.strip().downcase
      tag = get_tag(tag)
      add_tag(tag)
    end


    if @post.update_attributes(params[:post])
      flash[:success] = "Post is updated"
      redirect_to @post
    else
      render 'edit'
    end
  end

  def destroy
    @post = Post.find(params[:id])
    @post.destroy

    redirect_to posts_path
  end

  private
    def post_params
      params.require(:post).permit(:title, :text)
    end
    def correct_user
      @user = Post.find(params[:id]).user
      redirect_to(root_url) unless current_user?(@user) || current_user.admin?
    end
    def get_tag(tag)
      @tag = Tag.find_by_name(tag) || Tag.create(name: tag)
    end
    def add_tag(tag)
      @post.tags<<(tag) unless @post.tags.exists?(tag)
    end
end
