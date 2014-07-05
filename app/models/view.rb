class View < ActiveRecord::Base
  # attr_accessible :post_id, :datetime

  validates :post_id, presence: true
  validates :user_id, presence: true
  validates :datetime, presence: true
end
