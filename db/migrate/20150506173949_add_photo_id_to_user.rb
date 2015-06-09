class AddPhotoIdToUser < ActiveRecord::Migration
  def change
    add_column :users, :photo_id, :string, :default => nil
    add_index  :users, :photo_id
  end
end
