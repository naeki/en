class ChangeAttr < ActiveRecord::Migration
  def change
    change_table :users do |t|
      t.remove :hashed_password, :passsword
      t.string :password_digest
    end
  end
end
