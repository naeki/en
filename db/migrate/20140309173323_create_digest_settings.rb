class CreateDigestSettings < ActiveRecord::Migration
  def change
    create_table :digest_settings do |t|
      t.integer :tag_id
      t.integer :user_id

      t.timestamps
    end

    add_index :digest_settings, :tag_id
    add_index :digest_settings, :user_id
    add_index :digest_settings, [:tag_id, :user_id], unique: true
  end
end
