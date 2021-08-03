//import SERVER_URL from "./config.js";
const SERVER_URL = "https://sevaprod.sagisu.com/v1";
//const SERVER_URL = "http://localhost:5001/v1";
var contentCount = 10;
var pageNo = 1;
var pageIndex=0;
var services;
var filterKey;
var $html;
loadHtml(false);
registerFilterClickEvent();
addUrgentRequestFormListener();
getServices();
scrollEvent();
$('body').bind('copy paste cut drag drop', function (e) {
  e.preventDefault();
});
$("#urgentRequetForm").dialog({  //create dialog, but keep it closed
  autoOpen: false,
  height: 300,
  width: 350,
  modal: true,
  buttons: {
    "close": function () {
        $("#urgentRequetForm").dialog('close');
    }
}
});
$('#largeModal').on('hidden.bs.modal', function () {
  $('#largeModal form')[0].reset();
});

function loadHtml(loadData){
  $.get("services_card.html",function (data) {
    $html = $(data);
    if(loadData) filterPage();
  });
 }

function getServices(){
  $.ajax({
    type: "GET",
    url: SERVER_URL+"/services",
    cache: false,
    success: function(data){
       services = data;
       displayPageData();
    }
  });
}


  function displayPageData(){
    if($html === undefined){
      loadHtml(true)
      return;
  }
  
   var i;
   var displayed=0;
   console.log("value of pageIndex "+pageIndex);
   for(i=pageIndex;displayed< contentCount  && i< services.length;i++){
    if(filterKey == null){
      displayed++;
      load_services_card(services[i],i);
    }
    else if($.inArray(filterKey, services[i].category)!== -1){
      displayed++;
      load_services_card(services[i],i);
    }
   }
   pageIndex = i;
   pageNo++;
  }

  function scrollEvent(){
  
  $(window).scroll(function() {
     if ((window.innerHeight + window.pageYOffset) >= (document.body.offsetHeight -2)) {
        // ok
        displayPageData();
      }
  });
  }

  function load_services_card(item,index) {
   
      var html = $html.clone();
       $('#requestHeader', html).text(item.requestHeader);
       $('#name', html).text(item.name);
       $('#description', html).text(item.description);
       if(item.mobile!=null && item.mobile != ""){
        $('#mobile', html).text(item.mobile);
        $('#mobile',html).attr('href','tel:+91'+item.mobile);
       } 
       $.each(item.category, function(index, value) {
          if(value == "Others"){
            $("#category",html).append('<div class="chips1"><span>'+item.otherCategoryName+'</span></div>');
          }else $("#category",html).append('<div class="chips1"><span>'+value+'</span></div>');
      });
       $("#services_card").append(html);
}

function registerFilterClickEvent(){
    $(".btn-services").on('click',function(e) {
      console.log($(this).text());
      $('.btn-services').not(this).removeClass("active");
      if($(this).text().toLocaleLowerCase().indexOf("add services")!=-1){
     // if($(this).text() === "Add Services") {
   //e.preventDefault();
       // $('#largeModal').modal('show').find('.modal-content').load($(this).attr('href'));
        return;
      };
      if($(this).text() === filterKey){
        filterKey = null; 
        //$(".btn-services").removeClass("active");
      }else{
        filterKey =  $(this).text();
      }
      filterPage();

  });
}

function refreshPage(){
    $("#services_card").empty();
    pageNo = 1;
    pageIndex = 0;
}

function filterPage(){
  refreshPage();
  displayPageData();
}
function reload()
{
  refreshPage();
  getServices();
}

function openUrgentRequestPopup(){
  //e.preventDefault(); //stops from going to test2.html
  //$('#modal').load(this.href).dialog({ modal : true });
//$( "#urgentRequetForm" ).load('register_services.html').dialog({ autoOpen: false, height: 300, width: 350, modal: true});
/*var dialog = {
  modal: false,
  height: 300
};
$('#urgentRequetForm')
.dialog($.extend(dialog, {
    modal: true,
    width: 500
}))
.load('register_services.html');*/
$("#urgentRequetForm").load('register_services.html');
$("#urgentRequetForm").dialog("open");   
}
function addUrgentRequestFormListener(){
  $("#registerSubmit").submit(function(e) {
    //alert("inside submit");
    e.preventDefault(); // avoid to execute the actual submit of the form.
    var form = $(this);
    
    $.ajax({
           type: "POST",
           url: SERVER_URL+"/services",
           data: form.serialize(), // serializes the form's elements.
           success: function(data)
           {
            //alert(data); // show response from the php script.
            $('.close').click();
            //$('#largeModal form')[0].reset();
            reload();
               
          }
    });

    
});
}