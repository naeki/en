App.Views.Post_small = App.Views.BASE.extend({
    className : "post-small",
    _markup : "\
            <div class='post-small-photo'/>\
            <div class='post-small-body'>\
                <span class='post-title'></span>\
                <div class='post-small-stats'>\
                    <span class='post-stat-lock'></span>\
                    <div class='post-stat post-stat-likes'><svg xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' version='1.1' class='likes' x='0px' y='0px' viewBox='0 0 25 22' xml:space='preserve' width='25px' height='22px'><path d='M12.604,3.291C9.395-2.26-0.047-0.375,0,7.609c0.031,5.663,3.878,8.444,7.041,10.768  c3.091,2.271,3.716,2.451,5.584,3.624c1.686-1.147,3.191-2.022,5.957-4.206c3.101-2.446,6.384-4.811,6.418-9.886  C25.059-0.87,15.604-2.236,12.604,3.291z'/></svg></div>\
                </div>\
                <ul class='post-tags'></ul>\
                <div class='post-text'></div>\
                <span class='post-publish-date'></span>\
                <img class='user-photo-small user-link'>\
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
        this.renderTags();
    },
    bindChain : function(){
        var dfd = this.options.prev ? this.options.prev.chain : $.Deferred().resolve();
        this.dfd = $.Deferred();

        this.chain = dfd.then(function(){

            setTimeout(function(){

                this.$el.appendTo(this.options.renderTo);

                this.dfd.resolve();

            }.bind(this), 50);

            return this.dfd;

        }.bind(this));

//        this.parent.renderDfd = this.parent.renderDfd ?  this.dfd.then(this.parent.renderDfd) : this.dfd;



        this.chain.done(this.columnate.bind(this));
    },
    render : function(){
        this.$el.html(this._markup).data("post", this.model.get("id"));
        this.$el[this.model.get("deleted") ? "addClass" : "removeClass"]("deleted");
        this.$el[!this.model.get("access") ? "addClass" : "removeClass"]("lock");

        this.$picture = $("<img style='width: 1px; height: 1px; opacity: 0;'/>").appendTo("body");

        this.$(".user-photo-small").attr({
            src : this.model.user.getSmallPhoto(),
            alt : this.model.user.get("name")
        }).data("user-id", this.model.user.id);

        if (this.model.getPhoto()){
            this.$picture.attr("src", this.model.getNormalPhoto());
            this.$picture.on('load error', function(){
//                this.dfd.resolve();
                this.$picture.remove();
                this.$('.post-small-photo').css('background-image', "url(" + this.model.getNormalPhoto() + ")").addClass("show");
            }.bind(this));
        }
        else{
            this.$picture.hide();
            this.$('.post-small-photo').addClass("show");
//            this.dfd.resolve();
        }



        this.renderLikes();
        this.$(".post-title").prepend(this.model.get("title"));
        this.$(".post-text").html(this.model.get("short_text"));
        this.$(".post-publish-date").html(Post.getShortDate(this.model.get("published_at") || this.model.get("created_at")));
        this.$(".post-comments").html(this.model.get("comments"));
        this.$(".post-author").html(this.model.user.get("name")).data("user-id", this.model.get("user_id"));
    },
    renderLikes : function(){
        this.$likes = this.$(".post-stat-likes").css("display", this.model.get("likes") ? "inline-block" : "none");
        var likes = this.model.get("likes");
        this.$likes.attr("title", likes + " likes");
        if (likes) {
            if (likes > 0 && likes < 2)  this.$likes.attr("likes", 1);
            if (likes > 1 && likes < 7)  this.$likes.attr("likes", 2);
            if (likes > 6 && likes < 9)  this.$likes.attr("likes", 3);
            if (likes > 9 && likes < 20) this.$likes.attr("likes", 4);
            if (likes > 19)              this.$likes.attr("likes", 5);
        }
    },
    renderTags : function(){
        if (this.model.get("deleted")) return this.$('.post-tags').remove();

        if (this.tags) this.tags.render();
        else
            this.tags = new TagsView({
                collection : this.model.tags,
                el         : this.$('.post-tags'),
                parent     : this
            });
    },

    tileWidth: 450,
    tileMarginRight: 0,
    columnate : function(){

        var //scroll = window.innerHeight != $("body")[0].scrollHeight,
            sum = 0,
            postNum = this.parent.collection.models.indexOf(this.model) + 1,
            rc,
            tilesWidth       = parseInt(this.$el.css("width")) || this.tileWidth,
            tileMarginBottom = parseInt(this.$el.css("margin-bottom")) || "30",
            tileMarginRight  = parseInt(this.$el.css("margin-right")) || this.tileMarginRight,

            cols = parseInt((this.parent.el.offsetWidth + 12) / (tilesWidth + tileMarginRight)),  // || const;

       //if ((this.parent.collection.models.length/cols) < 1.75 && (this.parent.collection.models.length/cols) >= 1.25) cols = (cols - 1) || 1;

        rc = "c" + ((postNum % cols) || cols);

        this.parent.$("." + rc).each(function(i, item){
            sum += item.offsetHeight + tileMarginBottom;
            $(item).removeClass('last');
        }.bind(this));

        this.$el.addClass("last " + rc).css("top", sum);

        if (this.model == this.parent.collection.last()){
            setTimeout(function(){

                this.parent.renderDfd && this.parent.renderDfd.resolve();

                App.windowHeight = $('body')[0].scrollHeight;

            }.bind(this),200)
        }
    }
});


