class TagsController < ApplicationController
  def show
    @tag   = Tag.find(params[:tag_id])
    @posts = Post.build_posts_lite(@tag.posts)

    respond_to do |format|
      format.json { render json: {tag: @tag, posts: @posts}, location: root_path }
    end
  end

end
