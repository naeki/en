class TagsController < ApplicationController
  def show
    begin
      @tag = Tag.find(params[:tag_id])
    rescue => error
      @error = error.message
    else
      @posts = Post.build_posts_lite(@tag.posts)
    end


    # if (!@tag)

    respond_to do |format|
      format.json { render json: {tag: @tag, posts: @posts, error: @error}, location: root_path }
    end
  end

end
