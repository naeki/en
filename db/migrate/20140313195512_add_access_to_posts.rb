class AddAccessToPosts < ActiveRecord::Migration
  def change
    add_column :posts, :access, :integer, default: 0
  end
end
