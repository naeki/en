window.TagsView = App.Views.BASE.extend({
    _markup : "\
        <ul class='tags-list'></ul>\
    ",
    events : {
        'click .tag-link'  : "navigate"
    },
    init : function(){
        this.render();

        this.$tags = this.$(".tags-list");
        this.renderList();
    },
    render : function(){
        this.$el.html(this._markup);
    },
    renderList : function(){
        this.$tags.empty();

        for (var i=0;this.collection.models[i];i++){
            var tag = this.collection.models[i];
            this.$tags.append(
                $("<li></li>").append($("<span class='tag-link tag'></span>")
                        .html(tag.get("name"))
                        .data("id", tag.id)
                ));
        }
    },
    navigate : function(e){
        App.router.navigate("tag" + $(e.target).data("id"), {trigger: true, replace: false});
    }
});






// Вьюшка выбора тегов
App.Views.TagsControl = TagsView.extend({
    _markup : "\
        <ul class='tags-list'></ul>\
        <div class='edit-tags-button'></div>\
    ",
    _editMarkup : "\
        <div class='edit-tags-controls'>\
            <input type='text' class='input-tags' placeholder='"+ Lang.tags +"' size='15'>\
            <input type='button' class='add-tags' value='"+ Lang.add +"'>\
            <ul class='get-tags'></ul>\
        </div>",
    events : {
        "input .input-tags" : "getTags",
        "click .tag-link" : function(e){
            this.editable ? this.removeTag(e) : this.navigate(e);
        },
        "click .add-tags" : function(){
            var value;
            if (!(value = this.$(".input-tags").val()).length) return;

            this.model.addTags(value);
            this.$(".input-tags").focus().val("").trigger("input")[0].size = 15;

        },
        "click .tag-found" : function(e){
            this.model.addTags($(e.target).data("tag").name);
            this.$(".input-tags").val("").trigger("input");
        },
        "click .edit-tags-button" : "renderEditable"
    },
    init : function(){
        this.render();
        this.renderStatic();

        this.$tags      = this.$(".tags-list");

        this.renderList();
        if (!this.collection.length) this.renderEditable();
//        this.renderControl();

        // Сделать теги поста как коллекцию тегов у поста, запрашивать их в одном запросе, но не пихать в модель поста как сейчас

        this.listenTo(this.collection, "add remove reset", function(){
            this.renderList();
//            this.renderControl();
        }.bind(this));
    },
    renderStatic : function(){
        this.$(".edit-tags-controls").remove();
        this.$el.removeClass("edit-tags");
        this.editable = false;
        this.$(".edit-tags-button").css("display", "inline-block");
    },
    renderEditable : function(){
        this.$el.addClass("edit-tags").append(this._editMarkup);
        this.$input = this.$(".input-tags");
        this.$suggest = this.$(".get-tags");
        this.editable = true;
        this.$(".edit-tags-button").css("display", "none");

        this.$input.focus();
    },
//    renderControl : function(){
//        this.$control = this.$(".edit-tags-button")
//        if (this.collection.length)
//            this.$control.html(App.SVG.tags);
//        else
//            this.$control.html(App.SVG.tags + "<label>Добавить теги</label>");
//    },
    getTags : function(){
        var val = _.escape(this.$input.val());
        if (!val) return this.$suggest.empty();


        // Увеличение инпута по мере набора
        if (val.length + 4 > this.$input[0].size){this.$input[0].size = val.length + 4}


        return App.loader.sync("posts/tags", {data : {search: val.toLowerCase()}, type: "GET"}).done(function(result){
            this.$suggest.empty();
            _.each(result, function(item){
                $("<li class='tag tag-found'>").html(item.name).data("tag", item).appendTo(this.$suggest);
            }, this);
        }.bind(this));
    },
    removeTag : function(e){
        this.model.removeTag($(e.target).data("id"))
    }
});

