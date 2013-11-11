class AddingIndexToPosts < ActiveRecord::Migration
  add_index :posts, [:user_id, :created_at]
end
