App.Views.FlickrGallery = App.Views.BASE.extend({
    className : "flickr-gallery",
    events : {
        "click .flickr-search-submit" : "search",
        "keydown .flickr-search-input" : function(e){
            if (e.keyCode == 13) this.search();
        },
        "click .flickr-photo" : "choose"
    },
    init : function(){
        this.render();
        this.$input   = this.$(".flickr-search-input");
        this.$results = this.$(".flickr-results");
    },
    render : function(){
        this.$el.html(this._markup);
    },

    search : function(val){
        $.ajax({
            url    : "https://api.flickr.com/services/rest/",
            dataType : "json",
            data : {
                method : 'flickr.photos.search',
                text   : val,
                api_key: "f6bb4da0186965584d006a50bd8ddda1",
                size   : "T",
                nojsoncallback:1,
                format : "json",
                privacy_filter : 1,
                extras : "url_q, url_n"
            }
        }).done(this.renderPics.bind(this));
    },
    renderPics : function(data){
//        data = JSON.parse(data);
        data = data.photos;
        this.$(".flickr-photo").remove();

        for(var i=0;data.photo[i];i++){
            var $pic = this.renderPic(data.photo[i]);
            this.$el.append($pic);
        }
    },
    renderPic : function(model){
        return $("<img>", {
            "class" : "flickr-photo",
            "src"   : model.url_q
        }).data("model", model);
    },

    renderSamples : function(){

    },

    choose : function(e){
        var model = $(e.target).data("model");
        var id = "https://farm"+ model.farm +".staticflickr.com/"+ model.server +"/"+ model.id +"_" + model.secret;
        this.trigger("select", id);
        this.chosenId = id;
//        this.close();
//        this.openBigPic(model);
//        this.close();
    },

//    openBigPic : function(model){
//        $("body").append($("<img>", {
//            "class" : "flickr-big-photo",
//            "src"   : model.url_n
//        }))
//    },
    open : function(){
        this.$el.appendTo(this.options.renderTo);

        this.lastScrollTop = window.scrollY;
        App.main.$el.addClass("fixed").css("top", -1 * this.lastScrollTop);
        delete this.chosenId;
    },
    close : function(){
        this.$results.empty();

        App.main.$el.removeClass("fixed");
        window.scrollTo(0, this.lastScrollTop);
    },
    getFade : function(){
        if (!this.$fade) this.$fade = $("<div class='flickr-gallery-fade'></div>");
        this.$fade.on("click", function(e){
            if ($(e.target).is(this.$fade)) this.close();
        }.bind(this));

        return this.$fade;
    }
}, {
    getBigPhoto : function(id){
        return id && (id + "_b.jpg");
    }
});

App.Views.FlickrPhotoView = App.Views.BASE.extend({

});