App.Views.PostList = App.Views.BASE.extend({
    className : "post-list",
    attributes : {
        placeholder: Lang.no_posts
    },
    views : [],
    init : function(){
//        this.render();
        this.$el.appendTo(this.options.renderTo);
        if (this.options.page) this.$el.attr("placeholder", Lang["no_" + this.options.page]);

        this.listenTo(this.collection, "fetch search", this.startFetch.bind(this));
        this.listenTo(this.collection, "before:reset", function(els){

            if (els.length > 5) this.$el.css('min-height', 1000);


            this.render(els).done(function(){
                setTimeout(function(){
                    this.waiter.remove();
                    console.log("removeWaiter")
                }.bind(this), 800);

            }.bind(this));

        }.bind(this));


        this.startFetch();
        this.initLazyload();

        $(window).on("resize", _.debounce(this.columnateAll.bind(this)));    //TODO: Только через requestAnimationFrame
    },

    startFetch : function(){
        if (this.collection.fetchDfd && this.collection.fetchDfd.state() == "pending") {

            if (this.waiter) this.waiter.remove();

            this.waiter = new App.Views.Waiter({renderTo: this.$el, size: 8})
            console.log("createWaiter")
        }
    },

    render : function(models){

        this.renderDfd = $.Deferred();

        _.each(models, this.addView, this);

        return this.renderDfd;
    },
    addView : function(model){
        this.views.push(new App.Views.Post_small({
            model    : model,
            parent   : this,
            renderTo : this.$el,
            prev     : _.last(this.views)
        }));
    },
    columnateAll : function(){

        if (!this.busy);

        this.busy = true;

        requestAnimationFrame(function(){
            this.$('.post-small').removeClass("c1 c2 c3 c4 last");
            for (var i=0;this.views[i];i++){                        // Тоже через raf, именно то, что выравнивание должно произойти только когда уже точно посты отстроились и + дождались загрузки картинок
                this.views[i].columnate();
            }
            this.busy = false;
        }.bind(this))
    },

    initLazyload : function(){
        $(window).on('scroll', function() {

            requestAnimationFrame(function () {

                if (this.collection.fetchDfd && this.collection.fetchDfd.state() == "pending") return;
                if (this.renderDfd && this.renderDfd.state() == "pending") return;

                function fetch() {
                    if (App.windowHeight < window.scrollY + window.innerHeight + 200) this.collection.fetch();
                }

                console.log("scroll", this.collection.fetchDfd, this.renderDfd)

                fetch.call(this);

            }.bind(this))

        }.bind(this))
    }
});

//App.Views.Post_middle = Backbone.View.extend({});