class Like < ActiveRecord::Base
  belongs_to :user, class_name: "User"
  belongs_to :post, class_name: "Post"
  # attr_accessible :post_id

  validates :post_id, presence: true
  validates :user_id, presence: true
end
