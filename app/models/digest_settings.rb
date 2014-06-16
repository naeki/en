class DigestSettings < ActiveRecord::Base
  belongs_to :user, class_name: "User"
  belongs_to :tag , class_name: "Tag"

  validates_presence_of :user_id, :tag_id
end
