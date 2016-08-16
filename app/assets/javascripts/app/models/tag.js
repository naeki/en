window.Tag = App.Models.Tag = Backbone.Model.extend({
    find : function(){
        return App.loader.sync("/tags", {data : {tag_id : this.id}}).then(function(result){
            this.set(result);
            return $.Deferred().resolve();
        }.bind(this));


    }
});




window.Tags = App.Collections.Tags = Backbone.Collection.extend({
    model : Tag
});