class StaticPagesController < ApplicationController
  before_filter :signed_in_user
  include ApplicationHelper

  def home
  end
end