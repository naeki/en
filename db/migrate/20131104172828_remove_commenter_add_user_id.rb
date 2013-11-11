class RemoveCommenterAddUserId < ActiveRecord::Migration
  def change
    add_column :comments, :user_id, :integer
    remove_column :comments, :commenter
  end
end
