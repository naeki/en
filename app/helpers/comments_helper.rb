module CommentsHelper
  def get_comment_user(user_id)
    @user = User.find(user_id)
  end

  def is_my_comment?(comment)
    current_user.id == comment.user_id
  end
end
