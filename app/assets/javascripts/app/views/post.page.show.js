App.Views.Page_Post = App.Views.BASE.extend({

    pageStep : 1500,

    className : "page-post",
    _markup:"<div class='post-page-view'>\
        <div class='page-header'>\
            <div class='h1'></div>\
            <div class='post-stats'>\
                <span class='post-stat-likes post-stat link'></span>\
                <span class='post-stat-comments post-stat link'></span><br>\
                <span class='post-stat-view post-stat-info'></span>\
            </div>\
            <div class='post-page-illustration'>\
                <div class='post-page-illustration__wrapper'>\
                    <div class='post-page-photo__dot'><img class='post-page-photo'></div>\
                </div>\
            </div>\
            <div class='history-back'></div>\
        </div>\
        <div class='page-body'>\
            <div class='page-viewer'>\
                <div class='post-page-text'></div>\
            </div>\
        </div>\
        <div class='omnibar'>\
            <div class='author-box'>\
                <img class='user-photo-middle user-link'><br>\
                <span class='post-author user-name user-link'></span>\
            </div>\
            <ul class='tags'></ul>\
            <div class='post-meta'>\
                <div class='edit-controls'></div>\
                <ul class='post-actions'>\
                    <li><span class='post-action do-bookmark link'></span></li>\
                    <li><span class='post-action do-like link'></span></li>\
                </ul>\
                <div class='post-info'>\
                    <p class='page-number'></p>\
                    <p class='help-title'></p>\
                </div>\
            </div>\
        </div>\
    </div>",
    events : {
        "click .history-back" : function(){
            Backbone.history.history.back();
        },
        "click .do-like"            : "likeAction",
        "click .do-bookmark"        : "bookmarkAction",
        "click .return"             : "openText",
        "click .post-stat-comments" : "openComments",
        "click .post-stat-likes"    : "openLikes"
    },
    init : function(){
        this.render();

        this.$header       = this.$(".page-header");
        this.$picture      = this.$(".post-page-photo");
        this.$body         = this.$(".page-body");
        this.$viewer       = this.$(".post-page-text");
        this.$tags         = this.$(".tags");
        this.$comments     = this.$(".post-stat-comments");
        this.$likes        = this.$(".post-stat-likes");
        this.$lastview     = this.$(".post-stat-view");

        this.openText();
        this.view();

        this.listenTo(this.model, "change:title change:comments change:likes change:bookmarks change:last_view change:access", this.renderHeader);
        this.listenTo(this.model, "change:text", this.openText);
        this.listenTo(this.model, "change:deleted", this.view);
        this.listenTo(this.model.tags, "add remove reset", this.renderTags);

        $(window).on("resize", this.pasteParts.bind(this));
        $(window).on("scroll", this.setPageNumber.bind(this));

        this.constructor.view = this;
    },
    render : function(){
        this.$el.html(this._markup).appendTo(this.options.renderTo);
    },
    view : function(){
        this.renderHeader();
        this.renderOmnibar();
    },
    renderHeader : function(){
        this.$header.children(".h1").html(this.model.get("title"));
        this.$el[!this.model.get("access") ? "addClass" : "removeClass"]("lock");


        //this.$(".post-page-illustration__wrapper").css("background-image", "url("+ this.model.getBigPhoto() +")");
        this.$picture.attr({
            src : this.model.getBigPhoto(),
            alt : this.model.get("title")
        });

        this.$likes.html(this.model.get("likes"));
        this.$comments.html(this.model.get("comments"));

        if (this.model.get("last_view"))
            this.$lastview.html("Last viewed: " + Post.getDateString(this.model.get("last_view")));

        this.renderActions();
    },
    renderTags : function(){
        if (this.model.get("deleted")) return this.$tags.remove();

        if (this.tags) this.tags.render();
        else
            this.tags = new TagsView({
                collection : this.model.tags,
                el         : this.$tags,
                parent     : this
            });
    },
    openText : function(){
        if (this.model.get("deleted")) return this.$viewer.html("<div class='error-note deleted'>"+ Lang.post_deleted +"</div>");
        this.$viewer.html(this.model.get("text"));

        this.model.loading.done(this.pasteParts.bind(this));
    },
    renderOmnibar : function(){
        this.$(".user-photo-middle").attr({
            src : this.model.user.getSmallPhoto(),
            alt : this.model.user.get("name")
        }).data("user-id", this.model.user.id);

        this.$(".post-author").html(this.model.user.get("name")).data("user-id", this.model.user.id);
        this.$(".page-number").html("1");
        this.$(".help-title").html(this.model.get("title"));

        if (this.model.get("permissions")&Post.OWNER)
            $("<span class='post-action settings link'>Настройки</span>").insertAfter(this.$tags);

        // Show/hide user box
        this.$(".author-box")[this.model.isNew() ? "hide" : "show"]();

        this.renderTags();
    },
    renderActions : function(){

        if (this.model.iAdded())
            this.$('.do-bookmark').html("Добавлено").addClass("done");
        else
            this.$('.do-bookmark').html("Добавить").removeClass("done");

        if (this.model.iLike())
            this.$('.do-like').html("Рекомендуете").addClass("done");
        else
            this.$('.do-like').html("Рекомендую").removeClass("done");
    },
    likeAction : function(){
        this.model.like() || this.model.unlike();
    },
    bookmarkAction : function(){
        this.model.addBookmark() || this.model.removeBookmark();
    },
    openLikes : function(){
        this.$viewer[0].innerHTML = "";

        if (!this.likes)
            this.likes = new App.Views.PostLikes({
                renderTo   : this.$viewer,
                parent     : this,
                collection : this.model.likes
            });

        this.$('.page-mark').remove();
        this.$viewer.append(this.likes.$el);
    },
    openComments : function(){    // Для обоих (лайков и комментариев) нужно сделать, чтобы каждый раз обновлялись, сейчас просто вставляется то, что уже было
        this.$viewer[0].innerHTML = "";

        if (!this.comments)
            this.comments = new App.Views.Comments({
                renderTo   : this.$viewer,
                model      : this.model,
                collection : this.model.comments,
                parent     : this
            });

        this.$('.page-mark').remove();
        this.$viewer.append(this.comments.$el);
    },
    pasteParts : function(){
        var height = this.resizeText(),
            length = parseInt(this.model.get("text").length / this.pageStep),
            heightStep = parseInt(height/length);

        this.topsArray = [];
        this.$('.page-mark').remove();

        for (var i=1; i <= length; i++){
            this.topsArray.push(this.createPageMark(i, heightStep));
        }

        this.setPageNumber();
    },
    createPageMark : function(num, step){
        var top = (num-1)*step;
        if (!top) return;
        num -= 1;
        this.$body.append($("<a class='page-mark'>"+ num +"</a>").css('top', top).data("number", num));
        return top;
    },
    setPageNumber : function(){
        var top = $(document).scrollTop() + window.innerHeight - this.$header.height() - 150;

        for(var i=1; i<this.topsArray.length+1; i++){
            if (this.topsArray[i] > top || typeof(this.topsArray[i]) != "number"){
                this.$('.page-number').html(i > 0 ? i : 1);
                break;
            }
        }
    },
    resizeText : function(){
        return this.$viewer[0].scrollHeight;
    }
});





