App.Views.ToggleControl = App.Views.BASE.extend({
    className : "toggle-control",
    _markup : '' +
        '<div class="toggle-control__toggle">' +
            '<span class="toggle-control__on">ON</span>' +
            '<div class="toggle-control__border"></div>' +
            '<span class="toggle-control__off">OFF</span>' +
        '</div>',
    events : {
        "click" : "toggle"
    },
    init : function(){
        this.render();
        this.$el.appendTo(this.options.renderTo);

        this.refresh();
        this.listenTo(this.model, "change:access", this.refresh.bind(this));
    },
    render : function(){
        this.$el.html(this._markup);
    },
    toggle : function(){
        this.model.set("access", this.model.get("access") ? 0 : 1);
        this.model.save();
    },
    refresh : function(){
        this.model.get("access") ? this.$el.addClass("on") : this.$el.removeClass("on");
    }
});