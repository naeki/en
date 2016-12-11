class SessionsController < ApplicationController
  layout 'simple'
  respond_to :html, :json

  def new
  end

  def create
    @user = User.from_omniauth(request.env['omniauth.auth'])

    # user = User.find_by_email(params[:session][:email].downcase)
    if @user #&& user.authenticate(params[:session][:password])
      session[:user_id] = @user.id
    #   sign_in user
      redirect_to root_path
      # else
      # redirect_to signin_path, :flash => {:error => "The email or password is wrong!"}
    end
  end

  def createAtAndroid
    @user = User.from_android_oauth(request)

    # user = User.find_by_email(params[:session][:email].downcase)
    if @user #&& user.authenticate(params[:session][:password])
      session[:user_id] = @user.id
      #   sign_in user
      # redirect_to root_path
      # else
      # redirect_to signin_path, :flash => {:error => "The email or password is wrong!"}
      format.json { render json: session, location: root_path }
    end
  end

  def auth
    user = User.find_by_email(params[:session][:email].downcase)
    if user && user.authenticate(params[:session][:password])
      sign_in user
      # redirect_to root_path
      respond_to do |format|
        format.json { render json: _build_current_user, location: root_path }
      end
    else
      respond_to do |format|
        format.json { render json: {error => "wrong pass or login"}, location: root_path }
      end
    end
  end

  def get_current_user
    respond_to do |format|
      format.json { render json: _build_current_user, location: root_path }
    end
  end

  def destroy
    sign_out
    redirect_to root_url
  end
end
