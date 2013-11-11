# == Schema Information
#
# Table name: posts
#
#  id         :integer          not null, primary key
#  title      :string(255)
#  text       :text
#  created_at :datetime         not null
#  updated_at :datetime         not null
#

class Post < ActiveRecord::Base
  has_many :comments, dependent: :destroy
  has_and_belongs_to_many :tags, :uniq => true

  belongs_to :user

  default_scope -> {order("created_at DESC")}
  validates_presence_of :title, :text, :user_id
end
