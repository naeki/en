class Tag < ActiveRecord::Base
   Elasticsearch::Model.client = Elasticsearch::Client.new({url: ENV['BONSAI_URL'], logs: true})
   include Elasticsearch::Model
   include Elasticsearch::Model::Callbacks

   has_and_belongs_to_many :posts
   has_many :digest_settings, foreign_key: "tag_id", class_name:  "DigestSettings", dependent: :destroy

   before_save {self.name = name.downcase.strip}
   validates_uniqueness_of :name

   # searchable do
   #   text :name
   # end

   def self.get_tag(name)
     @tag = self.find_by_name(name) || self.create(name: name)
   end
end
