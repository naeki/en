class AddBase64PhotoToUser < ActiveRecord::Migration
  def change
    add_column :users, :photo_s, :text, :default => nil
    add_column :users, :photo,   :text, :default => nil
  end
end
