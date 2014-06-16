class RelationshipsController < ApplicationController
  before_filter :signed_in_user

  def create
    @user = User.find(params[:id])
    current_user.follow!(@user)
    respond_to do |format|
      format.json { render json: _build_current_user, location: root_path }
    end
  end

  def destroy
    @user = Relationship.find(current_user.relationships.find_by_followed_id(params[:id])).followed
    current_user.unfollow!(@user)
    respond_to do |format|
      format.json { render json: _build_current_user, location: root_path }
    end
  end
end
