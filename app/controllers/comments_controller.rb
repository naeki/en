class CommentsController < ApplicationController
  before_filter :signed_in_user, only: [:create, :destroy]

  def create
    @post = Post.find(params[:post_id])
    @comment = @post.comments.create(params[:data].merge(:user_id => current_user.id))
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
end
