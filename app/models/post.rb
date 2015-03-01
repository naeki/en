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
require 'elasticsearch/model'

class Post < ActiveRecord::Base
  Elasticsearch::Model.client = Elasticsearch::Client.new({url: ENV['BONSAI_URL'], logs: true})
  include Elasticsearch::Model
  include Elasticsearch::Model::Callbacks

  has_many :comments  , dependent: :destroy
  has_many :likes     , foreign_key: 'post_id', dependent: :destroy
  has_many :bookmarks , foreign_key: 'post_id', dependent: :destroy
  has_many :views     , foreign_key: 'post_id', dependent: :destroy

  has_and_belongs_to_many :tags, :uniq => true

  belongs_to :user

  default_scope -> {order("published_at DESC")}
  validates_presence_of :title, :text, :user_id


  # searchable do
  #   text    :title, :boost => 5
  #   text    :text
  #   boolean :deleted
  #   integer :access
  # end



  def self.from_users_followed_by(user)
    followed_user_ids = "SELECT followed_id FROM relationships WHERE follower_id = :user_id"
    where("(user_id IN (#{followed_user_ids})) AND deleted=false AND access=1",
          user_id: user)
  end

  def add_tag(tag)
    self.tags<<(tag) unless self.tags.exists?(tag)
  end

  def remove_tag(tag)
    self.tags.delete(tag)
  end

  def self.all_public
    sql = "SELECT * FROM posts WHERE (deleted=false AND access=1) ORDER BY published_at DESC"
    @posts = Post.find_by_sql(sql)
  end

  def self.all_public_pop
    sql = "SELECT * FROM posts WHERE (deleted=false AND access=1) ORDER BY likes_count DESC"
    @posts = Post.find_by_sql(sql)
  end

  def self._build(post)
    result = post.as_json

    if (post.deleted || post.access == 0)
      result.delete("text")
    else
      result["tags"] = post.tags
    end
    result["user_name"]     = post.user.name.blank? ? post.user.email : post.user.name
    # result["user_photo_id"] = post.user.photo_id
    result["comments"]      = post.comments.count
    result["likes"]         = post.likes.count

    result
  end

  def self._build_my(post)
    result = post.as_json

    result["tags"] = post.tags
    result["user_name"]     = post.user.name.blank? ? post.user.email : post.user.name
    # result["user_photo_id"] = post.user.photo_id
    result["comments"]      = post.comments.count
    result["likes"]         = post.likes.count

    result
  end


  def self._build_lite(post)
    result = post.as_json

    result.delete("text")

    if (!post.deleted || post.access == 1)
      result["short_text"] = post.text.split(" ").slice(0, 50).join(" ") + "..." #Считать слова а не буквы  slice(0, 300)
      result["tags"] = post.tags
    else
      result["short_text"] = "Post was deleted"
    end

    result["title"]         = post.title.size > 45 ? post.title.slice(0, 45).concat('...') : post.title
    result["user_name"]     = post.user.name.blank? ? post.user.email : post.user.name
    # result["user_photo_id"] = post.user.photo_id
    result["comments"]      = post.comments.count
    result["likes"]         = post.likes.count

    Time.now.to_i.to_s

    result
  end


  def self.build_posts(posts)
    @posts = posts.map{|post| Post._build(post)}
  end

  def self.build_posts_lite(posts)
    @posts = posts.map{|post| Post._build_lite(post)}
  end


  def set_photo(file)
    if (self.photo_id)
      Photo.savePostPhoto(file, self.photo_id)
    else
      name = Digest::MD5.hexdigest(Time.now.to_i.to_s + file.original_filename)
      # self.update_attribute(:photo_id, name)
      if (Photo.savePostPhoto(file, name.to_s))
        self.update_attribute(:photo_id, name)
      end
    end
  end

  def update_likes
    self.update_attributes({likes_count: self.likes.count})
  end

  def delete_photo
    if (self[:photo_id])
      self.update_attribute(:photo_id, nil)   #Delete the file
    end
  end

  def publish
    if (self.published_at == 0)
      self.update_attributes published_at: Time.now.to_i.to_s
    end
  end

  def archive
    self.update_attributes deleted: true
  end

end


Post.import