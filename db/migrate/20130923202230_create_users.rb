class CreateUsers < ActiveRecord::Migration
  def change
    change_table :users do |t|
      t.string :email
      t.string :password

      t.timestamps
    end
  end
end
