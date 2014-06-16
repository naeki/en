class Tag < ActiveRecord::Base
   has_and_belongs_to_many :posts
   has_many :digest_settings, foreign_key: "tag_id", class_name:  "DigestSettings", dependent: :destroy

   before_save {self.name = name.downcase.strip}
   validates_uniqueness_of :name

   def self.get_tag(name)
     @tag = self.find_by_name(name) || self.create(name: name)
   end
end
