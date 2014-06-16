class ViewsController < ApplicationController
  before_filter :signed_in_user

  def destroy
    @view = Like.find(current_user.likes.find_by_post_id(params[:post_id]))
    @view.destroy
  end
end
