class CreateViews < ActiveRecord::Migration
  def change
    create_table :views do |t|
      t.integer :post_id
      t.integer :user_id
      t.integer :datetime

      t.timestamps
    end

    add_index :views, :post_id
    add_index :views, :user_id
    add_index :views, :datetime
    add_index :views, [:post_id, :user_id], unique: true
  end
end
