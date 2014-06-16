class AddDigestToUsers < ActiveRecord::Migration
  def change
    add_column :users, :digest, :string, default: ''
  end
end