App.Views.Post_Form = App.Views.Page_Post.extend({
    events : {
        "click .post-save"   : "save",
        "click .post-delete" : function(){this.model.del();},
        "click .history-back" : function(){
            Backbone.history.history.back();   // Перенести эту чертову стрелку в мэйн
        },
        "input .edit-text" : "resizeText",
        "click .do-like"   : "likeAction",
        "click .do-bookmark"        : "bookmarkAction",
        "click .post-stat-comments" : "openComments",
        "click .post-stat-likes"    : "openLikes",
        "click .return"    : "openText",
        "click .settings"  : "openSettings"
    },
    init : function(){
        this.render();

        this.$body     = this.$(".page-body");
        this.$header   = this.$(".page-header");
        this.$picture  = this.$(".post-page-photo");
        this.$viewer   = this.$(".page-viewer");
        this.$tags     = this.$(".tags");
        this.$stats    = this.$(".post-stats");
        this.$likes    = this.$(".post-stat-likes");
        this.$comments = this.$(".post-stat-comments");
        this.$lastview = this.$(".post-stat-view");
        this.$actions  = this.$(".post-actions");
        this.$controls = this.$(".edit-controls");

        //this.openSettings();
        this.openText();
        this.renderControls();

        //this.on("model", this.setModel, this);
        this.listenTo(this.model, "change:tags", this.renderTags);
        this.listenTo(this.model, "change:title change:comments change:likes change:bookmarks change:last_view change:access", this.renderHeader);
        this.listenTo(this.model, "change:text", this.openText);

        $(window).on("resize", this.pasteParts.bind(this));
        $(window).on("scroll", this.setPageNumber.bind(this));

        this.constructor.view = this;
        this.view();
    },
    renderHeader : function(){
        this.$header.children(".h1").addClass("edit-title").attr("contenteditable", true).html(this.model.get("title"));
        this.$el[!this.model.get("access") ? "addClass" : "removeClass"]("lock");

        this.$picture.attr({
            src : this.model.getBigPhoto(),
            alt : this.model.get("title")
        });

        this.$likes.html(this.model.get("likes") || 0);
        this.$comments.html(this.model.get("comments") || 0);

        if (this.model.isNew()) {
            this.$actions.remove();
            this.$stats.remove();
            return;
        }

        if (this.model.get("last_view"))
            this.$lastview.html("Last viewed: " + Post.getDateString(this.model.get("last_view")));

        this.renderActions();
    },
    renderControls : function(){
        this.$controls.empty()
            .append("<input type='button' class='big post-save' value='"+ Lang.save +"'>");
    },
    save : function(){
        var title = this.$header.children(".h1")[0].textContent,
            text  = this.$text.val().replace(/\n/g, "<br>");

        return this.model.set({
            title : title,
            text  : text
        }).save();
    },
    openText : function(){
        this.$viewer[0].innerHTML = "<textarea class='edit-text'></textarea>";
        this.$text = this.$(".edit-text").val(this.model.get("text").replace(/<br>/g, "\n") || "");

        this.model.loading.done(this.pasteParts.bind(this));
    },
    resizeText : function(){
        var st = $(document).scrollTop(), height; // Чтобы, если снизу что-то правим, то скролл после ресайза вернулся туда, куда надо

        this.$text.height(0);
        this.$text.height(height = this.$text[0].scrollHeight);
        $(document).scrollTop(st);

        return height;
    },
    openSettings : function(){
        this.$viewer[0].innerHTML = "";

        if (!this.settings)
            this.settings = new App.Views.Post_Settings({
                renderTo   : this.$viewer,
                model      : this.model,
                parent     : this
            });

        this.$('.page-mark').remove();
        this.$viewer.append(this.settings.$el);
    }
});








