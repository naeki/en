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
    result = comment.as_json
    result["user_email"] = User.find(comment.user_id).email
    result
  end
end
