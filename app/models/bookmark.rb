class Bookmark < ActiveRecord::Base
  # attr_accessible :post_id

  validates :post_id, presence: true
  validates :user_id, presence: true
end
