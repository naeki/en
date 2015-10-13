class ChangePostsDeletedDefault < ActiveRecord::Migration
  def change
    remove_column :posts, :deleted
    add_column :posts, :deleted, :integer, default: 0
  end
end
