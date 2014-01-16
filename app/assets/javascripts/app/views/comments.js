App.Views.Comments = App.Views.BASE.extend({
    _markup :"<div class='comments'></div>\
            <div class='comment-form'>\
                <textarea class='comment-input'></textarea>\
                <input class='send-comment' type='button' value='send'>\
            </div>"
    ,
    events : {
        "click .send-comment" : "send"
    },
    init : function(){
        this.render();

        this.$input = this.$(".comment-input");

        this.listenTo(this.collection, "add", this.renderComment);
    },
    render : function(){
        this.$el.html(this._markup);
        this.collection.each(this.renderComment, this);
    },
    renderComment : function(model){
        return new App.Views.Comment({
            model    : model,
            renderTo : this.$(".comments"),
            parent   : this
        });
    },
    send : function(){
        this.model.addComment({
            body : this.$input.val()
        });

        this.$input.val("");
    }
});




App.Views.Comment = App.Views.BASE.extend({
    className : "comment",
    _markup : "\
            <em class='comment-delete'>X</em>\
            <span class='comment-author'></span>\
            <span class='comment-date'></span>\
            <div class='comment-message'></div>",
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
        this.$(".comment-author").html(this.model.get("user_email"));
        this.$(".comment-date").html((new Date(this.model.get("created_at"))).toDateString());
        this.$(".comment-message").html(this.model.get("body"));
    },
    del : function(){
        this.model.del();
    }
});