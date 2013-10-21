class ChangeUsersHashedPass < ActiveRecord::Migration
  def change
    change_table :users do |t|
      t.string :hashed_password
    end
  end
end
