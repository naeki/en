App.Views.Page_Post = App.Views.BASE.extend({

    pageStep : 1500,


    className : "page-post",
    _markup:"\
    <div id='post-page-about' class='post-page-about'>\
        <div class='post-last-visit'>\
            <h3>"+ Lang.last_seen +"</h3>\
            <span class='post-stat-view post-stat-info'></span>\
        </div>\
    </div>\
    <div class='post-page-photo'>\
    </div>\
    <ul class='post-actions'>\
        <li><span class='post-stat-comments post-stat link'>" + App.SVG.comments + "</span></li>\
        <li><span class='post-action do-like link'></span></li>\
        <li><span class='post-action do-bookmark link'></span></li>\
    </ul>\
    <p class='help-title'></p>\
    <div class='post-meta'>\
        <div class='edit-controls'></div>\
        <div class='post-info'>\
            <p class='page-number'></p>\
        </div>\
    </div>\
    <div class='post-page-view'>\
        <div class='post-stats'>\
            <span class='post-stat-lock'></span>\
            <span class='post-stat-likes post-stat link'>"+ App.SVG.like +"</span>\
        </div>\
        <div class='page-header'>\
            <div class='author-box'>\
                <img class='user-photo-middle user-link'>\
                <span class='post-author user-name user-link'></span>\
            </div>\
            <div class='h1'></div>\
            <div class='tags'></div>\
            <div class='history-back'></div>\
        </div>\
        <div class='post-page-marks'></div>\
        <div class='page-body'>\
            <div class='page-viewer'>\
                <div class='post-page-text'></div>\
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
        "click .post-stat-likes"    : "openLikes",
//        "click" : function(){if (this.moved) this.movePage(false);},
        "wheel" : "_wheel"
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
        this.$nav          = this.$(".post-page-nav");

        this.view();
        this.openText();

        this.listenTo(this.model, "change:title change:last_view change:access", this.renderHeader);
        this.listenTo(this.model, "change:text", this.openText);
        this.listenTo(this.model, "change:deleted", this.view);
        this.listenTo(this.model, "change:likes change:bookmarks", this.renderActions);
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

        var url = this.model.getBigPhoto();
        this.$header.children(".h1").html(this.model.get("title"));

        this.$el[!this.model.get("access") ? "addClass" : "removeClass"]("lock");

        this.$picture.css("background-image", "url(" + url + ")")[url ? "addClass" : "removeClass"]("image");

        this.model.get("comments") && this.$comments.attr("count", this.model.get("comments"));


        if (this.model.get("last_view"))
            this.$lastview.html(Post.getDateString(this.model.get("last_view")));

        this.renderActions();

        this.renderTags();
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
    renderAuthor : function(){
        this.$(".user-photo-middle").attr({
            src : this.model.user.getSmallPhoto(),
            alt : this.model.user.get("name")
        }).data("user-id", this.model.user.id);

        this.$(".post-author").html(this.model.user.get("name")).data("user-id", this.model.user.id);
    },
    renderOmnibar : function(){

        this.renderAuthor();

        this.$(".help-title").html(this.model.get("title"));

        if (this.model.get("permissions")&Post.OWNER)
            $("<span class='post-action settings link'></span>").html(App.SVG.settings).appendTo(this.$nav);

        // Show/hide user box
        this.$(".author-box")[this.model.isNew() ? "hide" : "show"]();
    },

    renderActions : function(){
        this.renderLikes();

        if (this.model.iAdded())
            this.$('.do-bookmark').addClass("done");
        else
            this.$('.do-bookmark').removeClass("done");

        if (this.model.iLike())
            this.$('.do-like').addClass("done");
        else
            this.$('.do-like').removeClass("done");
    },
    renderLikes : function(){
        this.$likes[this.model.get("likes") ? "show" : "hide"]();
        var likes = this.model.get("likes"), count;
        if (likes) {
            if (likes > 0 && likes < 2)  count = 1;
            if (likes > 1 && likes < 7)  count = 2;
            if (likes > 6 && likes < 9)  count = 3;
            if (likes > 9 && likes < 20) count = 4;
            if (likes > 19)              count = 5;

            this.$likes.attr("likes", count);
        }
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

        App.router.navigate(this.model.get("id")+"/comments", {trigger: true, replace: false});

    },
    pasteParts : function(){
        var height = this.resizeText(),
            length = parseInt(this.model.get("text").length / this.pageStep),
            heightStep = parseInt(height/length);

        this.topsArray = [];
        this.$('.page-mark').remove();

        if (length === 0) return;

        for (var i=1; i <= length; i++){
            this.topsArray.push(this.createPageMark(i, heightStep));
        }

        this.setPageNumber();
    },
    createPageMark : function(num, step){
        var top = (num-1)*step;
        if (!top) return;
        num -= 1;
        this.$(".post-page-marks").append($("<a class='page-mark'>"+ num +"</a>").css('top', top).data("number", num));
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
    },
    _wheel : function(e){
        requestAnimationFrame(function (e){
            if ($(e.target).parents(".flickr-gallery").length || $(e.target).hasClass("flickr-gallery")) return;
            if (e && e.originalEvent.deltaY < 0 && window.scrollY == 0 && !this.moved)          this.movePage(true);
            if (e === false || e.originalEvent.deltaY > 0 && window.scrollY == 0 && this.moved) this.movePage(false);
        }.bind(this, e));
    },
    movePage : function(open){
        this.$el[(this.moved = open) ? "addClass" : "removeClass"]("move");
    }
});





