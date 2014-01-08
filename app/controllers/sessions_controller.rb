class SessionsController < ApplicationController
  layout 'simple'

  def new
  end

  def create
    user = User.find_by_email(params[:session][:email].downcase)
    if user && user.authenticate(params[:session][:password])
      sign_in user
      redirect_back_or user
    else
      flash.now[:error] = "The email or password is wrong!"
      render "new"
    end
  end

  def destroy
    sign_out
    redirect_to root_url
  end
end