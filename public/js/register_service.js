const SERVER_URL = "https://sevaprod.sagisu.com/v1";
$("#registerSubmit").submit(function(e) {

    e.preventDefault(); // avoid to execute the actual submit of the form.
    var form = $(this);
    
    $.ajax({
           type: "POST",
           url: SERVER_URL+"/services",
           data: form.serialize(), // serializes the form's elements.
           success: function(data)
           {
            alert("Success"); // show response from the php script.
               window.location = "services.html";
               
           }
    });

    
});