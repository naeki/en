App.Views.Post_small = App.Views.BASE.extend({
    className : "post-small",
    _markup : "\
            <div class='post-small-header'>\
                <div class='post-stat'></div>\
                <img class='user-photo-small user-link'>\
                <span class='post-author user-link'></span>\
            </div>\
            <img class='post-small-photo'>\
            <div class='post-small-body'>\
                <span class='post-title'></span>\
                <div class='post-text'></div>\
                <span class='post-publish-date'></span>\
            </div>",
    events : {
        "click .post-title" : function(e){
            App.router.navigate(this.model.get("id")+"", {trigger: true, replace: false});
        }
    },
    init : function(){
        this.listenTo(this.model, "change", this.render);
        this.bindChain();

        this.render();
    },
    bindChain : function(){
        var dfd = this.options.prev ? this.options.prev.chain : $.Deferred().resolve();
        this.dfd = $.Deferred();

        this.chain = dfd.then(function(){
            return this.dfd;
        }.bind(this));

        this.chain.done(this.columnate.bind(this));
    },
    render : function(){
        this.$el.html(this._markup).data("post", this.model.get("id")).appendTo(this.options.renderTo);
        if (this.model.get("deleted")) this.$el.addClass("deleted");

        this.picture = this.$(".post-small-photo");

        this.$(".user-photo-small").attr({
            src : this.model.user.getSmallPhoto(),
            alt : this.model.user.get("name")
        }).data("user-id", this.model.user.id);

        if (this.model.getPhoto()){
            this.picture.show().attr({
                src : this.model.getPhoto(),
                alt : this.model.get("title")
            });
            this.picture.on('load', function(){
                this.dfd.resolve();
            }.bind(this));
        }
        else{
            this.picture.hide();
            this.dfd.resolve()
        }

        this.$(".post-stat").html(this.model.get("likes"));
        this.$(".post-title").html(this.model.get("title"));
        this.$(".post-text").html(this.model.get("short_text"));
        this.$(".post-publish-date").html(Post.getShortDate(this.model.get("published_at")));
        this.$(".post-comments").html(this.model.get("comments"));
        this.$(".post-author").html(this.model.user.get("name")).data("user-id", this.model.get("user_id"));
    },
    columnate : function(){
        var scroll = window.innerHeight != $("body")[0].scrollHeight,
            cols = parseInt((this.parent.el.offsetWidth + (scroll ? 12 : 0)) / 350),  // || const
            sum = 0,
            postNum = this.parent.collection.models.indexOf(this.model) + 1,
            rc;

       //if ((this.parent.collection.models.length/cols) < 1.75 && (this.parent.collection.models.length/cols) >= 1.25) cols = (cols - 1) || 1;

        rc = "c" + ((postNum % cols) || cols);

        this.parent.$("." + rc).each(function(i, item){
            sum += item.offsetHeight + 40;
            $(item).removeClass('last');
        });

        this.$el.addClass("last " + rc).css("top", sum);

        if (this == _.last(this.parent.collection)){
            setTimeout(function(){
                this.parent.colDfd && this.parent.colDfd.resolve();
            }.bind(this),200)
        }
    }
});


App.Views.PostList = App.Views.BASE.extend({
    className : "post-list",
    views : [],
    init : function(){
        this.render();
        this.$el.appendTo(this.options.renderTo);

        this.listenTo(this.collection, "reset", this.render);

        $(window).on("resize", this.columnateAll.bind(this));    //TODO: Только через requestAnimationFrame
    },
    render : function(){
        _.invoke(this.views, "remove");
        this.views = [];

        _.each(this.collection.models, function(m, i){
            this.views.push(new App.Views.Post_small({
                model    : m,
                parent   : this,
                renderTo : this.$el,
                prev     : this.views[i-1]
            }));
        }, this);
    },
    columnateAll : function(){
        if (!this.busy);

        this.busy = true;

        requestAnimationFrame(function(){
            this.$('.post-small').removeClass("c1 c2 c3 c4 last");
            for (var i=0;this.views[i];i++){                        // Тоже через реквестанимейшен, именно то, что выравнивание должно произойти только когда уже точно посты отстроились и + дождались загрузки картинок
                this.views[i].columnate();
            }
            this.busy = false;
        }.bind(this))
    }
});

//App.Views.Post_middle = Backbone.View.extend({});