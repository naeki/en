class BookmarksController < ApplicationController
  before_filter :signed_in_user

  def create
    @post = Post.find(params[:post_id])
    current_user.add_bookmark!(@post)
    respond_to do |format|
      format.json { render json: _build_current_user, location: root_path }
    end
  end

  def destroy
    @bookmark = Bookmark.find(current_user.bookmarks.find_by_post_id(params[:post_id]))
    current_user.remove_bookmark!(@bookmark)
    respond_to do |format|
      format.json { render json: _build_current_user, location: root_path }
    end
  end
end
