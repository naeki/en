class AddAncestorToPost < ActiveRecord::Migration
  def change
    add_column :posts, :ancestor, :integer, default: 0
  end
end
