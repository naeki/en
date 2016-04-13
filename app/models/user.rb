# == Schema Information
#
# Table name: users
#
#  id              :integer          not null, primary key
#  email           :string(255)
#  created_at      :datetime         not null
#  updated_at      :datetime         not null
#  password        :string(255)
#  password_digest :string(255)
#  remember_token  :string(255)
#



class User < ActiveRecord::Base
  # has_one  :photo, dependent: :destroy
  has_many :posts
  has_many :relationships, foreign_key: "follower_id", dependent: :destroy
  has_many :followed_users, through: :relationships, source: :followed
  has_many :reverse_relationships, foreign_key: "followed_id",
                                   class_name:  "Relationship",
                                   dependent:   :destroy

  has_many :followers, through: :reverse_relationships

  has_many :digest_settings, foreign_key: "user_id", class_name:  "DigestSettings", dependent: :destroy
  has_many :digest_tags, through: :digest_settings, source: :tag

  has_many :likes    , foreign_key: "user_id", dependent: :destroy
  has_many :bookmarks, foreign_key: "user_id", dependent: :destroy
  has_many :views    , foreign_key: "user_id", dependent: :destroy

  has_many :recommendations, -> { where deleted: false, access: 1}, through: :likes, source: :post

  validates :photo, length: { maximum: 100000 }
  validates :photo_s, length: { maximum: 100500 }
  # Paperclip attachment
  # has_attached_file :avatar, :styles => {:thumbnail => "100x100#"}
  # validates_attachment :avatar, content_type: { content_type: ["image/jpg", "image/jpeg", "image/png", "image/gif"] }




  # has_secure_password

  # before_save {self.email = email.downcase}
  # before_create :create_remember_token

  # validates_presence_of   :email, :password
  # validates_format_of     :email, :with => /\A([^@\s]+)@((?:[-a-z0-9]+\.)+[a-z]{2,})\Z/i
  # validates_uniqueness_of :email

  # attr_accessible :password, :password_confirmation, :email, :name

  def self.from_omniauth(auth_hash)
    @user = find_by(uid: auth_hash['uid'], provider: auth_hash['provider'])

    if (!@user)
      @user = create(uid: auth_hash['uid'], provider: auth_hash['provider'])
      @user.name = auth_hash['info']['name']
      # user.location = auth_hash['info']['location']
      @user.photo_id = auth_hash['info']['image']
      # user.url = auth_hash['info']['urls'][user.provider.capitalize]
      @user.save!
    end

    @user
  end

  def feed
    @posts = Post.from_users_followed_by(self)
  end

  def following?(other_user)
    relationships.find_by_followed_id(other_user.id)
  end

  def follow!(other_user)
    relationships.create!(followed_id: other_user.id)
  end

  def unfollow!(other_user)
    relationships.find_by_followed_id(other_user.id).destroy
  end

  #Like
  def like!(post)
    likes.create!(post_id: post.id)
  end
  def unlike!(like)
    like.destroy
  end

  #View
  def view!(post)
    @view_ex = self.views.find_by_post_id(post.id)

    if (@view_ex)
      @view = View.find(self.views.find_by_post_id(post.id))
      @view.update_attributes(datetime: Time.now.to_i.to_s)
    else
      views.create!(post_id: post.id, datetime: Time.now.to_i.to_s)
    end
  end

  #Bookmarks
  def add_bookmark!(post)
    bookmarks.create!(post_id: post.id)
  end
  def remove_bookmark!(bookmark)
    bookmark.destroy
  end


  # Own posts
  def own_posts(options)
    options = {"deleted" => 0}.merge(options)
    query = ''
    options.each {|key, value| query += " AND #{key}=#{value}" }

    sql = 'SELECT * FROM posts WHERE user_id=' + self.id.to_s + query
    @posts = Post.find_by_sql(sql)
  end

  def own_public_posts(options)
    query = 'deleted=false'
    options.each {|key, value| query += " AND #{key}=#{value}" }

    sql = 'SELECT * FROM posts WHERE user_id=' + self.id.to_s + query
    @posts = Post.find_by_sql(sql)
  end

  def self._build_users(users)
    @users = users.map{|user| User._build(user)}
  end

  def self._build(user)
    result = user.as_json
    result["followers_count"] = user.followers.count
    result["following_count"] = user.followed_users.count
    result["posts_count"]     = user.posts.select{|m| !m.deleted && m.access == 1}.count
    result["likes_count"]     = user.likes.select{|m| !m.post.deleted && m.post.access == 1}.count
    result["name"]            = user.name.empty? ? user.email : user.name        #TEMPORARY!!!!
    # result["avatar_url"]      = user.avatar.url(":thumbnail")
    result.delete("admin")
    result.delete("digest")
    result.delete("email")
    result.delete("password_digest")
    result.delete("remember_token")
    result.delete("tank")
    result
  end


  def set_photo(file)
    # self.avatar = file
    require "base64"


    image = MiniMagick::Image.read(file.read)

    # image.write original_path

    image.resize "150x150^"
    image.crop "150x150+0+0"
    image.format "jpg"

    enc   = Base64.encode64(image.to_blob())

    image.resize "60x60"
    image.format "gif"
    # image.write small_path

    enc_s = Base64.encode64(image.to_blob())



    self.update_attribute(:photo, enc)
    self.update_attribute(:photo_s, enc_s)

    # self.photo_s = enc_s
    # self.photo = enc





    # if (self[:photo_id])
    #   Photo.saveUserPhoto(file, self.photo_id)
    # else
    #   # name = Digest::MD5.hexdigest(Time.now.to_i.to_s + file.original_filename)
    #   # if (Photo.saveUserPhoto(file, self))
    #   #   self.update_attribute(:photo_id, name)
    #   # end
    #   Photo.saveUserPhoto(file, self)
    # end
  end

  def delete_photo
    # self.avatar = nil

    if (self[:photo_id])
      self.update_attribute(:photo_id, nil)   #Delete the file
    end
  end


  def add_digest_settings(tag_id)
    digest_settings.create!(tag_id: tag_id)
  end

  def remove_digest_settings(tag_id)
    digest_settings.find_by_tag_id(tag_id).destroy
  end

  def get_digest_settings
    digest_tags
  end



  def User.run_digest_generation
    User.all.each do |user|
      user.generate_digest
    end
  end

  def generate_digest
    sql = "SELECT * FROM posts ORDER BY random() LIMIT 2"  # Может лучше получать все из базы а уж потом вынимать рандом и 10 штук
    self.update_attribute(:digest, Post.find_by_sql(sql).map{|m| m.id}.join(','))
  end

  def User.new_remember_token
    SecureRandom.urlsafe_base64
  end

  def User.encrypt(token)
    Digest::SHA1.hexdigest(token.to_s)
  end

  private
    def create_remember_token
      self.remember_token = User.encrypt(User.new_remember_token)
    end



  #attr_accessor :new_password, :new_password_confirmation

  #validates_confirmation_of :new_password, :if=>:password_changed?
  #before_save :hash_new_password, :if=>:password_changed?

  #def password_changed?
  #  !@new_password.blank?
  #end

  #def password
  #  @password ||= Password.new(password)
  #end

  #def password=(new_password)
  #  @password = Password.create(new_password)
  #  self.password = @password
  #end


  #def self.authenicate(email, password)
  #  if user = find_by_email(email)
  #    if BCrypt::Password.new(user.hashed_password).is_password? password
  #      return user
  #    end
  #  end
  #  return nil
  #end
end
