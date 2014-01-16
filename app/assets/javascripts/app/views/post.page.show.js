App.Views.Page_Post = App.Views.BASE.extend({
    className : "page-post",
    _markup:"<div class='post-page-view'>\
                <div class='page-header'>\
                    <div class='history-back'></div>\
                    <div class='h1'></div>\
                    <div class='post-options'>\
                        <span class='post-comments'></span>\
                        <span class='post-author'></span>\
                    </div>\
                    <h4>Tags:</h3>\
                    <div class='tags'></div>\
                </div>\
                <div class='page-body'></div>\
                <div class='page-comments'></div>\
            </div>\
            <div class='omnibar'>options</div>",
    events : {
        "click .history-back" : function(){
            Backbone.history.history.back();
        }
    },
    init : function(){
        this.render();

        this.$header   = this.$(".page-header");
        this.$body     = this.$(".page-body");
        this.$omnibar  = this.$(".omnibar");
        this.$options  = this.$(".post-options");
        this.$tags     = this.$(".tags");
        this.$comments = this.$(".page-comments");

        this.view();

        this.listenTo(this.model, "change:title change:comments", this.renderHeader);
        this.listenTo(this.model, "change:text", this.renderBody);
        this.listenTo(this.model, "change:tags", this.renderTags);

        this.constructor.view = this;
    },
    render : function(){
        this.$el.html(this._markup).appendTo(this.options.renderTo);
    },
    view : function(){
        this.renderHeader();
        this.renderBody();
        this.renderTags();
        this.renderComments();
        this.renderOmnibar();
    },
    renderHeader : function(){
        this.$header.children(".h1").html(this.model.get("title"));
        this.$header.children(".h1").append("<span class='edit-post'>edit</span>");

        this.$options.children(".post-comments").html(this.model.get("comments"));
        this.$options.children(".post-author").html(this.model.get("user_email"));
    },
    renderTags : function(){
        this.$tags.empty();
        for (var i=0;this.model.get("tags")[i];i++){
            var tag = this.model.get("tags")[i];
            this.$tags.append(
                $("<span class='tag'></span>")
                    .html(tag.name)
                    .data("id", tag.id)
            );
        }
    },
    renderBody : function(){
        this.$body.html(this.model.get("text"));
    },
    renderComments : function(){
        new App.Views.Comments({
            el         : this.$comments[0],
            model      : this.model,
            collection : this.model.comments,
            parent     : this
        });
    },
    renderOmnibar : function(){
        this.$omnibar.html("Omnicontent");
    }
});





App.Views.Post_Form = App.Views.Page_Post.extend({
    _markup:"<div class='post-page-view'>\
                <div class='page-header'>\
                    <div class='history-back'></div>\
                    <div class='h1'></div>\
                </div>\
                <div class='page-body'>\
                    <div class='edit-controls'></div>\
                    <input type='text' class='edit-title'>\
                    <textarea class='edit-text'></textarea>\
                    <div class='edit-tags'>\
                        <h3>Edit tags</h3>\
                        <div class='tags'></div>\
                        <input type='text' class='input-tags'>\
                        <input type='button' class='add-tags' value='add'>\
                    </div>\
                </div>\
             </div>",
    events : {
        "click .post-save"   : "save",
        "click .post-delete" : function(){this.model.del();},
        "click .add-tags"    : function(){
            var value;
            if (!(value = this.$(".input-tags").val()).length) return;

            this.model.addTags(value);
            this.$(".input-tags").val("");
        },
        "click .history-back" : function(){
            Backbone.history.history.back();
        },
        "click .tag" : function(e){
            this.model.removeTag($(e.target).data("id"));
        }
    },
    init : function(){
        this.render();

        this.$header   = this.$(".page-header");
        this.$body     = this.$(".page-body");
        this.$controls = this.$(".edit-controls");
        this.$title    = this.$(".edit-title");
        this.$text     = this.$(".edit-text");
        this.$tags     = this.$(".tags");

        this.on("model", this.setModel, this);
        this.listenTo(this.model, "change", this.view);

        this.constructor.view = this;
        this.view();
    },
    view : function(){
        this.renderHeader();
        this.renderControls();
        this.renderBody();
        this.renderTags();
    },
    renderControls : function(){
        this.$controls.empty()
            .append("<input type='button' class='post-save' value='save'>")
            .append("<input type='button' class='post-delete' value='delete'>");
    },
    renderHeader : function(){
        var title = this.model.isNew() ? "New post" : "Edit " + this.model.get("title");
        this.$header.children(".h1").html(title);
    },
    renderBody : function(){
        this.$title.val(this.model.get("title") || "");
        this.$text.val(this.model.get("text") || "");
    },
    save : function(){
        var title = this.$title.val(),
            text = this.$text.val();

        return this.model.set({
            title : title,
            text  : text
        }).save();
    }
});

