class ChangeDefaultPhotoIdAtPosts < ActiveRecord::Migration
  def change
    change_column :posts, :photo_id, :string, :default => nil
  end
end
