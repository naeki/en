# encoding: UTF-8
# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# Note that this schema.rb definition is the authoritative source for your
# database schema. If you need to create the application database on another
# system, you should be using db:schema:load, not running all the migrations
# from scratch. The latter is a flawed and unsustainable approach (the more migrations
# you'll amass, the slower it'll run and the greater likelihood for issues).
#
# It's strongly recommended to check this file into your version control system.

ActiveRecord::Schema.define(:version => 20140530212702) do

  create_table "bookmarks", :force => true do |t|
    t.integer  "post_id"
    t.integer  "user_id"
    t.datetime "created_at", :null => false
    t.datetime "updated_at", :null => false
  end

  add_index "bookmarks", ["post_id", "user_id"], :name => "index_bookmarks_on_post_id_and_user_id", :unique => true
  add_index "bookmarks", ["post_id"], :name => "index_bookmarks_on_post_id"
  add_index "bookmarks", ["user_id"], :name => "index_bookmarks_on_user_id"

  create_table "comments", :force => true do |t|
    t.text     "body"
    t.integer  "post_id"
    t.datetime "created_at", :null => false
    t.datetime "updated_at", :null => false
    t.integer  "user_id"
  end

  add_index "comments", ["post_id"], :name => "index_comments_on_post_id"

  create_table "digest_settings", :force => true do |t|
    t.integer  "tag_id"
    t.integer  "user_id"
    t.datetime "created_at", :null => false
    t.datetime "updated_at", :null => false
  end

  add_index "digest_settings", ["tag_id", "user_id"], :name => "index_digest_settings_on_tag_id_and_user_id", :unique => true
  add_index "digest_settings", ["tag_id"], :name => "index_digest_settings_on_tag_id"
  add_index "digest_settings", ["user_id"], :name => "index_digest_settings_on_user_id"

  create_table "likes", :force => true do |t|
    t.integer  "post_id"
    t.integer  "user_id"
    t.datetime "created_at", :null => false
    t.datetime "updated_at", :null => false
  end

  add_index "likes", ["post_id", "user_id"], :name => "index_likes_on_post_id_and_user_id", :unique => true
  add_index "likes", ["post_id"], :name => "index_likes_on_post_id"
  add_index "likes", ["user_id"], :name => "index_likes_on_user_id"

  create_table "photos", :force => true do |t|
    t.datetime "created_at", :null => false
    t.datetime "updated_at", :null => false
  end

  create_table "posts", :force => true do |t|
    t.string   "title"
    t.text     "text"
    t.datetime "created_at",                      :null => false
    t.datetime "updated_at",                      :null => false
    t.integer  "user_id"
    t.boolean  "deleted",      :default => false
    t.string   "photo_id"
    t.integer  "likes_count",  :default => 0
    t.integer  "access",       :default => 0
    t.integer  "published_at", :default => 0
  end

  add_index "posts", ["user_id", "created_at"], :name => "index_posts_on_user_id_and_created_at"

  create_table "posts_tags", :force => true do |t|
    t.integer "post_id"
    t.integer "tag_id"
  end

  create_table "relationships", :force => true do |t|
    t.integer  "follower_id"
    t.integer  "followed_id"
    t.datetime "created_at",  :null => false
    t.datetime "updated_at",  :null => false
  end

  add_index "relationships", ["followed_id"], :name => "index_relationships_on_followed_id"
  add_index "relationships", ["follower_id", "followed_id"], :name => "index_relationships_on_follower_id_and_followed_id", :unique => true
  add_index "relationships", ["follower_id"], :name => "index_relationships_on_follower_id"

  create_table "tags", :force => true do |t|
    t.string   "name"
    t.datetime "created_at", :null => false
    t.datetime "updated_at", :null => false
  end

  add_index "tags", ["name"], :name => "index_tags_on_name", :unique => true

  create_table "users", :force => true do |t|
    t.string   "email"
    t.string   "password_digest"
    t.datetime "created_at",                         :null => false
    t.datetime "updated_at",                         :null => false
    t.string   "remember_token"
    t.boolean  "admin",           :default => false
    t.string   "photo_id"
    t.string   "name",            :default => ""
    t.string   "digest",          :default => ""
    t.string   "tank",            :default => ""
  end

  add_index "users", ["email"], :name => "index_users_on_email", :unique => true
  add_index "users", ["photo_id"], :name => "index_users_on_photo_id"
  add_index "users", ["remember_token"], :name => "index_users_on_remember_token"

  create_table "views", :force => true do |t|
    t.integer  "post_id"
    t.integer  "user_id"
    t.integer  "datetime"
    t.datetime "created_at", :null => false
    t.datetime "updated_at", :null => false
  end

  add_index "views", ["datetime"], :name => "index_views_on_datetime"
  add_index "views", ["post_id", "user_id"], :name => "index_views_on_post_id_and_user_id", :unique => true
  add_index "views", ["post_id"], :name => "index_views_on_post_id"
  add_index "views", ["user_id"], :name => "index_views_on_user_id"

end
