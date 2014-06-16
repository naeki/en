class SessionsController < ApplicationController
  layout 'simple'

  def new
  end

  def create
    user = User.find_by_email(params[:session][:email].downcase)
    if user && user.authenticate(params[:session][:password])
      sign_in user
      redirect_to root_path
    else
      redirect_to signin_path, :flash => {:error => "The email or password is wrong!"}
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