App.Views.Post_Settings = App.Views.BASE.extend({
    className : "post-settings",
    _markup : "\
        <span class='h2'>Настройки</span><span class='return link'>← К тексту</span>\
        <div class='edit-life'>\
            <h3>"+ Lang.change_life +"</h3>\
            <input type='button' class='change-life'>\
        </div>\
        <div class='change-access'>\
            <h3>"+ Lang.change_access +"</h3>\
            <select class='access-select'>\
                <option value='0'>"+ Lang.private +"</option>\
                <option value='1'>"+ Lang.public +"</option>\
            </select>\
        </div>\
        <div class='change-photo'>\
            <h3>"+ Lang.photo_change +"</h3>\
            <img class='post-picture'>\
            <div class='upload-bar'></div>\
            <div class='file-source'>\
                <input type='file' class='select-file' value='"+ Lang.upload +"'>\
                <span class='or-divider'>or</span>\
                <input type='button' class='flickr-open' value='" + Lang.flickr_open + "'>\
            </div>\
            <input type='button' class='submit-photo' value='"+ Lang.save_photo +"'>\
            <input type='button' class='delete-photo' value='"+ Lang.photo_delete +"'>\
        </div>\
        <div class='edit-tags'></div>",
    events : {
        "click .change-life"  : "changeLife",
        "click .flickr-open"  : "openGallery",
        "click .submit-photo" : "submitPicture",
        "click .delete-photo" : "deletePicture",
        "change .access-select" : function(e){
            this.model.set('access', parseInt(e.target.value));
            this.model.save();
        }
    },
    init : function(){
        this.render();

        this.$picture   = this.$(".post-picture");
        this.$uploadBar = this.$(".upload-bar");
        this.$tags      = this.$(".edit-tags");
        this.$access    = this.$(".access-select");

        this.renderLife();
        this.renderPicture();
        this.renderTags();
        this.renderAccess();

        this.listenTo(this.model, "change:photo_id", this.renderPicture);
        this.listenTo(this.model, "change:deleted",  this.renderLife);
        this.listenTo(this.model, "change:access",   this.renderAccess);
    },
    render : function(){
        this.$el.html(this._markup);
    },

    // LIFE
    renderLife : function(){
        var del = this.model.get("deleted");
        this.$(".change-life").val(del ? Lang.return : Lang.delete).data("value", !del);
        this.$el[del ? "addClass" : "removeClass"]("deleted");
        this.$('.edit-life > h3').html(del ? Lang.post_isdeleted : Lang.change_life);
    },
    changeLife : function(e){
        this.model[$(e.target).data("value") ? "del" : "ret"]();
    },

    // PICTURE
    renderPicture : function(){
        this.$picture.attr({
            src : this.model.getNormalPhoto(),
            alt : this.model.get("title")
        });
    },
//    submitPicture : function(){
//        var data = {
//            file    : this.$(".select-file")[0].files[0],
//            id : this.model.id
//        };
//
//        this.$uploadBar.addClass("visible");
//        return App.loader.sync("posts/picture", {data: data, type: "POST"}).then(
//            function(result){
//                setTimeout(function(){
//                    Post.builder(result).trigger("change:photo_id");
//                    this.$uploadBar.removeClass("visible").css("background-size","0% 100%");
//                }.bind(this), 200);
//            }.bind(this),
//            function(){},
//            function(progress){
//                this.$uploadBar.css("background-size", progress*100 + "% 100%");
//            }.bind(this)
//        );
//    },

    openGallery : function(){
        if (!this.gallery) {
            this.gallery = new App.Views.FlickrGallery();
            this.listenTo(this.gallery, "select", function(id){
                this.model.set("photo_id", id).save();
            });
        }

        this.gallery.open();
    },

    deletePicture : function(){
        var data = {id : this.model.id};
        return App.loader.sync("posts/picture", {data: data, type: "DELETE"});
    },

    renderAccess : function(){
        this.$access.val(this.model.get("access"));
    },

    // TAGS
    renderTags : function(){
        this.tags = new App.Views.TagsControl({
            parent     : this,
            renderTo   : this.$tags,
            model      : this.model,
            collection : this.model.tags
        });
    }
});





