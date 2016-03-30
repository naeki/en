class HomeController < ApplicationController
  #before_filter :signed_in_user

  def index
    #respond_to do |format|
    #  format.json { render json: session[:return_to].to_s, location: root_path }
    #  format.html { render 'index' }
    #end
    if (signed_in?)
      render 'index'
    else
      SessionsController.new
      @user = User.new
      render file: 'home/static', layout: 'simple'
    end
  end

  def post
    store_location

    if (!signed_in?)
      redirect_to '/'
    else
      @model = Post.find_by_id(params[:id])

      if (@model)
        store_location
        render 'index'
      else
        render file: 'home/nf', layout: 'error'
      end
    end
  end

  def user
    store_location

    if (!signed_in?)
      redirect_to '/'
    else
      @model = User.find_by_id(params[:id].slice(/\d*$/))

      if (@model)
        store_location
        render 'index'
      else
        render file: 'home/nf', layout: 'error'
      end
    end
  end


  def enter
    store_location
    if (signed_in?)
      render "index"
    else
      redirect_to '/'
    end
  end

  def nf
    render file: 'home/nf', layout: 'error'
  end
end