App.Views.Post_Form = App.Views.Page_Post.extend({
    className : "page-post page-post-form",
    _imageControlsMarkup : "\
    <div class='image-settings'>\
        <h3>"+ Lang.photo_change +"</h3>\
        <input class='flickr-search-input' type='text' placeholder='"+ Lang.search +"'>\
        <div class='submit-photo save-button'></div>\
        <!--<input type='button' class='delete-photo' value='"+ Lang.photo_delete +"'>-->\
    </div>",
    events : {
        "click .save-post"   : "save",
        "click .post-delete" : function(){this.model.del();},
        "click .history-back" : function(){
            Backbone.history.history.back();   // Перенести эту чертову стрелку в мэйн
        },
        "input .edit-text" : function(){
            this.refreshSaveButton();
            this.resizeText();
        },
        "click .do-like"   : "likeAction",
        "click .do-bookmark"        : "bookmarkAction",
        "click .post-stat-comments" : "openComments",
        "click .post-stat-likes"    : "openLikes",
        "click .return"    : "openText",
        "click .settings"  : "openSettings",
//        "click" : function(){if (this.moved) this.movePage(false);},
        "wheel" : "_wheel",
        "wheel .flickr-gallery" : function(e){
            if (!this.reqwheel) e.stopPropagation();

            this.reqwheel = requestAnimationFrame(function(e){
                e.stopPropagation();
                delete this.reqwheel;
            }.bind(this, e));
        },
        "click .flickr-open"  : "openGallery",
//        "click .image-settings-button" : "openImageSettings",
        "click .submit-photo" : "savePicture",
        "click .delete-photo" : "deletePicture",
        "click .post-page-about" : function(e){
            if (e.target.className == "post-page-about") this.movePage(true);
        },
        "keydown .flickr-search-input" : function(e){
            if (e.keyCode == 13) {
                this.openImageSettings();
                this.gallery.search(this.$(".flickr-search-input").val());
            }
        },
        "input .edit-title" : "refreshSaveButton"
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
        this.$nav      = this.$(".post-page-nav");



        //this.openSettings();
        this.openText();
        this.renderControls();

        //this.on("model", this.setModel, this);
//        this.listenTo(this.model, "change:tags", this.renderTags);
        this.listenTo(this.model, "change:title change:last_view", this.renderHeader);
        this.listenTo(this.model, "change:text", this.openText);
        this.listenTo(this.model, "change:likes change:bookmarks", this.renderActions);
        this.listenTo(this.model, "change:access", this.renderAccessIndication.bind(this));

        $(window).on("resize", this.pasteParts.bind(this));
        $(window).on("scroll", this.setPageNumber.bind(this));

        this.constructor.view = this;
        this.view();
        this.renderImageControls();

        if (this.model.isNew())
            this.initNew();
    },
    initNew : function(){
        this.$el.addClass("new");

        this.listenTo(this.model, "change:id", function(){
            this.$el.removeClass("new");
        }.bind(this));
    },
    renderHeader : function(){
        this.$header.children(".h1").addClass("edit").html(
            $("<input class='edit-title' placeholder='"+ Lang.new_post_name +"'>").val(this.model.get("title"))
        );

        this.renderTags();
        this.renderAccessIndication();
        this.renderPicture();
        this.model.get("comments") && this.$comments.attr("count", this.model.get("comments"));


        if (this.model.get("last_view"))
            this.$lastview.html(Post.getDateString(this.model.get("last_view")));

        this.renderAccess();
        this.renderActions();
    },
    renderPicture : function(id){
        var url = this.model.getBigPhoto();
        if (id) url = App.Views.FlickrGallery.getBigPhoto(id);

        if (url)
            this.$picture.addClass("image").css("background-image", "url(" + url + ")");
    },
    renderAccessIndication : function(){
        this.$el[!this.model.get("access") ? "addClass" : "removeClass"]("lock");
    },
    renderGalleryPreview : function(id){
        if (!this.$galleryPreview)
            this.$picture.prepend(this.$galleryPreview = $("<div class='post-gallery-preview'></div>"));

        this.$galleryPreview.css("background-image", "url(" + App.Views.FlickrGallery.getBigPhoto(id) + ")");
    },
    removeGalleryPreview : function(){
        if (this.$galleryPreview)
            this.$galleryPreview.remove();

        delete this.$galleryPreview;
    },
    renderControls : function(){
        this.$controls.empty()
            .append("<div class='save-button save-post'></div>");
    },
    openText : function(){
        this.$viewer[0].innerHTML = "<textarea class='edit-text'></textarea><bg></bg>";
        this.$text = this.$(".edit-text").val(this.model.get("text").replace(/<br>/g, "\n") || "");

//        requestAnimationFrame(function(){
//            this.$text.focus();
//        }.bind(this));

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
    },
    renderTags : function(){
        if (this.model.get("deleted")) return this.$tags.remove();

        if (!this.tags) {
            this.tags = new App.Views.TagsControl({
                collection: this.model.tags,
                el: this.$tags,
                parent: this,
                model: this.model
            });

            this.tags.on("change", function(value){
                this.model.addTags(value);
            }.bind(this))
        }
    },
    renderAccess : function(){
        if (this.access) return;

        this.$(".post-page-about").append("<div class='access-control'><h3>"+ Lang.change_access +"</h3></div>");
        this.$(".access-control").append(this.$accessLabel = $("<label></label>"));

        this.access = new App.Views.ToggleControl({
            model    : this.model,
            renderTo : this.$(".access-control"),
            parent   : this
        });

        function setLabel(value){
            this.$accessLabel.html(value ? "Доступно всем" : "Доступно только вам");
        }
        setLabel.call(this, this.model.get("access"));

        this.listenTo(this.access, "change", setLabel.bind(this));
    },
    renderImageControls : function(){
        this.$(".post-page-about").append(this._imageControlsMarkup);
        this.$input = this.$(".flickr-search-input");
    },
    openImageSettings : function(){
//        this.$(".image-settings").show();
        this.$(".image-settings-button").hide();
        this.movePage(true);

        if (!this.gallery) {
            this.gallery = new App.Views.FlickrGallery({
                renderTo : this.$(".post-page-photo")
            });

            /*
            // Event from gallery
            */

            this.listenTo(this.gallery, "select", function(id){

                //Show save button
                this.$(".submit-photo").addClass("visible");
                this.renderGalleryPreview(id);
            }.bind(this));

        }

        this.gallery.open();
        this.$(".post-page-about").addClass("fixed");
    },
    closeImageSettings : function(){
//        this.$(".image-settings").hide();
        this.$(".image-settings-button").show();
        this.$(".post-page-about").removeClass("fixed");

        this.gallery.close();
        this.gallery.remove();
        delete this.gallery;
        this.$(".submit-photo").removeClass("visible");
        this.removeGalleryPreview();
    },
    movePage : function(open){
        if (this.moved == open) return;

        this.$el[(this.moved = open) ? "addClass" : "removeClass"]("move");
        this[open ? "openImageSettings" : "closeImageSettings"]();

    },
    refreshSaveButton : function(e){
        var button = this.$(".save-post"),
            changedName = this.$(".edit-title").val() != (this.model.get("name") || ""),
            changedText = this.$(".edit-text").val()  != (this.model.get("text") || "");

        if (changedName || changedText)
            button.addClass("visible");
        else {
            button.css("opacity", 0);
            setTimeout(function(){
                button.removeClass("visible").css('opacity', 1);
            }, 300);
        }
    },
    savePicture : function(id){
        if (typeof id != "number") id = this.gallery.chosenId;

        this.model.set("photo_id", id);
        this.save();

//        this.closeImageSettings();
        this.movePage(false);
        this.renderPicture(id);
    },
    save : function(){
        var title = this.$(".edit-title").val(),
            text  = this.$text.val().replace(/\n/g, "<br>");

        return this.model.set({
            title : title,
            text  : text
        }).save();
    }
});








