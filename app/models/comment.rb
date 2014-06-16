# == Schema Information
#
# Table name: comments
#
#  id         :integer          not null, primary key
#  commenter  :string(255)
#  body       :text
#  post_id    :integer
#  created_at :datetime         not null
#  updated_at :datetime         not null
#

class Comment < ActiveRecord::Base
  belongs_to :post

  validates_presence_of :user_id, :body

  def self._build(comment)
    user   = User.find(comment.user_id)
    result = comment.as_json
    result["user_name"]     = user.name.blank? ? user.email : user.name
    result["user_photo_id"] = user.photo_id
    result
  end

  def self._build_comments(comments)
    comments.map{|comment| Comment._build(comment)}
  end
end
