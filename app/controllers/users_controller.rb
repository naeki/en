class UsersController < ApplicationController
  before_filter :signed_in_user, only: [:index, :edit, :update, :destroy, :following, :followers]
  before_filter :correct_user,   only: [:edit, :update, :destroy, :following, :followers]

  def new
    @user = User.new
  end

  def create
    @user = User.new(params[:user])

    if @user.save
      sign_in @user
      flash[:success] = "Welcome to the Greatest App Engigest!"
      redirect_to @user
    else
      render "new"
    end
  end

  #def checkUser
  #  user = User.find_by_email(params[:email])
  #end

  def show
    @user = User.find(params[:id])
    if (@user == current_user)
      @posts = @user.feed
    else
      @posts = @user.posts
    end
  end

  def posts
    @user = User.find(params[:id])
    @posts = @user.posts
    render "shared/posts"
  end

  def feed
    @user = User.find(params[:id])
    @posts = @user.feed
    render "shared/posts"
  end

  def index
    @users = User.all
  end

  def edit
  end

  def update
    if @user.update_attributes(params[:user])
      redirect_to @user
    else
      render 'edit'
    end
  end

  def destroy
    @user = User.find(params[:id])
    @user.destroy
    flash[:success] = "User deleted"

    redirect_to users_url
  end

  def following
    @title = "Following"
    @user = User.find(params[:id])
    @users = @user.followed_users
    render 'show_follow'
  end

  def followers
    @title = "Followers"
    @user = User.find(params[:id])
    @users = @user.followers
    render 'show_follow'
  end

  private
    def user_params
      params.require(:user).permit(:email, :password, :password_confirmation)
    end

    def correct_user
      @user = User.find(params[:id])
      redirect_to(root_url) unless current_user?(@user) || current_user.admin?
    end
end
