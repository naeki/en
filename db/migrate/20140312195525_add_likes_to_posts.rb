class AddLikesToPosts < ActiveRecord::Migration
  def change
    remove_column :posts, :likes
    add_column :posts, :likes_count, :integer, default: 0
  end
end
