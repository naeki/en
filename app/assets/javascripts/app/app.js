window.App = {
    name        : "en_js",
    version     : "0.0",
    Views       : {},
    Models      : {},
    Collections : {}
};

window.Lang = {
    all    : "all",
    digest : "digest",
    feed   : "feed",
    users  : "users"
}




App.Router = Backbone.Router.extend({
    initialize : function(){
        Backbone.history.start({pushState: true});
    },
    routes: {
        "all"             : "_all",
        "digest"          : "_digest",
        "feed"            : "_feed",
        'users'           : "_users",
        "user:id(/)"      : "_user",
        "user:id(/:page)" : "_user",
        "edit"            : "_edit",
        ":id"             : "_post",
        "new"             : "_post"
    },
    _post    : function(){this._use({post : arguments[0]})},
    _user    : function(){this._use({user : arguments[0], page: arguments[1]})},

    _edit    : function(){App.main.editProfile()},

    _all     : function(){this._use({dvsn : App.Views.All})},
    _digest  : function(){this._use({dvsn : App.Views.Digest})},
    _feed    : function(){this._use({dvsn : App.Views.Feed})},
    _users   : function(){this._use({dvsn : App.Views.Users})},

    _use : function(options){
        App.main.open(options);
    }
});




App.loader = {
    sync : function(url, options){
        var options = options || {};
        return $.ajax({
            url  : url,
            type : options.type || "GET",
            data : {data : options.data || {}}
        })
        .then(
            function(result){
                if (!result || result.error){
                    if (result && result.error && (result.error == 2))
                        return App.service.signout();
                    else
                        return $.Deferred().reject(this.errors[result && result.error] || (result && result.error) || result);
                }
                else
                    return $.Deferred().resolve(result);
            }.bind(this),

            function(result){
                alert("error loading " + result.toString());
            }.bind(this)
        )
    },
    preload : function(){
        return this.loadCurrentUser();
    },
    loadCurrentUser : function(){
        return this.sync("/sessions/get_current_user", {type : "GET"}).then(function(result){
            return $.Deferred().resolve(App.currentUser = User.builder(result));
        });
    },
    errors : {
        1 : "Entered password is wrong"
    }
}


App.service = {
    signout : function(){
        window.location = "/signin";
        App.main.remove();
        return $.Deferred().reject();
    },
    signin : function(){

    },
    signup : function(){

    }
}
