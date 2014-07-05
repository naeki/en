class CommentsController < ApplicationController
  before_filter :signed_in_user, only: [:create, :destroy]
  before_filter :correct_user,   only: [:destroy]

  def create
    @post = Post.find(params[:post_id])
    @comment = @post.comments.create(comments_params.merge(:user_id => current_user.id))
    respond_to do |format|
      format.json { render json: Comment._build(@comment), location: root_path }
    end
  end

  def destroy
    @post = Post.find(params[:post_id])
    @comment = @post.comments.find(params[:id])
    @comment.destroy
    respond_to do |format|
      format.json { render json: Post._build(@post), location: root_path }
    end
  end

  private
    def comments_params
      params.require(:data).permit(:body, :post_id)
    end

    def correct_user
      @user = User.find(Comment.find(params[:id]).user_id)
      redirect_to(root_url) unless current_user?(@user) || current_user.admin?
    end
end
