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
  #validates_presence_of :title, :text, :user_id

  def self.from_users_followed_by(user)
    followed_user_ids = "SELECT followed_id FROM relationships WHERE follower_id = :user_id"
    where("user_id IN (#{followed_user_ids}) OR user_id = :user_id",
          user_id: user)
  end

  def add_tag(tag)
    self.tags<<(tag) unless self.tags.exists?(tag)
  end

  def remove_tag(tag)
    self.tags.delete(tag)
  end

  def self._build(post)
    result = post.as_json
    result["user_email"] = post.user.email
    result["comments"] = post.comments.count
    result["tags"] = post.tags
    result
  end

  def self.build_posts(posts)
    @posts = posts.map{|post| Post._build(post)}
  end
end
