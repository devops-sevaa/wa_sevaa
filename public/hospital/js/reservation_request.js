//const SERVER_URL = "http://localhost:5001/v1";
const SERVER_URL = "https://sevaprod.sagisu.com/v1";
var reservationData;
var sortKey = "updatedAt";
var sortOrder = "-1";
var contentCount = 50;
var pageNo = 1;
var $html;
var hospId = localStorage.getItem("id");

loadHtml(false);
$(window).on('load', function(){ 
    if(localStorage['needPasswordReset'] === "true"){
        $("#resetPasswordSubmit").submit(function(e) {

            e.preventDefault(); // avoid to execute the actual submit of the form.
            var form = $(this);
            var data = getFormData(form);
            if(data.newPassword !== data.confPassowrd){
                alert("Passwords do not match")
                return;
            }

            $.ajax({
                   type: "POST",
                   url: SERVER_URL+"/hospital/resetPassword/"+hospId,
                   data: {'newPassword':data.newPassword}, // serializes the form's elements.
                   success: function(data)
                   {
                       alert("Password reset success"); // show response from the php script.
                       localStorage['needPasswordReset'] = false;
                       $('#close').click();
                       //window.location = "index.html";
                       
                   },
                   error: function(xhr, textStatus, errorThrown) {
                    var err = JSON.parse(xhr.responseText);
                    alert(err.message);
                  }
            });
        })
        $('#modal-reset-password').modal('show');
    }
});
function getFormData($form){
    var unindexed_array = $form.serializeArray();
    var indexed_array = {};

    $.map(unindexed_array, function(n, i){
        indexed_array[n['name']] = n['value'];
    });

    return indexed_array;
}

//call reservation api to get data
$.ajax({
    type: "GET",
    url: SERVER_URL+"/reserve?sortKey="+sortKey+"&sortOrder="+sortOrder+"&id="+hospId,
    cache: false,
    success: function(data){
       reservationData = data.data;
       displayPageData();
    }
});

function loadHtml(loadData){
//Load the card html and save and clone it for every use
$.get("bed_reservation_request.html",function (data) {
    $html = $(data);
    if(loadData) reloadPage();
});
}

function reloadPage(){
    pageNo = 1;
    displayPageData();
}

function displayPageData(){
    if($html === undefined){
        loadHtml(true)
        return;
    }

    var i;
    var startIndex = (pageNo-1) * contentCount;
    var endIndex = pageNo * contentCount;
    for(i=startIndex;i<endIndex && i< reservationData.length;i++){
        load_card(reservationData[i],i);
    }
    pageNo++;
}

function load_card(item,index) {
	var html = $html.clone();
    $('#patientName', html).text(item.patientName);
    $('#location', html).text(item.location);
    $('#srfId', html).text(item.srfid);
    $('#age', html).text(item.age+' Years');
    $('#buNumber', html).text(item.buNumber);
    $('#testedForCovid', html).text(item.testedForCovid?"Yes" : "No");
    $('#covidResult', html).text(item.covidResult);
    $('#onOxygenCylinder', html).text(item.onOxygenCylinder?"Yes":"No");
    $('#hospitalPreference', html).text(item.hospitalPreference);
    $('#symptoms', html).text(item.symptoms);
    $('#o2Level', html).text(item.spo2Level);
    $('#sinceHowManyDays', html).text(item.sinceHowManyDays);

    //array to comma seperated string
    var hospVisited="";
    $.each(item.hospitalsVisited , function(index, val) { 
       hospVisited+=val+",";
    });
    hospVisited = hospVisited.slice(0,-1);//Remove last comma(',') appended to string
    $('#hospitalsVisited', html).text(hospVisited);

    $('#searchingHospitalSince', html).text(item.searchingHospitalSince);
    $('#attenderMobile', html).text(item.attenderMobile);
    $('#relationship', html).text(item.relationship);

    if(item.status == "ACCEPTED" || item.status == "REJECTED"){
        if(item.status == "ACCEPTED"){
            $("#reservationStatusAccept",html).text(item.status);
            $("#reservationStatusReject",html).hide();
        }else
        if(item.status == "REJECTED"){
            $("#reservationStatusReject",html).text(item.status);
            $("#reservationStatusAccept",html).hide();
        }
        
        $("#accept",html).hide();
        $("#reject",html).hide();
    }else{
        $("#reservationStatusReject",html).hide();
        $("#reservationStatusAccept",html).hide();
        $("#accept",html).click(function() {
            accept(item.id,html)
        });
        
        $( "#reject",html).click(function() {
            reject(item.id,html)
        });
    }
    
    //Append html to div
	$("#reservation_request_card").append(html);
      
}

function accept(id,html){
    $.ajax({
        type: "PUT",
        url: SERVER_URL+"/reserve/accept/"+id,
        cache: false,
        success: function(data){
            $("#accept",html).hide();
            $("#reject",html).hide();
            alert("Bed approval sent to user");
            location.reload();
        }
    });
}

function reject(id,html){
    $.ajax({
        type: "PUT",
        url: SERVER_URL+"/reserve/reject/"+id,
        cache: false,
        success: function(data){
            $("#accept",html).hide();
            $("#reject",html).hide();
            alert("Bed denial information sent to user");
            location.reload();
        }
    });
}

function logout(){
    localStorage.clear();
}