// Вьюшка выбора тегов
App.Views.TagsControl = App.Views.BASE.extend({
    className : "tags-control",
    _markup : "<h3>"+ Lang.tags_edit +"</h3>\
        <ul class='tags'></ul>\
        <input type='text' class='input-tags'>\
        <input type='button' class='add-tags' value='"+ Lang.add +"'>\
        <ul class='get-tags'></ul>",
    events : {
        "input .input-tags" : "getTags",
        "click .tag" : function(e){
            this.model.removeTag($(e.target).data("id"));
        },
        "click .add-tags" : function(){
            var value;
            if (!(value = this.$(".input-tags").val()).length) return;

            this.model.addTags(value);
            this.$(".input-tags").val("").trigger("input");
        },
        "click .tag-found" : function(e){
            this.model.addTags($(e.target).data("tag").name);
            this.$(".input-tags").val("").trigger("input");
        }
    },
    init : function(){
        this.render();

        this.$tags    = this.$(".tags");
        this.$input   = this.$(".input-tags");
        this.$suggest = this.$(".get-tags");

        this.renderTags();

        // Сделать теги поста как коллекцию тегов у поста, запрашивать их в одном запросе, но не пихать в модель поста как сейчас

        this.listenTo(this.collection, "add remove reset", this.renderTags);
    },
    render : function(){
        this.$el.html(this._markup).appendTo(this.options.renderTo);
    },
    renderTags : function(){
        this.$tags.empty();

        for (var i=0;this.collection.models[i];i++){
            var tag = this.collection.models[i];
            this.$tags.append(
                $("<li></li>").append($("<span class='tag'></span>")
                    .html(tag.get("name"))
                    .data("id", tag.id)
                ));
        }
    },
    getTags : function(){
        var val = this.$input.val();
        if (!val) return this.$suggest.empty();

        return App.loader.sync("posts/tags", {data : {search: val.toLowerCase()}, type: "GET"}).done(function(result){
            this.$suggest.empty();
            _.each(result, function(item){
                $("<li class='tag-found'>").html(item.name).data("tag", item).appendTo(this.$suggest);
            }, this);
        }.bind(this));
    }
});





