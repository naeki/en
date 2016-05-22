App.Views.Comments = App.Views.BASE.extend({
    className : "page-comments",
    _markup :"\
            <div class='author-box'>\
                <img class='user-photo-middle user-link'>\
                <span class='post-author user-name user-link'></span>\
            </div>\
            <div class='h1'></div>\
            <span class='return link'></span>\
            <span class='h2'>Комментарии</span>\
            <div class='comment-form'>\
                <img class='user-photo-middle'>\
                <textarea class='comment-input' placeholder='Input your comment...'></textarea>\
                <div class='send-comment save-button'></div>\
            </div>\
            <div class='comments' placeholder='"+ Lang.no_comments +"'></div>"
    ,
    events : {
        "click .send-comment"  : "send",
        "input .comment-input" : "resizeText",
        "click .return" : function(){
            App.router.navigate(this.model.get("id")+"", {trigger: true, replace: false});
        }
    },
    init : function(){
        this.render();
        this.$el.appendTo(this.options.renderTo);

        this.$input = this.$(".comment-input");

        this.listenTo(this.collection, "add", this.renderComment);
    },
    render : function(){
        this.$el.html(this._markup);

        this.renderAuthor();

        this.$(".comment-form .user-photo-middle").attr({
            src : App.currentUser.getSmallPhoto(),
            alt : App.currentUser.get("name")
        }).data("user-id", App.currentUser.id);

        this.$(".h1").html(this.model.get("title"));

        this.collection.each(this.renderComment.bind(this));

        this.collection.fetch().done(function(){
//            this.$(".h2").append(" (" + this.collection.length + ")");
        }.bind(this));
    },
    renderAuthor : function(){
        this.$(".author-box .user-photo-middle").attr({
            src : this.model.user.getSmallPhoto(),
            alt : this.model.user.get("name")
        }).data("user-id", this.model.user.id);

        this.$(".post-author").html(this.model.user.get("name")).data("user-id", this.model.user.id);
    },
    renderComment : function(model){
        return new App.Views.Comment({
            model    : model,
            renderTo : this.$(".comments"),
            parent   : this
        });
    },
    send : function(){
        if (!this.$input.val().length) return;

        this.model.addComment({
            body : this.$input.val()
        });

        this.$input.val("");
        this.resizeText();
    },
    resizeText : function(){
        this.$input.height(0);
        this.$input.height(this.$input[0].scrollHeight - 20);
    }
});




App.Views.Comment = App.Views.BASE.extend({
    className : "comment",
    _markup : "\
            <div class='comment-message'></div>\
            <div class='comment-block'>\
                <img class='user-photo-small user-link'>\
                <span class='comment-author user-link'></span>\
                <span class='comment-date'></span>\
                <em class='comment-delete'>X</em>\
            </div>",
    events : {
        "click .comment-delete" : "del"
    },
    init : function(){
        this.render();
        this.$el.appendTo(this.options.renderTo);

        this.listenTo(this.model, "change", this.render);
        this.listenTo(this.model, "destroy", this.remove);
    },
    render : function(){
        this.$el.html(this._markup);

        this.$(".user-photo-small").attr({
            src : this.model.user.getSmallPhoto(),
            alt : this.model.user.get("name")
        }).data("user-id", this.model.user.id);

        this.$(".comment-author").html(this.model.get("user_name")).data("user-id", this.model.get("user_id"));
        this.$(".comment-date").html(Post.getDateString(new Date(this.model.get("created_at")).getTime()/1000));
        this.$(".comment-message").html(this.model.get("body"));
    },
    del : function(){
        this.model.del();
    }
});