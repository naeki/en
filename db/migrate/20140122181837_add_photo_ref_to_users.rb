class AddPhotoRefToUsers < ActiveRecord::Migration
  def change
    add_column :users, :photo_id, :string
    add_index  :users, :photo_id
  end
end