// Обязательно убрать это куда-нибудь

App.Views.PostLikes = App.Views.BASE.extend({
    className : "post-likes",
    _markup : "<span class='h2'>Рекоммендуют</span><span class='return link'>← К тексту</span>\
        <div class='likes-list'></div>",
    init : function(){
        this.collection.fetch();
        this.render();
    },
    render : function(){
        this.$el.html(this._markup);

        new App.Views.UserList({
            collection : this.collection,
            parent     : this,
            renderTo   : this.$(".likes-list")
        })
    }
})


































//
//$(window).on("resize", this.openText.bind(this));
//
//this.constructor.view = this;
//this.view();
//},
//renderHeader : function(){
//    this.$header.children(".h1").addClass("edit-title").attr("contenteditable", true).html(this.model.get("title"));
//    setTimeout(function(){
//        this.$header.height(this.$header[0].offsetHeight);
//    }.bind(this), 100);
//
//    this.$picture.attr({
//        src : this.model.getBigPhoto(),
//        alt : this.model.get("title")
//    });
//
//    this.$likes.html(this.model.get("likes") || 0);
//    this.$comments.html(this.model.get("comments") || 0);
//    this.$lastview.html("Last viewed: " + Post.getDateString(this.model.get("last_view")));
//
//    this.renderActions();
//},
//renderControls : function(){
//    this.$controls.empty()
//        .append("<input type='button' class='post-save' value='"+ Lang.save +"'>")
//        .append("<input type='button' class='post-delete' value='"+ Lang.delete +"'>");
//},
//save : function(){
//    var title = this.$header.children(".h1")[0].textContent,
//        text  = this.$text.val().replace(/\n+/g, "\n\u00A0\u00A0\u00A0\u00A0");
//
//    return this.model.set({
//        title : title,
//        text  : text
//    }).save();
//},
//openText : function(){
//    this.$viewer[0].innerHTML = "<div class='edit-controls'></div><textarea class='edit-text'></textarea>";
//    this.$text = this.$(".edit-text").val(this.model.get("text") || "");
//
//    this.model.loading.done(this.pasteParts.bind(this));
//},
//pasteParts : function(){
//    var height = this.resizeText(),
//        step   = 2000,
//        length = parseInt(text.length / step),
//        parts  = [];
//    for (var i=0; i < length; i++){
//        parts.push(text.slice(step * i, step * (i+1)));
//    }
//
//    for (var i=0; i < parts.length; i++){
//        this.$(".edit-text")[0].value += parts[i];
//        //i != 2 && this.createPageMark(i);       // Убожество и позор
//        if(i+2 > parts.length) continue;
//
//        i || this.createPageMark(i+1);
//        this.createPageMark(i+2);
//
//        //i && i != parts.length-1 && this.createPageMark(i+1);
//    }
//},
//createPageMark : function(num){
//    var height = this.$text[0].scrollHeight;
//
//    this.$body.append($("<a name='"+ num +"' class='page-mark'>"+ num +"</a>").css('top', num-1 && height).data("number", num));
//},
//resizeText : function(height){
//    var st = $(document).scrollTop(); // Чтобы, если снизу что-то правим, то скролл после ресайза вернулся туда, куда надо
//
//    height && typeof(height) == "number" || (height = this.$text[0].scrollHeight);
//
//    this.$text.height(0);
//    this.$text.height(height);
//    $(document).scrollTop(st);
//
//    return height;
//},
//openSettings : function(){
//    this.$viewer[0].innerHTML = "";
//
//    if (!this.settings)
//        this.settings = new App.Views.Post_Settings({
//            renderTo   : this.$viewer,
//            model      : this.model,
//            parent     : this
//        });
//
//    this.$viewer.append(this.settings.$el);
//}
//});