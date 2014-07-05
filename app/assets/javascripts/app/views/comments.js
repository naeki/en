App.Views.Comments = App.Views.BASE.extend({
    className : "page-comments",
    _markup :"\
            <span class='h2'>Комментарии</span><span class='return link'>← К тексту</span>\
            <div class='comment-form'>\
                <textarea class='comment-input' placeholder='Input your comment...'></textarea>\
                <input class='send-comment' type='button' value="+ Lang.send +">\
            </div>\
            <div class='comments'></div>"
    ,
    events : {
        "click .send-comment"  : "send",
        "input .comment-input" : "resizeText"
    },
    init : function(){
        this.render();

        this.$input = this.$(".comment-input");

        this.listenTo(this.collection, "add", this.renderComment);
    },
    render : function(){
        this.$el.html(this._markup);

        this.collection.fetch();
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
            <img class='user-photo-small user-link'>\
            <div class='comment-block'>\
                <span class='comment-author user-link'></span>\
                <span class='comment-date'></span>\
                <em class='comment-delete'>X</em>\
                <div class='comment-message'></div>\
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