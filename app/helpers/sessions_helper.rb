module SessionsHelper
  def sign_in(user)
    sign_out
    remember_token = User.new_remember_token
    cookies.permanent[:remember_token] = remember_token
    user.update_attribute(:remember_token, User.encrypt(remember_token))
    self.current_user = user
  end

  def signed_in?
    !current_user.nil?
  end

  def current_user?(user)
    current_user == user
  end

  def signed_in_user
    unless signed_in?
      #store_location
      respond_to do |format|
        format.json { render json: {error: 2}, location: root_path }
      end
    end
  end

  def redirect_back_or(default)
    redirect_to(session[:return_to] || default)
    session.delete(:return_to)
  end
  def store_location
    session[:return_to] = request.url if request.get?
  end

  def current_user=(user)
    @current_user = user
  end

  def current_user
    remember_token = User.encrypt(cookies[:remember_token])
    @current_user ||= User.find_by_remember_token(remember_token)
  end

  def _build_current_user
    fs    = current_user.followers.map{|m| m.id}       # Для того, чтобы знать, кто подписан на меня
    fg    = current_user.followed_users.map{|m| m.id}  # Для того, чтобы знать, на кого я подписан, чтобы показывать в кнопке правильноое слово и не подгружать каждый раз каждому пользователю фолловеров только для того, чтобы в кнопке написать фол или унфол
    likes = current_user.likes.map{|m| m.post_id}      # Для того, чтобы знать, что я лайкнул
    bmks  = current_user.bookmarks.map{|m| m.post_id}  # Для того, чтобы знать, что я добавил в закладки

    obj = current_user.as_json

    obj["name"]            = current_user.name.empty? ? current_user.email : current_user.name        #TEMPORARY!!!!
    obj["posts_count"]     = current_user.posts.count
    obj["likes_count"]     = current_user.likes.count
    obj["followers"]       = fs
    obj["following"]       = fg
    obj["likes"]           = likes
    obj["bookmarks"]       = bmks
    obj["digest_settings"] = current_user.digest_tags

    obj
  end

  def sign_out
    self.current_user = nil
    cookies.delete(:remember_token)
  end
end
