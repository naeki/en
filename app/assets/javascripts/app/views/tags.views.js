window.TagsView = App.Views.BASE.extend({
    events : {
        'click .tag-link'  : function(e){
            App.router.navigate("tag" + $(e.target).data("id"), {trigger: true, replace: false});
        }
    },
    init : function(){
        this.render();
    },
    render : function(){
        this.$el.empty();

        for (var i=0;this.collection.models[i];i++){
            var tag = this.collection.models[i];
            this.$el.append(
                $("<li></li>").append($("<span class='tag-link'></span>")
                        .html(tag.get("name"))
                        .data("id", tag.id)
                ));
        }
    }
});