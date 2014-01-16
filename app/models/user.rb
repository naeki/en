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
  has_many :posts
  has_many :relationships, foreign_key: "follower_id", dependent: :destroy
  has_many :followed_users, through: :relationships, source: :followed
  has_many :reverse_relationships, foreign_key: "followed_id",
                                   class_name:  "Relationship",
                                   dependent:   :destroy
  has_many :followers, through: :reverse_relationships

  has_secure_password

  before_save {self.email = email.downcase}
  before_create :create_remember_token

  validates_presence_of :email, :password
  validates_format_of :email, :with => /\A([^@\s]+)@((?:[-a-z0-9]+\.)+[a-z]{2,})\Z/i
  validates_uniqueness_of :email

  attr_accessible :password, :password_confirmation, :email

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


  def self._build(user)
    result = user.as_json
    result["followers_count"] = user.followers.count
    result["following_count"]  = user.followed_users.count
    result
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
