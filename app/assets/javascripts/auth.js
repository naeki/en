/**
 * Created by ryo on 28.01.16.
 */

window.Auth = {
    currentForm : 0
}

Auth.lang = {
    "signup" : "Sign up",
    "signin" : "Sign in"
}

Auth.signIn = function(){
    var arr = $(".signin-box form").serializeArray();
    var data = {};
    $.each(arr, function(i, e){
        data[e.name] = e.value;
    });

    $.ajax("/sessions/auth", {method: "POST", data: data}).then(function(result){
        if (result.error) {
            alert(result.error);
            return;
        }
        else {
            window.location.reload();
        }
    });
    return false;
};



Auth.toggleType = function(e){
    var type = e.target.classList[1];
    $(".input-block").removeClass("sign-in sign-up repass").addClass(type);


//    Auth.currentForm = Auth.currentForm ? 0 : 1;
//
//    $(".toggle-type").html(Auth.currentForm ? Auth.lang.signin : Auth.lang.signup);
//
//
//    $(".form-box").removeClass("active");
//
//    (Auth.currentForm ? $(".signup-box") : $(".signin-box")).addClass("active");
//    $(".send").removeClass("signup signin").addClass(Auth.currentForm ? "signup" : "signin");
}


$(document).on('ready', function(){
    $("body").on("click", ".signin", Auth.signIn);
//    $("body").on("click", ".signup", Auth.signUp);

    $("body").on("click", ".page-link", Auth.toggleType);

    $("body").on("input", "input", function(){
        $(this)[$(this).val().length ? "addClass" : "removeClass"]("val");
    });
})



