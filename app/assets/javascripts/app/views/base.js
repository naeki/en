App.Views.BASE = Backbone.View.extend({
    initialize : function(options){
        this.options = options || {};      // Тут в опции вроде надо при создании вьюшки просто пихать, а модель будет просто модель, а сейчас она в опциях

        if (this.options.collection)
            this.collection = this.options.collection;

        if (this.options.parent){
            this.parent = this.options.parent;
            this.listenTo(this.parent, "remove", this.remove);
        }

        this.init();
        this.setup();
    },
    init : function(){},
    setup : function(){},
    remove : function(){
        Backbone.View.prototype.remove.call(this);
        this.trigger("remove");
    }
});