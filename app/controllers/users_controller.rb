class UsersController < ApplicationController
  before_filter :signed_in_user, only: [:index, :edit, :update, :destroy, :following, :followers]
  before_filter :correct_user,   only: [:edit, :update, :destroy, :following, :followers]

  layout 'simple'

  def new
    @user = User.new
  end

  def create
    @user = User.new(params[:user])

    if @user.save
      sign_in @user
      redirect_to '/user' + @user.id.to_s
    else
      render 'new'
    end
  end

  #def checkUser
  #  user = User.find_by_email(params[:email])
  #end

  def show
    @user = User.find(params[:id])
    @posts = @user.posts

    respond_to do |format|
      format.json { render json: {user: User._build(@user), posts: Post.build_posts(@posts)}, location: root_path }
    end
  end

  def posts
    @user = User.find(params[:id])
    @posts = @user.posts
    respond_to do |format|
      format.json { render json: Post.build_posts(@posts), location: root_path }
    end
  end

  def index
    @users = User.all
    respond_to do |format|
      format.json { render json: @users, location: root_path }
    end
  end

  def edit
  end

  def update
    @user = current_user   #Even if someone will try to edit someone's profile, he will edit his own current_user's profile

    if @user && @user.authenticate(params[:data][:old])
      @result = @user.update_attributes(params[:data][:user])
    else
      @result = {error: 1}
    end

    #if @user.update_attributes(params[:user])

    respond_to do |format|
      format.json { render json: @result, location: root_path }
    end
  end

  def destroy
    @user = User.find(params[:id])
    @user.destroy

    redirect_to users_url
  end

  def following
    @user = User.find(params[:id])
    @users = @user.followed_users
    respond_to do |format|
      format.json { render json: @users, location: root_path }
    end
  end

  def followers
    @user = User.find(params[:id])
    @users = @user.followers
    respond_to do |format|
      format.json { render json: @users, location: root_path }
    end
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
