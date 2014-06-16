class AddTankToUsers < ActiveRecord::Migration
  def change
    add_column :users, :tank, :string, default: ''
  end
end
