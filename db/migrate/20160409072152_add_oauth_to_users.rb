class AddOauthToUsers < ActiveRecord::Migration
  def change
    add_column :users, :provider, :string, :default => nil
    add_column :users, :uid, :string, :default => nil
    add_index  :users, :provider
    add_index  :users, :uid
    add_index  :users, [:provider, :uid], :unique => true
  end
end
