/*$(function() {
    $("#navigation").load("navigation.html");
});*/
$('body').bind('copy paste cut drag drop', function (e) {
    e.preventDefault();
  });
$.get("navigation.html", function(data){
    var html = $(data);
    
    if (localStorage['userId']!==null && localStorage['userId'] !== undefined) {
        $("#bookings",html).show();
        $("#hospitalLogin",html).hide();
        $("#userLogin",html).hide();
        $("#logout",html).show();
    }else if (localStorage['hospId']!==null && localStorage['hospId'] !== undefined) {
        $("#bookings",html).hide();
        $("#hospitalLogin",html).hide();
        $("#userLogin",html).hide();
        $("#logout",html).show();
    }else{
        $("#bookings",html).hide();
        $("#hospitalLogin",html).show();
        $("#userLogin",html).show();
        $("#logout",html).hide();
    }

   // $("#userLogin",html).click(showLoginPage);
    $("#logout",html).click(logout);
    $("#navigation").replaceWith(html);
});

function logout(){
    localStorage.clear();
    window.location.href = "index.html";
}