//App.Views.Post_Settings = App.Views.BASE.extend({
//    className : "post-settings",
//    _markup : "\
//        <span class='h2'>Настройки</span><span class='return link'>← К тексту</span>\
//        <div class='edit-life'>\
//            <h3>"+ Lang.change_life +"</h3>\
//            <input type='button' class='change-life'>\
//        </div>\
//        <div class='change-access'>\
//            <h3>"+ Lang.change_access +"</h3>\
//            <select class='access-select'>\
//                <option value='0'>"+ Lang.private +"</option>\
//                <option value='1'>"+ Lang.public +"</option>\
//            </select>\
//        </div>\
//        <div class='change-photo'>\
//            <h3>"+ Lang.photo_change +"</h3>\
//            <div class='file-source'>\
//                <input type='button' class='flickr-open' value='" + Lang.flickr_open + "'>\
//            </div>\
//            <input type='button' class='submit-photo' value='"+ Lang.save_photo +"'>\
//            <input type='button' class='delete-photo' value='"+ Lang.photo_delete +"'>\
//        </div>\
//        <div class='edit-tags'></div>",
//    events : {
//        "click .change-life"  : "changeLife",
//        "click .flickr-open"  : "openGallery",
//        "click .submit-photo" : "submitPicture",
//        "click .delete-photo" : "deletePicture",
//        "change .access-select" : function(e){
//            this.model.set('access', parseInt(e.target.value));
//            this.model.save();
//        }
//    },
//    init : function(){
//        this.render();
//
//        this.$picture   = this.$(".post-picture");
//        this.$uploadBar = this.$(".upload-bar");
//        this.$tags      = this.$(".edit-tags");
//        this.$access    = this.$(".access-select");
//
//        this.renderLife();
//        this.renderPicture();
//        this.renderTags();
//        this.renderAccess();
//
//        this.listenTo(this.model, "change:photo_id", this.renderPicture);
//        this.listenTo(this.model, "change:deleted",  this.renderLife);
//        this.listenTo(this.model, "change:access",   this.renderAccess);
//    },
//    render : function(){
//        this.$el.html(this._markup);
//    },
//
//    // LIFE
//    renderLife : function(){
//        var del = this.model.get("deleted");
//        this.$(".change-life").val(del ? Lang.return : Lang.delete).data("value", !del);
//        this.$el[del ? "addClass" : "removeClass"]("deleted");
//        this.$('.edit-life > h3').html(del ? Lang.post_isdeleted : Lang.change_life);
//    },
//    changeLife : function(e){
//        this.model[$(e.target).data("value") ? "del" : "ret"]();
//    },
//
//    // PICTURE
//    renderPicture : function(){
//        this.$picture.attr({
//            src : this.model.getNormalPhoto(),
//            alt : this.model.get("title")
//        });
//    },
////    submitPicture : function(){
////        var data = {
////            file    : this.$(".select-file")[0].files[0],
////            id : this.model.id
////        };
////
////        this.$uploadBar.addClass("visible");
////        return App.loader.sync("posts/picture", {data: data, type: "POST"}).then(
////            function(result){
////                setTimeout(function(){
////                    Post.builder(result).trigger("change:photo_id");
////                    this.$uploadBar.removeClass("visible").css("background-size","0% 100%");
////                }.bind(this), 200);
////            }.bind(this),
////            function(){},
////            function(progress){
////                this.$uploadBar.css("background-size", progress*100 + "% 100%");
////            }.bind(this)
////        );
////    },
//
//    openGallery : function(){
//        if (!this.gallery) {
//            this.gallery = new App.Views.FlickrGallery();
//            this.listenTo(this.gallery, "select", function(id){
//                this.model.set("photo_id", id).save();
//            });
//        }
//
//        this.gallery.open();
//    },
//
//    deletePicture : function(){
//        var data = {id : this.model.id};
//        return App.loader.sync("posts/picture", {data: data, type: "DELETE"});
//    },
//
//
//    // TAGS
//    renderTags : function(){
//        this.tags = new App.Views.TagsControl({
//            parent     : this,
//            el         : this.$tags,
//            model      : this.model,
//            collection : this.model.tags
//        });
//    }
//});








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