class UsersController < ApplicationController
  before_filter :signed_in_user, only: [:index, :edit, :update, :destroy, :following, :followers]
  before_filter :correct_user,   only: [:update, :destroy, :following]

  layout 'simple'

  def new
    @user = User.new
  end

  def create
    @user = User.new(user_params)

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
    options = params[:options] || {}
    if (!current_user?(@user))
      options["access"] = 1
    end
    @posts = @user.own_posts(options)
    respond_to do |format|
      format.json { render json: Post.build_posts_lite(@posts), location: root_path }
    end
  end

  def likes
    @user = User.find(params[:id])
    @posts = @user.recommendations

    respond_to do |format|
      format.json { render json: Post.build_posts_lite(@posts), location: root_path }
    end
  end

  def bookmarks
    @posts = current_user.bookmarks.map{|b| Post.find(b.post_id)}
    respond_to do |format|
      format.json { render json: Post.build_posts_lite(@posts), location: root_path }
    end
  end

  def index
    @users = User.all
    respond_to do |format|
      format.json { render json: User._build_users(@users), location: root_path }
    end
  end

  def update
    @user = current_user   #Even if someone will try to edit someone's profile, he will edit his own current_user's profile

    if (params[:user][:password] && params[:user][:password_confirmation])
      if (@user && @user.authenticate(params[:old]))
        @result = @user.update_attributes(params[:user])
        @result = {succ: 1}
      else
        @result = {error: 1}
      end
    else
      @result = @user.update_attribute(:name, params[:user][:name])    #@user.update_attributes(params[:user]) - Лучше так
    end

    #if @user.update_attributes(params[:user])
    respond_to do |format|
      format.json { render json: @user, location: root_path }
    end
  end





  def upload_photo
    current_user.set_photo(params[:file])

    respond_to do |format|
      format.json { render json: current_user, location: root_path }
    end
  end

  def delete_photo
    current_user.delete_photo

    respond_to do |format|
      format.json { render json: current_user, location: root_path }
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
      format.json { render json: User._build_users(@users), location: root_path }
    end
  end

  def followers
    @user = User.find(params[:id])
    @users = @user.followers
    respond_to do |format|
      format.json { render json: User._build_users(@users), location: root_path }
    end
  end

  private
    def user_params
      params.require(:user).permit(:email, :password, :password_confirmation, :name)
    end

    def correct_user
      @user = User.find(params[:id])
      redirect_to(root_url) unless current_user?(@user) || current_user.admin?
    end
end
