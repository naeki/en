class RemoveAncestorFromPost < ActiveRecord::Migration
  def change
    remove_column :posts, :ancestor
  end
end
