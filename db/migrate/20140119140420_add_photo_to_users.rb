class AddPhotoToUsers < ActiveRecord::Migration
  def change
    add_column :users, :photo, :integer, default: 0
  end
end
