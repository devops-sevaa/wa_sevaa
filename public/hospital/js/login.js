//const SERVER_URL = "http://localhost:5001/v1";
const SERVER_URL = "https://sevaprod.sagisu.com/v1";
//call login api

$("#loginSubmit").submit(function(e) {

    e.preventDefault(); // avoid to execute the actual submit of the form.
    var form = $(this);
    
    $.ajax({
           type: "POST",
           url: SERVER_URL+"/hospital/login",
           data: form.serialize(), // serializes the form's elements.
           success: function(data)
           {
               localStorage.setItem("id",data.data._id);
               localStorage['needPasswordReset']=data.data.needPasswordReset;
               window.location = "index.html";
               
           },
           error: function(xhr, textStatus, errorThrown) {
            //alert(jqXHR.status);
            //alert(textStatus);
            //alert(errorThrown); 
            var err = JSON.parse(xhr.responseText);
            alert(err.message);
          }
    });
})