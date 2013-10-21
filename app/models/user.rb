class User < ActiveRecord::Base
  has_many :posts

  before_save {self.email = email.downcase}
  has_secure_password

  validates_presence_of :email, :password
  validates_format_of :email, :with => /\A([^@\s]+)@((?:[-a-z0-9]+\.)+[a-z]{2,})\Z/i
  validates_uniqueness_of :email

  attr_accessible :password, :password_confirmation, :email
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
