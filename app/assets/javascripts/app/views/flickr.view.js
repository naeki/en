App.Views.FlickrGallery = App.Views.BASE.extend({
    className : "flickr-gallery",
    _markup : '\
        <div class="flickr-search">\
            <input class="flickr-search-input" type="text" placeholder="'+ Lang.search +'">\
            <input class="flickr-search-submit" type="button" value="'+ Lang.find +'">\
            <div class="samples"></div>\
        </div>\
        <div class="flickr-results"></div>\
    ',
    events : {
        "click .flickr-search-submit" : "search"
    },
    init : function(){
        this.render();

        this.$results = this.$(".flickr-results");
    },
    render : function(){
        this.$el.html(this._markup);
    },

    search : function(){
        $.ajax("https://api.flickr.com/services/rest/", {
            method : 'flickr.photos.search',
            text   : "cat",
            format : "json",
            api_key: "f6bb4da0186965584d006a50bd8ddda1",
            size   : "T",
            privacy_filter : 1,
            extras : "url_q"
        }).done(function(){
            this.renderPics();
        }.bind(this));
    },
    renderPics : function(data){
        this.$results.empty();

        for(var i=0;data.photo[i];i++){
            var $pic = this.renderPic(data.photo[i]);
            this.$results.append($pic);
        }
    },
    renderPic : function(model){
        return $("<img>", {
            src: model.url_q
        });
    },


    renderSamples : function(){

    },

    open : function(){
        this.getFade().appendTo($("body"));
        this.$el.appendTo(this.$fade);
    },
    getFade : function(){
        if (!this.$fade) this.$fade = $("<div class='flickr-gallery-fade'></div>");

        return this.$fade;
    }
})