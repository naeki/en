class DigestSettingsController < ApplicationController
  # Tags to digest settings
  def add_tag
    current_user.add_digest_settings(params[:data][:tag_id])

    respond_to do |format|
      format.json { render json: current_user.get_digest_settings, location: root_path }
    end
  end

  def remove_tag
    tag = Tag.find(params[:data][:tag_id])
    current_user.remove_digest_settings(tag)

    respond_to do |format|
      format.json { render json: current_user.get_digest_settings, location: root_path }
    end
  end

  def get_tags
    respond_to do |format|
      format.json { render json: current_user.get_digest_settings, location: root_path }
    end
  end
end
