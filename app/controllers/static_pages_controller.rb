class StaticPagesController < ApplicationController
  before_filter :signed_in_user
  include ApplicationHelper

  def home
  end

  def digest
    sql = "SELECT * FROM posts ORDER BY random() LIMIT 2"
    results = ActiveRecord::Base.connection.execute(sql)
    #@posts = results.map{|m| Post(m)}

    respond_to do |format|
      if results
        format.json { render json: results, location: root_path }
      end
    end
    #render "shared/digest"
  end
end