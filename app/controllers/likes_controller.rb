class LikesController < ApplicationController
  before_filter :signed_in_user

  def create
    @post = Post.find(params[:post_id])
    current_user.like!(@post)
    @post.update_likes

    respond_to do |format|
      format.json { render json: _build_current_user, location: root_path }
    end
  end

  def destroy
    @post = Post.find(params[:post_id])
    @like = Like.find(current_user.likes.find_by_post_id(params[:post_id]))
    current_user.unlike!(@like)
    @post.update_attribute(:likes_count, @post.likes.count)

    respond_to do |format|
      format.json { render json: _build_current_user, location: root_path }
    end
  end

end
